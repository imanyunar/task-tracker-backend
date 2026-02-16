/**
 * /js/projects.js
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({ headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });

let currentUserRole = '';
let selectedProjectId = null;

$(document).ready(function() {
    // 1. Ambil Profil & Cek Role
    $.get(`${API_URL}/profile`, function(res) {
        currentUserRole = res.data.role.toLowerCase(); 
        $('#user-info-text').text(`Sesi: ${res.data.role} | ${res.data.department}`);
        
        // Proteksi Fitur Admin
        if (currentUserRole !== 'employee') {
            $('#btn-create-project').removeClass('hidden');
            $('#btn-add-team-det').removeClass('hidden');
            loadUserList(); 
        }
        fetchProjects(1);
    });

    $('#form-project').submit(handleProjectSubmit);
    $('#form-add-member').submit(handleMemberSubmit);
    $('#logout-btn').click(() => { localStorage.clear(); window.location.href = 'login.html'; });
    $('#search-input').on('keyup', function() { fetchProjects(1, $(this).val()); });
});

/**
 * AMBIL DAFTAR PROJEK
 */
function fetchProjects(page = 1, search = '') {
    const endpoint = search ? `${API_URL}/projects/search?search=${search}` : `${API_URL}/projects?page=${page}`;
    $.get(endpoint, function(res) {
        const $list = $('#project-list').empty();
        const projects = res.data || res;

        projects.forEach(p => {
            $list.append(`
                <tr onclick="showProjectDetail(${p.id})" class="cursor-pointer hover:bg-blue-50/50 transition-all border-b border-slate-100 group">
                    <td class="p-8">
                        <p class="text-lg font-black text-slate-800 italic uppercase leading-none group-hover:text-blue-600 transition-colors">${p.name}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1 line-clamp-1">${p.description || 'Klik untuk rincian...'}</p>
                    </td>
                    <td class="p-8 text-center text-xs font-black text-slate-500 italic">${p.start_date} / ${p.end_date}</td>
                    <td class="p-8 text-right"><span class="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 tracking-widest uppercase transition-all">Rincian →</span></td>
                </tr>
            `);
        });
        if (!search && res.links) renderPagination(res);
    });
}

/**
 * TAMPILKAN DETAIL PROJEK
 */
window.showProjectDetail = function(id) {
    selectedProjectId = id;
    // Panggil fungsi show() di controller yang sudah me-load 'members'
    $.get(`${API_URL}/projects/${id}`, function(res) {
        const p = res.data;
        $('#det-name').text(p.name);
        $('#det-desc').text(p.description || 'Tidak ada deskripsi projek.');
        $('#det-start').text(p.start_date);
        $('#det-end').text(p.end_date);
        
        // Render Tim
        const $teamList = $('#det-team-list').empty();
        (p.members || []).forEach(m => {
            $teamList.append(`
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
                    <div class="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-[9px]">TAS</div>
                    <div><p class="text-[11px] font-black italic uppercase text-slate-800 leading-none">${m.name}</p><p class="text-[8px] font-bold text-blue-600 uppercase mt-1">${m.pivot.role_in_project}</p></div>
                </div>`);
        });

        // Kontrol Tombol Admin di Detail
        if (currentUserRole !== 'employee') {
            $('#admin-actions').removeClass('hidden');
            $('#btn-edit-det').attr('onclick', `openEditModal(${id})`);
            $('#btn-delete-det').attr('onclick', `deleteProject(${id})`);
        }
        $('#btn-task-det').attr('onclick', `window.location.href='tasks.html?project_id=${id}'`);

        $('#project-list-view').addClass('hidden');
        $('#project-detail-view').removeClass('hidden');
        $('#header-title').text('Detail Projek');
    });
}

function backToList() {
    $('#project-detail-view').addClass('hidden');
    $('#project-list-view').removeClass('hidden');
    $('#header-title').text('Manajemen Projek');
    fetchProjects(1);
}

// Global CRUD Helpers
window.openProjectModal = () => { $('#form-project')[0].reset(); $('#project-id').val(''); $('#modal-project-title').text('Buat Projek Baru'); $('#modal-project').removeClass('hidden'); };
window.openEditModal = (id) => { $.get(`${API_URL}/projects/${id}`, (res) => { const p = res.data; $('#project-id').val(p.id); $('#project-name').val(p.name); $('#project-desc-input').val(p.description); $('#project-start-input').val(p.start_date); $('#project-end-input').val(p.end_date); $('#modal-project-title').text('Edit Projek'); $('#modal-project').removeClass('hidden'); }); };
window.openTeamModal = () => { $('#member-project-id').val(selectedProjectId); $('#modal-team').removeClass('hidden'); };

function handleProjectSubmit(e) {
    e.preventDefault();
    const id = $('#project-id').val();
    const data = { name: $('#project-name').val(), description: $('#project-desc-input').val(), start_date: $('#project-start-input').val(), end_date: $('#project-end-input').val() };
    $.ajax({ url: id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`, method: id ? 'PUT' : 'POST', data: data, success: () => { $('#modal-project').addClass('hidden'); id ? showProjectDetail(id) : fetchProjects(1); } });
}

function handleMemberSubmit(e) {
    e.preventDefault();
    // Gunakan syncWithoutDetaching di backend
    $.post(`${API_URL}/projects/${selectedProjectId}/add-member`, { user_id: $('#select-user').val(), role: "Anggota Tim" })
        .done(() => { $('#modal-team').addClass('hidden'); showProjectDetail(selectedProjectId); });
}

window.deleteProject = (id) => { if(confirm('Hapus projek?')) $.ajax({ url: `${API_URL}/projects/${id}`, method: 'DELETE', success: () => backToList() }); };
function loadUserList() { $.get(`${API_URL}/users`, (users) => users.forEach(u => $('#select-user').append(`<option value="${u.id}">${u.name}</option>`))); }
function renderPagination(res) { const $c = $('#pagination-container').empty(); res.links.forEach(l => { if(l.url){ const p = new URL(l.url).searchParams.get('page'); $c.append(`<button onclick="fetchProjects(${p})" class="h-10 w-10 rounded-xl font-black text-xs ${l.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}">${l.label.replace('&laquo; Previous', '<').replace('Next &raquo;', '>')}</button>`); } }); }