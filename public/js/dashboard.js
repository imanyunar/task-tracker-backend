/**
 * KONFIGURASI API & KEAMANAN
 */
const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) {
    window.location.href = 'login.html';
}

/**
 * Global AJAX Setup Header
 */
$.ajaxSetup({
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});

$(document).ready(function() {
    // Jalankan semua penarikan data
    fetchProfile();
    fetchStats();
    fetchProjects();

    // Event Logout
    $('#logout-btn').on('click', function() {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });
});

/**
 * 1. AMBIL PROFIL
 */
function fetchProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data || res;
        $('#user-name').text(user.name);
        $('#user-dept').text(`${user.department} | ${user.role}`);
        
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#nav-initial').text(initials);
    }).fail(function(xhr) {
        if (xhr.status === 401) window.location.href = 'login.html';
    });
}

/**
 * 2. AMBIL STATISTIK
 */
function fetchStats() {
    $.get(`${API_URL}/dashboard/stats`, function(res) {
        $('#stat-projects').text(res.project_count || 0);
        $('#stat-tasks').text(res.task_count_active || 0);
    });
}

/**
 * 3. AMBIL DAFTAR PROYEK (GRID BOX)
 */
function fetchProjects() {
    $.get(`${API_URL}/projects`, function(res) {
        // SOLUSI ERROR LENGTH: Cek jika res adalah array langsung atau res.data
        const projects = res.data || res; 

        let html = '';

        if (!Array.isArray(projects) || projects.length === 0) {
            $('#project-list').html('<div class="col-span-full py-10 text-center text-slate-400 bg-white rounded-3xl border border-dashed italic">Belum ada proyek ditugaskan.</div>');
            return;
        }

        projects.forEach(p => {
            html += `
                <div onclick="goToTasks(${p.id}, '${p.name}')" 
                     class="p-8 bg-white border border-slate-100 rounded-[2.5rem] cursor-pointer hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/5 transition-all active:scale-95 group">
                    <div class="flex justify-between items-start mb-6">
                        <div class="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg text-slate-500">${p.status}</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors leading-tight">${p.name}</h3>
                    <p class="text-xs text-slate-400 font-medium mb-8 leading-relaxed line-clamp-2">Klik untuk mengelola tugas proyek ini secara detail.</p>
                    <div class="pt-4 border-t border-slate-50 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest">
                        Buka Task
                        <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                </div>`;
        });
        
        $('#project-list').html(html);
    });
}

/**
 * 4. FUNGSI REDIRECT KE HALAMAN TUGAS
 */
function goToTasks(id, name) {
    localStorage.setItem('current_project_name', name);
    window.location.href = `tasks.html?project_id=${id}`;
}