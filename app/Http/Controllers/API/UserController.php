<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Menampilkan daftar semua user beserta nama departemennya.
     */
    public function index()
    {
        // Eager load department agar tidak berat di database
        $users = User::with('department')->get();

        return response()->json([
            'success' => true,
            'data'    => $users
        ], 200);
    }

    /**
     * Membuat User (Karyawan) baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users',
            'password'      => 'required|string|min:8',
            'department_id' => 'required|exists:departments,id',
            'role'          => 'required|in:admin,manager,employee',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), // Password WAJIB di-hash
            'department_id' => $request->department_id,
            'role'          => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil didaftarkan',
            'data'    => $user
        ], 201);
    }

    /**
     * Melihat profil lengkap satu user (Relasi paling kompleks).
     */
    public function show($id)
    {
        // Mengambil user beserta departemen, daftar tugas, dan proyek yang diikuti
        $user = User::with(['department', 'tasks', 'projects', 'attendances'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $user
        ], 200);
    }

    /**
     * Update data karyawan.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        // Jika ada password baru, hash dulu
        $data = $request->all();
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui',
            'data'    => $user
        ], 200);
    }

    /**
     * Hapus karyawan.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User telah dihapus dari sistem'
        ], 200);
    }
}