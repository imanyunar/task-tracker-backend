<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // 1. Ambil tugas berdasarkan user_id yang dikirim di URL/Request
    public function index(Request $request)
    {
        // Untuk testing, kita ambil user_id dari parameter query atau default ke 1
        $userId = $request->query('user_id', 1); 
        $tasks = Task::where('user_id', $userId)->get();
        return response()->json($tasks);
    }

    // 2. Simpan tugas baru
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id', // Wajib kirim user_id dari Postman
            'title' => 'required|string|max:255',
            'status' => 'in:todo,in_progress,done',
            'priority' => 'in:low,medium,high',
        ]);

        $task = Task::create([
            'user_id' => $request->user_id, // Ambil dari input Postman
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'todo',
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date,
        ]);

        return response()->json(['message' => 'Tugas berhasil dibuat', 'data' => $task], 201);
    }

    // 3. Lihat detail
    public function show($id)
    {
        // Cari task tanpa filter user_id dulu agar mudah testingnya
        $task = Task::findOrFail($id);
        return response()->json($task);
    }

    // 4. Update tugas
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->all());

        return response()->json(['message' => 'Tugas berhasil diperbarui', 'data' => $task]);
    }

    // 5. Hapus tugas
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus']);
    }
}