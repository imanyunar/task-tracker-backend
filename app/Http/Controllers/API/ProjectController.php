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
    public function index(Request $request)
    {
        $user = $request->user();

        if($user->role->name === 'employee'){
            $projects = Project::whereHas('members', function($query) use ($user){
                $query->where('user_id', $user->id);
            })->get();

    }   else{
            $projects = Project::all();
        }

        return response()-> json($projects);
    
    }
    public function store(Request $request)
    {
       $user = $request->user();
        if($user->role->name === 'employee'){
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }else{
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        $project = Project::create($request->all());
        return response()->json(['success' => true, 'data' => $project], 201);
    }

    }
    
    public function addMember(Request $request, $id)
{
    $user = $request->user();
    if($user->role->name === 'employee'){
        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak'
        ], 403);
    }else{
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'role'    => 'required|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $project = Project::findOrFail($id);
            
            // 2. Gunakan syncWithoutDetaching agar tidak ada user ganda di proyek yang sama
            $project->members()->syncWithoutDetaching([
                $request->user_id => ['role_in_project' => $request->role]
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Anggota berhasil ditambahkan ke tim proyek'
            ]);
}
}

    public function show($id)
    {
        $user = $request->user();
        if($user->role->name === 'employee'){
            $project = Project::where('id', $id)
                ->whereHas('members', function($query) use ($user){
                    $query->where('user_id', $user->id);
                })->first();

            if (!$project) {
                return response()->json(['message' => 'Project Tidak Ditemukan atau Akses Ditolak'], 404);
            }
        } else {
            $project = Project::find($id);
            if (!$project) {
                return response()->json(['message' => 'Project Tidak Ditemukan'], 404);
            }
        }
        return response()->json(['success' => true, 'data' => $project], 200);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if($user->role->name === 'employee'){
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }else{
        $project = Project::find($id);
        if (!$project) return response()->json(['message' => 'Project Tidak Ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'name'       => 'string|max:255',
            'start_date' => 'date',
            'end_date'   => 'date|after:start_date',
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        $project->update($request->all());
        return response()->json(['Berhasil Merubah Proyek' => true, 'data' => $project], 200);
    }
    }

    public function destroy($id)
    {
        if($user->role->name === 'employee'){
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }else{
        $project = Project::find($id);
        if (!$project) return response()->json(['message' => 'Project Tidak Ditemukan'], 404);

        $project->delete();
        return response()->json(['success' => true, 'message' => 'Project Berhasil Dihapus'], 200);
    }
}

}