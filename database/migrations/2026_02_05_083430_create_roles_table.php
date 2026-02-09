<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi untuk membuat tabel roles.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            // id() secara otomatis membuat Primary Key (BIGINT) yang Auto-Increment
            $table->id(); 
            
            // name akan menyimpan teks 'admin', 'manager', atau 'employee'
            // unique() memastikan tidak ada nama role yang ganda
            $table->string('name')->unique(); 
            
            // Mencatat created_at dan updated_at secara otomatis
            $table->timestamps(); 
        });
    }

    /**
     * Membatalkan migrasi (Rollback).
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};