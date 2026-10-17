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
use Illuminate\Foundation\Testing\RefreshDatabase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected Company $companyA;
    protected Company $companyB;
    protected User $userA;
    protected User $userB;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create([
            'name' => 'company_admin',
            'display_name' => 'Company Admin'
        ]);

        // Tenant A
        $this->companyA = Company::create(['name' => 'Khairul Fresh Mart', 'status' => 'active']);
        $this->userA = User::create([
            'name' => 'Ahmad Admin',
            'email' => 'ahmad@freshmart.com',
            'password' => bcrypt('password123')
        ]);
        CompanyUser::create([
            'company_id' => $this->companyA->id,
            'user_id' => $this->userA->id,
            'role_id' => $this->adminRole->id,
            'status' => 'active'
        ]);

        // Tenant B
        $this->companyB = Company::create(['name' => 'Amanah Grocer', 'status' => 'active']);
        $this->userB = User::create([
            'name' => 'Siti Admin',
            'email' => 'siti@amanahgrocer.com',
            'password' => bcrypt('password123')
        ]);
        CompanyUser::create([
            'company_id' => $this->companyB->id,
            'user_id' => $this->userB->id,
            'role_id' => $this->adminRole->id,
            'status' => 'active'
        ]);
    }

    /**
     * Test A: Company A user cannot query Company B products via Eloquent scope.
     */
    public function test_user_a_cannot_see_company_b_products(): void
    {
        // Seed unit & category for B
        $unitB = CompanyUnit::create(['company_id' => $this->companyB->id, 'code' => 'BTL', 'name' => 'Botol']);
        $catB = Category::create(['company_id' => $this->companyB->id, 'name' => 'Minuman']);
        $prodB = Product::create([
            'company_id' => $this->companyB->id,
            'category_id' => $catB->id,
            'unit_id' => $unitB->id,
            'name' => 'Minyak Masak Amanah',
            'cost_price' => 25.00,
            'default_price' => 32.00,
        ]);

        // Authenticate as User A and bind Tenant A
        $this->actingAs($this->userA);
        app()->instance('CurrentTenant', $this->companyA);

        $visibleProducts = Product::all();

        $this->assertCount(0, $visibleProducts);
        $this->assertFalse($visibleProducts->contains('id', $prodB->id));
    }

    /**
     * Test B: Company A cannot query Company B customer.
     */
    public function test_user_a_cannot_access_company_b_customers(): void
    {
        $custB = Customer::create([
            'company_id' => $this->companyB->id,
            'name' => 'Restoran Bintang',
            'phone' => '0198887777',
        ]);

        $this->actingAs($this->userA);
        app()->instance('CurrentTenant', $this->companyA);

        $customers = Customer::all();
        $this->assertCount(0, $customers);
        $this->assertNull(Customer::find($custB->id));
    }
}
