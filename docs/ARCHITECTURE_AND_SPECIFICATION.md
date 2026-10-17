# KHAIRUL POS SAAS — ARCHITECTURAL SPECIFICATION & SYSTEM DESIGN
**Project:** KHAIRUL POS SAAS  
**Reference Model (UX & Workflow Only):** Khairul Fresh POS - Sunmi V3 (Isolated & Untouched)  
**Target Stack:** React + Vite + TypeScript (Frontend) | Laravel 11 (REST API, PHP 8.3+) | MySQL 8.0+ (InnoDB)  
**Security Level:** Commercial Multi-Tenant B2B SaaS with Database-Level Composite Isolation  
**Status:** Phase 1 Implementation Complete (Multi-Tenancy, Database Schemas, Auth & Security Barriers)

---

## 1. System Architecture

The KHAIRUL POS SAAS platform is engineered as a decoupled, multi-tenant Software-as-a-Service (SaaS) web and mobile application designed to serve multiple independent retail and grocery enterprises (e.g., fresh markets, poultry, sundry shops, restaurants) from a single shared application codebase while maintaining 100% tenant data isolation.

### High-Level Hierarchy:
```
Company (Tenant Entity)
   ├── Branches / Outlets (Multi-Branch Support)
   │     ├── Cashier Shifts & Cash Drawers
   │     ├── Transactions & Invoicing
   │     ├── Inventory & Stock Movements
   │     └── Branch Staff Assignments (branch_users)
   ├── Company Master Catalog (Shared across all branches of the company)
   │     ├── Company Units (company_units: KG, EKOR, PKT, SET, PCS, etc.)
   │     ├── Categories (sorted with delete protection)
   │     ├── Products (linked to company units & category with cost_price)
   │     └── Customers (default Runcit / Pelanggan Am)
   └── Receipt & Company Settings (Branding, PIN configuration, Paper size)
```

### High-Level Topology:
- **Client Tier (Frontend):** Modern Single Page Application (SPA) built with React 19, TypeScript, and Vite. Mobile-first and touch-optimized for Android POS terminals (including Sunmi form-factors), tablets, and desktop workstations.
- **API Gateway & Application Tier (Backend):** Laravel 11 running on PHP 8.3+ FPM behind Nginx. Exposes strict JSON REST APIs guarded by Laravel Sanctum for SPA authentication and token-based API communication.
- **Data Tier (Storage):** MySQL 8.0+ relational database utilizing InnoDB storage engine, composite foreign key constraints, strict SQL modes, and `DECIMAL(12,2)` precision for all financial accounting.
- **External Integration Services (Isolated on Server):**
  - **Fonnte WhatsApp API Gateway:** Managed strictly server-side through queued jobs. The client never touches the Fonnte API or token (`FONNTE_TOKEN` strictly in `.env`).
  - **PDF Generation Engine:** Server-side headless PDF rendering utilizing the identical HTML/CSS template engine as the physical receipt designer.

---

## 2. Multi-Tenant Architecture & Database-Level Guardrails

### 1. Dual-Layer Isolation: Application Scoping + MySQL Foreign Key Enforcement
To prevent cross-tenant leakage even in the presence of application bugs, we enforce data boundaries at two layers:
1. **Laravel Eloquent Scopes (`BelongsToCompany`, `BelongsToBranch`):** Injects `WHERE company_id = ?` and `WHERE branch_id = ?` dynamically on all queries.
2. **MySQL Composite Foreign Keys:** Prevents cross-tenant entity linking at the database engine level:
   - `products` enforces:
     - `FOREIGN KEY (company_id, category_id) REFERENCES categories (company_id, id)`
     - `FOREIGN KEY (company_id, unit_id) REFERENCES company_units (company_id, id)`
   - `transactions` enforces:
     - `FOREIGN KEY (company_id, branch_id) REFERENCES branches (company_id, id)`
     - `FOREIGN KEY (company_id, customer_id) REFERENCES customers (company_id, id)`
     - `FOREIGN KEY (company_id, cashier_user_id) REFERENCES company_users (company_id, user_id)`
   - `cashier_shifts` enforces:
     - `FOREIGN KEY (company_id, branch_id) REFERENCES branches (company_id, id)`
     - `FOREIGN KEY (company_id, cashier_user_id) REFERENCES company_users (company_id, user_id)`

---

## 3. Entity Relationship Diagram (MySQL ERD)

