# Quick Start Guide - DailyLedger

## Prerequisites

- Node.js v16+ installed
- MongoDB running locally or connection string ready
- Git (optional)

## Option 1: Local Development (Recommended)

### 1. Install Dependencies

```bash
# Backend setup
cd server
npm install
cp .env.example .env  # Create your .env file

# Frontend setup (from project root)
cd ../client
npm install
```

### 2. Configure Environment Variables

Edit `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/DailyLedger
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Both Services

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm start
# App opens on http://localhost:3000
```

## Option 2: Docker (Recommended for Production-like Environment)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f
```

## Testing the Application

### Create Test Account

1. Navigate to http://localhost:3000
2. Click "Register"
3. Create account with:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123!

### Test Features

- **Dashboard**: View balance and recent transactions
- **Transactions**: Add/edit/delete financial transactions
- **Categories**: Create income and expense categories
- **Profile**: Update username and password

## Common Issues

### "Cannot connect to MongoDB"

- Ensure MongoDB is running: `brew services list`
- Check MongoDB URI in `.env`
- Verify port 27017 is not blocked

### "EADDRINUSE" on port 5000 or 3000

```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS errors

- Backend must have `CORS_ORIGIN=http://localhost:3000` in `.env`
- Frontend proxy in `package.json` should point to `http://localhost:5000`

### "npm ERR! code ENOENT" (missing dependencies)

```bash
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

## API Endpoints

All endpoints except `/register` and `/login` require JWT token in header:

```
Authorization: Bearer <token>
```

### Authentication

- `POST /api/users/register` - Create account
- `POST /api/users/login` - Get JWT token
- `GET /api/users/profile` - Get current user
- `PUT /api/users/profile` - Update username
- `PUT /api/users/change-password` - Change password

### Transactions

- `GET /api/transactions` - List transactions (supports pagination & filtering)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Environment Variables Reference

```
NODE_ENV          - 'development' or 'production'
PORT              - Server port (default: 5000)
MONGODB_URI       - MongoDB connection string
JWT_SECRET        - Secret for signing JWT tokens (min 32 chars in production)
JWT_EXPIRE        - Token expiration (e.g., '7d', '24h')
CORS_ORIGIN       - Frontend URL for CORS (default: http://localhost:3000)
```

## Production Deployment

1. Build frontend: `cd client && npm run build`
2. Update `.env` with production values
3. Deploy backend to Node.js hosting (Heroku, Railway, AWS, etc.)
4. Deploy frontend to CDN or static hosting (Vercel, Netlify, etc.)
5. Set `NODE_ENV=production`
6. Use strong `JWT_SECRET` (32+ characters)
7. Enable HTTPS in production

## Useful Commands

```bash
# View server logs with timestamps
npm run dev 2>&1 | grep -E "listening|error|Connected"

# Test backend directly
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Rebuild frontend
cd client && npm run build

# Clear cache and reinstall
rm -rf */node_modules */package-lock.json && npm install --workspace=*
```

## Next Steps

- Review `PROJECT_STRUCTURE.md` for detailed file documentation
- Check `README.md` for full feature list and troubleshooting
- Create `.env.example` from `.env` for sharing (exclude sensitive data)
- Set up Git hooks for linting (optional)
