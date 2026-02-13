/**
 * /js/register.js
 */

const API_URL = 'http://localhost:8000/api';

$(document).ready(function() {
    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        
        // Data diambil langsung dari form (department akan berupa angka 1, 2, atau 3)
        const payload = {
            name: $('#name').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            department: $('#department').val() 
        };

        Swal.fire({
            title: 'Memproses...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Mengirim data ke AuthController@register
        $.post(`${API_URL}/register`, payload)
            .done(function(res) {
                // Simpan token untuk sesi dashboard
                localStorage.setItem('api_token', res.api_token);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Akun pendaftaran Anda sukses.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            })
            .fail(function(xhr) {
                let errorMsg = 'Gagal mendaftar.';
                // Menangkap error validasi seperti email sudah terdaftar
                if (xhr.status === 422) {
                    const errors = xhr.responseJSON;
                    errorMsg = Object.values(errors)[0][0]; 
                }
                Swal.fire('Gagal', errorMsg, 'error');
            });
    });
});