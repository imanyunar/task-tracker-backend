<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects
     * Employee: hanya projek yang mereka ikuti
     * Admin/Manager: semua projek
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role->name === 'employee') {
            $projects = Project::whereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->paginate(10);
        } else {
            $projects = Project::paginate(10);
        }

        // Response format: {data: [...], links: [...], current_page: ...}
        return response()->json($projects, 200);
    }

    /**
     * Store a newly created project
     * Only admin/manager can create
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if ($user->role->name === 'employee') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Projek berhasil dibuat',
            'data' => $project
        ], 201);
    }

    /**
     * Display the specified project
     * Employee: hanya jika mereka anggota projek
     * Admin/Manager: semua projek
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role->name === 'employee') {
            $project = Project::where('id', $id)
                ->whereHas('members', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->first();

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project tidak ditemukan atau akses ditolak'
                ], 404);
            }
        } else {
            $project = Project::find($id);
            
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project tidak ditemukan'
                ], 404);
            }
        }

        // Load relationships
        $project->load('members');
        
        return response()->json([
            'success' => true,
            'data' => $project
        ], 200);
    }

    /**
     * Update the specified project
     * Only admin/manager can update
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role->name === 'employee') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $project = Project::find($id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Projek berhasil diperbarui',
            'data' => $project
        ], 200);
    }

    /**
     * Remove the specified project
     * Only admin/manager can delete
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role->name === 'employee') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $project = Project::find($id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan'
            ], 404);
        }

        $project->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Project berhasil dihapus'
        ], 200);
    }

    /**
     * Search projects by name
     * Employee: hanya projek yang mereka ikuti
     * Admin/Manager: semua projek
     * PostgreSQL: menggunakan ILIKE untuk case-insensitive search
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $katakunci = $request->input('search', '');
        
        // PostgreSQL: ILIKE untuk case-insensitive search
        $query = Project::where('name', 'ILIKE', "%$katakunci%")
                       ->orWhere('description', 'ILIKE', "%$katakunci%");
        
        if ($user->role->name === 'employee') {
            $query->whereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        
        $projects = $query->get();
        
        // FIXED: Consistent response format
        return response()->json([
            'success' => true,
            'data' => $projects,
            'count' => $projects->count()
        ], 200);
    }

    /**
     * Add member to project
     * Only admin/manager can add members
     */
    public function addMember(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role->name === 'employee') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::find($id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan'
            ], 404);
        }

        // Check if user is already a member
        $isMember = $project->members()->where('user_id', $request->user_id)->exists();
        
        if ($isMember) {
            return response()->json([
                'success' => false,
                'message' => 'User sudah menjadi anggota projek ini'
            ], 422);
        }

        // Add member with role
        $project->members()->attach($request->user_id, [
            'role_in_project' => $request->role ?? 'Anggota Tim'
        ]);

        // Load fresh members
        $project->load('members');

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan ke tim projek',
            'data' => $project
        ], 200);
    }
}