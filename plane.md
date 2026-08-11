# LandLedger — Arbitrum Stylus (Rust) Smart Contract Plan
### RainbowKit + MetaMask + Arbitrum Sepolia | 12-Hour Build Plan

This replaces the Solana/Anchor plan. Solana wallets (Phantom) are incompatible with
MetaMask/RainbowKit — those are EVM-only. Arbitrum Stylus keeps your contract in **Rust**
while deploying as a normal EVM-compatible contract, so RainbowKit works unmodified.

---

## 0. Non-negotiable: the Hour-3 Checkpoint

Stylus tooling (`cargo stylus`) is less mature than Solidity's. Budget for it to fight you.

**Rule: by the end of Hour 3, you must have a contract deployed to Arbitrum Sepolia —
even the unmodified hello-world/counter template.** If `cargo stylus check` or
`cargo stylus deploy` is still broken at that point, stop debugging Stylus and switch
to the **Solidity fallback contract** in Section 7. Your frontend (RainbowKit/wagmi)
does not change either way — it just points at a different ABI/address.

Don't spend hour 4, 5, 6 fighting a WASM instrumentation error. That's how a 12h plan dies.

---

## 1. Architecture

```
┌─────────────────────────────┐
│  React + Vite + Tailwind     │  ← BhoomiChain frontend (already planned)
│  + RainbowKit + wagmi + viem │
└──────────────┬────────────────┘
               │ ABI calls (identical whether contract is Rust/Stylus or Solidity)
┌──────────────▼────────────────┐
│  LandLedger contract           │
│  Rust (Stylus) on Arbitrum     │
│  Sepolia — chain ID 421614     │
└──────────────┬────────────────┘
               │ same wallet, same MetaMask, same RainbowKit modal
┌──────────────▼────────────────┐
│  MongoDB (properties, users…) │  ← off-chain metadata, tx hash written back
└─────────────────────────────────┘
```

**Arbitrum Sepolia details:**
- Chain ID: `421614` (`0x66eee`)
- Public RPC: `https://sepolia-rollup.arbitrum.io/rpc` (or `https://arbitrum-sepolia.drpc.org`)
- Explorer: `https://sepolia.arbiscan.io`
- Faucet: bridge Sepolia ETH via the official Arbitrum bridge, or use `https://faucets.chain.link/arbitrum-sepolia` / QuickNode's multi-chain faucet — get this funded in the first 15 minutes, faucets can be slow.

---

## 2. On-chain Data Model (EVM version — no PDAs)

Stylus runs on Arbitrum's EVM-compatible storage — you use **mappings**, not PDAs.

```rust
// src/lib.rs
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::string::String;
use alloy_primitives::{Address, B256, U256};
use stylus_sdk::{prelude::*, block, msg};

sol_storage! {
    #[entrypoint]
    pub struct LandLedger {
        mapping(bytes32 => LandRecord) records;
        mapping(bytes32 => bool) exists;
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
        self.admin.set(msg::sender());
    }

    pub fn register_land(&mut self, parcel_id: String, location: String, area_sqft: u64) -> Result<(), Vec<u8>> {
        let key = keccak(parcel_id.as_bytes());
        if self.exists.get(key) {
            return Err(b"Parcel already registered".to_vec());
        }
        let mut record = self.records.setter(key);
        record.owner.set(msg::sender());
        record.location.set_str(&location);
        record.area_sqft.set(U256::from(area_sqft));
        record.is_verified.set(false);
        record.registration_timestamp.set(U256::from(block::timestamp()));
        self.exists.setter(key).set(true);
        Ok(())
    }

    pub fn transfer_ownership(&mut self, parcel_id: String, new_owner: Address) -> Result<(), Vec<u8>> {
        let key = keccak(parcel_id.as_bytes());
        if !self.exists.get(key) {
            return Err(b"Parcel not found".to_vec());
        }
        let mut record = self.records.setter(key);
        if record.owner.get() != msg::sender() {
            return Err(b"Unauthorized: not the owner".to_vec());
        }
        if new_owner == Address::ZERO {
            return Err(b"Invalid new owner".to_vec());
        }
        record.owner.set(new_owner);
        Ok(())
    }

    pub fn verify_land(&mut self, parcel_id: String) -> Result<(), Vec<u8>> {
        if msg::sender() != self.admin.get() {
            return Err(b"Unauthorized: not admin".to_vec());
        }
        let key = keccak(parcel_id.as_bytes());
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
        let key = keccak(parcel_id.as_bytes());
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
```

