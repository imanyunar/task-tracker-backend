<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['project']);
        if ($user->role_id == 3){
            $tasks = $query->whereHas('project.members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->get();

        }else{
            $tasks = $query->get();
        }
        return response()->json($tasks, 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if($user ->role_id == 3){
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }else{ 
            $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:todo,review,doing,done',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $task = Task::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tugas Berhasil Dibuat',
            'task' => $task
        ], 201);
        }
    }

    public function update(Request $request, $id){
        $user = $request->user();
        $task = Task::findOrFail($id);
        if($user ->role_id == 3){
            $isMember = $task->project->members()->where('user_id', $user->id)->exists();
            if (!$isMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak'
                ], 403);
            }
                    $task->update($request->only('status'));

        }else{
            $task->update($request->all());
        }
        return response()->json([
            'success' => true,
            'message' => 'Tugas Berhasil Diperbarui',
            'task' => $task
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);
        if($user ->role_id == 3){
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }else{
            $task->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Tugas Berhasil Dihapus'
        ], 200);
    }

}