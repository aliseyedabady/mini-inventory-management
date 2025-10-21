# Mini Inventory Management System

A professional and modern inventory management system built with NestJS backend and React frontend, following Clean Code principles and best practices.

## 🚀 Features

### Backend (NestJS + TypeORM + PostgreSQL)
- **Modular Architecture**: Clean separation of concerns with modules for Products, Categories, Inventory, and Transactions
- **TypeORM Integration**: Database operations with PostgreSQL
- **Repository Pattern**: Custom repository implementation for better data access
- **DTOs & Validation**: Request/response validation using class-validator
- **RESTful API**: Well-structured endpoints with proper HTTP status codes
- **Pagination & Filtering**: Advanced query capabilities with sorting and filtering
- **Error Handling**: Comprehensive error handling and validation
- **Database Relations**: Proper entity relationships and foreign keys

### Frontend (React + TypeScript + Tailwind CSS)
- **Modern UI**: Clean and responsive design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **Form Validation**: Client-side validation with react-hook-form
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Component Architecture**: Reusable and maintainable components
- **State Management**: Efficient state management with React Query

## 📋 System Requirements

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mini-inventory-management
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=mini_inventory
# JWT_SECRET=your-super-secret-jwt-key
# JWT_EXPIRES_IN=24h
# PORT=3000
# NODE_ENV=development

# Start the backend server
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:3000/api/v1" > .env

# Start the frontend development server
npm start
```

The frontend will be available at `http://localhost:3001`

## 🗄️ Database Schema

### Entities

#### Categories
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `description` (TEXT, Optional)
- `isActive` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### Products
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `sku` (VARCHAR, Unique)
- `description` (TEXT, Optional)
- `price` (DECIMAL)
- `cost` (DECIMAL, Optional)
- `unit` (VARCHAR, Optional)
- `isActive` (BOOLEAN)
- `categoryId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### Inventory
- `id` (UUID, Primary Key)
- `currentStock` (INTEGER)
- `minimumStock` (INTEGER)
- `maximumStock` (INTEGER)
- `averageCost` (DECIMAL, Optional)
- `lastRestockedAt` (TIMESTAMP, Optional)
- `productId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### Transactions
- `id` (UUID, Primary Key)
- `type` (ENUM: purchase, sale, adjustment, return)
- `quantity` (INTEGER)
- `unitPrice` (DECIMAL, Optional)
- `totalAmount` (DECIMAL, Optional)
- `notes` (TEXT, Optional)
- `reference` (VARCHAR, Optional)
- `transactionDate` (TIMESTAMP)
- `productId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (TIMESTAMP)

## 🔌 API Endpoints

### Categories
- `GET /api/v1/categories` - Get all categories (with pagination, filtering, sorting)
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create new category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Products
- `GET /api/v1/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PATCH /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Inventory
- `GET /api/v1/inventory` - Get all inventory items (with pagination, filtering, sorting)
- `GET /api/v1/inventory/:id` - Get inventory item by ID
- `GET /api/v1/inventory/product/:productId` - Get inventory by product ID
- `GET /api/v1/inventory/low-stock` - Get low stock items
- `PATCH /api/v1/inventory/:id` - Update inventory item

### Transactions
- `GET /api/v1/transactions` - Get all transactions (with pagination, filtering, sorting)
- `GET /api/v1/transactions/:id` - Get transaction by ID
- `POST /api/v1/transactions` - Create new transaction
- `PATCH /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction
- `GET /api/v1/transactions/summary` - Get transaction summary

## 🎨 Frontend Pages

### Dashboard
- Overview of system statistics
- Recent products and transactions
- Low stock alerts
- Quick access to all modules

### Products Management
- CRUD operations for products
- Advanced filtering and search
- Category assignment
- Price and cost tracking
- SKU management

### Categories Management
- CRUD operations for categories
- Category hierarchy support
- Product count tracking
- Active/inactive status

### Inventory Management
- Real-time stock levels
- Low stock alerts
- Stock level tracking
- Inventory adjustments
- Stock history

### Transactions Management
- Transaction recording (Purchase, Sale, Adjustment, Return)
- Transaction history
- Stock impact tracking
- Reference number management
- Date-based filtering

## 🏗️ Architecture

### Backend Architecture
```
src/
├── common/
│   └── repositories/
│       └── base.repository.ts
├── database/
│   └── database.config.ts
├── modules/
│   ├── categories/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── products/
│   ├── inventory/
│   └── transactions/
├── app.module.ts
└── main.ts
```

### Frontend Architecture
```
src/
├── components/
│   ├── Layout.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── ProductForm.tsx
│   ├── CategoryForm.tsx
│   └── TransactionForm.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Categories.tsx
│   ├── Inventory.tsx
│   └── Transactions.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── index.tsx
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Run in development mode
npm run start:dev

# Run tests
npm run test

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Frontend Development
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=mini_inventory
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📚 Key Features Implemented

### ✅ Backend Features
- [x] NestJS modular architecture
- [x] TypeORM with PostgreSQL
- [x] Repository pattern implementation
- [x] DTOs with validation (class-validator)
- [x] RESTful API endpoints
- [x] Pagination, filtering, and sorting
- [x] Error handling and validation
- [x] Database relationships
- [x] Transaction management
- [x] Inventory tracking

### ✅ Frontend Features
- [x] React with TypeScript
- [x] Tailwind CSS for styling
- [x] React Query for data fetching
- [x] Form validation with react-hook-form
- [x] Responsive design
- [x] Component-based architecture
- [x] State management
- [x] API integration
- [x] Pagination and filtering UI
- [x] Modal forms
- [x] Data tables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control
- [ ] Advanced reporting and analytics
- [ ] Barcode scanning integration
- [ ] Email notifications
- [ ] Mobile app development
- [ ] API rate limiting
- [ ] Caching implementation
- [ ] Unit and integration tests
- [ ] CI/CD pipeline setup
