#![cfg(test)]
extern crate std;

use super::*;
use ::etiqueta::{Category as DgtCategory, Etiqueta, EtiquetaClient as DgtClient};
use soroban_sdk::{
    BytesN, Env, Event, symbol_short,
    testutils::{Address as _, Events, Ledger, storage::Persistent as _},
    token::{StellarAssetClient, TokenClient},
};

const USDC: i128 = 10_000_000; // 7 decimales
const FEE: i128 = 5 * USDC;
const APPEAL_SECS: u64 = 60;

struct Setup<'a> {
    env: Env,
    peaje: PeajeClient<'a>,
    dgt: DgtClient<'a>,
    usdc: TokenClient<'a>,
    usdc_admin: StellarAssetClient<'a>,
    admin: Address,
    treasury: Address,
    arbiter: Address,
    camera: Address,
}

fn plate(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

fn centro() -> Symbol {
    symbol_short!("centro")
}

/// Zona "centro" (solo Cero y Eco, 5 USDC, 60 s), una cámara y un conductor
/// con etiqueta B y 20 USDC en la cartera.
fn setup<'a>() -> (Setup<'a>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_000_000);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let arbiter = Address::generate(&env);
    let camera = Address::generate(&env);
    let dgt_admin = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc = TokenClient::new(&env, &sac.address());
    let usdc_admin = StellarAssetClient::new(&env, &sac.address());

    let dgt_id = env.register(Etiqueta, (&dgt_admin,));
    let dgt = DgtClient::new(&env, &dgt_id);

    let peaje_id = env.register(Peaje, (&admin, &sac.address(), &treasury, &arbiter));
    let peaje = PeajeClient::new(&env, &peaje_id);
    peaje.set_etiqueta(&dgt_id);
    peaje.set_zone(&centro(), &Category::Eco, &FEE, &APPEAL_SECS);
    peaje.add_camera(&camera);

    let lucia = Address::generate(&env);
    dgt.issue(&plate(&env, 1), &lucia, &DgtCategory::B);
    usdc_admin.mint(&lucia, &(20 * USDC));

    (
        Setup {
            env,
            peaje,
            dgt,
            usdc,
            usdc_admin,
            admin,
            treasury,
            arbiter,
            camera,
        },
        lucia,
    )
}

fn advance(env: &Env, secs: u64) {
    env.ledger().set_timestamp(env.ledger().timestamp() + secs);
}

#[test]
fn allowed_category_is_not_charged() {
    let (s, _) = setup();
    let env = &s.env;
    let eco_owner = Address::generate(env);
    s.dgt.issue(&plate(env, 2), &eco_owner, &DgtCategory::Eco);
    // Aunque tenga bono, no se le bloquea nada
    s.usdc_admin.mint(&eco_owner, &(10 * USDC));
    s.peaje.deposit(&eco_owner, &(10 * USDC));

    assert_eq!(
        s.peaje.report_entry(&s.camera, &plate(env, 2), &centro()),
        None
    );
    assert_eq!(s.peaje.charge_count(), 0);
}

#[test]
fn no_bono_only_emits_event() {
    let (s, lucia) = setup();
    let env = &s.env;

    assert_eq!(
        s.peaje.report_entry(&s.camera, &plate(env, 1), &centro()),
        None
    );
    assert_eq!(
        env.events().all().filter_by_contract(&s.peaje.address),
        [NoBono {
            zone_id: centro(),
            plate_hash: plate(env, 1),
            owner: Some(lucia.clone())
        }
        .to_xdr(env, &s.peaje.address)]
    );
    assert_eq!(s.peaje.charge_count(), 0);
    assert_eq!(s.usdc.balance(&lucia), 20 * USDC);
}

#[test]
fn insufficient_bono_is_not_charged() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(4 * USDC));

    assert_eq!(
        s.peaje.report_entry(&s.camera, &plate(env, 1), &centro()),
        None
    );
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 4 * USDC,
            locked: 0
        }
    );
}

