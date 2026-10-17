<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'default_categories',
        'default_units',
        'is_active',
    ];

    protected $casts = [
        'default_categories' => 'array',
        'default_units' => 'array',
        'is_active' => 'boolean',
    ];
}
