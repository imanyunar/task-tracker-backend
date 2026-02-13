/**
 * /js/dashboard.js
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// Cek Sesi
if (!token) window.location.href = 'login.html';

$(document).ready(function() {
    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        }
    });

    initDashboard();

    // Event Logout
    $('#logout-btn').click(handleLogout);
});

function initDashboard() {
    // 1. Ambil Profil User
    $.get(`${API_URL}/profile`)
        .done(function(res) {
            const user = res.data; //
            $('#user-name-header').text(user.name + " | " + user.department);
            $('#user-role-badge').text(user.role);
            $('#welcome-text').text(`Halo, ${user.name.split(' ')[0]}!`);
        })
        .fail(function(xhr) {
            if (xhr.status === 401) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });

    // 2. Ambil Statistik Dashboard
    $.get(`${API_URL}/dashboard/stats`)
        .done(function(res) {
            if (res.success) {
                $('#stat-projects').text(res.project_count);
                $('#stat-tasks').text(res.task_count_active);
            }
        });
}

function handleLogout() {
    Swal.fire({
        title: 'Keluar Sistem?',
        text: 'Sesi Anda akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626', // Merah Solid
        cancelButtonColor: '#475569',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post(`${API_URL}/logout`)
                .always(() => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });
        }
    });
}