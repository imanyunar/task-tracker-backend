<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['project', 'user']);
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
            'user_id' => 'required|exists:users,id',
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

    public function tasksByProject(Request $request, $projectId)
    {
        $user = $request->user();
        $task = Task::with('user.department')->where('project_id', $projectId);
        if ($user->role_id == 3) {
            $isMember = Project::where('id', $projectId)
                ->whereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
           
            });
            if (!$isMember->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak'
                ], 403);
            }
          
        }
        $taskslist = $task->orderBy('due_date')->paginate(10);

        return response()->json([
            'success' => true,
            'tasks' => $taskslist
        ], 200);
    }

   public function getDashboardStats(Request $request)
{
    $user = $request->user();
    
    // Periksa apakah user adalah Employee (role_id 3)
    if ($user->role_id == 3) {
        // Hitung proyek dan tugas yang diikutinya saja
        $projectCount = $user->projects()->count();
        $taskCountactive = Task::whereHas('project.members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('status', '!=', 'done')->count();
    } else {
        // Jika Admin/Manager, hitung TOTAL keseluruhan di database
        $projectCount = Project::count();
        $taskCountactive = Task::where('status', '!=', 'done')->count();
    }

    return response()->json([
        'success' => true,
        'project_count' => $projectCount,
        'task_count_active' => $taskCountactive
    ], 200);
}

public function show ($id){
     $task = Task::with('project', 'user.department') -> findOrFail($id);
     return response()->json([
        'success' => true,
        'data' => $task,
     ], 200);
}

public function getKPIStats(Request $request)
{
    $user = $request->user();

    $totalTasks = Task::where('user_id', $user->id)->count();
    $doneTasks = Task::where('user_id', $user->id)->where('status', 'done')->count();
    $completionRate = $totalTasks > 0 ? ($doneTasks / $totalTasks) * 100 : 0;

    $onTimeTasks = Task::where('user_id', $user->id)
                    ->where('status', 'done')
                    ->whereColumn('updated_at', '<=', 'due_date')->count();
    $timelinessRate = $doneTasks > 0 ? ($onTimeTasks / $doneTasks) * 100 : 0;

    $projectCount = Project::whereHas('members', function($q) use ($user) {
        $q->where('user_id', $user->id);
    })->count();
    $projectScore = min($projectCount * 20, 100); 

    $finalKPI = ($completionRate * 0.6) + ($timelinessRate * 0.3) + ($projectScore * 0.1);

    return response()->json([
        'success' => true,
        'score' => round($finalKPI, 2),
        'metrics' => [
            'completion' => round($completionRate),
            'attendance' => 0, 
            'timeliness' => round($timelinessRate),
            'projects'   => $projectCount
        ]
    ]);
}
}