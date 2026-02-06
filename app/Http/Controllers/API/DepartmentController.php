<?php

namespace App\Http\Controllers\API;

use App\Models\Department;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Menampilkan daftar semua departemen.
     */
    public function index()
    {
        $departments = Department::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar semua departemen',
            'data'    => $departments
        ], 200);
    }

    /**
     * Membuat departemen baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $department = Department::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil dibuat',
            'data'    => $department
        ], 201);
    }

    /**
     * Menampilkan detail departemen beserta daftar karyawannya.
     */
    public function show($id)
    {
        // Relasi: Menarik departemen sekaligus semua User yang terdaftar di dalamnya
        $department = Department::with('users')->find($id);

        if (!$department) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $department
        ], 200);
    }

    /**
     * Memperbarui data departemen.
     */
    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255|unique:departments,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $department->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil diperbarui',
            'data'    => $department
        ], 200);
    }

    /**
     * Menghapus departemen.
     */
    public function destroy($id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        // PERINGATAN: Karena di migrasi kita pakai onDelete('cascade'),
        // Menghapus departemen ini akan menghapus semua User di dalamnya!
        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil dihapus'
        ], 200);
    }
}