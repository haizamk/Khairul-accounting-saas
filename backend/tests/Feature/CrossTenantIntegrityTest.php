<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Company;
use App\Models\Category;
use App\Models\CompanyUnit;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrossTenantIntegrityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test C: Product in Company A referencing Company B Unit is REJECTED at database layer.
     */
    public function test_product_cannot_reference_foreign_tenant_unit(): void
    {
        $companyA = Company::create(['name' => 'Company A', 'status' => 'active']);
        $companyB = Company::create(['name' => 'Company B', 'status' => 'active']);

        $catA = Category::create(['company_id' => $companyA->id, 'name' => 'Ayam']);
        $unitB = CompanyUnit::create(['company_id' => $companyB->id, 'code' => 'KG', 'name' => 'Kilogram']);

        $this->expectException(QueryException::class);

        // Attempting to create product with mismatched company_id and unit_id
        Product::create([
            'company_id' => $companyA->id,
            'category_id' => $catA->id,
            'unit_id' => $unitB->id, // BELONGS TO COMPANY B!
            'name' => 'Illegal Cross-Tenant Chicken',
            'cost_price' => 8.00,
            'default_price' => 10.00,
        ]);
    }

    /**
     * Test D: Product in Company A referencing Company B Category is REJECTED at database layer.
     */
    public function test_product_cannot_reference_foreign_tenant_category(): void
    {
        $companyA = Company::create(['name' => 'Company A', 'status' => 'active']);
        $companyB = Company::create(['name' => 'Company B', 'status' => 'active']);

        $catB = Category::create(['company_id' => $companyB->id, 'name' => 'Category B']);
        $unitA = CompanyUnit::create(['company_id' => $companyA->id, 'code' => 'KG', 'name' => 'Kilogram']);

        $this->expectException(QueryException::class);

        Product::create([
            'company_id' => $companyA->id,
            'category_id' => $catB->id, // BELONGS TO COMPANY B!
            'unit_id' => $unitA->id,
            'name' => 'Illegal Cross-Tenant Product',
            'cost_price' => 8.00,
            'default_price' => 10.00,
        ]);
    }
}
