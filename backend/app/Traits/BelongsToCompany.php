<?php

namespace App\Traits;

use App\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToCompany
{
    /**
     * Boot the BelongsToCompany trait for a model.
     */
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($model) {
            if (!$model->company_id && app()->bound('CurrentTenant')) {
                $model->company_id = app('CurrentTenant')->id;
            }
        });
    }

    /**
     * Scope a query to include all companies (bypassing tenant filter).
     */
    public function scopeWithoutTenant(Builder $query): Builder
    {
        return $query->withoutGlobalScope(CompanyScope::class);
    }
}
