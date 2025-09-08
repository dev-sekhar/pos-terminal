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
    *   **Important:** Ensure `DATABASE_URL` is correctly set for your MySQL instance.
3.  **Generate Prisma Client:**
    ```bash
    yarn prisma generate --schema=./apps/customer/pos-backend/prisma/schema.prisma
    ```
4.  **Run Database Migrations:**
    ```bash
    # This command will create and apply migrations based on your schema.prisma
    # It will also generate the Prisma client.
    yarn workspace @pos-terminal/backend exec prisma migrate dev --name initial_migration
    ```
5.  **Seed the Database:**
    *   **Create Initial Admin User:**
        ```bash
        yarn workspace admin-backend run create-admin
        ```
    *   **Seed Pricing Plans:**
        ```bash
        yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-pricing.js
        ```
    *   **Seed Default Employee (if applicable):**
        ```bash
        yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-employee.js
        ```
    *   **Seed System Settings (if applicable):**
        ```bash
        yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-system-settings.js
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

## Role-Based Access Control (RBAC)

This system implements a robust Role-Based Access Control (RBAC) mechanism to manage user permissions across the application.

*   **Centralized Permissions:** Permissions are defined and managed in the `@pos-terminal/permissions` package, serving as a single source of truth.
*   **Frontend Integration:** The frontend uses these permissions to conditionally render UI elements (e.g., navigation items, buttons) and protect routes (e.g., using `ProtectedRoute` components).
*   **Backend Enforcement:** The backend utilizes `rbacMiddleware` to enforce permissions on API routes, ensuring that users can only perform actions they are authorized for.

**Example:** A user with the `CASHIER` role might only have permission to `CREATE_SALES` and `VIEW_DASHBOARD`, while an `ADMIN` has broader `MANAGE_SETTINGS` or `MANAGE_USERS` permissions.

## Schema Validation (Yup)

Data validation is crucial for maintaining data integrity and security. This project leverages [Yup](https://github.com/jquense/yup) for schema-based validation.

*   **Schema Definitions:** All data schemas (e.g., for products, users, suppliers) are defined using Yup in the `apps/customer/pos-backend/src/schemas` directory.
*   **Validation Middleware:** These schemas are applied on incoming API requests via validation middleware (e.g., `apps/customer/pos-backend/src/middleware/validate.ts`), ensuring that only valid data is processed by the backend services.

## Recent Code Changes Summary

This section outlines recent significant changes to the codebase:

*   **Print Settings in Customer Portal:**
    *   Added new input fields (`printHeader`, `printFooter`, `taxNo`) to the Customer Portal's Settings page (`apps/customer/pos-frontend/src/pages/Settings.jsx`) to allow tenants to configure custom multi-line headers and footers for printed documents.
    *   These settings are now passed to the print layout for sales invoices and purchase orders.
*   **Componentized Print Utility:**
    *   Introduced a reusable `printUtility` function (`apps/customer/pos-frontend/src/utils/PrintUtility.jsx`) to centralize the logic for opening print windows, injecting content, and triggering print actions.
    *   This utility is now used by both sales and purchases modules, making print management more consistent and maintainable.
*   **Wider Print Pop-up Windows:**
    *   The print pop-up windows for sales invoices and purchase orders now open with a wider default width (`width=800,height=800`) for better readability of printed details.
*   **Backend Settings Persistence:**
    *   The backend's settings service (`apps/customer/pos-backend/src/services/settingsService.ts`) has been updated to correctly store and retrieve the new `printHeader`, `printFooter`, and `taxNo` fields within the existing `settings` JSON column of the `Tenant` model. No explicit database migration was required for these fields.
*   **Frontend Bug Fixes:**
    *   Resolved an issue in the Suppliers page (`apps/customer/pos-frontend/src/pages/Suppliers.jsx`) where creating a new supplier incorrectly triggered an update request due to an `isEditing` state mismatch.
    *   Addressed a `ReferenceError: user is not defined` in the Purchases and Sales pages (`apps/customer/pos-frontend/src/pages/purchases/index.jsx` and `apps/customer/pos-frontend/src/pages/sales/index.jsx`) by ensuring the `user` object from the `UserContext` is fully loaded before being accessed in print functions.
    *   Fixed a syntax error in `apps/customer/pos-frontend/src/pages/sales/index.jsx` related to JSX rendering within conditional statements.

## Troubleshooting

**Port Conflicts:**
```bash
# Kill existing node processes
taskkill /f /im node.exe 2>nul
```

**CORS Issues:**
Ensure the backend allows your frontend origin in `apps/customer/pos-backend/src/app.ts`.

**Database Issues (Prisma):**
If you encounter issues with Prisma migrations or database state, try:
```bash
# Reset your database and re-run migrations and seeds
yarn workspace @pos-terminal/backend exec prisma migrate reset
```

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests for new features or bug fixes.
