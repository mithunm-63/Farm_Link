# 🌾 FarmLink — Direct Farm-to-Retail Marketplace

A production-ready MERN stack platform connecting farmers directly with retailers, eliminating middlemen and creating fair, transparent commerce.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Redux   │  │ React    │  │ Socket.io Client       │ │
│  │  Toolkit │  │ Router   │  │ (Real-time updates)    │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│               BACKEND (Node.js + Express)                │
│  ┌─────────────┐ ┌───────────┐ ┌──────────────────────┐ │
│  │ JWT Auth    │ │ Socket.io │ │ RESTful API Routes   │ │
│  │ Middleware  │ │ Server    │ │ /api/auth /api/crops │ │
│  └─────────────┘ └───────────┘ │ /api/orders /api/... │ │
│                                └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐│
│  │              MVC Controllers                         ││
│  │  authController │ cropController │ orderController  ││
│  └──────────────────────────────────────────────────────┘│
└───────────────────────┬─────────────────────────────────┘
                        │ Mongoose ODM
┌───────────────────────▼─────────────────────────────────┐
│                    MongoDB Atlas                          │
│  Collections: Users │ Crops │ Orders │ Reviews          │
│               Notifications                              │
└─────────────────────────────────────────────────────────┘
External Services:
  ☁️  Cloudinary      → Image uploads & CDN
  📧  Nodemailer      → Email notifications
  💳  Stripe          → Payment processing (optional)
  🔌  Socket.io       → Real-time order updates
```

---

## 📁 Project Structure

```
farmlink/
├── backend/
│   ├── config/              # Database & cloud config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cropController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect & authorize
│   │   └── errorHandler.js  # Global error handling
│   ├── models/
│   │   ├── User.js          # Farmer & Retailer schema
│   │   ├── Crop.js          # Product listing schema
│   │   ├── Order.js         # Order lifecycle schema
│   │   ├── Review.js        # Ratings & reviews schema
│   │   └── Notification.js  # In-app notifications
│   ├── routes/
│   │   ├── auth.js
│   │   ├── crops.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   ├── notifications.js
│   │   ├── uploads.js
│   │   └── payments.js
│   ├── utils/
│   │   ├── socketHandlers.js # Real-time socket events
│   │   ├── notificationHelper.js
│   │   ├── email.js          # Nodemailer
│   │   └── seeder.js         # Sample data seeder
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── common/
        │       ├── Navbar.js
        │       ├── Footer.js
        │       ├── LoadingSpinner.js  # + StarRating, Badge, Modal
        │       └── CropCard.js
        ├── context/
        │   └── SocketContext.js
        ├── pages/
        │   ├── HomePage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── MarketplacePage.js
        │   ├── CropDetailPage.js
        │   ├── FarmerDashboard.js
        │   ├── RetailerDashboard.js
        │   ├── AddCropPage.js
        │   ├── EditCropPage.js
        │   ├── OrdersPage.js
        │   ├── OrderDetailPage.js
        │   ├── ProfilePage.js
        │   └── NotFoundPage.js
        ├── services/
        │   └── api.js         # Axios + all API methods
        ├── store.js            # Redux Toolkit store + slices
        ├── App.js
        ├── index.js
        └── index.css
