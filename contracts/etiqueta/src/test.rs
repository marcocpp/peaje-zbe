#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{BytesN, Env, testutils::Address as _};

fn setup(env: &Env) -> (Address, EtiquetaClient<'_>) {
    let admin = Address::generate(env);
    let id = env.register(Etiqueta, (&admin,));
    env.mock_all_auths();
    (admin, EtiquetaClient::new(env, &id))
}

fn plate(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

#[test]
fn issue_and_get() {
    let env = Env::default();
    let (admin, client) = setup(&env);
    let owner = Address::generate(&env);

    assert_eq!(client.get(&plate(&env, 1)), None);
    client.issue(&plate(&env, 1), &owner, &Category::Eco);

    // La firma la exige la DGT, no el titular
    assert_eq!(env.auths()[0].0, admin);
    assert_eq!(
        client.get(&plate(&env, 1)),
        Some(Label {
            category: Category::Eco,
            owner
        })
    );
}

#[test]
fn cannot_issue_twice() {
    let env = Env::default();
    let (_, client) = setup(&env);
    let owner = Address::generate(&env);
    client.issue(&plate(&env, 1), &owner, &Category::B);
    assert_eq!(
        client.try_issue(&plate(&env, 1), &owner, &Category::Cero),
        Err(Ok(Error::AlreadyIssued))
    );
}

#[test]
fn reassign_changes_owner() {
    let env = Env::default();
    let (admin, client) = setup(&env);
    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    client.issue(&plate(&env, 1), &seller, &Category::C);

    client.reassign(&plate(&env, 1), &buyer);
    assert_eq!(env.auths()[0].0, admin);
    let label = client.get(&plate(&env, 1)).unwrap();
    assert_eq!(label.owner, buyer);
    assert_eq!(label.category, Category::C);

    assert_eq!(
        client.try_reassign(&plate(&env, 2), &buyer),
        Err(Ok(Error::NotFound))
    );
}

#[test]
fn revoke_removes_label() {
    let env = Env::default();
    let (_, client) = setup(&env);
    let owner = Address::generate(&env);
    client.issue(&plate(&env, 1), &owner, &Category::B);

    client.revoke(&plate(&env, 1));
    assert_eq!(client.get(&plate(&env, 1)), None);
    assert_eq!(client.try_revoke(&plate(&env, 1)), Err(Ok(Error::NotFound)));
}

#[test]
fn only_admin_can_issue() {
    let env = Env::default();
    let (_, client) = setup(&env);
    let owner = Address::generate(&env);
    // Sin autorizaciones simuladas, nadie puede firmar como DGT
    env.set_auths(&[]);
    assert!(
        client
            .try_issue(&plate(&env, 1), &owner, &Category::Cero)
            .is_err()
    );
    assert_eq!(client.get(&plate(&env, 1)), None);
}

#[test]
fn categories_are_ordered_by_cleanliness() {
    assert!(Category::Cero > Category::Eco);
    assert!(Category::Eco > Category::C);
    assert!(Category::C > Category::B);
    assert!(Category::B > Category::SinEtiqueta);
}