This is a **starting point**, not guaranteed-to-compile code — Stylus SDK macro syntax
shifts between versions. Your agent should treat `cargo stylus check` errors as normal
and iterate. Budget ~1.5–2 hours for this file to compile clean (that's inside the Hour-3
checkpoint above).

---

## 3. Hour-by-Hour Plan (12 hours total)

| Hours | Task | Checkpoint |
|---|---|---|
| 0.0–0.5 | Install Rust 1.91+, `cargo install cargo-stylus`, Node.js, get Arbitrum Sepolia testnet ETH from faucet into MetaMask | Wallet shows testnet ETH balance |
| 0.5–1.0 | `cargo stylus new --minimal land-ledger`, run `cargo stylus check` on the unmodified template against Arbitrum Sepolia RPC | Template passes `check` — proves your whole toolchain works |
| 1.0–3.0 | Write `LandRecord` struct + 3 functions (Section 2), iterate with `cargo stylus check` until clean | **HARD CHECKPOINT** — if not clean by Hour 3, switch to Solidity (Section 7) |
| 3.0–3.5 | `cargo stylus deploy` to Arbitrum Sepolia, save contract address, `cargo stylus export-abi` | Contract live, visible on sepolia.arbiscan.io |
| 3.5–4.5 | Scaffold frontend: Vite+React+Tailwind (if not already from earlier BhoomiChain work), install wagmi + RainbowKit + viem, configure Arbitrum Sepolia chain | `ConnectButton` renders, MetaMask connects, correct chain shown |
| 4.5–6.5 | Wire `useWriteContract`/`useReadContract` (wagmi) to `register_land`, `transfer_ownership`, `verify_land`, `get_land` using the exported ABI | Can register a test parcel from the UI, see tx on Arbiscan |
| 6.5–8.0 | Build the actual forms/pages: register-land form, land-detail view showing verification status, transfer flow | Core user flows work end-to-end on testnet |
| 8.0–9.5 | Connect to MongoDB `properties` collection — write the on-chain `txHash` back into `blockchain.txHash` after a successful register/verify tx | Off-chain record and on-chain record link up by `propertyId` |
| 9.5–10.5 | UI polish to match your institutional light theme | Looks presentable for demo |
| 10.5–11.5 | End-to-end test: register → verify (as admin wallet) → transfer (as owner) → confirm all 3 txs on Arbiscan | No broken flow |
| 11.5–12.0 | Buffer — bug fixes, demo script, screen recording backup in case live demo network hiccups | Done |

---

## 4. RainbowKit + wagmi Setup

```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```tsx
// src/config/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'LandLedger',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // get free at cloud.walletconnect.com — 2 min signup
  chains: [arbitrumSepolia],
  ssr: false,
});
```

```tsx
// src/main.tsx
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* your app */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

```tsx
// Connect button — drop anywhere
import { ConnectButton } from '@rainbow-me/rainbowkit';
<ConnectButton />
```

```tsx
// src/hooks/useLandLedger.ts — example write call
import { useWriteContract } from 'wagmi';
import landLedgerAbi from '../abi/land_ledger.json'; // from `cargo stylus export-abi`

const CONTRACT_ADDRESS = '0xYourDeployedAddress';

export function useRegisterLand() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const register = (parcelId: string, location: string, areaSqft: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landLedgerAbi,
      functionName: 'registerLand',
      args: [parcelId, location, BigInt(areaSqft)],
    });
  };

  return { register, hash, isPending };
}
```

---

## 5. Deploy Commands (Stylus path)

```bash
# One-time setup
rustup target add wasm32-unknown-unknown
cargo install cargo-stylus

# Scaffold
cargo stylus new --minimal land-ledger
cd land-ledger

# After writing your contract, verify it will deploy/activate
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc

# Deploy (needs a funded testnet private key)
cargo stylus deploy \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $PRIVATE_KEY

# Export ABI for the frontend
cargo stylus export-abi --json > ../frontend/src/abi/land_ledger.json
```

---

## 6. Testing (abbreviated for 12h — don't skip this, but keep it minimal)

Given the timeline, skip full LiteSVM unit test suites. Do this instead:
1. `cargo stylus check` passing = your contract logic compiles and activates correctly.
2. Manual testnet pass: register → verify → transfer → confirm on Arbiscan (Hour 10.5–11.5 slot above). This is your actual proof-of-working-system for a demo.
3. If time allows after Hour 12 buffer, add 2–3 basic Rust unit tests using the Stylus SDK's `TestVM`.

