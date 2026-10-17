-- ==============================================================================
-- KHAIRUL POS SAAS — MYSQL 8.0+ PRODUCTION DATABASE SCHEMA
-- Multi-Tenant Commercial POS Platform
-- Company -> Branch -> Operational Entities
-- Strict Composite Foreign Keys & Database-Level Tenant Isolation
-- DECIMAL(12,2) Financials, Company Units, COGS Snapshots
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Platform Master Admins
DROP TABLE IF EXISTS `platform_users`;
CREATE TABLE `platform_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'support_agent') NOT NULL DEFAULT 'super_admin',
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Companies (Tenants)
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `legal_name` VARCHAR(255) NULL,
  `registration_no` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `website` VARCHAR(255) NULL,
  `logo_path` VARCHAR(500) NULL,
  `status` ENUM('active', 'suspended', 'trial') NOT NULL DEFAULT 'active',
  `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'MYR',
  `admin_pin_hash` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_companies_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Branches (Tenant Outlets)
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `address` TEXT NULL,
  `phone` VARCHAR(50) NULL,
  `is_main` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_branch_id` (`company_id`, `id`),
  UNIQUE KEY `uq_company_branch_code` (`company_id`, `code`, `deleted_at`),
  CONSTRAINT `fk_branches_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users (Global Authentication)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NULL,
  `password` VARCHAR(255) NOT NULL,
  `google_id` VARCHAR(255) NULL UNIQUE,
  `avatar` VARCHAR(500) NULL,
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
  `email_verified_at` TIMESTAMP NULL,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`name`, `display_name`, `description`) VALUES
('company_admin', 'Company Admin', 'Full tenant management, staff, branding, settings, reports, POS'),
('admin', 'Admin', 'Catalog, customers, POS, reports, permitted administrative actions'),
('cashier', 'Cashier', 'Fast POS checkout, receipt printing, customer selection, WhatsApp receipt');

-- 6. Company Users (Tenant Membership & Role Binding)
DROP TABLE IF EXISTS `company_users`;
CREATE TABLE `company_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_user` (`company_id`, `user_id`),
  INDEX `idx_company_users_role` (`company_id`, `role_id`),
  CONSTRAINT `fk_cu_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cu_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Branch Users (Branch Assignment)
DROP TABLE IF EXISTS `branch_users`;
CREATE TABLE `branch_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_user` (`branch_id`, `user_id`),
  CONSTRAINT `fk_bu_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Business Templates (Starter Blueprints)
