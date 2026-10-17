<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Platform Master Admins
        Schema::create('platform_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['super_admin', 'support_agent'])->default('super_admin');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Companies (Tenants)
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('legal_name')->nullable();
            $table->string('registration_no', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('logo_path', 500)->nullable();
            $table->enum('status', ['active', 'suspended', 'trial'])->default('active');
            $table->string('timezone', 50)->default('Asia/Kuala_Lumpur');
            $table->string('currency', 10)->default('MYR');
            $table->string('admin_pin_hash')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        // 3. Branches (Outlets)
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('code', 50);
            $table->text('address')->nullable();
            $table->string('phone', 50)->nullable();
            $table->boolean('is_main')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'id']);
            $table->unique(['company_id', 'code', 'deleted_at']);
        });

        // 4. Users (Global Credentials)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 50)->nullable();
            $table->string('password');
            $table->string('google_id')->nullable()->unique();
            $table->string('avatar', 500)->nullable();
            $table->enum('status', ['active', 'inactive', 'banned'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();
        });

        // 6. Company Users (Tenant Membership)
        Schema::create('company_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'user_id']);
            $table->index(['company_id', 'role_id']);
        });

        // 7. Branch Users (Branch Allocation)
        Schema::create('branch_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_default')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'user_id']);
        });

        // 8. Business Templates
        Schema::create('business_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->json('default_categories');
            $table->json('default_units');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 9. Company Units (Configurable per Tenant)
        Schema::create('company_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('code', 20);
            $table->string('name', 100);
            $table->boolean('is_decimal')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'id']);
            $table->unique(['company_id', 'code']);
        });

        // 10. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('color_code', 30)->default('#10b981');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'id']);
            $table->unique(['company_id', 'name', 'deleted_at']);
            $table->index(['company_id', 'sort_order']);
        });

        // 11. Products (Strict Composite Tenant Foreign Keys)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('unit_id');
            $table->string('name');
            $table->decimal('cost_price', 12, 2)->default(0.00);
            $table->decimal('default_price', 12, 2)->default(0.00);
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'id']);
            $table->index(['company_id', 'category_id', 'status']);
            $table->index(['company_id', 'sort_order']);

            // Composite Foreign Keys enforce same company ownership
            $table->foreign(['company_id', 'category_id'])->references(['company_id', 'id'])->on('categories')->onDelete('restrict');
            $table->foreign(['company_id', 'unit_id'])->references(['company_id', 'id'])->on('company_units')->onDelete('restrict');
        });

        // 12. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('category', ['Runcit', 'Pelanggan Tetap', 'Restoran', 'Pemborong'])->default('Runcit');
            $table->decimal('discount_percent', 5, 2)->default(0.00);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'id']);
            $table->index(['company_id', 'phone']);
        });

        // 13. Transactions (Sales & Invoicing)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('cashier_user_id');
            $table->string('invoice_no', 100);
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('discount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->enum('payment_method', ['cash', 'qr_pay', 'card', 'nfc', 'duitnow_qr', 'stripe_terminal', 'hitpay'])->default('cash');
            $table->decimal('amount_paid', 12, 2)->default(0.00);
            $table->decimal('change_amount', 12, 2)->default(0.00);
            $table->enum('status', ['completed', 'voided'])->default('completed');
            $table->text('void_reason')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users');
            $table->timestamp('voided_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'invoice_no']);
            $table->unique(['company_id', 'id']);
            $table->index(['company_id', 'created_at', 'status']);
            $table->index(['company_id', 'branch_id']);

            // Composite Foreign Keys
            $table->foreign(['company_id', 'branch_id'])->references(['company_id', 'id'])->on('branches')->onDelete('restrict');
            $table->foreign(['company_id', 'customer_id'])->references(['company_id', 'id'])->on('customers')->onDelete('restrict');
            $table->foreign(['company_id', 'cashier_user_id'])->references(['company_id', 'user_id'])->on('company_users')->onDelete('restrict');
        });

        // 14. Transaction Items (Immutable Historical Snapshot with COGS)
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name_snapshot');
            $table->string('unit_snapshot', 50);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('cost_price_snapshot', 12, 2)->default(0.00);
            $table->decimal('quantity', 10, 3);
            $table->decimal('subtotal', 12, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->index('transaction_id');
        });

        // 15. Held Tickets (Parked Carts)
        Schema::create('held_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->unsignedBigInteger('branch_id');
            $table->foreignId('cashier_user_id')->constrained('users');
            $table->unsignedBigInteger('customer_id');
            $table->string('ticket_label', 100);
            $table->json('cart_payload');
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->timestamps();

            $table->foreign(['company_id', 'branch_id'])->references(['company_id', 'id'])->on('branches')->onDelete('cascade');
            $table->foreign(['company_id', 'customer_id'])->references(['company_id', 'id'])->on('customers')->onDelete('restrict');
        });

        // 16. Cashier Shifts
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('cashier_user_id');
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_float', 12, 2)->default(0.00);
            $table->decimal('system_cash_sales', 12, 2)->default(0.00);
            $table->decimal('system_non_cash_sales', 12, 2)->default(0.00);
            $table->decimal('cash_counted', 12, 2)->nullable();
            $table->decimal('cash_difference', 12, 2)->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->text('closing_notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->foreign(['company_id', 'branch_id'])->references(['company_id', 'id'])->on('branches')->onDelete('cascade');
            $table->foreign(['company_id', 'cashier_user_id'])->references(['company_id', 'user_id'])->on('company_users')->onDelete('restrict');
        });

        // 17. Receipt Settings (1:1 per Company)
        Schema::create('receipt_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->unique()->constrained('companies')->onDelete('cascade');
            $table->string('header_title');
            $table->string('registration_no', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->text('footer_text')->nullable();
            $table->enum('paper_width', ['58mm', '80mm'])->default('58mm');
            $table->enum('font_size', ['small', 'medium', 'large'])->default('medium');
            $table->boolean('show_qr')->default(false);
            $table->string('qr_data')->nullable();
            $table->boolean('show_logo')->default(true);
            $table->timestamps();
        });

        // 18. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('target_type', 100);
            $table->string('target_id', 100);
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['company_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('receipt_settings');
        Schema::dropIfExists('cashier_shifts');
        Schema::dropIfExists('held_tickets');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('company_units');
        Schema::dropIfExists('business_templates');
        Schema::dropIfExists('branch_users');
        Schema::dropIfExists('company_users');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('platform_users');
    }
};
