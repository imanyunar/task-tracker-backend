<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'start_date', 'end_date', 'status'];

    /**
     * Relasi One-to-Many ke Task.
     * Satu proyek memiliki banyak tugas detail.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relasi Many-to-Many ke User (Tim Proyek).
     * Menghubungkan ke tabel pivot 'project_user'.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }
}