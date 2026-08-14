# 🏛️ LandLedger

**LandLedger** is a secure, Web3-powered decentralized land registry and property transfer system. It aims to eliminate real estate fraud, eliminate bureaucracy, and drastically reduce property transfer timelines by digitizing the entire land ownership lifecycle onto the blockchain.

---

## 🌟 Key Features

1. **Role-Based Access Control**
   - **Buyer**: Discover verified properties on the marketplace, request purchases, and securely escrow funds.
   - **Seller**: Register properties for government verification and manage incoming purchase requests.
   - **Government Officer**: Manually verify user KYC identity and cross-check physical property deeds before minting them on-chain.
   - **Admin**: Oversee the entire platform, manage user suspensions, and view analytics.

2. **Secure Smart Contract Escrow**
   - Built on **Arbitrum Stylus (Rust)**, ensuring high performance, enterprise-grade security, and low gas fees.
   - When a buyer initiates a transfer, funds are securely locked in an on-chain escrow. They are only released to the seller once the property is officially transferred by a Government Officer.

3. **100% EVM Compatible**
   - Despite the core engine being written in Rust, LandLedger remains fully compatible with standard Web3 wallets like MetaMask.

4. **Immutable Audit Trail**
   - Every property registered on the platform has a tamper-proof history of ownership recorded on the Arbitrum Sepolia testnet.

---

## 🏗️ Technology Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons), GSAP/Three.js (3D Landing), Wagmi (Web3).
*   **Backend**: Node.js, Express, MongoDB, Mongoose, Cloudinary (Image Hosting).
*   **Smart Contracts**: Rust, Arbitrum Stylus (Deployed on Arbitrum Sepolia Testnet).

---

## 🚀 How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (or local MongoDB)
*   MetaMask Extension (configured for Arbitrum Sepolia)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and stay in the root project folder (`LandLedger`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the contract address:
   ```env
   VITE_CONTRACT_ADDRESS=0x4388b20d6a35e62ddc2b0fc872de6a0ce2bd3664
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Smart Contract Deployment (Optional)

If you wish to compile and deploy the Arbitrum Stylus Rust contract yourself:

1. Navigate to the `smart_contracts` folder:
   ```bash
   cd smart_contracts
   ```
2. Ensure you have Rust and the Stylus CLI installed:
   ```bash
   cargo install --force cargo-stylus
   rustup target add wasm32-unknown-unknown
   ```
3. Create a `.env` file in the `smart_contracts` directory:
   ```env
   PRIVATE_KEY=your_metamask_private_key
   RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
   ```
4. Check the contract and deploy:
   ```bash
   cargo stylus check
   cargo stylus deploy --private-key-path .env
   ```

---

## 🌍 Important Links
*   **Live Demo**: [www.landledger.online](https://www.landledger.online/)
*   **Arbitrum Sepolia Chain ID**: `421614`
*   **Live Contract Address**: `0x4388b20d6a35e62ddc2b0fc872de6a0ce2bd3664`
