<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Relasi ke model User.
     * Satu Role dapat dimiliki oleh banyak User (One-to-Many).
     * * @return HasMany
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}