<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('user_id')->constrained()->onDelete('cascade');
                    $table->date('date');
                    $table->time('clock_in');
                    $table->time('clock_out')->nullable();
                    // Menggunakan decimal untuk akurasi koordinat GPS
                    $table->decimal('latitude', 10, 8)->nullable();
                    $table->decimal('longitude', 11, 8)->nullable();
                    $table->enum('status', ['present', 'late', 'absent', 'leave'])->default('present');
                    $table->timestamps();
                });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
