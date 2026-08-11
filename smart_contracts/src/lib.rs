#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;
use alloy_primitives::{Address, B256, U256, U64, keccak256};
use stylus_sdk::{prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct LandLedger {
        mapping(bytes32 => LandRecord) records;
        mapping(bytes32 => bool) exists;
        mapping(bytes32 => address) proposed_buyer;
        mapping(bytes32 => bool) seller_approved;
        mapping(bytes32 => bool) buyer_approved;
        address admin; // deployer wallet — only address allowed to call verify_land
    }

    pub struct LandRecord {
        address owner;
        string location;
        uint64 area_sqft;
        bool is_verified;
        uint64 registration_timestamp;
    }
}

#[public]
impl LandLedger {
    pub fn init(&mut self) {
        // Initialization is deployment-only; never allow a later caller to
        // replace the registry administrator.
        if self.admin.get() != Address::ZERO {
            return;
        }
        let sender = self.vm().msg_sender();
        self.admin.set(sender);
    }

    pub fn register_land(&mut self, parcel_id: String, location: String, area_sqft: u64) -> Result<(), Vec<u8>> {
        let key = keccak256(parcel_id.as_bytes());
        if self.exists.get(key) {
            return Err(b"Parcel already registered".to_vec());
        }
        let sender = self.vm().msg_sender();
        let timestamp = self.vm().block_timestamp();
        
        let mut record = self.records.setter(key);
        record.owner.set(sender);
        record.location.set_str(&location);
        record.area_sqft.set(U64::from(area_sqft));
        record.is_verified.set(false);
        record.registration_timestamp.set(U64::from(timestamp));
        
        self.exists.setter(key).set(true);
        Ok(())
    }

    pub fn transfer_ownership(&mut self, parcel_id: String, new_owner: Address) -> Result<(), Vec<u8>> {
        let key = keccak256(parcel_id.as_bytes());
        if !self.exists.get(key) {
            return Err(b"Parcel not found".to_vec());
        }
        let sender = self.vm().msg_sender();
        
        let mut record = self.records.setter(key);
        // The title holder can initiate a transfer, while the registry admin
        // can execute the final officer-approved transfer from the dashboard.
        if record.owner.get() != sender && self.admin.get() != sender {
            return Err(b"Unauthorized: not owner or registry admin".to_vec());
        }
        if new_owner == Address::ZERO {
            return Err(b"Invalid new owner".to_vec());
        }
        record.owner.set(new_owner);
        Ok(())
    }

    pub fn request_purchase(&mut self, parcel_id: String) -> Result<(), Vec<u8>> {
        let key = keccak256(parcel_id.as_bytes());
        if !self.exists.get(key) { return Err(b"Parcel not found".to_vec()); }
        if !self.records.get(key).is_verified.get() { return Err(b"Parcel is not verified".to_vec()); }
        if self.proposed_buyer.get(key) != Address::ZERO { return Err(b"Purchase already in progress".to_vec()); }
        let buyer = self.vm().msg_sender();
        if buyer == self.records.get(key).owner.get() { return Err(b"Owner cannot buy own parcel".to_vec()); }
        self.proposed_buyer.setter(key).set(buyer);
        Ok(())
    }

    pub fn approve_sale(&mut self, parcel_id: String, buyer: Address) -> Result<(), Vec<u8>> {
        let key = keccak256(parcel_id.as_bytes());
        if !self.exists.get(key) { return Err(b"Parcel not found".to_vec()); }
        if self.records.get(key).owner.get() != self.vm().msg_sender() { return Err(b"Only owner can approve sale".to_vec()); }
        if self.proposed_buyer.get(key) != buyer { return Err(b"Buyer does not match purchase request".to_vec()); }
        self.seller_approved.setter(key).set(true);
        Ok(())
    }

    pub fn accept_purchase(&mut self, parcel_id: String) -> Result<(), Vec<u8>> {
        let key = keccak256(parcel_id.as_bytes());
        if !self.seller_approved.get(key) { return Err(b"Seller approval required".to_vec()); }
        if self.proposed_buyer.get(key) != self.vm().msg_sender() { return Err(b"Only proposed buyer can accept".to_vec()); }
        self.buyer_approved.setter(key).set(true);
        Ok(())
    }

    pub fn finalize_transfer(&mut self, parcel_id: String) -> Result<(), Vec<u8>> {
        if self.vm().msg_sender() != self.admin.get() { return Err(b"Only registry admin can finalize".to_vec()); }
        let key = keccak256(parcel_id.as_bytes());
        if !self.seller_approved.get(key) || !self.buyer_approved.get(key) { return Err(b"Both parties must approve".to_vec()); }
        let mut record = self.records.setter(key);
        record.owner.set(self.proposed_buyer.get(key));
        self.proposed_buyer.setter(key).set(Address::ZERO);
        self.seller_approved.setter(key).set(false);
        self.buyer_approved.setter(key).set(false);
        Ok(())
    }

    pub fn verify_land(&mut self, parcel_id: String) -> Result<(), Vec<u8>> {
        if self.vm().msg_sender() != self.admin.get() {
            return Err(b"Unauthorized: not admin".to_vec());
        }
        let key = keccak256(parcel_id.as_bytes());
        if !self.exists.get(key) {
            return Err(b"Parcel not found".to_vec());
        }
        let mut record = self.records.setter(key);
        if record.is_verified.get() {
            return Err(b"Already verified".to_vec());
        }
        record.is_verified.set(true);
        Ok(())
    }

    pub fn get_land(&self, parcel_id: String) -> (Address, String, u64, bool, u64) {
        let key = keccak256(parcel_id.as_bytes());
        let record = self.records.get(key);
        (
            record.owner.get(),
            record.location.get_string(),
            record.area_sqft.get().to::<u64>(),
            record.is_verified.get(),
            record.registration_timestamp.get().to::<u64>(),
        )
    }
}
