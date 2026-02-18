

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project_id');

const DEPARTMENT_MAP = {
    1: 'IT Support',
    2: 'Human Resource',
    3: 'Marketing'
};

let activeTab = 'todo';
let loadedTasks = [];

// 1. Setup & Proteksi
if (!token) window.location.href = '/api/login';
$.ajaxSetup({ headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });

$(document).ready(function() {
    const navToken = `?token=${token}`;
    $('#link-back-projects').attr('href', `/api/projects-view${navToken}`);

    if (!projectId) { window.location.href = `/api/projects-view${navToken}`; return; }

    fetchProjectInfo(); 
    fetchTasks(1);

    $('#form-task').submit(handleTaskSubmit);
    $('#btn-add-task').click(() => { $('#form-task')[0].reset(); $('#task-id').val(''); $('#form-title').text('Buat Tugas Baru'); $('#modal-form').removeClass('hidden'); });
    $('#logout-btn').click(() => { localStorage.clear(); window.location.href='/api/login'; });
});

/**
 * AMBIL INFO PROJEK & FILTER MEMBER
 */
function fetchProjectInfo() {
    $.get(`${API_URL}/projects/${projectId}`, (res) => {
        const p = res.data;
        $('#project-name-display').text(p.name);
        
        const $selectUser = $('#input-user').empty().append('<option value="">Pilih Anggota Projek</option>');
        (p.members || []).forEach(m => {
            // FIX: Menggunakan DEPARTMENT_MAP jika m.department null
            const dept = m.department?.name || DEPARTMENT_MAP[m.department_id] || 'GENERAL';
            $selectUser.append(`<option value="${m.id}">${m.name} [${dept}]</option>`);
        });
    });
}

/**
 * RENDER TAB BERDASARKAN STATUS
 */
function fetchTasks(page = 1) {
    $.get(`${API_URL}/projects/${projectId}/tasks?page=${page}`, function(res) {
        const tasksObj = res.tasks;
        loadedTasks = tasksObj.data || [];
        
        let counts = { todo: 0, doing: 0, review: 0, done: 0 };
        loadedTasks.forEach(t => { if (counts.hasOwnProperty(t.status)) counts[t.status]++; });
        Object.keys(counts).forEach(k => $(`#count-${k}`).text(counts[k]));

        renderActiveTab();
        renderPagination(tasksObj);
    });
}

function renderActiveTab() {
    const $list = $('#tab-content').empty();
    const filtered = loadedTasks.filter(t => t.status === activeTab);

    if (filtered.length === 0) {
        $list.append('<div class="py-20 text-center font-black text-slate-300 text-[10px] uppercase italic tracking-[0.3em]">Tidak Ada Tugas</div>');
        return;
    }

    filtered.forEach(t => {
        // FIX: Departemen Akurat Berdasarkan Mapping ID
        const userDept = t.user?.department?.name || DEPARTMENT_MAP[t.user?.department_id] || 'GENERAL';
        
        $list.append(`
            <div class="task-card bg-white p-5 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-left-2 duration-300">
                <div class="flex items-center space-x-5 flex-1 cursor-pointer" onclick="showDetail(${t.id})">
                    <div class="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-[11px] shadow-lg shadow-slate-200">${(t.user?.name || '?').charAt(0)}</div>
                    <div>
                        <h4 class="text-sm font-black text-slate-800 uppercase italic leading-none mb-1.5">${t.title}</h4>
                        <p class="text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">${t.user?.name || 'Unassigned'} • ${userDept}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right hidden md:block">
                        <p class="text-[7px] font-bold text-slate-300 uppercase">Deadline</p>
                        <p class="text-[9px] font-black text-slate-800 uppercase tracking-tighter">${t.due_date ? t.due_date.split(' ')[0] : '-'}</p>
                    </div>
                    <div class="h-8 w-[1px] bg-slate-50"></div>
                    <button onclick="editTask(${t.id})" class="text-slate-200 hover:text-blue-600 transition-colors p-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    <button onclick="deleteTask(${t.id})" class="text-slate-200 hover:text-red-500 transition-colors p-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    <select onchange="updateQuickStatus(${t.id}, this.value)" class="bg-slate-50 border-none rounded-xl text-[8px] font-black uppercase p-2 outline-none cursor-pointer">
                        <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Todo</option>
                        <option value="doing" ${t.status === 'doing' ? 'selected' : ''}>Doing</option>
                        <option value="review" ${t.status === 'review' ? 'selected' : ''}>Review</option>
                        <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </div>
            </div>`);
    });
}

