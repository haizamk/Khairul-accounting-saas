<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Company;
use App\Models\Branch;
use App\Models\User;
use App\Models\Role;
use App\Models\CompanyUser;
use App\Models\Category;
use App\Models\CompanyUnit;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CogsAndSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_changing_product_cost_or_price_does_not_alter_past_receipt_gross_profit(): void
    {
        $company = Company::create(['name' => 'Khairul Poultry', 'status' => 'active']);
        $branch = Branch::create(['company_id' => $company->id, 'name' => 'Main Outlet', 'code' => 'HQ-01']);
        $user = User::create(['name' => 'Cashier Ali', 'email' => 'ali@poultry.com', 'password' => 'secret']);
        $role = Role::create(['name' => 'cashier', 'display_name' => 'Cashier']);
        CompanyUser::create(['company_id' => $company->id, 'user_id' => $user->id, 'role_id' => $role->id]);

        $unit = CompanyUnit::create(['company_id' => $company->id, 'code' => 'KG', 'name' => 'Kilogram', 'is_decimal' => true]);
        $cat = Category::create(['company_id' => $company->id, 'name' => 'Ayam']);
        $customer = Customer::create(['company_id' => $company->id, 'name' => 'Runcit Cash']);

        // Product created: Cost RM7.00, Selling RM10.00
        $product = Product::create([
            'company_id' => $company->id,
            'category_id' => $cat->id,
            'unit_id' => $unit->id,
            'name' => 'Ayam Segar Standard',
            'cost_price' => 7.00,
            'default_price' => 10.00,
        ]);

        // Sale executed for 2.000 KG
        $transaction = Transaction::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'customer_id' => $customer->id,
            'cashier_user_id' => $user->id,
            'invoice_no' => 'INV-20260924-0001',
            'subtotal' => 20.00,
            'total_amount' => 20.00,
            'amount_paid' => 20.00,
            'change_amount' => 0.00,
            'status' => 'completed',
        ]);

        $item = TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'product_name_snapshot' => 'Ayam Segar Standard',
            'unit_snapshot' => 'KG',
            'unit_price' => 10.00,
            'cost_price_snapshot' => 7.00,
            'quantity' => 2.000,
            'subtotal' => 20.00,
        ]);

        // Initial Gross Profit = 20.00 - (7.00 * 2.000) = RM6.00
        $this->assertEquals(6.00, $item->gross_profit);

        // Later, market price spikes: Supplier increases cost to RM9.50, selling price to RM13.00
        $product->update([
            'cost_price' => 9.50,
            'default_price' => 13.00,
            'name' => 'Ayam Segar Super Premium',
        ]);

        // Verify historical transaction item snapshot remains unchanged
        $reloadedItem = TransactionItem::find($item->id);
        $this->assertEquals('Ayam Segar Standard', $reloadedItem->product_name_snapshot);
        $this->assertEquals(10.00, $reloadedItem->unit_price);
        $this->assertEquals(7.00, $reloadedItem->cost_price_snapshot);
        $this->assertEquals(6.00, $reloadedItem->gross_profit); // Gross profit preserved 100%
    }
}
