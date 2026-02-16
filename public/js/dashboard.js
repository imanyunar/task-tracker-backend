/**
 * dashboard.js
 * Updated untuk AuthController
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

console.log('🚀 Dashboard loaded');
console.log('🎫 Token:', token ? token.substring(0, 20) + '...' : 'NONE');

if (!token) {
    console.log('❌ No token, redirecting...');
    window.location.href = '/api/login';
    throw new Error('No token');
}

$.ajaxSetup({
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    }
});

$(document).ready(function() {
    console.log('📊 Loading data...');

    // GET PROFILE - AuthController::userProfile
    $.ajax({
        url: `${API_URL}/profile`,
        method: 'GET',
        success: function(res) {
            console.log('✅ Profile:', res);
            
            // AuthController return: {success: true, user: {...}}
            const userData = res.user || res.data || res;
            const userName = userData.name || 'User';
            const userRole = userData.role?.name || userData.role || 'Member';
            
            $('#user-welcome').text(`Halo, ${userName} (${userRole})`);
        },
        error: function(xhr) {
            console.error('❌ Profile failed:', xhr.status, xhr.responseJSON);
            
            if (xhr.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sesi Berakhir',
                    text: 'Token tidak valid. Login kembali.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    localStorage.clear();
                    window.location.href = '/api/login';
                });
            } else {
                $('#user-welcome').text('Error: ' + (xhr.responseJSON?.message || 'Gagal load'));
            }
        }
    });

    // GET DASHBOARD STATS
    $.ajax({
        url: `${API_URL}/dashboard-stats`,
        method: 'GET',
        success: function(res) {
            console.log('✅ Stats:', res);
            
            const stats = res.data || res;
            $('#stat-projects').text(stats.project_count || 0);
            $('#stat-tasks').text(stats.task_count_active || stats.task_count || 0);
        },
        error: function(xhr) {
            console.error('❌ Stats failed:', xhr.status);
            
            if (xhr.status === 401) {
                localStorage.clear();
                window.location.href = '/api/login';
            } else {
                $('#stat-projects').text('N/A');
                $('#stat-tasks').text('N/A');
            }
        }
    });

    // LOGOUT
    $('#logout-btn').click(function() {
        Swal.fire({
            title: 'Keluar?',
            text: 'Yakin keluar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `${API_URL}/logout`,
                    method: 'POST',
                    complete: function() {
                        localStorage.clear();
                        window.location.href = '/api/login';
                    }
                });
            }
        });
    });
});