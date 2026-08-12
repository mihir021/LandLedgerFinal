# LandLedger Codebase Audit Report

## Summary of Findings

| Severity | Area | Issue Title | Effort |
| :--- | :--- | :--- | :--- |
| **Critical** | Config/Infra | Hardcoded JWT Secret Fallback | Small |
| **Critical** | Frontend | Optimistic Property Registration Race Condition | Medium |
| **High** | Frontend | Optimistic Purchase Request Race Condition | Medium |
| **High** | Config/Infra | Database Connection Errors Swallowed Silently | Small |
| **Medium** | Frontend | Missing Data Polling on Seller & Admin Dashboards | Small |
| **Medium** | Backend | Chain Network Config Mismatch | Small |
| **Medium** | Backend | Auth Gap in Manual Transfer Completion Fallback | Small |

---

## Config/Infra

### [SEVERITY: Critical] Hardcoded JWT Secret Fallback
**Location:** `backend/src/middleware/authMiddleware.js:30` and `backend/src/utils/generateToken.js:12`
**Problem:** The JWT logic uses a fallback: `process.env.JWT_SECRET || 'landledger_secure_jwt_fallback_key'`.
**Why it matters:** If the `JWT_SECRET` environment variable is ever accidentally omitted in production (e.g., during a Vercel deployment update), the system silently falls back to a public, hardcoded string. Anyone reading the source code can forge a valid JWT token and hijack the platform as an Admin.
**Fix:** Remove the fallback string entirely. Instead, add a startup check or throw a loud error: `if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing');`.
**Effort:** Small

### [SEVERITY: High] Database Connection Errors Swallowed Silently
**Location:** `backend/src/config/database.js:20`
**Problem:** The `connectDB` function wraps `mongoose.connect` in a try/catch, but the catch block only logs the error (`logger.error`) without rethrowing or exiting.
**Why it matters:** In a serverless environment, if the DB fails to connect (e.g., due to IP whitelisting or bad credentials), the Express app continues to execute the route logic without a database connection, leading to cascading, unhandled `undefined` errors deeper in the controllers.
**Fix:** Remove the try/catch or explicitly `throw error` inside the catch block so the serverless function fails loudly.
**Effort:** Small

---

## Frontend

### [SEVERITY: Critical] Optimistic Property Registration Race Condition
**Location:** `src/pages/RegisterProperty.jsx:199` (`handleSubmit`)
**Problem:** The frontend calls `writeContractAsync` and immediately takes the returned `txHash` to call the `createProperty` backend API, assuming the blockchain transaction was successful. 
**Why it matters:** `writeContractAsync` resolves as soon as the user signs the transaction and it enters the mempool — it does not wait for block mining. If the transaction eventually drops or reverts on the blockchain, the MongoDB database is permanently updated with a fake property listing pointing to a failed `txHash`.
**Fix:** Shift to a "Sync-on-Read" architecture (similar to the transfer fix) where the backend monitors `pending` property registrations, OR implement a safe polling loop on the frontend using `useWaitForTransactionReceipt`.
**Effort:** Medium

### [SEVERITY: High] Optimistic Purchase Request Race Condition
**Location:** `src/pages/PropertyDetails.jsx:129` (`handlePurchase`)
**Problem:** Similar to the registration bug, the frontend submits the `requestPurchase` smart contract transaction and immediately hits the `requestTransfer` backend endpoint.
**Why it matters:** The backend instantly marks the property as `isListed: false` to lock it from other buyers. If the smart contract transaction reverts, the property is permanently locked off the market in the database, even though no valid request exists on-chain.
**Fix:** The backend should accept the `txHash` but put the transfer in a `pendingRequest` state without delisting the property. A backend sync-on-read check should confirm the transaction before locking the listing.
**Effort:** Medium

### [SEVERITY: Medium] Missing Data Polling on Seller & Admin Dashboards
**Location:** `src/pages/SellerProperties.jsx`, `src/pages/AdminProperties.jsx`, and `src/pages/SellerRequests.jsx`
**Problem:** These pages fetch data using a single `useEffect` on component mount and never refresh.
**Why it matters:** The LandLedger workflow is highly asynchronous and multi-party. If an officer verifies a property or a buyer requests a transfer, the seller will not see these updates unless they manually refresh the page. This leads to a stale, unresponsive UX.
**Fix:** Implement a 10-second `setInterval` polling loop inside the `useEffect` of these components, similar to the logic added to `BuyerPurchases.jsx`.
**Effort:** Small

---

## Backend

### [SEVERITY: Medium] Chain Network Config Mismatch
**Location:** `backend/src/controllers/propertyController.js:242` and `358`
**Problem:** When creating or verifying properties, the backend hardcodes `'blockchain.chainNetwork': 'Sepolia'` into the MongoDB document.
**Why it matters:** The smart contracts and frontend `viem` configurations were correctly migrated to Arbitrum Sepolia (`arbitrumSepolia`), but the database schema (`models/Property.js`) and controllers still hardcode Ethereum Sepolia. This mismatch causes incorrect Block Explorer URLs to generate on the frontend and creates schema validation risks.
**Fix:** Update `models/Property.js` to include `'Arbitrum Sepolia'` in the `chainNetwork` enum, and update the controllers to inject the correct network name.
**Effort:** Small

### [SEVERITY: Medium] Auth Gap in Manual Transfer Completion Fallback
**Location:** `backend/src/controllers/transferController.js:347` (`completeTransfer`)
**Problem:** The manual `/api/transfers/complete` endpoint retrieves the transfer and executes the completion logic using the ID, but it lacks a controller-level check to ensure `req.user.role` is actually an admin or officer.
**Why it matters:** It relies 100% on the route-level middleware to protect the endpoint. If the routing file is ever refactored incorrectly, any authenticated user (including buyers/sellers) could manually force a transfer to complete by hitting this endpoint. 
**Fix:** Add a defense-in-depth role check: `if (!['admin', 'officer'].includes(req.user.role)) throw new ApiError(403, 'Unauthorized');`.
**Effort:** Small