```
  [platform_users]
    id (PK), email, password, role ('super_admin', 'support_agent')

  [companies] 1 <------- M [company_users] M -------> 1 [users]
    id (PK)                   id (PK)                    id (PK)
    name, legal_name          company_id (FK)            name, email, password
    registration_no           user_id (FK)               phone, google_id, status
    status, timezone          role_id (FK)
    currency, admin_pin_hash  status (active/inactive)
        |
        +---> [branches] (1:M)
        |       id (PK), company_id (FK), name, code, address, phone, is_main
        |           ^
        |           +--- [branch_users] (M:N) ---> [users]
        |
        +---> [company_units] (1:M)
        |       id (PK), company_id (FK), code, name, is_decimal, sort_order
        |           ^
        |           | (Composite FK: company_id, unit_id)
        |           |
        +---> [categories] (1:M)
        |       id (PK), company_id (FK), name, color_code, sort_order
        |           ^
        |           | (Composite FK: company_id, category_id)
        |           |
        +---> [products] (1:M)
        |       id (PK), company_id (FK), category_id (FK), unit_id (FK)
        |       name, cost_price (DECIMAL 12,2), default_price (DECIMAL 12,2)
        |
        +---> [customers] (1:M)
        |       id (PK), company_id (FK), name, phone, category (Runcit...), discount_percent
        |
        +---> [transactions] (1:M)
        |       id (PK), company_id (FK), branch_id (FK), customer_id (FK), cashier_user_id (FK)
        |       invoice_no, subtotal, discount, total_amount, payment_method, amount_paid, change_amount
        |       status ('completed', 'voided'), void_reason, voided_by, voided_at
        |           |
        |           +---> [transaction_items] (1:M)
        |                   id (PK), transaction_id (FK), product_id (FK nullable)
        |                   product_name_snapshot, unit_snapshot, unit_price
        |                   cost_price_snapshot, quantity (DECIMAL 10,3), subtotal
        |
        +---> [cashier_shifts] (1:M)
        |       id (PK), company_id (FK), branch_id (FK), cashier_user_id (FK)
        |       opening_float, system_cash_sales, cash_counted, cash_difference, status
        |
        +---> [receipt_settings] (1:1 per company)
        |       logo_path, header_title, registration_no, phone, whatsapp, paper_width ('58mm', '80mm')
        |
        +---> [audit_logs] (1:M)
                action, target_type, target_id, metadata (JSON), ip_address, created_at
```

---

## 4. Business Templates & Starter Unit Cloning

Business templates provide initial bootstrap defaults without coupling:
1. **Templates Registry (`business_templates`):** Defines preset packages (e.g. `chicken_frozen`, `grocery_sundry`, `restaurant_cafe`, `retail_boutique`).
2. **Onboarding Cloning:** When a company is registered, the chosen template seeds `categories` and `company_units` into that company's private namespace.
3. **Total Independence:** Future modifications to the global template never alter existing companies.

---

## 5. Historical Immutability & COGS Tracking

1. **Transaction Items Snapshots:**
   - `product_name_snapshot`: Preserves name at sale time.
   - `unit_snapshot`: Preserves unit string (e.g., `KG`, `EKOR`).
   - `unit_price`: Selling price at transaction time.
   - `cost_price_snapshot`: Wholesale cost price at transaction time (`DECIMAL 12,2`).
   - `quantity`: Exact quantity (`DECIMAL 10,3` for scale accuracy).
   - `subtotal`: Exact line subtotal (`DECIMAL 12,2`).
2. **Gross Profit Calculation:**
   $$\text{Gross Profit} = \sum (\text{subtotal} - (\text{cost\_price\_snapshot} \times \text{quantity}))$$
   Changing a product's cost price today will **never** alter the historical profit reports of past weeks or months.

---

## 5. Complete Database Table Design

All monetary amounts are strictly `DECIMAL(12,2)`.  
All product units strictly validate: `KG`, `EKOR`, `PKT`, `SET`.  
**Note:** `KEPING` is strictly eliminated from all tables, constraints, enums, seeds, and validation rules.

### Table: `platform_users`
Platform-level administrators managing SaaS tenants.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `password`: VARCHAR(255) NOT NULL
- `role`: ENUM('super_admin', 'support_agent') DEFAULT 'super_admin'
- `remember_token`: VARCHAR(100) NULL
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL

