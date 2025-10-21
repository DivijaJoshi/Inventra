# Inventra - Smart Inventory & Order Management System

A full-stack inventory and order management dashboard built with React, Node.js, Express, and MongoDB. Features AI-powered insights using Google's Gemini 2.0 Flash model.

## Features

### Backend Features
- **Authentication**: JWT-based authentication with role management
- **Product Management**: CRUD operations with stock tracking
- **Order Management**: Order processing with automatic stock updates
- **Supplier Management**: Supplier information and rating system
- **Analytics**: Dashboard analytics and AI-powered insights
- **Smart Alerts**: Automated low-stock notifications using cron jobs

### Frontend Features
- **Modern UI**: Built with React, Tailwind CSS, and Lucide icons
- **Dashboard**: Real-time analytics with interactive charts
- **Product Management**: Search, filter, and manage inventory
- **Order Processing**: Create orders with automatic stock deduction
- **Supplier Management**: Manage supplier information and ratings
- **AI Assistant**: Natural language queries for inventory insights

### AI Features
- **Predictive Analytics**: AI-powered stock predictions using Gemini 2.0 Flash
- **Natural Queries**: Ask questions like "Which items are running low?"
- **Smart Recommendations**: Get AI-driven insights for inventory management

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Google Generative AI (Gemini 2.0 Flash)
- node-cron for scheduled tasks

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls
- React Router for navigation

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventra
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=key
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/lowstock` - Get low stock products

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `PATCH /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `POST /api/analytics/ai-insights` - Get AI insights

## Usage

### First Time Setup

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Register a new admin account
4. Add suppliers and products
5. Create orders and track inventory

### AI Assistant Usage

Use the AI assistant on the dashboard to ask questions like:
- "Which items are running low and when should I reorder them?"
- "What are my top-selling products this month?"
- "Show me inventory trends and recommendations"

### Default Login (After creating an account)
- Email: admin@inventra.com
- Password: admin123
- Role: admin

## Project Structure

```
inventra/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.