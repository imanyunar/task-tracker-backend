<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Str;


class AuthController extends Controller
{
   public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|string',
        'department' => 'required|exists:departments,id' // Sudah benar 'exists'
    ]);
    
    // 1. Jika validasi GAGAL, kirim error dan BERHENTI di sini
    if($validator->fails()){
        return response()->json($validator->errors(), 422);
    } // <--- KURUNG PENUTUP HARUS DI SINI

    // 2. Jika lolos validasi, baru jalankan kode di bawah ini
    $plain_token = Str::random(60);
    $hashed_token = hash('sha256', $plain_token);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'department_id' => $request->department, // Mapping dari 'department' ke 'department_id'
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