### Table: `companies`
Core tenant registry for retail/market businesses.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL (e.g. "Khairul Fresh Mart")
- `legal_name`: VARCHAR(255) NULL
- `registration_no`: VARCHAR(100) NULL (SSM Registration Number)
- `phone`: VARCHAR(50) NULL
- `email`: VARCHAR(255) NULL
- `address`: TEXT NULL
- `website`: VARCHAR(255) NULL
- `logo_path`: VARCHAR(500) NULL
- `status`: ENUM('active', 'suspended', 'trial') DEFAULT 'active'
- `timezone`: VARCHAR(50) DEFAULT 'Asia/Kuala_Lumpur'
- `currency`: VARCHAR(10) DEFAULT 'MYR'
- `admin_pin_hash`: VARCHAR(255) NULL (Optional company-specific PIN for sensitive administrative actions)
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL, `deleted_at`: TIMESTAMP NULL
- INDEX `idx_companies_status` (`status`)

### Table: `users`
Global user credentials (can be associated with one or more companies via `company_users`).
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `phone`: VARCHAR(50) NULL
- `password`: VARCHAR(255) NOT NULL
- `google_id`: VARCHAR(255) NULL UNIQUE
- `avatar`: VARCHAR(500) NULL
- `status`: ENUM('active', 'inactive', 'banned') DEFAULT 'active'
- `email_verified_at`: TIMESTAMP NULL
- `remember_token`: VARCHAR(100) NULL
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL, `deleted_at`: TIMESTAMP NULL
- INDEX `idx_users_email` (`email`)

### Table: `roles`
System-defined and tenant roles.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(50) NOT NULL UNIQUE ('company_admin', 'admin', 'cashier')
- `display_name`: VARCHAR(100) NOT NULL
- `description`: TEXT NULL

### Table: `company_users`
Multi-tenant pivot linking users to their active company and role.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `user_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE CASCADE
- `role_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `roles`(`id`)
- `status`: ENUM('active', 'inactive') DEFAULT 'active'
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL
- UNIQUE KEY `uq_company_user` (`company_id`, `user_id`)
- INDEX `idx_company_users_role` (`company_id`, `role_id`)

### Table: `categories`
Tenant product categories (e.g., Ayam Segar, Daging, Ikan, Sayur, Runcit).
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `name`: VARCHAR(150) NOT NULL
- `color_code`: VARCHAR(30) DEFAULT '#10b981'
- `sort_order`: INT NOT NULL DEFAULT 0
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL, `deleted_at`: TIMESTAMP NULL
- UNIQUE KEY `uq_company_category_name` (`company_id`, `name`, `deleted_at`)
- INDEX `idx_categories_sort` (`company_id`, `sort_order`)

### Table: `products`
Tenant catalog products. **Units strictly limited to KG, EKOR, PKT, SET.**
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `category_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `categories`(`id`) ON DELETE RESTRICT
- `name`: VARCHAR(255) NOT NULL
- `default_price`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `default_unit`: ENUM('KG', 'EKOR', 'PKT', 'SET') NOT NULL
- `sort_order`: INT NOT NULL DEFAULT 0
- `status`: ENUM('active', 'inactive') DEFAULT 'active'
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL, `deleted_at`: TIMESTAMP NULL
- INDEX `idx_products_company_category` (`company_id`, `category_id`, `status`)
- INDEX `idx_products_sort` (`company_id`, `sort_order`)

### Table: `customers`
Tenant customer database.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `name`: VARCHAR(255) NOT NULL
- `phone`: VARCHAR(50) NULL
- `email`: VARCHAR(255) NULL
- `address`: TEXT NULL
- `category`: ENUM('Runcit', 'Pelanggan Tetap', 'Restoran', 'Pemborong') NOT NULL DEFAULT 'Runcit'
- `discount_percent`: DECIMAL(5,2) NOT NULL DEFAULT 0.00
- `status`: ENUM('active', 'inactive') DEFAULT 'active'
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL, `deleted_at`: TIMESTAMP NULL
- INDEX `idx_customers_company_phone` (`company_id`, `phone`)

### Table: `transactions`
Tenant sales records.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `invoice_no`: VARCHAR(100) NOT NULL
- `customer_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `customers`(`id`)
- `cashier_user_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `users`(`id`)
- `subtotal`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `discount`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `total_amount`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `payment_method`: ENUM('cash', 'qr_pay', 'card', 'nfc', 'duitnow_qr', 'stripe_terminal', 'hitpay') NOT NULL DEFAULT 'cash'
- `amount_paid`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `change_amount`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `status`: ENUM('completed', 'voided') NOT NULL DEFAULT 'completed'
- `void_reason`: TEXT NULL
- `voided_by`: BIGINT UNSIGNED NULL, FOREIGN KEY REFERENCES `users`(`id`)
- `voided_at`: TIMESTAMP NULL
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL
- UNIQUE KEY `uq_company_invoice` (`company_id`, `invoice_no`)
- INDEX `idx_transactions_company_date` (`company_id`, `created_at`, `status`)
- INDEX `idx_transactions_cashier` (`company_id`, `cashier_user_id`)

### Table: `transaction_items`
Immutable historical item snapshots.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `transaction_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `transactions`(`id`) ON DELETE CASCADE
- `product_id`: BIGINT UNSIGNED NULL, FOREIGN KEY REFERENCES `products`(`id`) ON DELETE SET NULL
- `product_name_snapshot`: VARCHAR(255) NOT NULL
- `unit`: ENUM('KG', 'EKOR', 'PKT', 'SET') NOT NULL
- `unit_price`: DECIMAL(12,2) NOT NULL
- `quantity`: DECIMAL(10,3) NOT NULL (Supports decimal weights such as 1.450 KG)
- `subtotal`: DECIMAL(12,2) NOT NULL
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL
- INDEX `idx_items_transaction` (`transaction_id`)

