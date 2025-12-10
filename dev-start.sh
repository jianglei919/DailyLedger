#!/bin/bash

# Daily Ledger - 快速启动脚本
# 此脚本用于在本地开发环境中快速启动前后端服务

echo "🚀 Starting Daily Ledger Development Environment..."
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# 检查 MongoDB 是否运行（可选）
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. You may need to start it manually:"
        echo "   macOS: brew services start mongodb-community"
        echo "   Linux: sudo systemctl start mongod"
        echo "   Docker: docker run -d -p 27017:27017 --name mongodb mongo"
    fi
else
    echo "⚠️  MongoDB not found. Make sure you have a MongoDB instance running."
fi
echo ""

# 安装后端依赖（如果需要）
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
    echo ""
fi

# 安装前端依赖（如果需要）
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
    echo ""
fi

# 检查 .env 文件
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating from .env.example..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env - Please update with your settings"
    echo ""
fi

# 启动服务
echo "🚀 Starting services..."
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📝 Press Ctrl+C to stop all services"
echo ""

# 使用 trap 捕获 Ctrl+C 信号
trap 'echo ""; echo "🛑 Stopping services..."; kill 0' INT

# 后台启动后端
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 前台启动前端（这样可以看到输出）
cd client
npm start &
FRONTEND_PID=$!
cd ..

# 等待两个进程
wait $BACKEND_PID $FRONTEND_PID
