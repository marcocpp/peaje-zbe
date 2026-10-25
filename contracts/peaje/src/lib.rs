#![no_std]
use soroban_sdk::{
    Address, BytesN, Env, Symbol, Vec, contract, contracterror, contractevent, contractimpl,
    contracttype, token,
};

mod dgt;

pub use dgt::Category;
use dgt::EtiquetaClient;

/// Reglas de una zona: categoría mínima que entra gratis, tarifa diaria (en
/// unidades del token) y ventana de alegación en segundos.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Zone {
    pub min_category: Category,
    pub fee: i128,
    pub appeal_secs: u64,
}

/// Bono ZBE de un conductor. `free` se puede retirar; `locked` está reservado
/// para cargos pendientes o en disputa.
#[contracttype]
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct Bono {
    pub free: i128,
    pub locked: i128,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ChargeStatus {
    Pending,
    Disputed,
    Settled,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Charge {
    pub id: u64,
    pub owner: Address,
    pub plate_hash: BytesN<32>,
    pub zone_id: Symbol,
    pub amount: i128,
    pub created_at: u64,
    /// Hasta este instante se puede alegar; a partir de él, `settle`
    pub deadline: u64,
    pub status: ChargeStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub admin: Address,
    pub etiqueta: Option<Address>,
    pub token: Address,
    pub treasury: Address,
    pub arbiter: Address,
}

#[contracttype]
enum DataKey {
    Admin,
    Etiqueta,
    Token,
    Treasury,
    Arbiter,
    NextId,
    Collected,
    Zone(Symbol),
    Camera(Address),
    Bono(Address),
    Charge(u64),
    Charges(Address),
    /// plate_hash + zone_id + día: un solo cargo por vehículo, zona y día
    Daily(BytesN<32>, Symbol, u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Falta `set_etiqueta`
    NotConfigured = 1,
    ZoneNotFound = 2,
    /// La cuenta no es una cámara autorizada
    NotCamera = 3,
    /// Importe o tarifa no válidos (≤ 0 o negativa)
    InvalidAmount = 4,
    /// Saldo libre insuficiente para retirar
    InsufficientFree = 5,
    ChargeNotFound = 6,
    /// El cargo no es de este conductor
    NotChargeOwner = 7,
    /// El cargo no está `Pending`
    NotPending = 8,
    /// Plazo de alegación vencido
    AppealWindowClosed = 9,
    /// Plazo de alegación aún abierto: no se puede cobrar
    AppealWindowOpen = 10,
    /// Cargo en disputa: solo el árbitro puede cerrarlo
    ChargeDisputed = 11,
    /// El cargo no está `Disputed`
    NotDisputed = 12,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ChargeCreated {
    #[topic]
    pub owner: Address,
    pub charge_id: u64,
    pub zone_id: Symbol,
    pub amount: i128,
    pub deadline: u64,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Appealed {
    #[topic]
    pub owner: Address,
    pub charge_id: u64,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Settled {
    #[topic]
    pub owner: Address,
    pub charge_id: u64,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Cancelled {
    #[topic]
    pub owner: Address,
    pub charge_id: u64,
}

/// Entrada no permitida sin bono o sin saldo: procedimiento ordinario fuera de
/// la cadena. `owner` es `None` si el vehículo no tiene etiqueta.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NoBono {
    #[topic]
    pub zone_id: Symbol,
    pub plate_hash: BytesN<32>,
    pub owner: Option<Address>,
}

const DAY_IN_SECS: u64 = 86_400;
const DAY_IN_LEDGERS: u32 = 17_280;
// Extender a 7 días cuando quede menos de 1: en testnet, extender 30 días
// cuesta decenas de XLM por entrada
const TTL_THRESHOLD: u32 = DAY_IN_LEDGERS;
const TTL_EXTEND_TO: u32 = 7 * DAY_IN_LEDGERS;

#[contract]
pub struct Peaje;

#[contractimpl]
impl Peaje {
    /// Guarda las direcciones fijas. La del contrato Etiqueta se fija después
    /// con `set_etiqueta`, porque scaffold.yml no puede pasar la dirección de
    /// un contrato al constructor de otro.
    pub fn __constructor(
        env: &Env,
        admin: Address,
        token: Address,
        treasury: Address,
        arbiter: Address,
    ) {
        let s = env.storage().instance();
        s.set(&DataKey::Admin, &admin);
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::Treasury, &treasury);
        s.set(&DataKey::Arbiter, &arbiter);
        s.set(&DataKey::NextId, &0u64);
        s.set(&DataKey::Collected, &0i128);
    }

    // ----- Ayuntamiento (admin) -----

    /// Dirección del contrato Etiqueta de la DGT.
    pub fn set_etiqueta(env: &Env, etiqueta: Address) {
        Self::require_admin(env);
        env.storage().instance().set(&DataKey::Etiqueta, &etiqueta);
    }

    /// Crea o cambia las reglas de una zona.
    pub fn set_zone(
        env: &Env,
        zone_id: Symbol,
        min_category: Category,
        fee: i128,
        appeal_secs: u64,
    ) -> Result<(), Error> {
        Self::require_admin(env);
        if fee <= 0 {
            return Err(Error::InvalidAmount);
        }
        let zone = Zone {
            min_category,
            fee,
            appeal_secs,
        };
        Self::save(env, &DataKey::Zone(zone_id), &zone);
        Ok(())
    }

    /// Autoriza una cámara (oráculo) a reportar entradas.
    pub fn add_camera(env: &Env, camera: Address) {
        Self::require_admin(env);
        Self::save(env, &DataKey::Camera(camera), &true);
    }

    pub fn remove_camera(env: &Env, camera: Address) {
        Self::require_admin(env);
        env.storage().persistent().remove(&DataKey::Camera(camera));
    }

    // ----- Conductor -----

    /// Recarga el bono: el importe pasa de la cuenta del conductor al contrato
    /// como saldo libre.
    pub fn deposit(env: &Env, owner: Address, amount: i128) -> Result<(), Error> {
        owner.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        Self::token(env).transfer(&owner, &env.current_contract_address(), &amount);
        let mut bono = Self::load_bono(env, &owner);
        bono.free += amount;
        Self::save(env, &DataKey::Bono(owner), &bono);
        Ok(())
    }

    /// Retira saldo libre. El bloqueado no se puede retirar.
    pub fn withdraw(env: &Env, owner: Address, amount: i128) -> Result<(), Error> {
        owner.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let mut bono = Self::load_bono(env, &owner);
        if bono.free < amount {
            return Err(Error::InsufficientFree);
        }
        bono.free -= amount;
        Self::save(env, &DataKey::Bono(owner.clone()), &bono);
        Self::token(env).transfer(&env.current_contract_address(), &owner, &amount);
        Ok(())
    }

    /// Alega dentro de plazo: el cargo pasa a `Disputed` y solo el árbitro
    /// puede cerrarlo.
    pub fn appeal(env: &Env, owner: Address, charge_id: u64) -> Result<(), Error> {
        owner.require_auth();
        let mut charge = Self::load_charge(env, charge_id)?;
        if charge.owner != owner {
            return Err(Error::NotChargeOwner);
        }
        if charge.status != ChargeStatus::Pending {
            return Err(Error::NotPending);
        }
        if env.ledger().timestamp() >= charge.deadline {
            return Err(Error::AppealWindowClosed);
        }
        charge.status = ChargeStatus::Disputed;
        Self::save(env, &DataKey::Charge(charge_id), &charge);
        Appealed { owner, charge_id }.publish(env);
        Ok(())
    }

    // ----- Cámara -----

    /// Reporta la entrada de un vehículo en una zona. Devuelve el id del cargo
    /// bloqueado (nuevo o el ya creado hoy), o `None` si no se bloquea nada.
    pub fn report_entry(
        env: &Env,
        camera: Address,
        plate_hash: BytesN<32>,
        zone_id: Symbol,
    ) -> Result<Option<u64>, Error> {
        camera.require_auth();
        let camera_key = DataKey::Camera(camera);
        if !env.storage().persistent().has(&camera_key) {
            return Err(Error::NotCamera);
        }
        let zone_key = DataKey::Zone(zone_id.clone());
        let zone: Zone = env
            .storage()
            .persistent()
            .get(&zone_key)
            .ok_or(Error::ZoneNotFound)?;
        // Una zona con tráfico permitido no se escribe nunca: sin esto caduca a
        // los 7 días y cada entrada pagaría su restauración
        Self::touch(env, &camera_key);
        Self::touch(env, &zone_key);
        let etiqueta: Address = env
            .storage()
            .instance()
            .get(&DataKey::Etiqueta)
            .ok_or(Error::NotConfigured)?;

        let Some(label) = EtiquetaClient::new(env, &etiqueta).get(&plate_hash) else {
            NoBono {
                zone_id,
                plate_hash,
                owner: None,
            }
            .publish(env);
            return Ok(None);
        };
        if label.category >= zone.min_category {
            return Ok(None);
        }

        let now = env.ledger().timestamp();
        let daily = DataKey::Daily(plate_hash.clone(), zone_id.clone(), now / DAY_IN_SECS);
        if let Some(existing) = env.storage().persistent().get::<_, u64>(&daily) {
            return Ok(Some(existing));
        }

        let owner = label.owner;
        let mut bono = Self::load_bono(env, &owner);
        if bono.free < zone.fee {
            NoBono {
                zone_id,
                plate_hash,
                owner: Some(owner),
            }
            .publish(env);
            return Ok(None);
        }
        bono.free -= zone.fee;
        bono.locked += zone.fee;
        Self::save(env, &DataKey::Bono(owner.clone()), &bono);

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));
        let charge = Charge {
            id,
            owner: owner.clone(),
            plate_hash,
            zone_id: zone_id.clone(),
            amount: zone.fee,
            created_at: now,
            deadline: now.saturating_add(zone.appeal_secs),
            status: ChargeStatus::Pending,
        };
        Self::save(env, &DataKey::Charge(id), &charge);
        Self::save(env, &daily, &id);

        let list_key = DataKey::Charges(owner.clone());
        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or(Vec::new(env));
        ids.push_back(id);
        Self::save(env, &list_key, &ids);

        ChargeCreated {
            owner,
            charge_id: id,
            zone_id,
            amount: charge.amount,
            deadline: charge.deadline,
        }
        .publish(env);
        Ok(Some(id))
    }

    // ----- Cobro y disputas -----

    /// Cobra un cargo `Pending` cuyo plazo de alegación ha vencido. Lo puede
    /// llamar cualquiera.
    pub fn settle(env: &Env, charge_id: u64) -> Result<(), Error> {
        let charge = Self::load_charge(env, charge_id)?;
        match charge.status {
            ChargeStatus::Pending => {}
            ChargeStatus::Disputed => return Err(Error::ChargeDisputed),
            _ => return Err(Error::NotPending),
        }
        if env.ledger().timestamp() < charge.deadline {
            return Err(Error::AppealWindowOpen);
        }
        Self::collect(env, charge);
        Ok(())
    }

    /// El árbitro independiente cierra un cargo en disputa: `uphold = true`
    /// lo cobra, `false` lo anula y el importe vuelve a saldo libre.
    pub fn resolve(env: &Env, charge_id: u64, uphold: bool) -> Result<(), Error> {
        let arbiter: Address = env.storage().instance().get(&DataKey::Arbiter).unwrap();
        arbiter.require_auth();
        let mut charge = Self::load_charge(env, charge_id)?;
        if charge.status != ChargeStatus::Disputed {
            return Err(Error::NotDisputed);
        }
        if uphold {
            Self::collect(env, charge);
        } else {
            let mut bono = Self::load_bono(env, &charge.owner);
            bono.locked -= charge.amount;
            bono.free += charge.amount;
            Self::save(env, &DataKey::Bono(charge.owner.clone()), &bono);
            charge.status = ChargeStatus::Cancelled;
            Self::save(env, &DataKey::Charge(charge_id), &charge);
            Cancelled {
                owner: charge.owner,
                charge_id,
            }
            .publish(env);
        }
        Ok(())
    }

    // ----- Lecturas -----

    pub fn balance(env: &Env, owner: Address) -> Bono {
        Self::load_bono(env, &owner)
    }

    pub fn get_charge(env: &Env, charge_id: u64) -> Option<Charge> {
        env.storage().persistent().get(&DataKey::Charge(charge_id))
    }

    /// Cargos de un conductor, del más antiguo al más reciente.
    pub fn get_charges(env: &Env, owner: Address) -> Vec<Charge> {
        let ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::Charges(owner))
            .unwrap_or(Vec::new(env));
        let mut out = Vec::new(env);
        for id in ids.iter() {
            if let Some(c) = Self::get_charge(env, id) {
                out.push_back(c);
            }
        }
        out
    }

    /// Hasta `limit` cargos a partir del id `from` (panel del ayuntamiento).
    pub fn list_charges(env: &Env, from: u64, limit: u32) -> Vec<Charge> {
        let end = Self::charge_count(env).min(from.saturating_add(limit as u64));
        let mut out = Vec::new(env);
        for id in from..end {
            if let Some(c) = Self::get_charge(env, id) {
                out.push_back(c);
            }
        }
        out
    }

    pub fn charge_count(env: &Env) -> u64 {
        env.storage().instance().get(&DataKey::NextId).unwrap_or(0)
    }

    /// Total transferido a la tesorería.
    pub fn collected(env: &Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Collected)
            .unwrap_or(0)
    }

    pub fn get_zone(env: &Env, zone_id: Symbol) -> Option<Zone> {
        env.storage().persistent().get(&DataKey::Zone(zone_id))
    }

    pub fn is_camera(env: &Env, camera: Address) -> bool {
        env.storage().persistent().has(&DataKey::Camera(camera))
    }

    pub fn get_config(env: &Env) -> Config {
        let s = env.storage().instance();
        Config {
            admin: s.get(&DataKey::Admin).unwrap(),
            etiqueta: s.get(&DataKey::Etiqueta),
            token: s.get(&DataKey::Token).unwrap(),
            treasury: s.get(&DataKey::Treasury).unwrap(),
            arbiter: s.get(&DataKey::Arbiter).unwrap(),
        }
    }

    // ----- Internas -----

    /// Pasa el importe bloqueado a la tesorería y marca el cargo `Settled`.
    fn collect(env: &Env, mut charge: Charge) {
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        let mut bono = Self::load_bono(env, &charge.owner);
        bono.locked -= charge.amount;
        Self::save(env, &DataKey::Bono(charge.owner.clone()), &bono);
        charge.status = ChargeStatus::Settled;
        Self::save(env, &DataKey::Charge(charge.id), &charge);
        let collected = Self::collected(env) + charge.amount;
        env.storage()
            .instance()
            .set(&DataKey::Collected, &collected);
        Self::token(env).transfer(&env.current_contract_address(), &treasury, &charge.amount);
        Settled {
            owner: charge.owner,
            charge_id: charge.id,
            amount: charge.amount,
        }
        .publish(env);
    }

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }

    fn token(env: &Env) -> token::TokenClient<'_> {
        let addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::TokenClient::new(env, &addr)
    }

    fn load_bono(env: &Env, owner: &Address) -> Bono {
        env.storage()
            .persistent()
            .get(&DataKey::Bono(owner.clone()))
            .unwrap_or_default()
    }

    fn load_charge(env: &Env, charge_id: u64) -> Result<Charge, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Charge(charge_id))
            .ok_or(Error::ChargeNotFound)
    }

    /// Escribe en persistent storage y alarga el TTL de la entrada y de la
    /// instancia.
    fn save<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(env: &Env, key: &DataKey, value: &V) {
        env.storage().persistent().set(key, value);
        Self::touch(env, key);
    }

    /// Alarga el TTL de una entrada que existe y el de la instancia.
    fn touch(env: &Env, key: &DataKey) {
        env.storage()
            .persistent()
            .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND_TO);
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
    }
}

mod test;