### Table: `held_tickets`
POS parked carts / hold orders for queue management.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `cashier_user_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `users`(`id`)
- `customer_id`: BIGINT UNSIGNED NOT NULL, FOREIGN KEY REFERENCES `customers`(`id`)
- `ticket_label`: VARCHAR(100) NOT NULL
- `cart_payload`: JSON NOT NULL
- `subtotal`: DECIMAL(12,2) NOT NULL DEFAULT 0.00
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL
- INDEX `idx_held_tickets_company` (`company_id`, `created_at`)

### Table: `receipt_settings`
Company-isolated receipt branding and print layouts.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NOT NULL UNIQUE, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `header_title`: VARCHAR(255) NOT NULL
- `registration_no`: VARCHAR(100) NULL
- `phone`: VARCHAR(50) NULL
- `whatsapp`: VARCHAR(50) NULL
- `address`: TEXT NULL
- `website`: VARCHAR(255) NULL
- `footer_text`: TEXT NULL
- `paper_width`: ENUM('58mm', '80mm') NOT NULL DEFAULT '58mm'
- `font_size`: ENUM('small', 'medium', 'large') NOT NULL DEFAULT 'medium'
- `show_qr`: BOOLEAN NOT NULL DEFAULT FALSE
- `qr_data`: VARCHAR(255) NULL
- `show_logo`: BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`: TIMESTAMP NULL, `updated_at`: TIMESTAMP NULL

### Table: `audit_logs`
Tamper-evident operational audit trail.
- `id`: BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT UNSIGNED NULL, FOREIGN KEY REFERENCES `companies`(`id`) ON DELETE CASCADE
- `user_id`: BIGINT UNSIGNED NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE SET NULL
- `action`: VARCHAR(100) NOT NULL (e.g. 'sale.create', 'sale.void', 'product.update', 'receipt.whatsapp_sent')
- `target_type`: VARCHAR(100) NOT NULL
- `target_id`: VARCHAR(100) NOT NULL
- `metadata`: JSON NULL
- `ip_address`: VARCHAR(45) NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- INDEX `idx_audit_company_date` (`company_id`, `created_at`)

### Table: `subscription_plans` & `subscriptions` (Prepared for SaaS monetization)
- `subscription_plans`: `id`, `name`, `price`, `interval`, `max_cashiers`, `max_products`, `features` (JSON)
- `subscriptions`: `id`, `company_id`, `plan_id`, `status` ('active', 'past_due', 'canceled'), `starts_at`, `ends_at`

---

## 6. Authentication Architecture

1. **Dual Authentication Methods:**
   - **Email + Password:** Cryptographically hashed with `bcrypt` (work factor 12) or Argon2id.
   - **Google OAuth:** Handled via Laravel Socialite with token verification, matching against verified Google email, linking to existing accounts or bootstrapping new tenant memberships.
