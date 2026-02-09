<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
       $this->call([
           RoleSeeder::class,
              DepartmentSeeder::class,
       ]);

       User::create([
            'name'          => 'Super Admin TAS',
            'email'         => 'admin@tas.com',
            'password'      => Hash::make('password123'), 
            'department_id' => 1, // Pastikan ID 1 ada di tabel departments
            'role_id'       => 1, // ID 1 adalah Admin
        ]);
    }
}
