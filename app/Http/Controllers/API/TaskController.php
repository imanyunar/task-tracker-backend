<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Menampilkan semua daftar tugas.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // [DIUBAH]: Menggunakan role_id (3) lebih stabil & efisien daripada string 'employee'
        // [KODE BARU]: Ditambahkan eager loading 'project' dan 'user' agar respon JSON lengkap
        $query = Task::with(['project', 'user']);

        if ($user->role_id == 3) { 
            // [KODE AWAL]: $tasks = Task::where('user_id', $user->id)->get();
            $tasks = $query->where('user_id', $user->id)->get();
        } else {
            // [KODE AWAL]: $tasks = Task::all();
            $tasks = $query->get();
        }

        return response()->json($tasks);
    }

    /**
     * Menyimpan tugas baru.
     */
    public function store(Request $request)
    {
        // [TAMBAHAN BARU]: Proteksi Otorisasi
        // Mencegah Employee (3) menembus API store via Postman
        if ($request->user()->role_id == 3) {
            return response()->json(['message' => 'Hanya Admin/Manager yang bisa membuat tugas'], 403);
        }

        $validator = Validator::make($request->all(), [
            'project_id'  => 'required|exists:projects,id',
            // [DIUBAH]: Dari 'assigned_to' menjadi 'user_id' agar sinkron dengan Migrasi & PostgreSQL
            'user_id'     => 'required|exists:users,id', 
            'title'       => 'required|string|max:255',
            'priority'    => 'required|in:low,medium,high,urgent',
            'status'      => 'required|in:todo,doing,review,done',
            'due_date'    => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $task = Task::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dibuat!',
            // [KODE BARU]: Me-load relasi agar kita tahu project dan user mana yang terkait
            'data'    => $task->load(['project', 'user']) 
        ], 201);
    }

    /**
     * Menampilkan detail satu tugas.
     */
    public function show($id)
    {
        // [DIUBAH]: Mengganti 'assignee' (jika di model belum ada) menjadi 'user' sesuai kolom user_id
        $task = Task::with(['project', 'user'])->find($id);

        if (!$task) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $task], 200);
    }

    /**
     * Update data tugas.
     */
    public function update(Request $request, $id)
    {
        $task = Task::find($id);
        if (!$task) return response()->json(['message' => 'Tugas tidak ditemukan'], 404);

        $user = $request->user();

        // [TAMBAHAN BARU]: Otorisasi Update
        // Employee (3) hanya boleh update status, Admin (1/2) boleh semua.
        if ($user->role_id == 3) {
            if ($task->user_id !== $user->id) {
                return response()->json(['message' => 'Anda tidak berwenang mengedit tugas ini'], 403);
            }
            // Employee dipaksa hanya bisa update status saja
            $task->update($request->only('status'));
        } else {
            // Admin/Manager bebas update apapun
            $task->update($request->all());
        }

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui',
            'data'    => $task->load(['project', 'user'])
        ]);
    }

    /**
     * Menghapus tugas.
     */
    public function destroy($id)
    {
        // [TAMBAHAN BARU]: Proteksi Delete
        // Mencegah Employee menghapus tugas di database
        if (request()->user()->role_id == 3) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $task = Task::find($id);
        if (!$task) return response()->json(['message' => 'Tugas tidak ditemukan'], 404);

        $task->delete();
        return response()->json(['success' => true, 'message' => 'Tugas berhasil dihapus']);
    }
}