2. **Session / Token Security:**
   - **Laravel Sanctum:** Issues cryptographically secure, HttpOnly, SameSite=Lax/Strict session cookies for SPA web contexts, alongside Bearer token capabilities for native/mobile devices.
   - **Token Invalidation:** Instant revocation on logout or password rotation.
3. **No Frontend-Only State Auth:**
   - The React client never decides authorization permissions locally.
   - Every application boot and route transition verifies `GET /api/me`, returning user profile, active company, active role, and permitted capabilities.
4. **Brute Force Protection:**
   - Strict rate limiting configured on `/api/auth/login` (5 attempts per minute per IP/email) and password resets.

---

## 7. Role & Permission Architecture

The platform implements a 4-tier Role-Based Access Control (RBAC) model:

| Capability / Action | Platform Master Admin | Company Admin | Admin | Cashier |
| :--- | :---: | :---: | :---: | :---: |
| Manage Companies (Create/Suspend/Onboard) | YES | NO | NO | NO |
| View Platform Audit Logs & Metrics | YES | NO | NO | NO |
| Manage Company Profile & Receipt Settings | NO | YES | NO | NO |
| Manage Staff & Assign Roles | NO | YES | NO | NO |
| Add / Edit / Reorder Categories | NO | YES | YES | NO |
| Add / Edit / Delete Products | NO | YES | YES | NO |
| Add / Edit Customers | NO | YES | YES | YES |
| Open POS & Process Sales | NO | YES | YES | YES |
| Cash Tender & Accurate Change Calculation | NO | YES | YES | YES |
| Print Receipt & Download PDF | NO | YES | YES | YES |
| Send Receipt via WhatsApp (Fonnte) | NO | YES | YES | YES |
| Void Sale / Cancel Completed Transaction | NO | YES (Logs Reason) | YES (Logs Reason) | NO (Requires Admin Approval/PIN) |
| View Financial Reports & Sales Breakdown | NO | YES | YES (Configurable) | NO |

**Cashier Workflow Policy:**
- Normal cashier checkout and receipt printing **DO NOT REQUIRE AN ADMIN PIN**. The workflow is fast, friction-free, and optimized for rapid high-volume counters.
- Admin PIN is configurable per company and exclusively required for sensitive actions (voiding transactions, clearing sales history). The hardcoded PIN `1234` is strictly forbidden.

---

## 8. Tenant Isolation Strategy

### 1. Invariant Isolation Rules:
- Company A can **NEVER** view, query, update, or delete records belonging to Company B.
- Any attempt to query an entity with mismatched `company_id` returns HTTP 404 Not Found or HTTP 403 Forbidden.
- IDs in URLs (`/api/products/{id}`) are validated against the authenticated company scope:
  ```php
  // Laravel Global Scope Pattern
  Product::where('company_id', $currentCompanyId)->findOrFail($id);
  ```

### 2. Tenant Context Resolution Middleware:
```php
class ResolveTenantContext
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Selected company from header or active user association
        $companyId = $request->header('X-Company-ID') ?? $user->current_company_id;
        
        $membership = CompanyUser::where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return response()->json(['error' => 'Unauthorized tenant access'], 403);
        }

        // Bind company context to container for dependency injection
        app()->instance('CurrentTenant', $membership->company);
        app()->instance('CurrentRole', $membership->role);

        return $next($request);
    }
}
```

### 3. Automated Isolation Test Suite:
Automated test cases systematically verify:
1. User A (Company A) requests `GET /api/products` -> Receives only Company A products.
2. User A attempts `GET /api/products/{company_B_product_id}` -> Receives 404.
3. User A attempts `POST /api/transactions` with `customer_id` belonging to Company B -> Rejected with 422 Unprocessable Entity.
4. User A attempts `POST /api/transactions/{company_B_invoice}/void` -> Rejected with 404/403.

---

## 9. API Structure

All API routes are prefixed with `/api` and return structured JSON responses.

### 9.1 Authentication & Profile
- `POST /api/auth/login` (Body: `{ email, password }` -> Returns `{ user, token, companies }`)
- `POST /api/auth/google` (Body: `{ token }` -> Socialite verification)
- `POST /api/auth/logout`
- `GET /api/me` (Returns authenticated user profile, active company, roles, permissions)
- `POST /api/me/switch-company` (Body: `{ company_id }`)

