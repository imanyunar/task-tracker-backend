<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
  public function show(Request $request)
{
    // Mengambil user berdasarkan token yang dikirim di header
    $user = $request->user(); 

    if (!$user) {
        return response()->json(['message' => 'Sesi tidak valid'], 401);
    }

    
    $user->load(['department', 'role']);

    return response()->json([
        'success' => true,
        'message' => 'Data profil berhasil diambil',
        'data'    => [
            'name'       => $user->name,
            'email'      => $user->email,
            'department' => $user->department->name ?? 'N/A',
            'role'       => $user->role->name ?? 'N/A',
            'joined_at'  => $user->created_at->isoFormat('D MMMM YYYY'), 
        ]
    ], 200);
}
}