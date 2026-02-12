const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({ headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });

$(document).ready(function() {
    fetchProfile();
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project_id');

    if (projectId) {
        showTaskView(projectId);
    } else {
        loadProjectBubbles();
    }

    $('#logout-btn').click(() => {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });
});

/**
 * NAVBAR PROFILE
 */
function fetchProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data; 
        $('#nav-user-name').text(user.name);
        $('#nav-user-dept').text(`${user.department} | ${user.role}`);
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#nav-initial').text(initials);
    });
}

/**
 * LOAD PROJECT BUBBLES
 */
function loadProjectBubbles(page = 1) {
    $('#project-selector-section').removeClass('hidden');
    $('#task-view-section').addClass('hidden');

    $.get(`${API_URL}/projects?page=${page}`, function(res) {
        const projects = res.data; 
        let html = '';
        
        projects.forEach(p => {
            html += `
            <div onclick="window.location.href='tasks.html?project_id=${p.id}'" 
                 class="p-10 bg-white border border-blue-100 rounded-[2.5rem] text-center cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all group shadow-sm">
                <div class="h-16 w-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <h4 class="font-black text-xl text-blue-900 leading-tight mb-2">${p.name}</h4>
                <span class="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">${p.status}</span>
            </div>`;
        });
        $('#project-bubble-list').html(html);
        renderPagination(res, 'projects');
    });
}

/**
 * LOAD TASK LIST (FIXED)
 */
function showTaskView(id, page = 1) {
    $('#task-view-section').removeClass('hidden');
    $('#project-selector-section').addClass('hidden');

    // 1. Ambil Nama Projek
    $.get(`${API_URL}/projects/${id}`, function(res) {
        $('#current-project-name').text(res.data.name);
    });

    // 2. Ambil List Task
    $.get(`${API_URL}/projects/${id}/tasks?page=${page}`, function(res) {
        // PERBAIKAN: Backend mengirim res.tasks.data karena menggunakan paginate
        const tasksData = res.tasks.data; 
        const totalTasks = res.tasks.total;
        
        let html = '';
        $('#task-count-badge').text(`${totalTasks} Tugas`);

        if (!tasksData || tasksData.length === 0) {
            html = '<tr><td colspan="3" class="p-16 text-center text-blue-400 italic">Belum ada tugas di projek ini.</td></tr>';
        } else {
            tasksData.forEach(t => {
                const isDone = t.status === 'done';
                // Gunakan t.title sesuai dengan validator di Controller
                const taskTitle = t.title || t.name; 
                
                html += `
                <tr class="border-b border-blue-50 hover:bg-blue-50/30 transition-colors">
                    <td class="p-8">
                        <p class="font-bold ${isDone ? 'text-blue-300 line-through italic' : 'text-blue-900'} text-lg">${taskTitle}</p>
                        <p class="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 italic">Prioritas: ${t.priority}</p>
                    </td>
                    <td class="p-8 text-center text-sm font-bold text-blue-400 font-mono">
                        ${t.due_date || '-'}
                    </td>
                    <td class="p-8 text-right">
                        <span class="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest 
                            ${isDone ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-blue-100 text-blue-600'}">
                            ${t.status}
                        </span>
                    </td>
                </tr>`;
            });
        }
        $('#task-list-body').html(html);
        
        // Render pagination untuk tasks jika perlu
        renderPagination(res.tasks, 'tasks', id);
    });
}

/**
 * PAGINATION BUILDER (Dinamis)
 */
function renderPagination(meta, type, projectId = null) {
    let html = '';
    if (meta.last_page > 1) {
        for (let i = 1; i <= meta.last_page; i++) {
            const active = i === meta.current_page ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 border border-blue-100';
            const clickAction = type === 'projects' ? `loadProjectBubbles(${i})` : `showTaskView(${projectId}, ${i})`;
            html += `<button onclick="${clickAction}" class="h-12 w-12 rounded-2xl font-black transition-all ${active}">${i}</button>`;
        }
    }
    // Pastikan ID elemen pagination ada di HTML Anda
    $('#project-pagination').html(html);
}