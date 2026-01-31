# Canteen Management System

A modern, QR-based canteen ordering system built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS.

## 🚀 Features

### For Customers
- **QR Code Scanning**: Scan table QR codes to access the menu instantly
- **Interactive Menu**: Browse items by category, search, and filter by veg/non-veg
- **Cart Management**: Add items, adjust quantities, add special instructions
- **Real-time Order Tracking**: Track order status from placement to delivery
- **Order History**: View past orders and their details

### For Staff
- **Order Dashboard**: View all incoming orders in real-time
- **Order Management**: Accept/reject orders, set ETA, update status
- **Quick Actions**: Move orders through stages (Pending → Accepted → Preparing → Ready → Delivered)
- **Status Filtering**: Filter orders by status for efficient management

### For Admin
- **Menu Management**: Add, edit, delete menu items with full details
- **Table Management**: Create tables and generate unique QR codes
- **QR Code Download**: Download QR codes for printing and display

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **QR Generation**: qrcode library

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── menu/             # Menu CRUD
│   │   ├── orders/           # Order management
│   │   ├── tables/           # Table and QR management
│   │   └── seed/             # Database seeding
│   ├── admin/                # Admin pages
│   │   ├── menu/             # Menu management
│   │   └── tables/           # Table/QR management
│   ├── staff/                # Staff dashboard
│   ├── menu/[tableCode]/     # Customer menu (QR landing)
│   ├── cart/                 # Shopping cart
│   ├── order/[id]/           # Order tracking
│   └── history/              # Order history
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── customer/             # Customer-specific components
│   └── staff/                # Staff-specific components
├── lib/                      # Utilities
│   ├── db/                   # Database connection
│   └── utils.ts              # Helper functions
├── models/                   # Mongoose models
├── store/                    # Zustand stores
└── types/                    # TypeScript types
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
cd canteen-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your values
```

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/canteen
AUTH_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Canteen Express
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Seeding Sample Data

To populate the database with sample menu items and tables:

```bash
# Using curl
curl -X POST http://localhost:3000/api/seed

# Or open in browser and use the developer console
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

## 📱 User Flows

### Customer Flow
1. Customer scans QR code at table → Lands on menu page
2. Browse menu, add items to cart
3. View cart, enter phone number, place order
4. Track order status in real-time
5. Receive updates when order is ready

### Staff Flow
1. Open staff dashboard at `/staff`
2. View incoming orders (auto-refreshes every 5 seconds)
3. Click order to view details
4. Accept order and set ETA
5. Update status as order progresses
6. Mark as delivered when complete

### Admin Flow
1. Open admin panel from homepage
2. Manage menu items at `/admin/menu`
3. Add/edit/delete menu items
4. Manage tables at `/admin/tables`
5. Generate and download QR codes for tables

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with orange accents
- **Glassmorphism**: Subtle glass effects on cards and headers
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Works great on mobile, tablet, and desktop
- **Real-time Updates**: Polling for order status updates

## 📝 API Endpoints

### Menu
- `GET /api/menu` - List all menu items
- `POST /api/menu` - Create menu item
- `GET /api/menu/[id]` - Get single item
- `PUT /api/menu/[id]` - Update item
- `DELETE /api/menu/[id]` - Delete item

### Orders
- `GET /api/orders` - List orders (with filters)
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status/ETA

### Tables
- `GET /api/tables` - List all tables
- `POST /api/tables` - Create table
- `GET /api/tables/[id]/qr` - Get QR code for table
- `GET /api/tables/qr/[code]` - Lookup table by QR code
- `DELETE /api/tables/[id]` - Deactivate table

## 🔧 Configuration

### MongoDB Setup

For local development:
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

For production, use MongoDB Atlas:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with `npm run build && npm start`

## 📄 License

MIT License - feel free to use this project for your canteen!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
