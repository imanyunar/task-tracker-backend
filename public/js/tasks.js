/**
 * /js/tasks.js
 * Full CRUD & Detail Assignment Logic
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project_id');

if (!token) window.location.href = '/api/login';
if (!projectId) window.location.href = `/api/projects-view?token=${token}`;

$.ajaxSetup({ headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });

$(document).ready(function() {
    $('#btn-back-projects').on('click', () => window.location.href = `/api/projects-view?token=${token}`);

    loadProjectContext();
    fetchTasks();

    $('#form-task').submit(handleTaskSubmit);
});

// LOAD CONTEXT: Nama Projek & Daftar Anggota untuk Dropdown
function loadProjectContext() {
    $.get(`${API_URL}/projects/${projectId}`, function(res) {
        $('#project-title-header').text(`Tugas: ${res.data.name}`);
        const $u = $('#task-user').empty().append('<option value="">Pilih Anggota Tim...</option>');
        res.data.members.forEach(m => $u.append(`<option value="${m.id}">${m.name}</option>`));
    });

    $.get(`${API_URL}/profile`, (res) => {
        const user = res.data || res.user;
        if (user.role_id == 3) $('#btn-create-task').addClass('hidden'); // Sembunyikan tambah jika employee
        else $('#btn-create-task').removeClass('hidden');
    });
}

// SHOW DETAIL (EDIT): Memuat data lama ke form agar bisa ganti salah satu saja
window.openEditTask = function(id) {
    $.get(`${API_URL}/tasks/${id}`, (res) => {
        const t = res.data || res.task;
        
        // Isi Form dengan data lama (Ini kunci agar tidak perlu isi semua)
        $('#task-id').val(t.id);
        $('#task-title').val(t.title);
        $('#task-user').val(t.user_id);
        $('#task-desc').val(t.description || '');
        $('#task-status').val(t.status);
        $('#task-priority').val(t.priority);
        $('#task-due').val(t.due_date ? t.due_date.split(' ')[0] : '');

        $('#modal-task-title').text('Edit & Detail Tugas');
        $('#modal-task').removeClass('hidden');
    });
};

// CREATE & UPDATE
function handleTaskSubmit(e) {
    e.preventDefault();
    const id = $('#task-id').val();
    
    // Kirim semua data dari form (data lama yang tidak diganti tetap ikut terkirim)
    const data = {
        project_id: projectId,
        user_id: $('#task-user').val(),
        title: $('#task-title').val(),
        description: $('#task-desc').val(),
        status: $('#task-status').val(),
        priority: $('#task-priority').val(),
        due_date: $('#task-due').val()
    };

    $.ajax({
        url: id ? `${API_URL}/tasks/${id}` : `${API_URL}/tasks`,
        method: id ? 'PUT' : 'POST',
        data: data,
        success: () => {
            $('#modal-task').addClass('hidden');
            Swal.fire('Sinkron!', 'Data tugas berhasil diperbarui.', 'success');
            fetchTasks();
        },
        error: (xhr) => Swal.fire('Gagal', xhr.responseJSON?.message || 'Lengkapi field wajib', 'error')
    });
}

// READ LIST
function fetchTasks() {
    $.get(`${API_URL}/projects/${projectId}/tasks`, function(res) {
        const tasks = (res.tasks && res.tasks.data) ? res.tasks.data : []; 
        const $list = $('#task-list').empty();
        $('#task-count-text').text(`${tasks.length} TUGAS TERDAFTAR`);

        tasks.forEach(t => {
            const color = { 'todo': 'bg-slate-100 text-slate-500', 'doing': 'bg-blue-50 text-blue-600', 'review': 'bg-amber-50 text-amber-600', 'done': 'bg-emerald-50 text-emerald-600' }[t.status] || 'bg-slate-50';
            
            $list.append(`
                <tr class="hover:bg-slate-50 transition-colors group">
                    <td class="p-10">
                        <p class="text-sm font-black text-slate-800 uppercase italic leading-tight">${t.title}</p>
                        <p class="text-[9px] font-bold text-blue-500 mt-1 uppercase">PIC: ${t.user?.name || 'Unassigned'}</p>
                    </td>
                    <td class="p-10 text-center">
                        <div class="flex flex-col items-center space-y-1">
                            <span class="px-5 py-2 rounded-full text-[9px] font-black uppercase italic ${color}">${t.status}</span>
                            <span class="text-[8px] font-bold text-slate-400 uppercase italic">${t.priority}</span>
                        </div>
                    </td>
                    <td class="p-10 text-center text-xs font-bold text-slate-500">${t.due_date || '-'}</td>
                    <td class="p-10 text-right">
                        <div class="flex justify-end space-x-4">
                            <button onclick="openEditTask(${t.id})" class="text-amber-500 hover:text-amber-700 font-black text-[9px] uppercase">Edit/Show</button>
                            <button onclick="deleteTask(${t.id})" class="text-red-500 hover:text-red-700 font-black text-[9px] uppercase">Hapus</button>
                        </div>
                    </td>
                </tr>`);
        });
    });
}

// DELETE
window.deleteTask = (id) => {
    Swal.fire({ title: 'Hapus Tugas?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Hapus' }).then((r) => {
        if (r.isConfirmed) $.ajax({ url: `${API_URL}/tasks/${id}`, method: 'DELETE', success: () => fetchTasks() });
    });
};

window.openTaskModal = () => { $('#form-task')[0].reset(); $('#task-id').val(''); $('#modal-task-title').text('Tambah Tugas Baru'); $('#modal-task').removeClass('hidden'); };