DROP TABLE IF EXISTS `business_templates`;
CREATE TABLE `business_templates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `default_categories` JSON NOT NULL,
  `default_units` JSON NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Company Units (Tenant-Configurable Measurement Units)
DROP TABLE IF EXISTS `company_units`;
CREATE TABLE `company_units` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `is_decimal` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_unit_id` (`company_id`, `id`),
  UNIQUE KEY `uq_company_unit_code` (`company_id`, `code`),
  CONSTRAINT `fk_units_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Categories (Tenant Scoped with Sort Order & Delete Protection)
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `color_code` VARCHAR(30) NOT NULL DEFAULT '#10b981',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_category_id` (`company_id`, `id`),
  UNIQUE KEY `uq_company_category_name` (`company_id`, `name`, `deleted_at`),
  INDEX `idx_categories_sort` (`company_id`, `sort_order`),
  CONSTRAINT `fk_categories_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Products (Tenant Master Catalog with Composite Foreign Keys)
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `unit_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `default_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_product_id` (`company_id`, `id`),
  INDEX `idx_products_company_category` (`company_id`, `category_id`, `status`),
  INDEX `idx_products_sort` (`company_id`, `sort_order`),
  CONSTRAINT `fk_prod_company_category` FOREIGN KEY (`company_id`, `category_id`) REFERENCES `categories` (`company_id`, `id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_prod_company_unit` FOREIGN KEY (`company_id`, `unit_id`) REFERENCES `company_units` (`company_id`, `id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_products_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Customers (Tenant Scoped)
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `category` ENUM('Runcit', 'Pelanggan Tetap', 'Restoran', 'Pemborong') NOT NULL DEFAULT 'Runcit',
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_customer_id` (`company_id`, `id`),
  INDEX `idx_customers_company_phone` (`company_id`, `phone`),
  CONSTRAINT `fk_customers_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Transactions (Sales & Invoicing with Composite Tenant Guardrails)
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `cashier_user_id` BIGINT UNSIGNED NOT NULL,
  `invoice_no` VARCHAR(100) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'qr_pay', 'card', 'nfc', 'duitnow_qr', 'stripe_terminal', 'hitpay') NOT NULL DEFAULT 'cash',
  `amount_paid` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('completed', 'voided') NOT NULL DEFAULT 'completed',
  `void_reason` TEXT NULL,
  `voided_by` BIGINT UNSIGNED NULL,
  `voided_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_invoice` (`company_id`, `invoice_no`),
  UNIQUE KEY `uq_company_trans_id` (`company_id`, `id`),
  INDEX `idx_transactions_company_date` (`company_id`, `created_at`, `status`),
  INDEX `idx_transactions_branch` (`company_id`, `branch_id`),
  CONSTRAINT `fk_trans_company_branch` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_trans_company_customer` FOREIGN KEY (`company_id`, `customer_id`) REFERENCES `customers` (`company_id`, `id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_trans_company_cashier` FOREIGN KEY (`company_id`, `cashier_user_id`) REFERENCES `company_users` (`company_id`, `user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_trans_voided_by` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Transaction Items (Immutable Historical Snapshot with COGS)
DROP TABLE IF EXISTS `transaction_items`;
CREATE TABLE `transaction_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NULL,
  `product_name_snapshot` VARCHAR(255) NOT NULL,
  `unit_snapshot` VARCHAR(50) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `cost_price_snapshot` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `quantity` DECIMAL(10,3) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_items_transaction` (`transaction_id`),
  CONSTRAINT `fk_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Held Tickets (Parked Carts)
DROP TABLE IF EXISTS `held_tickets`;
CREATE TABLE `held_tickets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `cashier_user_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `ticket_label` VARCHAR(100) NOT NULL,
  `cart_payload` JSON NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_held_tickets_branch` (`company_id`, `branch_id`, `created_at`),
  CONSTRAINT `fk_held_company_branch` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE CASCADE,
  CONSTRAINT `fk_held_customer` FOREIGN KEY (`company_id`, `customer_id`) REFERENCES `customers` (`company_id`, `id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Cashier Shifts (Shift Reconciliation)
DROP TABLE IF EXISTS `cashier_shifts`;
CREATE TABLE `cashier_shifts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `cashier_user_id` BIGINT UNSIGNED NOT NULL,
  `opened_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` TIMESTAMP NULL,
  `opening_float` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `system_cash_sales` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `system_non_cash_sales` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cash_counted` DECIMAL(12,2) NULL,
  `cash_difference` DECIMAL(12,2) NULL,
  `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  `closing_notes` TEXT NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_shifts_branch` (`company_id`, `branch_id`, `opened_at`),
  CONSTRAINT `fk_shift_company_branch` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shift_company_cashier` FOREIGN KEY (`company_id`, `cashier_user_id`) REFERENCES `company_users` (`company_id`, `user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_shift_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Receipt Settings (1:1 per Company)
DROP TABLE IF EXISTS `receipt_settings`;
CREATE TABLE `receipt_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `header_title` VARCHAR(255) NOT NULL,
  `registration_no` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NULL,
  `whatsapp` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `website` VARCHAR(255) NULL,
  `footer_text` TEXT NULL,
  `paper_width` ENUM('58mm', '80mm') NOT NULL DEFAULT '58mm',
  `font_size` ENUM('small', 'medium', 'large') NOT NULL DEFAULT 'medium',
  `show_qr` BOOLEAN NOT NULL DEFAULT FALSE,
  `qr_data` VARCHAR(255) NULL,
  `show_logo` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_receipt_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Audit Logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(100) NOT NULL,
  `target_id` VARCHAR(100) NOT NULL,
  `metadata` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_company_date` (`company_id`, `created_at`),
  CONSTRAINT `fk_audit_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
