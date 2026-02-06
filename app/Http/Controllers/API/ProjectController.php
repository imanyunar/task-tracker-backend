<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['members', 'tasks'])->get();
        return response()->json(['success' => true, 'data' => $projects], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        $project = Project::create($request->all());
        return response()->json(['success' => true, 'data' => $project], 201);
    }

    /**
     * Menambahkan anggota tim ke proyek (Many-to-Many)
     */
    public function addMember(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        
        // Attach user ke project via pivot table
        $project->members()->attach($request->user_id, [
            'role_in_project' => $request->role // misal: Lead, Developer
        ]);

        return response()->json(['success' => true, 'message' => 'Anggota berhasil ditambahkan']);
    }

    public function show($id)
    {
        $project = Project::with(['members', 'tasks.assignee'])->find($id);
        if (!$project) return response()->json(['message' => 'Project not found'], 404);
        return response()->json(['success' => true, 'data' => $project], 200);
    }
}