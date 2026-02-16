$(document).ready(function () {

    const API_URL = "http://localhost:8000/api";

    $("#registerForm").submit(function (e) {
        e.preventDefault();

        $("#message")
            .removeClass("text-red-500 text-green-500")
            .addClass("text-slate-500")
            .text("Processing...");

        $("#btnRegister").prop("disabled", true).text("Registering...");

        const data = {
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#password").val(),
            password_confirmation: $("#password_confirmation").val()
        };

        $.ajax({
            url: API_URL + "/register",
            method: "POST",
            data: data,

            success: function (res) {

                $("#message")
                    .removeClass("text-slate-500 text-red-500")
                    .addClass("text-green-500")
                    .text("Register successful! Redirecting...");

                setTimeout(() => {
                    window.location.href = "/api/login";
                }, 1500);
            },

            error: function (xhr) {

                let msg = "Registration failed";

                if (xhr.responseJSON) {
                    if (xhr.responseJSON.errors) {
                        msg = Object.values(xhr.responseJSON.errors)
                            .flat()
                            .join(", ");
                    } else if (xhr.responseJSON.message) {
                        msg = xhr.responseJSON.message;
                    }
                }

                $("#message")
                    .removeClass("text-slate-500 text-green-500")
                    .addClass("text-red-500")
                    .text(msg);

                $("#btnRegister")
                    .prop("disabled", false)
                    .text("Register");
            }
        });
    });

});
