<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'department' => 'required|exists:departments,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $plain_token = Str::random(60);
        $hashed_token = hash('sha256', $plain_token);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department_id' => $request->department,
            'api_token' => $hashed_token
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil registrasi',
            'user' => $user,
            'api_token' => $plain_token
        ], 200);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        $plain_token = Str::random(60);
        $hashed_token = hash('sha256', $plain_token);
        $user->update(['api_token' => $hashed_token]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil login',
            'user' => $user,
            'api_token' => $plain_token
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        
        if ($user) {
            $user->update(['api_token' => null]);
            
            return response()->json([
                'success' => true,
                'message' => 'Berhasil logout',
            ], 200);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'User tidak ditemukan',
        ], 401);
    }
   
    public function userProfile(Request $request)
    {
        $user = $request->user()->load('department', 'role');

        return response()->json([
            'success' => true,
            'user' => $user,
        ], 200);
    }
}