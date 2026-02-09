<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role; // Pastikan model Role sudah di-import

class RoleSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     */
    public function run(): void
    {
        // Data yang akan dimasukkan ke tabel roles
        $roles = [
            ['name' => 'admin'],     // Otomatis dapat ID 1
            ['name' => 'manager'],   // Otomatis dapat ID 2
            ['name' => 'employee'],  // Otomatis dapat ID 3
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}