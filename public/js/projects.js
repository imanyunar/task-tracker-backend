/**
 * /js/projects.js
 * Project CRUD Logic & Sidebar Sync
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// 1. Proteksi Halaman: Arahkan ke rute API login jika token tidak ada
if (!token) window.location.href = '/api/login';

// 2. AJAX Setup dengan Token Bearer untuk request data
$.ajaxSetup({ 
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    } 
});

let currentUserRole = '';
let selectedProjectId = null;

$(document).ready(function() {
    console.log('🚀 Project Management Active');

    // 3. SINKRONISASI LINK SIDEBAR (Penting agar tidak muncul JSON)
    // Pastikan rute di api.php menggunakan nama rute view (contoh: dashboard-view, projects-view)
    const navToken = `?token=${token}`;
    $('#link-dashboard').attr('href', `/api/dashboard${navToken}`);
    $('#link-projects').attr('href', `/api/projects-view${navToken}`); // Diubah ke -view
    $('#link-profile').attr('href', `/api/profile-view${navToken}`);

    // 4. Ambil Profil & Cek Role
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data || res.user;
        currentUserRole = user.role.toLowerCase(); 
        $('#user-info-text').text(`Sesi: ${user.role} | ${user.department}`);
        
        // Proteksi Fitur Admin (Create/Add Team)
        if (currentUserRole !== 'employee') {
            $('#btn-create-project').removeClass('hidden');
            $('#btn-add-team-det').removeClass('hidden');
            loadUserList(); 
        }
        fetchProjects(1);
    }).fail(function(xhr) {
        if (xhr.status === 401) logout();
    });

    // 5. Form Event Handlers
    $('#form-project').submit(handleProjectSubmit);
    $('#form-add-member').submit(handleMemberSubmit);
    $('#btn-create-project').click(openProjectModal);
    $('#search-input').on('keyup', function() { fetchProjects(1, $(this).val()); });
    
    // Logout Handler
    $('#logout-btn').click(() => logout());
});

/**
 * AMBIL DAFTAR PROJEK (READ & SEARCH)
 */