### 9.2 Platform Master Administration (Guarded: `platform_admin`)
- `GET /api/platform/companies` (List all SaaS tenants, status, license)
- `POST /api/platform/companies` (Create new tenant)
- `PUT /api/platform/companies/{id}/status` (Activate / Suspend tenant)
- `GET /api/platform/audit-logs`

### 9.3 Company Settings & Staff (Guarded: `company_admin`)
- `GET /api/company/settings` (Fetch branding, timezone, registration)
- `PUT /api/company/settings` (Update company profile)
- `GET /api/company/staff` (List team members)
- `POST /api/company/staff` (Invite/add cashier or admin)
- `PUT /api/company/staff/{id}` (Update role / status)
- `DELETE /api/company/staff/{id}` (Deactivate staff)

### 9.4 Receipt Designer & Settings (Guarded: `company_admin`, `admin`)
- `GET /api/receipt-settings` (Fetch 58mm/80mm layout, logo, header/footer)
- `PUT /api/receipt-settings` (Update styling, QR toggle, paper width)
- `POST /api/receipt-settings/preview` (Generate live preview template)

### 9.5 Catalog & Master Data (Guarded: `company_admin`, `admin`, `cashier`)
- `GET /api/categories` (Fetch company categories sorted by `sort_order`)
- `POST /api/categories` (Create category)
- `PUT /api/categories/{id}` (Update category)
- `DELETE /api/categories/{id}` (Prevent deletion if products attached; list affected products)
- `GET /api/products` (Fetch products, query by category, search by name)
- `POST /api/products` (Create product; strict validation: unit in `KG`, `EKOR`, `PKT`, `SET`)
- `PUT /api/products/{id}` (Update product)
- `DELETE /api/products/{id}` (Soft-delete product)

### 9.6 Customers (Guarded: `company_admin`, `admin`, `cashier`)
- `GET /api/customers` (Fetch customers; default includes Runcit/Pelanggan Am)
- `POST /api/customers` (Create customer with phone for WhatsApp)
- `PUT /api/customers/{id}` (Update customer details)

### 9.7 POS Engine & Transactions (Guarded: `cashier`, `admin`, `company_admin`)
- `GET /api/pos/bootstrap` (One-trip bootstrap: active categories, active products, default customer, receipt layout)
- `POST /api/transactions` (Commit sale with decimal cash calculation)
  - **Request Body:**
    ```json
    {
      "customer_id": 1,
      "items": [
        { "product_id": 10, "quantity": 2.500, "unit_price": 12.00, "unit": "KG" },
        { "product_id": 14, "quantity": 1.000, "unit_price": 5.00, "unit": "PKT" }
      ],
      "discount": 0.00,
      "payment_method": "cash",
      "amount_paid": 50.00
    }
    ```
  - **Response (201 Created):**
    ```json
    {
      "invoice_no": "INV-20260924-0001",
      "subtotal": 35.00,
      "discount": 0.00,
      "total_amount": 35.00,
      "amount_paid": 50.00,
      "change_amount": 15.00,
      "cashier": "Ahmad",
      "created_at": "2026-09-24T10:00:00Z"
    }
    ```
- `GET /api/transactions` (List company sales, filter by date, cashier, invoice)
- `GET /api/transactions/{id}` (Detailed invoice and item snapshots)
- `POST /api/transactions/{id}/void` (Guarded: Requires Admin authorization and void reason)
- `POST /api/transactions/held-tickets` (Park current cart)
- `GET /api/transactions/held-tickets` (List active parked carts)
- `DELETE /api/transactions/held-tickets/{id}` (Recall/delete parked cart)

### 9.8 Receipts & WhatsApp Dispatch (Guarded: `cashier`, `admin`, `company_admin`)
- `GET /api/receipts/{transaction_id}/html` (Render thermal-ready receipt HTML)
- `GET /api/receipts/{transaction_id}/pdf` (Download high-fidelity PDF receipt)
- `POST /api/receipts/{transaction_id}/whatsapp` (Send receipt PDF/text via Fonnte)
  - Server verifies `FONNTE_TOKEN` from `.env`, sends message with status tracking (`sending`, `success`, `failed`).

### 9.9 Reports & Analytics (Guarded: `company_admin`, `admin`)
- `GET /api/reports/sales-summary` (Daily, weekly, monthly, yearly turnover)
- `GET /api/reports/product-sales` (Best-selling products by quantity and revenue)
- `GET /api/reports/cashier-performance` (Sales per cashier)
- `GET /api/reports/voided-sales` (Voided transactions audit)

