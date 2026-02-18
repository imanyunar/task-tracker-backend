/**
 * /js/profile.js
 * Manajemen Halaman Profil Pengguna
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// 1. Proteksi Halaman: Cek keberadaan token
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
    // 3. SINKRONISASI SIDEBAR (Mencegah Not Found/JSON Return)
    const navToken = `?token=${token}`;
    $('#link-dashboard').attr('href', `/api/dashboard${navToken}`);
    $('#link-projects').attr('href', `/api/projects-view${navToken}`); 
    $('#link-profile').attr('href', `/api/profile-view${navToken}`);

    // 4. LOAD DATA PROFIL
    $.get(`${API_URL}/profile`, function(res) {
        // Mendukung berbagai format response Laravel
        const user = res.data || res.user || res;
        
        // Mengisi elemen UI
        $('#prof-name').text(user.name);
        $('#prof-email').text(user.email);
        $('#prof-dept').text(user.department?.name || user.department || 'GENERAL');
        $('#prof-role').text(user.role?.name || user.role || 'MEMBER');
        $('#prof-joined').text(user.joined_at || 'Baru Saja Bergabung');
        
        // Inisial Nama
        if (user.name) {
            $('#profile-initial').text(user.name.charAt(0).toUpperCase());
        }
    }).fail(function(xhr) {
        if (xhr.status === 401) {
            localStorage.clear();
            window.location.href = '/api/login';
        }
    });

    // 5. LOGOUT HANDLER
    $('#logout-btn').click(function() {
        $.post(`${API_URL}/logout`, function() {
            localStorage.clear();
            window.location.href = '/api/login';
        });
    });
});