function fetchProjects(page = 1, search = '') {
    const endpoint = search ? `${API_URL}/projects/search?search=${search}` : `${API_URL}/projects?page=${page}`;
    
    $.get(endpoint, function(res) {
        const $list = $('#project-list').empty();
        const projects = res.data || res;

        if (!projects || projects.length === 0) {
            $list.append('<tr><td colspan="3" class="p-20 text-center font-bold text-slate-300 italic">Tidak ada projek ditemukan</td></tr>');
            return;
        }

        projects.forEach(p => {
            $list.append(`
                <tr onclick="showProjectDetail(${p.id})" class="cursor-pointer hover:bg-blue-50/50 transition-all border-b border-slate-100 group">
                    <td class="p-8">
                        <p class="text-xl font-black text-slate-800 italic uppercase leading-none group-hover:text-blue-600 transition-colors">${p.name}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-2 line-clamp-1 italic">${p.description || 'Lihat rincian projek...'}</p>
                    </td>
                    <td class="p-8 text-center text-xs font-black text-slate-500 italic">${p.start_date} s/d ${p.end_date}</td>
                    <td class="p-8 text-right">
                        <span class="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 tracking-widest uppercase transition-all">Lihat Detail →</span>
                    </td>
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
    $.get(`${API_URL}/projects/${id}`, function(res) {
        const p = res.data;
        $('#det-name').text(p.name);
        $('#det-desc').text(p.description || 'Tidak ada deskripsi projek.');
        $('#det-start').text(p.start_date);
        $('#det-end').text(p.end_date);
        
        // Render List Tim
        const $teamList = $('#det-team-list').empty();
        (p.members || []).forEach(m => {
            $teamList.append(`
                <div class="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center space-x-3 performance-card">
                    <div class="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-[10px]">TAS</div>
                    <div>
                        <p class="text-xs font-black italic uppercase text-slate-800 leading-none">${m.name}</p>
                        <p class="text-[9px] font-bold text-blue-600 uppercase mt-1 tracking-tighter">${m.pivot?.role_in_project || 'Anggota'}</p>
                    </div>
                </div>`);
        });

        // Tampilkan tombol Admin jika role bukan Employee
        if (currentUserRole !== 'employee') {
            $('#admin-actions').removeClass('hidden');
            $('#btn-edit-det').attr('onclick', `openEditModal(${id})`);
            $('#btn-delete-det').attr('onclick', `deleteProject(${id})`);
        }
        
        // FIX: Gunakan /tasks-view agar memuat HTML, bukan JSON mentah
        $('#btn-task-det').attr('onclick', `window.location.href='/api/tasks-view?project_id=${id}&token=${token}'`); 

        $('#project-list-view').addClass('hidden');
        $('#project-detail-view').removeClass('hidden');
        $('#header-title').text('Detail Projek');
    });
}

window.backToList = function() {
    $('#project-detail-view').addClass('hidden');
    $('#project-list-view').removeClass('hidden');
    $('#header-title').text('Manajemen Projek');
    fetchProjects(1);
};

/**
 * LOGIKA SUBMIT (POST/PUT)
 */
function handleProjectSubmit(e) {
    e.preventDefault();
    const id = $('#project-id').val();
    const data = { 
        name: $('#project-name').val(), 
        description: $('#project-desc-input').val(), 
        start_date: $('#project-start-input').val(), 
        end_date: $('#project-end-input').val() 
    };

    $.ajax({ 
        url: id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`, 
        method: id ? 'PUT' : 'POST', 
        data: data, 
        success: () => { 
            Swal.fire('Sukses', 'Data projek berhasil disimpan', 'success');
            $('#modal-project').addClass('hidden');
            id ? showProjectDetail(id) : fetchProjects(1);
        }
    });
}

function handleMemberSubmit(e) {
    e.preventDefault();
    $.post(`${API_URL}/projects/${selectedProjectId}/add-member`, { 
        user_id: $('#select-user').val(), 
        role: "Anggota Tim" 
    }).done(() => { 
        Swal.fire('Tim Ditambahkan', 'Anggota baru berhasil bergabung', 'success');
        $('#modal-team').addClass('hidden');
        showProjectDetail(selectedProjectId);
    });
}

window.deleteProject = (id) => { 
    Swal.fire({
        title: 'Hapus Projek?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({ 
                url: `${API_URL}/projects/${id}`, 
                method: 'DELETE', 
                success: () => {
                    Swal.fire('Terhapus!', 'Projek berhasil dihapus.', 'success');
                    backToList();
                }
            });
        }
    });
};

/**
 * UTILITIES
 */
function loadUserList() { 
    $.get(`${API_URL}/users`, (res) => {
        const users = res.data || res;
        $('#select-user').empty().append('<option value="">Cari Nama...</option>');
        users.forEach(u => $('#select-user').append(`<option value="${u.id}">${u.name} - ${u.department}</option>`)); 
    });
}

function openProjectModal() { 
    $('#form-project')[0].reset();
    $('#project-id').val('');
    $('#modal-project-title').text('Buat Projek Baru');
    $('#modal-project').removeClass('hidden');
}

window.openEditModal = (id) => { 
    $.get(`${API_URL}/projects/${id}`, (res) => { 
        const p = res.data;
        $('#project-id').val(p.id);
        $('#project-name').val(p.name);
        $('#project-desc-input').val(p.description);
        $('#project-start-input').val(p.start_date);
        $('#project-end-input').val(p.end_date);
        $('#modal-project-title').text('Edit Rincian Projek');
        $('#modal-project').removeClass('hidden');
    }); 
};

window.openTeamModal = () => { 
    $('#member-project-id').val(selectedProjectId);
    $('#modal-team').removeClass('hidden');
};

function renderPagination(res) { 
    const $c = $('#pagination-container').empty();
    if(!res.links) return;
    res.links.forEach(l => { 
        if(l.url){ 
            const p = new URL(l.url).searchParams.get('page');
            $c.append(`<button onclick="fetchProjects(${p})" class="h-10 w-10 rounded-xl font-black text-xs transition-all ${l.active ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-blue-50'}">${l.label.replace('&laquo; Previous', '<').replace('Next &raquo;', '>')}</button>`);
        } 
    }); 
}

function logout() {
    localStorage.clear();
    window.location.href = '/api/login';
}