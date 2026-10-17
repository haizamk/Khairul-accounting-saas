<?php

namespace App\Services;

use App\Models\BusinessTemplate;
use App\Models\Company;
use App\Models\Branch;
use App\Models\CompanyUnit;
use App\Models\Category;
use App\Models\Customer;
use App\Models\ReceiptSetting;
use App\Models\CompanyUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TenantOnboardingService
{
    /**
     * Provision a complete independent tenant cloned from a starter business template.
     */
    public function onboardTenant(array $companyData, int $creatorUserId, string $templateCode = 'chicken_frozen'): Company
    {
        return DB::transaction(function () use ($companyData, $creatorUserId, $templateCode) {
            // 1. Create Company
            $company = Company::create([
                'name' => $companyData['name'],
                'legal_name' => $companyData['legal_name'] ?? null,
                'registration_no' => $companyData['registration_no'] ?? null,
                'phone' => $companyData['phone'] ?? null,
                'email' => $companyData['email'] ?? null,
                'address' => $companyData['address'] ?? null,
                'status' => 'active',
                'timezone' => $companyData['timezone'] ?? 'Asia/Kuala_Lumpur',
                'currency' => $companyData['currency'] ?? 'MYR',
            ]);

            // 2. Create Default Main Branch
            $branch = Branch::create([
                'company_id' => $company->id,
                'name' => 'Main Outlet / Cawangan Utama',
                'code' => 'HQ-01',
                'address' => $company->address,
                'phone' => $company->phone,
                'is_main' => true,
                'status' => 'active',
            ]);

            // 3. Assign Creator as Company Admin
            $adminRole = Role::where('name', 'company_admin')->first();
            CompanyUser::create([
                'company_id' => $company->id,
                'user_id' => $creatorUserId,
                'role_id' => $adminRole->id,
                'status' => 'active',
            ]);

            // 4. Clone Business Template Units & Categories (Independent Copy)
            $template = BusinessTemplate::where('code', $templateCode)->first();
            if ($template) {
                // Clone Units
                foreach ($template->default_units as $unitDef) {
                    CompanyUnit::create([
                        'company_id' => $company->id,
                        'code' => $unitDef['code'],
                        'name' => $unitDef['name'],
                        'is_decimal' => $unitDef['is_decimal'] ?? false,
                        'sort_order' => $unitDef['sort_order'] ?? 0,
                        'is_active' => true,
                    ]);
                }

                // Clone Categories
                foreach ($template->default_categories as $catDef) {
                    Category::create([
                        'company_id' => $company->id,
                        'name' => $catDef['name'],
                        'color_code' => $catDef['color_code'] ?? '#10b981',
                        'sort_order' => $catDef['sort_order'] ?? 0,
                    ]);
                }
            }

            // 5. Create Default Customer (Runcit / Pelanggan Am)
            Customer::create([
                'company_id' => $company->id,
                'name' => 'Pelanggan Runcit (Cash)',
                'category' => 'Runcit',
                'discount_percent' => 0.00,
                'status' => 'active',
            ]);

            // 6. Create Initial Receipt Settings
            ReceiptSetting::create([
                'company_id' => $company->id,
                'header_title' => $company->name,
                'registration_no' => $company->registration_no,
                'phone' => $company->phone,
                'paper_width' => '58mm',
                'font_size' => 'medium',
                'show_qr' => false,
                'show_logo' => true,
            ]);

            return $company;
        });
    }
}
