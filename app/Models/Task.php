<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    /**
     * Kolom yang dapat diisi secara massal.
     * Sesuaikan dengan struktur migrasi terakhir kita.
     */
    protected $fillable = [
        'project_id',
        'assigned_to',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
    ];

    /**
     * Relasi ke Project (Many-to-One)
     * Setiap tugas pasti merujuk ke satu proyek tertentu.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Relasi ke User (Many-to-One)
     * Menghubungkan tugas ke karyawan yang ditugaskan.
     * Karena nama kolomnya 'assigned_to' (bukan user_id), 
     * kita harus mendefinisikannya secara manual.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}