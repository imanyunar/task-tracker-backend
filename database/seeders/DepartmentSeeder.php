<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $depts = [
        ['name' => 'IT Support'],      // ID 1
        ['name' => 'Human Resource'],  // ID 2
        ['name' => 'Marketing'],       // ID 3
    ];

    foreach ($depts as $dept) {
        \App\Models\Department::create($dept);
    }
}
}