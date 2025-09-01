# POS Terminal

Multi-tenant Point of Sale system with React frontend and Node.js backend.

## Features

*   **Multi-Tenant Architecture:** Each tenant gets their own subdomain and isolated data.
*   **Customer Portal:** A full-featured POS system for tenants, including:
    *   Dashboard with key metrics.
    *   Sales, product, and inventory management.
    *   Customer and supplier relationship management.
*   **Admin Portal:** A separate portal for platform administrators to manage tenants, system settings, and more.
*   **User Authentication:** Secure user authentication with login, registration, and a forgot password feature.
*   **Tiered Pricing Plans:** Multiple pricing plans with different feature sets.

## Development Setup

### Prerequisites

*   [Node.js](https://nodejs.org/)
*   [Yarn](https://yarnpkg.com/)
*   A running MySQL database.

### Initial Setup

1.  **Install Dependencies:**
    ```bash
    yarn install
    ```
2.  **Configure Environment Variables:**
    *   Copy `.env.example` to `.env` in both `apps/customer/pos-backend` and `apps/platform/admin-backend` and update the database connection string and other variables.
3.  **Generate Prisma Client:**
    ```bash
    yarn prisma generate --schema=./apps/customer/pos-backend/prisma/schema.prisma
    ```
4.  **Run Database Migrations:**
    ```bash
    yarn workspace @pos-terminal/backend exec prisma migrate dev
    ```
5.  **Seed the Database:**
    *   To create the initial admin user:
        ```bash
        yarn workspace admin-backend run create-admin
        ```
    *   To seed the pricing plans:
        ```bash
        yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-pricing.js
        ```

### Starting the Application

**Customer Apps:**

*   **Backend (`pos-backend`):**
    ```bash
    yarn workspace @pos-terminal/backend run dev
    ```
*   **Frontend (`pos-frontend`):**
    ```bash
    yarn workspace pos-frontend run dev
    ```

**Admin Apps:**

*   **Backend (`admin-backend`):**
    ```bash
    yarn workspace admin-backend run dev
    ```
*   **Frontend (`admin-frontend`):**
    ```bash
    yarn workspace admin-frontend run dev
    ```

## Port Configuration

**Default Ports:**

*   **Customer Frontend:** `3000` (configured in `apps/customer/pos-frontend/vite.config.js`)
*   **Customer Backend:** `5000` (configured in `apps/customer/pos-backend/.env`)
*   **Admin Frontend:** `3001` (configured in `apps/platform/admin-frontend/vite.config.js`)
*   **Admin Backend:** `5002` (configured in `apps/platform/admin-backend/src/server.js`)

## Access URLs

*   **Customer Frontend:** `http://<subdomain>.lvh.me:3000`
*   **Customer Backend API:** `http://localhost:5000/health`
*   **Admin Frontend:** `http://lvh.me:3001`
*   **Admin Backend API:** `http://localhost:5002`

## Troubleshooting

**Port Conflicts:**
```bash
# Kill existing node processes
taskkill /f /im node.exe 2>nul
```

**CORS Issues:**
Ensure the backend allows your frontend origin in `apps/customer/pos-backend/src/app.ts`.