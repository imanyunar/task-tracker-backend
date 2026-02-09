<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use HasApiTokens, Notifiable;
    protected $fillable = [
        'name',
        'email',
        'password',
        'department_id',
        'role',
    ];

    /**
     * Kolom yang harus disembunyikan saat serialisasi (JSON).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Relasi ke Department (Many-to-One)
     * Setiap user berada di bawah satu departemen.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Relasi ke Attendances (One-to-Many)
     * Satu user memiliki banyak catatan presensi harian.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Relasi ke Tasks (One-to-Many)
     * User berperan sebagai pelaksana (assigned_to).
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Relasi ke Projects (Many-to-Many)
     * Menghubungkan user ke banyak proyek melalui tabel pivot project_user.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class)
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }
}