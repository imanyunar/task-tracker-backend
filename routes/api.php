<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ProfileController;

Route::get('/login', function () {
    return response()->file(public_path('login.html'));
});

Route::get('/register', function () {
    return response()->file(public_path('register.html'));
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return response()->file(public_path('dashboard.html'));
    });
    
    Route::get('/tasks-view', function () {
        return response()->file(public_path('tasks.html'));
    });
    
    Route::get('/projects-view', function () {
        return response()->file(public_path('projects.html'));
    });

    Route::get('/profile-view', function () { 
        return response()->file(public_path('profile.html')); 
    });
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::get('/dashboard-stats', [TaskController::class, 'getDashboardStats']);
    
    Route::apiResource('/departments', DepartmentController::class);
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/projects', ProjectController::class);
    Route::get('/projects/search', [ProjectController::class, 'search']);
    Route::post('/projects/{id}/add-member', [ProjectController::class, 'addMember']);
    Route::get('/projects/{projectId}/tasks', [TaskController::class, 'tasksByProject']);
    
    Route::apiResource('/tasks', TaskController::class);
    
    Route::post('/logout', [AuthController::class, 'logout']);
});