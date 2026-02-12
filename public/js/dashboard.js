const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
});

$(document).ready(function() {
    fetchProfile();
    fetchStats();
    fetchProjects();

    $('#logout-btn').on('click', function() {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });
});

function fetchProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data || res;
        $('#user-name').text(user.name);
        $('#user-dept').text(`${user.department} | ${user.role}`);
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#nav-initial').text(initials);
    }).fail(() => window.location.href = 'login.html');
}

function fetchStats() {
    $.get(`${API_URL}/dashboard/stats`, function(res) {
        $('#stat-projects').text(res.project_count || 0);
        $('#stat-tasks').text(res.task_count_active || 0);
    });
}

function fetchProjects() {
    $.get(`${API_URL}/projects`, function(res) {
        // Handle format response paginate(10)
        const projects = res.data || res; 

        let html = '';
        if (!Array.isArray(projects) || projects.length === 0) {
            $('#project-list').html('<div class="col-span-full py-10 text-center text-slate-400 bg-white rounded-[2rem] border border-dashed italic">Tidak ada projek aktif.</div>');
            return;
        }

        projects.forEach(p => {
            html += `
                <div onclick="window.location.href='tasks.html?project_id=${p.id}'" 
                     class="p-8 bg-white border border-slate-100 rounded-[2.5rem] cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all active:scale-95 group">
                    <div class="flex justify-between items-start mb-6">
                        <div class="h-14 w-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg text-slate-500">${p.status}</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">${p.name}</h3>
                    <div class="pt-4 border-t border-slate-50 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest">
                        Buka Projek
                        <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                </div>`;
        });
        $('#project-list').html(html);
    });
}