---

## 10. Project Folder Structure

```
khairul-pos-saas/
├── frontend/                     # React + Vite + TypeScript Client
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/              # Client-side routing
│   │   │   ├── PosTerminal.tsx  # Sunmi & touch-friendly POS screen
│   │   │   ├── Transactions.tsx # Invoice history & void actions
│   │   │   ├── Products.tsx     # Catalog management (KG, EKOR, PKT, SET)
│   │   │   ├── Categories.tsx   # Category ordering & color tags
│   │   │   ├── Customers.tsx    # Customer directory & WhatsApp targets
│   │   │   ├── Reports.tsx      # Multi-period sales charts & breakdowns
│   │   │   ├── Staff.tsx        # Company admin staff management
│   │   │   ├── ReceiptDesign.tsx# 58mm/80mm live preview designer
│   │   │   └── Settings.tsx     # Company profile & PIN settings
│   │   ├── components/
│   │   │   ├── pos/             # Numpad, Quick Cash (RM5, RM10, RM20, RM50, RM100), Cart
│   │   │   ├── receipt/         # Thermal 58mm/80mm preview renderer
│   │   │   ├── layout/          # High-contrast navigation & sidebar
│   │   │   └── ui/              # Buttons, modals, input badges
│   │   ├── services/            # Axios / Fetch API client with tenant headers
│   │   ├── store/               # State management (auth, tenant, active cart)
│   │   └── types/               # TypeScript interfaces (Product, Transaction, Tenant, Unit)
│   └── public/
├── backend/                      # Laravel 11 REST API Application
│   ├── artisan
│   ├── composer.json
│   ├── .env.example             # Defines DB_*, FONNTE_TOKEN, SANCTUM_STATEFUL_DOMAINS
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/     # Auth, Company, Product, POS, Receipt, WhatsApp, Report
│   │   │   ├── Middleware/      # ResolveTenantContext, EnforceTenantScope, RequireAdminPin
│   │   │   └── Requests/        # StoreProductRequest, CheckoutRequest, VoidSaleRequest
│   │   ├── Models/              # Company, User, Category, Product, Customer, Transaction...
│   │   ├── Scopes/              # CompanyScope (Global Eloquent tenant isolation)
│   │   ├── Services/            # WhatsAppService (Fonnte API), ReceiptPdfService
│   │   └── Traits/              # BelongsToCompany
│   ├── config/                  # sanctum.php, cors.php, database.php
│   ├── database/
│   │   ├── migrations/          # 2026_09_24_000001_create_saas_multi_tenant_tables.php
│   │   └── seeders/             # CompanySeeder, RoleSeeder, InitialCatalogSeeder
│   ├── routes/
│   │   └── api.php              # RESTful API route definitions
│   └── tests/
│       ├── Feature/
│       │   ├── TenantIsolationTest.php # Company A vs Company B data barrier tests
│       │   ├── PosCheckoutTest.php     # Exact cash & change calculation tests
│       │   └── ProductUnitsTest.php    # Enforces KG, EKOR, PKT, SET (no KEPING)
├── docs/                         # Architecture, API & Database Documentation
│   ├── ARCHITECTURE_AND_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   └── API_SPECIFICATION.md
└── docker/ / nginx/              # Nginx virtual host configurations & deployment scripts
```

---

## 11. Development Roadmap (Phased Execution)

- **Phase 1: Architecture, Database, Authentication & Multi-Tenancy**
  - Establish database migrations, foreign keys, and indexes.
  - Implement Laravel Sanctum authentication, `company_users` pivot, and `BelongsToCompany` global scopes.
  - Build tenant isolation test suite (`TenantIsolationTest`).
- **Phase 2: Company Onboarding & Dashboard**
  - Company settings, branding, timezone, registration number, currency.
  - Platform master admin overview.
- **Phase 3: Catalog & Customer Master Data**
  - Company-specific configurable units, business templates, category ordering with delete protection, products linked to company units, and customer registry with Runcit default.
  - Units are NOT globally hard-coded; each company has its own configurable units (add, edit, activate, deactivate, reorder).
  - Business templates provide initial default units and categories (e.g., Chicken & Frozen template starts with KG, EKOR, PKT, SET; other businesses can have completely different units) with full company customization.