#[test]
fn unknown_vehicle_emits_no_bono_without_owner() {
    let (s, _) = setup();
    let env = &s.env;
    assert_eq!(
        s.peaje.report_entry(&s.camera, &plate(env, 9), &centro()),
        None
    );
    assert_eq!(
        env.events().all().filter_by_contract(&s.peaje.address),
        [NoBono {
            zone_id: centro(),
            plate_hash: plate(env, 9),
            owner: None
        }
        .to_xdr(env, &s.peaje.address)]
    );
}

#[test]
fn charge_is_locked_then_settled_after_deadline() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(20 * USDC));
    assert_eq!(s.usdc.balance(&lucia), 0);

    let id = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 15 * USDC,
            locked: FEE
        }
    );
    let charge = s.peaje.get_charge(&id).unwrap();
    assert_eq!(charge.status, ChargeStatus::Pending);
    assert_eq!(charge.deadline, charge.created_at + APPEAL_SECS);
    assert_eq!(s.peaje.get_charges(&lucia).len(), 1);

    // El bloqueado no se puede retirar
    assert_eq!(
        s.peaje.try_withdraw(&lucia, &(16 * USDC)),
        Err(Ok(Error::InsufficientFree))
    );

    // Dentro de plazo no se puede cobrar
    assert_eq!(s.peaje.try_settle(&id), Err(Ok(Error::AppealWindowOpen)));
    advance(env, APPEAL_SECS);
    s.peaje.settle(&id);

    assert_eq!(
        s.peaje.get_charge(&id).unwrap().status,
        ChargeStatus::Settled
    );
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 15 * USDC,
            locked: 0
        }
    );
    assert_eq!(s.usdc.balance(&s.treasury), FEE);
    assert_eq!(s.peaje.collected(), FEE);
    // No se cobra dos veces
    assert_eq!(s.peaje.try_settle(&id), Err(Ok(Error::NotPending)));

    s.peaje.withdraw(&lucia, &(15 * USDC));
    assert_eq!(s.usdc.balance(&lucia), 15 * USDC);
    assert_eq!(s.usdc.balance(&s.peaje.address), 0);
}

#[test]
fn one_charge_per_vehicle_zone_and_day() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(20 * USDC));

    let first = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();
    let again = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();
    assert_eq!(first, again);
    assert_eq!(s.peaje.balance(&lucia).locked, FEE);

    advance(env, 86_400);
    let next_day = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();
    assert_ne!(first, next_day);
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 10 * USDC,
            locked: 2 * FEE
        }
    );
    assert_eq!(s.peaje.list_charges(&0, &10).len(), 2);
}

#[test]
fn appeal_then_arbiter_cancels() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(20 * USDC));
    let id = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();

    s.peaje.appeal(&lucia, &id);
    assert_eq!(env.auths()[0].0, lucia);
    assert_eq!(
        s.peaje.get_charge(&id).unwrap().status,
        ChargeStatus::Disputed
    );

    // Aunque venza el plazo, un cargo en disputa no se cobra con settle
    advance(env, APPEAL_SECS);
    assert_eq!(s.peaje.try_settle(&id), Err(Ok(Error::ChargeDisputed)));

    s.peaje.resolve(&id, &false);
    assert_eq!(env.auths()[0].0, s.arbiter);
    assert_eq!(
        s.peaje.get_charge(&id).unwrap().status,
        ChargeStatus::Cancelled
    );
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 20 * USDC,
            locked: 0
        }
    );
    assert_eq!(s.usdc.balance(&s.treasury), 0);
    assert_eq!(s.peaje.try_resolve(&id, &true), Err(Ok(Error::NotDisputed)));
}

#[test]
fn appeal_then_arbiter_upholds() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(20 * USDC));
    let id = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();
    s.peaje.appeal(&lucia, &id);

    s.peaje.resolve(&id, &true);
    assert_eq!(
        s.peaje.get_charge(&id).unwrap().status,
        ChargeStatus::Settled
    );
    assert_eq!(
        s.peaje.balance(&lucia),
        Bono {
            free: 15 * USDC,
            locked: 0
        }
    );
    assert_eq!(s.usdc.balance(&s.treasury), FEE);
}

