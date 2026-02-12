$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();

        const $btn = $('#btnSubmit');
        const $msg = $('#msg');

        $btn.html('<svg class="animate-spin h-5 w-5 text-white" ...></svg>').prop('disabled', true);
        $msg.addClass('hidden').removeClass('bg-green-50 text-green-700 border-green-100 bg-red-50 text-red-700 border-red-100');

        const payload = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            url: '/api/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                localStorage.setItem('api_token', res.api_token);
                localStorage.setItem('user_name', res.user.name);
                localStorage.setItem('role_id', res.user.role_id);

                $msg.removeClass('hidden')
                    .addClass('bg-green-50 text-green-700 border-green-100')
                    .text('Login Berhasil! Mengalihkan...');
                
                // Redirect berdasarkan Role
                setTimeout(() => {
                    if (res.user.role_id == 1) {
                        window.location.href = '/admin-dashboard.html';
                    } else {
                        window.location.href = '/dashboard.html';
                    }
                }, 1500);
            },
            error: function(xhr) {
                let errorMsg = "Email atau Password salah.";
                if (xhr.status === 422) {
                    errorMsg = Object.values(xhr.responseJSON)[0][0];
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                }

                $msg.removeClass('hidden')
                    .addClass('bg-red-50 text-red-700 border-red-100')
                    .text(errorMsg);
                
                $btn.html('<span>Masuk Sekarang</span>').prop('disabled', false);
            }
        });
    });
});