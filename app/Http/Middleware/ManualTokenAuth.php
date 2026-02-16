<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;

class ManualTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. Ambil token dari Bearer Header (AJAX) 
        // ATAU dari Query String (?token=...) untuk akses URL langsung
        $token = $request->bearerToken() ?: $request->query('token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak disediakan'
            ], 401);
        }

        // 2. Hash token yang datang dari user (Plain) menjadi SHA-256
        // Harus sesuai dengan cara simpan di AuthController
        $hashedToken = hash('sha256', $token);

        // 3. Cari user berdasarkan hashed token di database
        $user = User::where('api_token', $hashedToken)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid'
            ], 401);
        }

        // 4. Daftarkan user ke request agar $request->user() bisa 
        // dipanggil di Controller manapun
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}