- **Phase 4: POS Sales Engine (UX Reference: Khairul Fresh POS - Sunmi V3)**
  - Touch-friendly interface with large buttons, high contrast, and dark mode.
  - Fast product selection, decimal quantity support (e.g., 1.450 KG).
  - Quick Cash buttons (`RM5`, `RM10`, `RM20`, `RM50`, `RM100`), manual cash tender, accurate change calculation.
  - Cart holding / park ticket mechanism.
- **Phase 5: Transactions, Invoicing & Receipts**
  - Sequential unique invoice numbers per company (`INV-YYYYMMDD-XXXX`).
  - Immutable item snapshots (`product_name_snapshot`, `unit_price`, `quantity`, `subtotal`).
  - Cashier identity locking (`cashier_user_id` bound to authenticated session).
  - Void transaction flow with mandatory reason and admin authorization.
- **Phase 6: Staff Management & Permissions**
  - Role management: Company Admin, Admin, Cashier.
  - Cashier sales without PIN; configurable Admin PIN for privileged actions.
- **Phase 7: Reports & Analytics**
  - Daily, weekly, monthly, and yearly sales aggregation.
  - Cashier turnover, product performance, and void audit logs.
- **Phase 8: Thermal Receipt & PDF Engine**
  - 58mm and 80mm live receipt designer.
  - Server-side PDF generation sharing exact styling with physical receipt.
- **Phase 9: Fonnte WhatsApp Integration**
  - Backend-only Fonnte API dispatch (`FONNTE_TOKEN` protected in `.env`).
  - Real-time client status tracking (`Sending...`, `Sent Successfully`, `Failed`, `Retry`).
- **Phase 10: Security Audit & Production Readiness**
  - IDOR and cross-tenant penetration testing.
  - Nginx optimization, PHP-FPM tuning, and SSL deployment.

---

## 12. Security Considerations

1. **Strict Backend-Only Tenant Isolation:** Frontend parameters such as `company_id` are never blindly trusted; the server determines company membership through the authenticated user token.
2. **Fonnte WhatsApp Token Isolation:** The Fonnte token is stored solely in the backend `.env`. It is never delivered to the browser or bundled into JavaScript client code.
3. **Financial Precision:** All prices, tender amounts, discounts, and changes use `DECIMAL(12,2)` (and `DECIMAL(10,3)` for weights). No floating-point rounding errors.
4. **Historical Immutability:** Product price adjustments never alter past receipts because all transaction lines store name and unit price snapshots.
5. **No Hardcoded PINs:** The insecure PIN `1234` is strictly prevented. Passwords and PINs are securely hashed.
6. **Audit Trails:** Critical actions (voiding sales, changing staff roles, altering receipt layouts, sending WhatsApp receipts) write immutable audit logs with user ID, company ID, and timestamp.

---

## 13. Deployment Architecture

- **Host Operating System:** Ubuntu 24.04 / 22.04 LTS (VPS or Cloud Compute).
- **Web Server:** Nginx configured as a reverse proxy serving static React SPA assets with gzip/brotli compression and proxying `/api` requests to PHP-FPM.
- **PHP Runtime:** PHP 8.3-FPM with OPcache enabled, `bcmath` extension (for decimal calculation), and `pdo_mysql`.
- **Database:** MySQL 8.0+ configured with utf8mb4 charset and strict SQL mode (`ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO`).
- **SSL / CDN:** Cloudflare proxy compatible, Let's Encrypt / Certbot automated SSL renewal.
- **Worker Queues:** Supervisor managing Laravel queue worker for asynchronous WhatsApp dispatch via Fonnte.

---

## 14. Explicit Assumptions & Clarifications

1. **Assumption 1 (Reference App Protection):** The existing "Khairul Fresh POS - Sunmi V3" application, its Firebase project, Firestore database, and authentication remain completely untouched. This new system is built in its own independent repository and database.
2. **Assumption 2 (Unit Constraints):** Units are strictly restricted to `KG`, `EKOR`, `PKT`, and `SET`. `KEPING` is explicitly excluded across all layers.
3. **Assumption 3 (POS Friction-Free Checkout):** Normal cashier sales require zero admin PIN hurdles. Only sensitive overrides (e.g. voiding a finalized transaction) request an Admin PIN.
4. **Assumption 4 (Fonnte WhatsApp Dispatch):** WhatsApp receipts are sent from the Laravel backend directly to Fonnte (`https://api.fonnte.com/send`). The client displays asynchronous feedback and a manual retry button in the event of upstream network failure.
