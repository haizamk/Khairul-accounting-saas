<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'product_name_snapshot',
        'unit_snapshot',
        'unit_price',
        'cost_price_snapshot',
        'quantity',
        'subtotal',
        'created_at',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'cost_price_snapshot' => 'decimal:2',
        'quantity' => 'decimal:3',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate line item gross profit.
     */
    public function getGrossProfitAttribute(): float
    {
        return (float) ($this->subtotal - ($this->cost_price_snapshot * $this->quantity));
    }
}
