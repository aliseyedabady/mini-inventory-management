#!/bin/bash

# Mini Inventory Management System Setup Script
echo "🚀 Setting up Mini Inventory Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL (v12 or higher) first."
    exit 1
fi

echo "✅ Node.js and PostgreSQL are installed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your database credentials"
fi

cd ..

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:3000/api/v1" > .env
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Create a PostgreSQL database named 'mini_inventory'"
echo "3. Start the backend: cd backend && npm run start:dev"
echo "4. Start the frontend: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "- Backend: http://localhost:3000"
echo "- Frontend: http://localhost:3001"
echo ""
echo "Happy coding! 🚀"
