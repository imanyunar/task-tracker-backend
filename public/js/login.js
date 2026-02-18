 
const API_URL = 'http://localhost:8000/api';

$(document).ready(function() {
    console.log('🚀 Login page loaded');

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();

        Swal.fire({
            title: 'Memverifikasi...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        $.ajax({
            url: `${API_URL}/login`,
            method: 'POST',
            data: { email, password },
            success: function(res) {
                // AuthController mengembalikan 'api_token' (plain)
                const token = res.api_token;
                const userData = res.user;

                if (token) {
                    // Simpan di localStorage untuk kebutuhan request AJAX berikutnya
                    localStorage.setItem('api_token', token);
                    localStorage.setItem('user_data', JSON.stringify(userData));

                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil Masuk!',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // REDIRECT PENTING:
                        // Masukkan token ke URL (?token=...) agar middleware 'auth' di Laravel 
                        // mengizinkan browser memuat file dashboard.html
                        window.location.href = `/api/dashboard?token=${token}`;
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Server tidak mengirim token' });
                }
            },
            error: function(xhr) {
                let message = xhr.responseJSON?.message || 'Email atau password salah';
                Swal.fire({ icon: 'error', title: 'Login Gagal', text: message });
            }
        });
    });
});