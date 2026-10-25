//! Interfaz del contrato Etiqueta que usa el Peaje. Los tipos deben coincidir
//! en forma con los de `contracts/etiqueta`.
use soroban_sdk::{Address, BytesN, Env, contractclient, contracttype};

/// Distintivo ambiental, de menos a más limpio.
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

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Label {
    pub category: Category,
    pub owner: Address,
}

#[allow(dead_code)]
#[contractclient(name = "EtiquetaClient")]
pub trait EtiquetaInterface {
    fn get(env: Env, plate_hash: BytesN<32>) -> Option<Label>;
}