#[test]
fn appeal_rules() {
    let (s, lucia) = setup();
    let env = &s.env;
    s.peaje.deposit(&lucia, &(20 * USDC));
    let id = s
        .peaje
        .report_entry(&s.camera, &plate(env, 1), &centro())
        .unwrap();

    let other = Address::generate(env);
    assert_eq!(
        s.peaje.try_appeal(&other, &id),
        Err(Ok(Error::NotChargeOwner))
    );
    assert_eq!(
        s.peaje.try_appeal(&lucia, &99),
        Err(Ok(Error::ChargeNotFound))
    );

    advance(env, APPEAL_SECS);
    assert_eq!(
        s.peaje.try_appeal(&lucia, &id),
        Err(Ok(Error::AppealWindowClosed))
    );
    // Sin disputa no hay nada que resolver
    assert_eq!(
        s.peaje.try_resolve(&id, &false),
        Err(Ok(Error::NotDisputed))
    );
}

#[test]
fn only_authorized_cameras_report() {
    let (s, _) = setup();
    let env = &s.env;
    let fake = Address::generate(env);
    assert_eq!(
        s.peaje.try_report_entry(&fake, &plate(env, 1), &centro()),
        Err(Ok(Error::NotCamera))
    );
    assert_eq!(
        s.peaje
            .try_report_entry(&s.camera, &plate(env, 1), &symbol_short!("norte")),
        Err(Ok(Error::ZoneNotFound))
    );

    s.peaje.remove_camera(&s.camera);
    assert!(!s.peaje.is_camera(&s.camera));
    assert_eq!(
        s.peaje
            .try_report_entry(&s.camera, &plate(env, 1), &centro()),
        Err(Ok(Error::NotCamera))
    );
}

#[test]
fn admin_functions_require_admin() {
    let (s, _) = setup();
    let env = &s.env;
    s.peaje
        .set_zone(&centro(), &Category::Cero, &FEE, &APPEAL_SECS);
    assert_eq!(env.auths()[0].0, s.admin);
    assert_eq!(
        s.peaje.get_zone(&centro()).unwrap().min_category,
        Category::Cero
    );
    assert_eq!(
        s.peaje
            .try_set_zone(&centro(), &Category::Eco, &0, &APPEAL_SECS),
        Err(Ok(Error::InvalidAmount))
    );

    env.set_auths(&[]);
    assert!(s.peaje.try_add_camera(&Address::generate(env)).is_err());
    assert!(
        s.peaje
            .try_set_zone(&centro(), &Category::B, &FEE, &0)
            .is_err()
    );
}

#[test]
fn not_configured_without_etiqueta() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let camera = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let id = env.register(
        Peaje,
        (
            &admin,
            &sac.address(),
            &Address::generate(&env),
            &Address::generate(&env),
        ),
    );
    let peaje = PeajeClient::new(&env, &id);
    peaje.set_zone(&centro(), &Category::Eco, &FEE, &APPEAL_SECS);
    peaje.add_camera(&camera);
    assert_eq!(peaje.get_config().etiqueta, None);
    assert_eq!(
        peaje.try_report_entry(&camera, &plate(&env, 1), &centro()),
        Err(Ok(Error::NotConfigured))
    );
}

#[test]
fn daily_entries_keep_zone_and_camera_alive() {
    let (s, _) = setup();
    let env = &s.env;
    let eco_owner = Address::generate(env);
    s.dgt.issue(&plate(env, 2), &eco_owner, &DgtCategory::Eco);

    // Solo entran coches permitidos (no se escribe nada): la zona y la cámara
    // tienen que seguir vivas más allá del TTL inicial de 7 días sin tener que
    // restaurarlas (la restauración automática sube el coste de la entrada)
    for _ in 0..10 {
        env.ledger().with_mut(|l| l.sequence_number += DAY_IN_LEDGERS);
        advance(env, DAY_IN_SECS);
        assert_eq!(
            s.peaje.report_entry(&s.camera, &plate(env, 2), &centro()),
            None
        );
    }
    env.as_contract(&s.peaje.address, || {
        let p = env.storage().persistent();
        // Sin renovar, la entrada habría caducado y se habría restaurado con
        // el TTL mínimo (menos de un día)
        let min = TTL_THRESHOLD;
        assert!(p.get_ttl(&DataKey::Zone(centro())) >= min);
        assert!(p.get_ttl(&DataKey::Camera(s.camera.clone())) >= min);
    });
}
