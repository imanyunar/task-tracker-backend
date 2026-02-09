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
            if ($user->role->name === 'employee'){
                $tasks = Task::where('user_id', $user->id)->get();
            }else{
                $tasks = Task::all();
            }

            return response()-> json($tasks);

    }

    /**
     * Menyimpan tugas baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id'  => 'required|exists:projects,id',
            'assigned_to' => 'required|exists:users,id',
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
            'data'    => $task
        ], 201);
    }

    /**
     * Menampilkan detail satu tugas.
     */
    public function show($id)
    {
        $task = Task::with(['project', 'assignee'])->find($id);

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

        $task->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui',
            'data'    => $task
        ]);
    }

    /**
     * Menghapus tugas.
     */
    public function destroy($id)
    {
        $task = Task::find($id);
        if (!$task) return response()->json(['message' => 'Tugas tidak ditemukan'], 404);

        $task->delete();
        return response()->json(['success' => true, 'message' => 'Tugas berhasil dihapus']);
    }
}