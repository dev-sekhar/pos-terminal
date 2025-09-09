# POS Terminal

Multi-tenant Point of Sale system with a React frontend and Node.js backend.

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd pos-terminal

# 2. Install all dependencies from the root
yarn install

# 3. Configure environment variables
# (See "Detailed Setup" for more info)
cp apps/customer/pos-backend/.env.example apps/customer/pos-backend/.env

# 4. Run database migrations and seeding
yarn workspace @pos-terminal/backend exec prisma migrate dev
yarn workspace @pos-terminal/backend exec prisma db seed

# 5. Start all applications
yarn workspace @pos-terminal/backend run dev
yarn workspace pos-frontend run dev
yarn workspace admin-backend run dev
yarn workspace admin-frontend run dev
```

**Demo Login:**
- **Email:** `admin@example.com`
- **Password:** `password123`
*(Note: Seed scripts must be run for this user to exist)*

---

## Repository Structure

The project is a monorepo using Yarn Workspaces.

```
pos-terminal/
├── apps/
│   ├── customer/
│   │   ├── pos-backend/     # Core backend API for the POS
│   │   └── pos-frontend/    # React frontend for the POS
│   └── platform/
│       ├── admin-backend/   # Backend for platform administration
│       └── admin-frontend/  # Frontend for platform administration
├── packages/
│   ├── @pos-terminal/schemas/      # Shared Yup validation schemas
│   └── @pos-terminal/permissions/  # Shared roles and permissions logic
├── .env.example         # Example environment variables
├── Caddyfile            # Caddy configuration for local development
├── package.json         # Root package configuration
└── README.md
```

---

## Features

*   **Multi-Tenant Architecture:** Each tenant gets their own subdomain and isolated data.
*   **Customer Portal:** A full-featured POS system for tenants.
*   **Admin Portal:** A separate portal for platform administrators.
*   **User Authentication:** Secure login, registration, and password recovery.
*   **Tiered Pricing Plans:** Multiple pricing plans with different feature sets.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL with Prisma ORM
- **Schema Validation:** Yup
- **Tooling:** Yarn Workspaces, Caddy

---

## Development Workflow

This section provides guidance for common development tasks.

#### Key Entry Points:
- **Backend Server:** `apps/customer/pos-backend/src/app.ts`
- **Frontend Application:** `apps/customer/pos-frontend/src/main.jsx`

#### How to Add a New API Endpoint:
1.  **Route:** Add the new route in the appropriate file under `apps/customer/pos-backend/src/routes/`.
2.  **Schema:** Define the validation schema for the request body/params in `packages/schemas/`.
3.  **Controller:** Create the controller function in `apps/customer/pos-backend/src/controllers/`.
4.  **Service:** Implement the core business logic in a service under `apps/customer/pos-backend/src/services/`.
5.  **Permissions:** If needed, update permissions in `packages/permissions/`.

#### How to Extend a Database Model:
1.  **Update Schema:** Modify the model in `apps/customer/pos-backend/prisma/schema.prisma`.
2.  **Create Migration:** Run `yarn workspace @pos-terminal/backend exec prisma migrate dev --name <your-migration-name>` to create a new database migration.
3.  **Update Client:** Prisma Client will be updated automatically. You can now use the new fields in your services.

---

## Technical Architecture

This project is built on a multi-tenant, service-oriented architecture.

- **Monorepo:** Yarn Workspaces holds all applications and shared code, simplifying dependency management.
- **Multi-Tenancy:** The system identifies tenants by subdomain and scopes all database queries using Prisma middleware.
- **Layered Backend:** The backend uses a standard layered architecture (Routes -> Middleware -> Controllers -> Services -> Prisma) to separate concerns.
- **Shared Packages:**
    - `@pos-terminal/schemas`: Provides centralized **Yup** schemas to ensure data consistency.
    - `@pos-terminal/permissions`: Defines a single source of truth for Role-Based Access Control (RBAC).
- **Reverse Proxy (Caddy):** In development, Caddy handles subdomain routing (`tenant1.lvh.me`) to the frontend, which is essential for testing the multi-tenant setup.

---

## Detailed Setup

#### Prerequisites
*   [Node.js](https://nodejs.org/)
*   [Yarn](https://yarnpkg.com/)
*   A running MySQL database instance.

#### Environment Handling
- This project requires `.env` files in both `apps/customer/pos-backend` and `apps/platform/admin-backend`.
- Start by copying the corresponding `.env.example` file (e.g., `cp .env.example .env`).
- **Important:** Ensure the `DATABASE_URL` in `.env` points to your running MySQL instance. The format is: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`.
- Never commit `.env` files to version control.

#### Installation and Seeding
1.  **Install Dependencies:** `yarn install`
2.  **Generate Prisma Client:** `yarn prisma generate --schema=./apps/customer/pos-backend/prisma/schema.prisma`
3.  **Run Database Migrations:** `yarn workspace @pos-terminal/backend exec prisma migrate dev`
4.  **Seed the Database:**
    - `yarn workspace admin-backend run create-admin`
    - `yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-pricing.js`
    - `yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-employee.js`
    - `yarn workspace @pos-terminal/backend node -r dotenv/config prisma/seed-system-settings.js`

#### Running the Application
- **Customer Backend:** `yarn workspace @pos-terminal/backend run dev`
- **Customer Frontend:** `yarn workspace pos-frontend run dev`
- **Admin Backend:** `yarn workspace admin-backend run dev`
- **Admin Frontend:** `yarn workspace admin-frontend run dev`

#### Port Configuration & Access URLs
- **Customer Frontend:** `http://<subdomain>.lvh.me:3000`
- **Customer Backend API:** `http://localhost:5000`
- **Admin Frontend:** `http://lvh.me:3001`
- **Admin Backend API:** `http://localhost:5002`

---

## Testing

*(Note: Test scripts are not fully configured in all packages.)*

- **To run backend tests (if configured):**
  ```bash
  yarn workspace @pos-terminal/backend test
  ```
- **To run frontend tests (if configured):**
  ```bash
  yarn workspace pos-frontend test
  ```

---

## Troubleshooting

- **Port Conflicts:** If an application fails to start, use `taskkill /f /im node.exe 2>nul` on Windows to kill lingering processes.
- **Yarn Workspace Issues:** If you encounter inconsistencies, running `yarn install` from the root directory again can often resolve issues with `node_modules` or lockfiles.
- **Database Issues:**
    - To reset the database completely, run: `yarn workspace @pos-terminal/backend exec prisma migrate reset`
    - Ensure your MySQL user has the correct permissions to create and alter tables.

---

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.
