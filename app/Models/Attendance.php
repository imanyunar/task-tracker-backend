<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'date', 
        'clock_in', 
        'clock_out', 
        'latitude', 
        'longitude', 
        'status'
    ];

    /**
     * Relasi Many-to-One ke User.
     * Setiap catatan absen dimiliki oleh satu orang user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}