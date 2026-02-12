const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
});

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

function fetchProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data;
        $('#nav-user-name').text(user.name);
        $('#nav-user-dept').text(`${user.department} | ${user.role}`);
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('#nav-initial').text(initials);
    });
}

function loadProjectBubbles(page = 1) {
    $('#project-selector-section').removeClass('hidden');
    $('#task-view-section').addClass('hidden');

    $.get(`${API_URL}/projects?page=${page}`, function(res) {
        const projects = res.data; 
        let html = '';
        
        if (!projects || projects.length === 0) {
            $('#project-bubble-list').html('<p class="col-span-full text-center py-20 text-blue-400 italic">Belum ada projek yang ditugaskan ke Anda.</p>');
            return;
        }

        projects.forEach(p => {
            html += `
            <div onclick="window.location.href='tasks.html?project_id=${p.id}'" 
                 class="project-card group bg-white border border-blue-100 p-8 rounded-[2.5rem] cursor-pointer transition-all duration-500 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-blue-600 transition-colors duration-500"></div>
                <div class="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <h4 class="font-black text-xl text-blue-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">${p.name}</h4>
                <div class="flex items-center justify-between mt-6">
                    <span class="text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-blue-500 transition-colors">${p.status}</span>
                    <span class="text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity italic">Lihat Tugas &rarr;</span>
                </div>
            </div>`;
        });
        $('#project-bubble-list').html(html);
        renderPagination(res, 'projects');
    });
}

function showTaskView(id, page = 1) {
    $('#task-view-section').removeClass('hidden');
    $('#project-selector-section').addClass('hidden');

    $.get(`${API_URL}/projects/${id}`, function(res) {
        $('#current-project-name').text(res.data.name);
    });

    $.get(`${API_URL}/projects/${id}/tasks?page=${page}`, function(res) {
        const tasksData = res.tasks.data; 
        const total = res.tasks.total;
        let html = '';
        $('#task-count-badge').text(`${total} Tugas Tercatat`);

        if (!tasksData || tasksData.length === 0) {
            html = '<tr><td colspan="3" class="p-20 text-center text-blue-300 italic font-medium">Tidak ada rincian tugas untuk projek ini.</td></tr>';
        } else {
            tasksData.forEach(t => {
                const isDone = t.status === 'done';
                html += `
                <tr class="hover:bg-blue-50/30 transition-colors group">
                    <td class="p-8">
                        <p class="font-bold text-lg ${isDone ? 'text-blue-300 line-through' : 'text-blue-900'} group-hover:text-blue-600 transition-colors">${t.title || t.name}</p>
                        <p class="text-[10px] text-blue-400 font-black uppercase mt-1 tracking-widest">ID: #${t.id} | Prioritas: ${t.priority}</p>
                    </td>
                    <td class="p-8 text-center text-sm font-bold text-blue-500 font-mono italic">
                        ${t.due_date || '-'}
                    </td>
                    <td class="p-8 text-right">
                        <span class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest 
                            ${isDone ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-blue-100 text-blue-600'}">
                            ${t.status}
                        </span>
                    </td>
                </tr>`;
            });
        }
        $('#task-list-body').html(html);
        renderPagination(res.tasks, 'tasks', id);
    });
}

function renderPagination(meta, type, projectId = null) {
    let html = '';
    if (meta.last_page > 1) {
        for (let i = 1; i <= meta.last_page; i++) {
            const active = i === meta.current_page ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-white text-blue-400 hover:text-blue-600 border border-blue-100';
            const action = type === 'projects' ? `loadProjectBubbles(${i})` : `showTaskView(${projectId}, ${i})`;
            html += `<button onclick="${action}" class="h-12 w-12 rounded-2xl font-black text-sm transition-all duration-300 ${active}">${i}</button>`;
        }
    }
    $('#project-pagination').html(html);
}

function resetToProjects() {
    window.location.href = 'tasks.html';
}