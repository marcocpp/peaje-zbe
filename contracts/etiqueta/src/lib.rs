#![no_std]
use soroban_sdk::{
    Address, BytesN, Env, contract, contracterror, contractevent, contractimpl, contracttype,
};

/// Distintivo ambiental. El orden numérico es el de "más limpio": una zona que
/// admite `Eco` admite también `Cero`.
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Category {
    SinEtiqueta = 0,
    B = 1,
    C = 2,
    Eco = 3,
    Cero = 4,
}

/// Etiqueta de un vehículo: categoría y titular actual.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Label {
    pub category: Category,
    pub owner: Address,
}

#[contracttype]
enum DataKey {
    Admin,
    /// plate_hash = HMAC-SHA256 de la matrícula
    Label(BytesN<32>),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Ya existe una etiqueta para esa matrícula
    AlreadyIssued = 1,
    /// No existe etiqueta para esa matrícula
    NotFound = 2,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Issued {
    #[topic]
    pub plate_hash: BytesN<32>,
    pub owner: Address,
    pub category: Category,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Reassigned {
    #[topic]
    pub plate_hash: BytesN<32>,
    pub from: Address,
    pub to: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Revoked {
    #[topic]
    pub plate_hash: BytesN<32>,
}

const DAY_IN_LEDGERS: u32 = 17_280;
// Extender a 7 días cuando quede menos de 1: en testnet, extender 30 días
// cuesta decenas de XLM por entrada
const TTL_THRESHOLD: u32 = DAY_IN_LEDGERS;
const TTL_EXTEND_TO: u32 = 7 * DAY_IN_LEDGERS;

#[contract]
pub struct Etiqueta;

#[contractimpl]
impl Etiqueta {
    /// Fija la DGT como única emisora de etiquetas.
    pub fn __constructor(env: &Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Emite la etiqueta de un vehículo. Solo la DGT.
    pub fn issue(
        env: &Env,
        plate_hash: BytesN<32>,
        owner: Address,
        category: Category,
    ) -> Result<(), Error> {
        Self::require_admin(env);
        let key = DataKey::Label(plate_hash.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyIssued);
        }
        let label = Label {
            category,
            owner: owner.clone(),
        };
        Self::save(env, &key, &label);
        Issued {
            plate_hash,
            owner,
            category,
        }
        .publish(env);
        Ok(())
    }

    /// Cambio de titular (venta del coche). Solo la DGT: el titular no puede
    /// transferir la etiqueta por su cuenta.
    pub fn reassign(env: &Env, plate_hash: BytesN<32>, new_owner: Address) -> Result<(), Error> {
        Self::require_admin(env);
        let key = DataKey::Label(plate_hash.clone());
        let mut label: Label = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;
        let from = label.owner;
        label.owner = new_owner.clone();
        Self::save(env, &key, &label);
        Reassigned {
            plate_hash,
            from,
            to: new_owner,
        }
        .publish(env);
        Ok(())
    }

    /// Retira la etiqueta. Solo la DGT.
    pub fn revoke(env: &Env, plate_hash: BytesN<32>) -> Result<(), Error> {
        Self::require_admin(env);
        let key = DataKey::Label(plate_hash.clone());
        if !env.storage().persistent().has(&key) {
            return Err(Error::NotFound);
        }
        env.storage().persistent().remove(&key);
        Revoked { plate_hash }.publish(env);
        Ok(())
    }

    /// Categoría y titular de un vehículo, si tiene etiqueta.
    pub fn get(env: &Env, plate_hash: BytesN<32>) -> Option<Label> {
        let key = DataKey::Label(plate_hash);
        let label = env.storage().persistent().get(&key);
        if label.is_some() {
            env.storage()
                .persistent()
                .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        }
        label
    }

    /// Dirección de la DGT.
    pub fn admin(env: &Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("admin not set")
    }

    fn require_admin(env: &Env) {
        Self::admin(env).require_auth();
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
    }

    fn save(env: &Env, key: &DataKey, label: &Label) {
        env.storage().persistent().set(key, label);
        env.storage()
            .persistent()
            .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND_TO);
    }
}

mod test;
