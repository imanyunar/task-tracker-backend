const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// 1. Proteksi Halaman
if (!token) {
    window.location.href = 'login.html';
}

$(document).ready(function() {
    // 2. Load Profil saat halaman siap
    loadProfile();
});

function loadProfile() {
    $.ajax({
        url: `${API_URL}/profile`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            const user = response.data;

            // 3. Isi data ke elemen HTML menggunakan selector jQuery ($)
            $('#user-name').text(user.name);
            $('#user-role').text(user.role);
            $('#user-email').text(user.email);
            $('#user-dept').text(user.department);
            $('#user-joined').text(user.joined_at);

            // 4. Buat Inisial Nama
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            $('#pfp-initial').text(initials);
        },
        error: function(xhr) {
            console.error("Gagal memuat profil:", xhr);
            if (xhr.status === 401) {
                window.location.href = 'login.html';
            }
        }
    });
}