```

---

## 🗄️ MongoDB Schema Design

### User Schema
```javascript
{
  name, email, password (hashed), role: ['farmer','retailer','admin'],
  phone, avatar: { public_id, url },
  location: { address, city, state, pincode, coordinates: { lat, lng } },
  // Farmer fields:
  farmName, farmSize, cropTypes[], farmingType, yearsOfExperience,
  // Retailer fields:
  businessName, businessType, gstNumber, preferredCrops[],
  // Stats:
  rating: { average, count }, totalTransactions, totalRevenue, totalSpent,
  isVerified, isActive, socketId, lastSeen,
  timestamps: true
}
```

### Crop Schema
```javascript
{
  farmer: ObjectId(User), name, category, description,
  images: [{ public_id, url, isMain }],
  pricePerUnit, unit, minimumOrderQuantity,
  availableQuantity, reservedQuantity,
  harvestDate, expiryDate, grade, isOrganic, certifications[],
  location: { address, city, state, pincode, coordinates },
  status: ['active','inactive','sold_out','expired'],
  rating: { average, count }, views, orderCount,
  shippingAvailable, shippingCost, deliveryDays,
  tags[], isFeatured,
  timestamps: true
}
```

### Order Schema
```javascript
{
  orderNumber (auto-generated: FL-timestamp-seq),
  retailer: ObjectId(User), farmer: ObjectId(User), crop: ObjectId(Crop),
  cropSnapshot: { name, category, pricePerUnit, unit, imageUrl },
  quantity, pricePerUnit, subtotal, shippingCost, totalAmount,
  status: ['pending','accepted','rejected','processing','shipped','delivered','cancelled','refunded'],
  statusHistory: [{ status, timestamp, note, updatedBy }],
  deliveryAddress: { name, phone, address, city, state, pincode },
  expectedDeliveryDate, actualDeliveryDate, trackingNumber,
  notes, rejectionReason,
  payment: { method, status, transactionId, paidAt },
  farmerReviewed, retailerReviewed,
  timestamps: true
}
```

### Review Schema
```javascript
{
  order, crop, reviewer, reviewee, reviewerRole,
  rating (1-5), title, comment,
  qualityRating, packagingRating, communicationRating,
  images[], isVerified, helpfulVotes, reply: { text, repliedAt },
  timestamps: true
}
```

---

## 🔌 API Routes Documentation

### Auth Routes `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register farmer/retailer |
| POST | `/login` | Public | Login + JWT |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update profile |
| PUT | `/change-password` | Private | Change password |
| POST | `/forgot-password` | Public | Send reset email |
| PUT | `/reset-password/:token` | Public | Reset password |

### Crops Routes `/api/crops`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all crops (filters, pagination, search) |
| GET | `/featured` | Public | Get featured crops |
| GET | `/my-listings` | Farmer | Get own listings |
| GET | `/farmer-stats` | Farmer | Dashboard stats |
| GET | `/:id` | Public | Get single crop |
| POST | `/` | Farmer | Create listing |
| PUT | `/:id` | Farmer/Admin | Update listing |
| DELETE | `/:id` | Farmer/Admin | Delete listing |

**Query Params for GET `/`:**
```
?search=tomato&category=vegetables&city=Mumbai&state=Maharashtra
&minPrice=10&maxPrice=500&isOrganic=true&unit=kg&grade=A
&page=1&limit=12&sort=-createdAt|pricePerUnit|-pricePerUnit|-rating
```

### Orders Routes `/api/orders`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Retailer | Place order |
| GET | `/` | Private | Get own orders |
| GET | `/retailer-stats` | Retailer | Dashboard stats |
| GET | `/:id` | Private | Get order detail |
| PUT | `/:id/status` | Private | Update status |

**Status Transitions:**
- Farmer: `pending → accepted/rejected`, `accepted → processing/shipped`, `shipped → delivered`
- Retailer: `pending/accepted → cancelled`

### Reviews Routes `/api/reviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | `?cropId=&userId=` |
| POST | `/` | Private | Create review (delivered orders only) |

### Notifications Routes `/api/notifications`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get notifications |
| PUT | `/:id/read` | Private | Mark read |
| PUT | `/read-all` | Private | Mark all read |
| DELETE | `/:id` | Private | Delete |

### Payments Routes `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create-intent` | Retailer | Create Stripe payment intent |
| POST | `/confirm` | Private | Confirm payment |
| POST | `/webhook` | Public | Stripe webhook |

---

## ⚡ Socket.io Real-Time Events

### Client → Server
```javascript
socket.emit('join', userId)      // Authenticate socket session
socket.emit('typing', { roomId, userName })
socket.emit('stop_typing', { roomId })
```

