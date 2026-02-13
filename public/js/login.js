/**
 * /js/login.js 
 * Integrasi dengan AuthController@login
 */

const API_URL = 'http://localhost:8000/api';

$(document).ready(function() {
    // Jika token sudah ada, langsung arahkan ke dashboard
    if (localStorage.getItem('api_token')) {
        window.location.href = 'dashboard.html';
    }

    // Handle pengiriman form login
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        
        const payload = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        // Indikator loading menggunakan SweetAlert2
        Swal.fire({
            title: 'Memverifikasi...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Mengirim data ke AuthController@login
        $.post(`${API_URL}/login`, payload)
            .done(function(res) {
                // Berhasil: Simpan api_token yang dihasilkan Str::random(60)
                localStorage.setItem('api_token', res.api_token);
                localStorage.setItem('user_data', JSON.stringify(res.user));

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Masuk!',
                    text: 'Membuka dashboard Anda...',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            })
            .fail(function(xhr) {
                let errorMessage = 'Gagal terhubung ke server.';
                
                // Menangkap pesan "Email atau password salah" dari backend
                if (xhr.status === 401) {
                    errorMessage = xhr.responseJSON.message; 
                } else if (xhr.status === 422) {
                    const errors = xhr.responseJSON;
                    errorMessage = Object.values(errors)[0][0];
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: errorMessage
                });
            });
    });
});