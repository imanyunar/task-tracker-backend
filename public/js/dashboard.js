/**
 * /js/dashboard.js
 * Dashboard Logic & Protected Link Sync
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// 1. Proteksi Halaman
if (!token) {
    window.location.href = '/api/login';
}

// 2. Konfigurasi AJAX Global
$.ajaxSetup({
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    }
});

$(document).ready(function() {
    // 3. SINKRONISASI SIDEBAR (Mencegah Not Found 404 & JSON return)
    // Pastikan link mengarah ke rute VIEW (-view), bukan rute DATA (API Resource)
    const navToken = `?token=${token}`;
    $('#link-dashboard').attr('href', `/api/dashboard${navToken}`);
    $('#link-projects').attr('href', `/api/projects-view${navToken}`); 
    $('#link-profile').attr('href', `/api/profile-view${navToken}`);

    // 4. LOAD USER PROFILE
    $.get(`${API_URL}/profile`, function(res) {
        // Mendukung berbagai format response Laravel
        const user = res.user || res.data;
        
        $('#user-name').text(user.name);
        $('#dept-name').text(user.department?.name || user.department || 'GENERAL');
        $('#user-role').text(user.role?.name || user.role || 'MEMBER');
        $('#last-login').text(user.joined_at || 'Hari Ini');
        
        console.log('✅ Dashboard profile loaded for:', user.name);
    }).fail(function(xhr) {
        if (xhr.status === 401) logout();
    });

    // 5. LOAD DASHBOARD STATS
    $.get(`${API_URL}/dashboard-stats`, function(res) {
        if (res.success) {
            $('#project-count').text(res.project_count);
            $('#task-count').text(res.task_count_active);
            console.log('✅ Dashboard stats synchronized');
        }
    });

    // 6. LOGOUT HANDLER
    $('#logout-btn').click(function() {
        $.post(`${API_URL}/logout`, function() {
            localStorage.clear();
            window.location.href = '/api/login';
        });
    });
});

function logout() {
    localStorage.clear();
    window.location.href = '/api/login';
}