### Server → Client
```javascript
socket.on('notification', (notification) => {})  // New notification
socket.on('order_update', ({ orderNumber, status }) => {})
socket.on('user_typing', ({ userName }) => {})
```

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/farmlink.git
cd farmlink
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values:
#   MONGO_URI=mongodb://localhost:27017/farmlink
#   JWT_SECRET=your_secret_here (min 32 chars)
#   CLOUDINARY_* (for image uploads)
#   SMTP_* (for emails)

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

# Start development server
npm start
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/health

### 5. Demo Credentials (after seeding)
```
Farmer:   farmer1@farmlink.com  / password123
Retailer: retailer1@farmlink.com / password123
```

---

## 🌐 Deployment Guide

### Option A: Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Create new Web Service on render.com
2. Connect GitHub repo, set root directory to `backend/`
3. Build: `npm install`, Start: `npm start`
4. Add environment variables from `.env`
5. Note the deployed URL (e.g. `https://farmlink-api.onrender.com`)

**Frontend on Vercel:**
1. Import project on vercel.com
2. Set root directory to `frontend/`
3. Add environment variables:
   - `REACT_APP_API_URL=https://farmlink-api.onrender.com/api`
   - `REACT_APP_SOCKET_URL=https://farmlink-api.onrender.com`
4. Deploy

### Option B: AWS (Production Scale)

```
Frontend:  S3 + CloudFront CDN
Backend:   EC2 (t3.medium) or ECS + ECR (Docker)
Database:  MongoDB Atlas M10+ (VPC peered)
Storage:   Cloudinary (images) / S3 (files)
Emails:    AWS SES
Payments:  Stripe
CDN:       CloudFront
Secrets:   AWS Secrets Manager
CI/CD:     GitHub Actions → ECR → ECS
```

**Docker Compose (development):**
```yaml
version: '3'
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
  backend:
    build: ./backend
    ports: ["5000:5000"]
    env_file: ./backend/.env
    depends_on: [mongo]
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
volumes:
  mongo_data:
```

### Option C: Railway (Simplest)
1. Connect GitHub on railway.app
2. Create Mongo, Backend, Frontend services
3. Set env vars, auto-deploys on push

---

## 🔑 Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | JWT (stateless) | Scales horizontally, no session storage needed |
| State | Redux Toolkit | Complex shared state, dev tools support |
| Real-time | Socket.io | Bi-directional, fallback polling, rooms |
| Images | Cloudinary | CDN + transforms + free tier generosity |
| Passwords | bcrypt (12 rounds) | Industry standard, slow by design |
| API design | RESTful MVC | Clear separation, testable, familiar |
| Pagination | Cursor-skip | Simple; upgrade to cursor-based at scale |
| Rate limiting | express-rate-limit | 100 req/15min per IP |

---

## 🛡️ Security Checklist

- [x] Password hashing with bcrypt (12 rounds)
- [x] JWT with configurable expiry
- [x] Role-based access control (farmer/retailer/admin)
- [x] Rate limiting on all API routes
- [x] Helmet.js security headers
- [x] CORS restricted to frontend domain
- [x] Input validation with mongoose validators
- [x] Password fields never returned in responses
- [x] Environment variables for all secrets
- [x] Owner-only crop editing/deletion
- [x] Order access restricted to involved parties

---

## 🔮 Future Enhancements

1. **Chat System** — Socket.io rooms for farmer-retailer messaging
2. **Geolocation** — MongoDB geospatial queries for nearby farmers
3. **Push Notifications** — Firebase Cloud Messaging (FCM)
4. **Analytics Dashboard** — Revenue charts, top crops, peak seasons
5. **Subscription Model** — Premium listings, featured placement
6. **Mobile App** — React Native sharing the API
7. **AI Recommendations** — Crop suggestions based on purchase history
8. **Bulk Import** — CSV upload for large farm inventories
9. **Dispute Resolution** — Automated mediation workflow
10. **Multi-language** — i18n for regional farmers

---

## 📄 License

MIT License — Free to use for commercial and non-commercial projects.

---

*Built with ❤️ for India's 140M+ farming families*
