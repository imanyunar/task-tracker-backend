<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\ProfileController;

Route::get('/register', function () {
    return response()->file(public_path('register.html'));
});
Route::get('/login', function () {
    return response()->file(public_path('login.html'));
});
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth')->group(function () {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::get('dashboard/stats', [TaskController::class, 'getDashboardStats']);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('users', UserController::class);
    Route::get('projects/search', [ProjectController::class, 'search']);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::get('projects/{projectId}/tasks', [TaskController::class, 'tasksByProject']);
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('projects/{id}/add-member', [ProjectController::class, 'addMember']); 
    Route::post('logout', [AuthController::class, 'logout']);
    
});