---

## 7. Solidity Fallback (use ONLY if Hour-3 checkpoint fails)

Functionally identical contract, deploys the same way any EVM contract does (Hardhat/Foundry).
Your RainbowKit/wagmi frontend code from Section 4 needs **zero changes** — just point
`CONTRACT_ADDRESS` at this deployment and swap the ABI file.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LandLedger {
    struct LandRecord {
        address owner;
        string location;
        uint64 areaSqft;
        bool isVerified;
        uint64 registrationTimestamp;
    }

    mapping(bytes32 => LandRecord) public records;
    mapping(bytes32 => bool) public exists;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function registerLand(string calldata parcelId, string calldata location, uint64 areaSqft) external {
        bytes32 key = keccak256(bytes(parcelId));
        require(!exists[key], "Parcel already registered");
        records[key] = LandRecord(msg.sender, location, areaSqft, false, uint64(block.timestamp));
        exists[key] = true;
    }

    function transferOwnership(string calldata parcelId, address newOwner) external {
        bytes32 key = keccak256(bytes(parcelId));
        require(exists[key], "Parcel not found");
        require(records[key].owner == msg.sender, "Unauthorized");
        require(newOwner != address(0), "Invalid new owner");
        records[key].owner = newOwner;
    }

    function verifyLand(string calldata parcelId) external {
        require(msg.sender == admin, "Unauthorized");
        bytes32 key = keccak256(bytes(parcelId));
        require(exists[key], "Parcel not found");
        require(!records[key].isVerified, "Already verified");
        records[key].isVerified = true;
    }

    function getLand(string calldata parcelId) external view returns (
        address owner, string memory location, uint64 areaSqft, bool isVerified, uint64 registrationTimestamp
    ) {
        LandRecord memory r = records[keccak256(bytes(parcelId))];
        return (r.owner, r.location, r.areaSqft, r.isVerified, r.registrationTimestamp);
    }
}
```

```bash
# Fastest deploy path — Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup
forge init land-ledger-solidity && cd land-ledger-solidity
# paste contract into src/LandLedger.sol
forge create src/LandLedger.sol:LandLedger \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $PRIVATE_KEY
```

---

## 8. Prompt for your coding agent (Cursor / Claude Code)

```
I'm building LandLedger on Arbitrum Sepolia (chain ID 421614), a land registry dApp.
I have 12 hours. Primary path is a Rust smart contract using Arbitrum Stylus; if it's
not compiling cleanly after ~2 hours of effort, switch to the Solidity fallback — both
versions are provided below, do not spend excessive time debugging Stylus toolchain
issues past that point.

PRIMARY (Stylus/Rust):
1. Run `cargo stylus new --minimal land-ledger`, confirm `cargo stylus check` passes
   on the unmodified template against https://sepolia-rollup.arbitrum.io/rpc first —
   this validates the whole toolchain before I write real logic.
2. Implement the LandLedger contract with this storage model and these 4 functions:
   register_land(parcel_id, location, area_sqft), transfer_ownership(parcel_id, new_owner),
   verify_land(parcel_id) [admin-only], get_land(parcel_id) [view].
   [paste Section 2 code as starting point]
3. Iterate with `cargo stylus check` until clean, then `cargo stylus deploy` to
   Arbitrum Sepolia and `cargo stylus export-abi --json` for the frontend.

FALLBACK (Solidity, only if Stylus stalls):
[paste Section 7 contract + forge deploy commands]

FRONTEND (same regardless of contract language):
4. In the existing React+Vite+Tailwind frontend, install wagmi + RainbowKit + viem.
   Configure wagmi for Arbitrum Sepolia only (chain ID 421614). Use
   getDefaultConfig from RainbowKit — I'll provide a WalletConnect projectId.
5. Build: a ConnectButton in the header, a "Register Land" form calling registerLand,
   a land detail view calling getLand and showing verification status, an admin-only
   "Verify" button calling verifyLand, and a transfer form calling transferOwnership.
6. After any successful write transaction, PATCH the corresponding property in MongoDB
   (properties collection, blockchain.txHash field) with the returned transaction hash.
7. Show tx pending/success/error states clearly — I'm demoing this live, UX matters.

Give me a working local build I can test against Arbitrum Sepolia before deploy time runs out.
```