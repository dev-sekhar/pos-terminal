# POS Terminal

Multi-tenant Point of Sale system with React frontend and Node.js backend.

## Development Setup

### Starting the Application

**Backend (API Server):**
```bash
npm run dev --workspace=pos-backend
```

**Frontend (React App):**
```bash
npm run dev --workspace=pos-frontend
```

### Port Configuration

**Default Ports:**
- Frontend: `3000` (configured in `apps/customer/pos-frontend/.env`)
- Backend: `5000` (configured in `apps/customer/pos-backend/.env`)

**How to Check Ports:**

1. **Frontend Port:** Check `apps/customer/pos-frontend/.env` → `VITE_PORT`
2. **Backend Port:** Check `apps/customer/pos-backend/.env` → `PORT`
3. **Runtime:** Backend displays port in console when starting: `Server is running on port 5000`

**Access URLs:**
- Frontend: `http://localhost:3000` or `http://[subdomain].lvh.me:3000`
- Backend API: `http://localhost:5000/health` (health check)

### Troubleshooting

**Port Conflicts:**
```bash
# Kill existing node processes
taskkill /f /im node.exe 2>nul
```

**CORS Issues:** Ensure backend allows your frontend origin in `apps/customer/pos-backend/src/app.ts`