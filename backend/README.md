# 🏛️ LandLedger — Blockchain Land Registry System (Backend)

A production-grade Node.js backend for a decentralized land registry system. Built with Express, MongoDB, and JWT authentication — fully prepared for future blockchain (Stylus Smart Contract) integration.

---

## 📦 Installation

```bash
# Clone and navigate to the backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with default users
npm run seed

# Start the development server
npm run dev
```

---

## 🔐 Environment Variables

| Variable               | Description                    | Default                              |
| ---------------------- | ------------------------------ | ------------------------------------ |
| `PORT`                 | Server port                    | `5000`                               |
| `NODE_ENV`             | Environment                    | `development`                        |
| `MONGO_URI`            | MongoDB connection string      | `mongodb://localhost:27017/landledger`|
| `JWT_SECRET`           | JWT signing secret             | —                                    |
| `JWT_EXPIRE`           | JWT expiration                 | `7d`                                 |
| `CORS_ORIGIN`          | Allowed CORS origin            | `http://localhost:5173`              |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms)         | `900000`                             |
| `RATE_LIMIT_MAX`       | Max requests per window        | `100`                                |

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js            # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── propertyController.js  # Property CRUD + verification
│   │   ├── transferController.js  # Transfer approval workflow
│   │   ├── userController.js      # User management (admin)
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Role-based authorization
│   │   ├── errorMiddleware.js     # Centralized error handler
│   │   ├── uploadMiddleware.js    # Multer file uploads
│   │   └── validationMiddleware.js# Express Validator chains
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Transfer.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── userRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/                  # Reserved for business logic
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── generateToken.js       # JWT helper
│   │   └── logger.js              # Console logger
│   ├── app.js                     # Express app configuration
│   ├── server.js                  # Entry point
│   └── seed.js                    # Database seeder
├── uploads/
│   ├── images/                    # Uploaded property images
│   └── documents/                 # Uploaded property documents
├── .env.example
├── package.json
└── README.md
```

---

## 🌐 API Routes

### Health Check

| Method | Endpoint       | Description      | Access |
| ------ | -------------- | ---------------- | ------ |
| GET    | `/api/health`  | API health check | Public |

### Authentication

| Method | Endpoint            | Description                | Access  |
| ------ | ------------------- | -------------------------- | ------- |
| POST   | `/api/auth/register`| Register (buyer/seller)    | Public  |
| POST   | `/api/auth/login`   | Login                      | Public  |
| GET    | `/api/auth/me`      | Get current user           | Private |

### Properties

| Method | Endpoint                    | Description             | Access           |
| ------ | --------------------------- | ----------------------- | ---------------- |
| GET    | `/api/properties`           | List all properties     | Public           |
| GET    | `/api/properties/:id`       | Get single property     | Public           |
| POST   | `/api/properties`           | Create property         | Seller, Admin    |
| PUT    | `/api/properties/:id`       | Update property         | Seller (owner), Admin |
| DELETE | `/api/properties/:id`       | Delete property         | Seller (owner), Admin |
| PUT    | `/api/properties/:id/verify`| Verify/reject property  | Officer, Admin   |

### Transfers

| Method | Endpoint                        | Description           | Access          |
| ------ | ------------------------------- | --------------------- | --------------- |
| GET    | `/api/transfers`                | List transfers        | Private (scoped)|
| POST   | `/api/transfers/request`        | Request transfer      | Buyer           |
| POST   | `/api/transfers/seller-approve` | Seller approves       | Seller          |
| POST   | `/api/transfers/officer-approve`| Officer approves      | Officer, Admin  |
| POST   | `/api/transfers/complete`       | Complete transfer     | Officer, Admin  |

### Users

| Method | Endpoint                 | Description          | Access          |
| ------ | ------------------------ | -------------------- | --------------- |
| GET    | `/api/users`             | List all users       | Admin           |
| GET    | `/api/users/:id`         | Get user by ID       | Admin           |
| PUT    | `/api/users/:id`         | Update user          | Self, Admin     |
| PUT    | `/api/users/:id/verify`  | Verify/reject user   | Admin, Officer  |
| DELETE | `/api/users/:id`         | Delete user          | Admin           |

### Notifications

| Method | Endpoint                         | Description             | Access  |
| ------ | -------------------------------- | ----------------------- | ------- |
| GET    | `/api/notifications`             | Get my notifications    | Private |
| PUT    | `/api/notifications/read-all`    | Mark all as read        | Private |
| PUT    | `/api/notifications/:id/read`    | Mark one as read        | Private |
| DELETE | `/api/notifications/:id`         | Delete notification     | Private |

---

## 🧑‍💻 Seed Users

| Role    | Email                    | Password     |
| ------- | ------------------------ | ------------ |
| Admin   | admin@landledger.com     | Admin@123    |
| Officer | officer@landledger.com   | Officer@123  |
| Seller  | seller@landledger.com    | Seller@123   |
| Buyer   | buyer@landledger.com     | Buyer@123    |

```bash
npm run seed
```

---

## 🚀 How to Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000` by default.

---

## 🔗 Future Blockchain Integration

The backend is pre-wired for blockchain integration. Every property document already includes:

- `blockchainPropertyId` — on-chain property identifier
- `blockchainTx` — transaction hash of the registration
- `currentOwnerWallet` — wallet address of the current owner

The transfer model includes:

- `transactionHash` — on-chain transfer transaction hash

**Where to integrate:**

Search for `// TODO: Call Stylus Smart Contract Here` across the codebase. Key integration points:

1. **`propertyController.js`** — Register, update, delete, and verify properties on-chain
2. **`transferController.js`** — Record approvals and complete ownership transfers on-chain
3. **`src/services/`** — Add a `blockchainService.js` to encapsulate all smart contract calls

**Recommended approach:**

```
src/services/blockchainService.js
├── registerProperty(propertyData)
├── updateProperty(propertyId, data)
├── transferOwnership(from, to, propertyId)
├── verifyProperty(propertyId)
└── getPropertyFromChain(propertyId)
```

---

## 🛡️ Security

- **Helmet** — HTTP security headers
- **CORS** — Configurable allowed origins
- **Rate Limiting** — Prevents brute-force attacks
- **NoSQL Injection Protection** — `express-mongo-sanitize`
- **JWT Authentication** — Stateless, token-based auth
- **Password Hashing** — bcrypt with 12 salt rounds
- **Input Validation** — `express-validator` on every route

---

## 📜 License

ISC
