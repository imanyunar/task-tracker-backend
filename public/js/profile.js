const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
});

$(document).ready(function() {
    fetchProfileData();

    $('#logout-btn').on('click', function() {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });
});

function fetchProfileData() {
    $.get(`${API_URL}/profile`, function(res) {
        // Ambil data dari pembungkus 'data'
        const user = res.data; 

        // Update Nav & Card
        $('#nav-user-name, #profile-name').text(user.name);
        $('#nav-user-dept').text(`${user.department} | ${user.role}`);
        $('#profile-role').text(user.role);
        $('#profile-email').text(user.email);
        $('#profile-dept').text(user.department);
        
        // Joined At Fix
        if (user.joined_at) {
            $('#profile-joined').text(user.joined_at).removeClass('italic');
        } else {
            $('#profile-joined').text('Data tidak tersedia');
        }
        
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#nav-initial, #profile-initial-large').text(initials);

    }).fail(function(xhr) {
        if (xhr.status === 401) window.location.href = 'login.html';
    });
}