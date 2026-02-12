$(document).ready(function() {
    $('#regForm').on('submit', function(e) {
        e.preventDefault();

        const $btn = $('#btnSubmit');
        const $msg = $('#msg');

        // Loading state
        $btn.html('<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>').prop('disabled', true);
        $msg.addClass('hidden').removeClass('bg-green-50 text-green-700 border-green-100 bg-red-50 text-red-700 border-red-100');

        const payload = {
            name: $('#name').val(),
            email: $('#email').val(),
            department: $('#dept_select').val(),
            password: $('#password').val(),
            password_confirmation: $('#password_confirmation').val()
        };

        $.ajax({
            url: '/api/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                localStorage.setItem('api_token', res.api_token);

                $msg.removeClass('hidden')
                    .addClass('bg-green-50 text-green-700 border-green-100 shadow-sm')
                    .html(`
                        <div class="flex flex-col gap-2">
                            <span class="font-bold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                                Berhasil mendaftar!
                            </span>
                        </div>
                    `);
                
                $('#regForm')[0].reset();
                $btn.html('Daftar Sekarang').prop('disabled', false);
            },
            error: function(xhr) {
                let errorMsg = "Terjadi kesalahan sistem.";
                if (xhr.status === 422) {
                    errorMsg = Object.values(xhr.responseJSON)[0][0];
                }
                $msg.removeClass('hidden')
                    .addClass('bg-red-50 text-red-700 border-red-100')
                    .text(errorMsg);
                
                $btn.html('Daftar Sekarang').prop('disabled', false);
            }
        });
    });
});