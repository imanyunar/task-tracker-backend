/**
 * /js/dashboard.js
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) {
    window.location.href = '/api/login';
}

$.ajaxSetup({
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    }
});

$(document).ready(function() {
    // Sinkronisasi Link Sidebar
    const navToken = `?token=${token}`;
    $('#link-dashboard').attr('href', `/api/dashboard${navToken}`);
    $('#link-projects').attr('href', `/api/projects-view${navToken}`); 
    $('#link-profile').attr('href', `/api/profile-view${navToken}`);

    loadProfile();
    loadKPIStats();

    $('#logout-btn').click(handleLogout);
});

function loadProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.user || res.data;
        $('#user-name').text(user.name.split(' ')[0]);
        $('#nav-user-name').text(user.name);
        $('#dept-name').text(user.department || 'GENERAL');
        $('#user-role').text(user.role || 'MEMBER');
        $('#last-login').text(user.joined_at || 'Baru Saja');
    }).fail(function(xhr) {
        if (xhr.status === 401) logout();
    });
}

function loadKPIStats() {
    // Menggunakan rute dashboard/stats sesuai TaskController@getKPIStats
    $.get(`${API_URL}/dashboard-stats`, function(res) {
        if (res.success) {
            // 1. Update Skor Final & Animasi Ring
            const finalScore = Math.round(res.score);
            $('#final-kpi-score').text(finalScore);
            animateKpiRing(finalScore);

            // 2. Update Metrik Progress Bars
            $('#metric-completion').text(`${res.metrics.completion}%`);
            $('#bar-completion').css('width', `${res.metrics.completion}%`);

            $('#metric-timeliness').text(`${res.metrics.timeliness}%`);
            $('#bar-timeliness').css('width', `${res.metrics.timeliness}%`);

            // 3. Update Project Count
            $('#project-count').text(res.metrics.projects);
        }
    });
}

function animateKpiRing(percent) {
    const circle = document.getElementById('kpi-ring');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    // Hitung offset berdasarkan persentase (0-100)
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;
}

function handleLogout() {
    $.post(`${API_URL}/logout`, function() {
        localStorage.clear();
        window.location.href = '/api/login';
    }).fail(() => logout());
}

function logout() {
    localStorage.clear();
    window.location.href = '/api/login';
}   