/**
 * 4. LOGIKA CRUD & TAB
 */
window.switchTab = function(status) {
    activeTab = status;
    $('.tab-btn').removeClass('tab-active');
    $(`#tab-${status}`).addClass('tab-active');
    renderActiveTab();
}

window.showDetail = function(id) {
    $.get(`${API_URL}/tasks/${id}`, function(res) {
        const t = res.data;
        const dept = t.user?.department?.name || DEPARTMENT_MAP[t.user?.department_id] || 'GENERAL';
        $('#det-title').text(t.title);
        $('#det-description').text(t.description || 'Tidak ada deskripsi rincian.');
        $('#det-user').text(t.user?.name || '-');
        $('#det-dept').text(dept);
        $('#det-date').text(t.due_date ? t.due_date.split(' ')[0] : '-');
        $('#det-avatar').text((t.user?.name || '?').charAt(0));
        $('#det-priority').text(t.priority.toUpperCase());
        $('#modal-detail').removeClass('hidden');
    });
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const id = $('#task-id').val();
    const data = { 
        project_id: projectId, user_id: $('#input-user').val(), title: $('#input-title').val(), 
        description: $('#input-description').val(), due_date: $('#input-date').val(), 
        priority: $('#input-priority').val(), status: $('#input-status').val() 
    };
    const url = id ? `${API_URL}/tasks/${id}` : `${API_URL}/tasks`;
    const method = id ? 'PUT' : 'POST';

    $.ajax({ url, method, data, success: () => { 
        Swal.fire({ icon: 'success', title: 'Data Berhasil Disimpan', timer: 1000, showConfirmButton: false });
        $('#modal-form').addClass('hidden');
        fetchTasks(1);
    }});
}

window.editTask = function(id) {
    $.get(`${API_URL}/tasks/${id}`, function(res) {
        const t = res.data;
        $('#task-id').val(t.id);
        $('#input-title').val(t.title);
        $('#input-description').val(t.description);
        $('#input-user').val(t.user_id);
        $('#input-date').val(t.due_date ? t.due_date.split(' ')[0] : '');
        $('#input-priority').val(t.priority);
        $('#input-status').val(t.status);
        $('#form-title').text('Edit Rincian Tugas');
        $('#modal-form').removeClass('hidden');
    });
}

window.updateQuickStatus = function(id, status) {
    $.ajax({ url: `${API_URL}/tasks/${id}`, method: 'PUT', data: { status }, success: () => fetchTasks(1) });
}

window.deleteTask = function(id) {
    Swal.fire({ title: 'Hapus Tugas?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' }).then((r) => {
        if (r.isConfirmed) $.ajax({ url: `${API_URL}/tasks/${id}`, method: 'DELETE', success: () => fetchTasks(1) });
    });
}

function renderPagination(obj) {
    const $c = $('#pagination-container').empty();
    if (!obj.links) return;
    obj.links.forEach(l => {
        if (l.url) {
            const pNum = new URL(l.url).searchParams.get('page');
            $c.append(`<button onclick="fetchTasks(${pNum})" class="h-10 w-10 rounded-xl font-black text-[10px] transition-all ${l.active ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100'}">${l.label.replace('&laquo; Previous', '<').replace('Next &raquo;', '>')}</button>`);
        }
    });
}