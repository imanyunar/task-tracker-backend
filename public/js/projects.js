/**
 * /js/projects.js
 * Sistem Manajemen Projek - PT TAS
 * Fitur: CRUD, Manajemen Tim, Paginasi, & RBAC
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// 1. Proteksi Halaman & Token Check
if (!token) {
    window.location.href = '/api/login';
}

// 2. Setup AJAX Global (Bearer Token)
$.ajaxSetup({
    headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    }
});

let currentUserRole = '';
let selectedProjectId = null;

$(document).ready(function() {
    // 3. Sinkronisasi Sidebar (Identik dengan Dashboard w-72)
    // Gunakan rute -view agar tidak mengembalikan JSON mentah
    const navToken = `?token=${token}`;
    $('#link-dashboard').attr('href', `/api/dashboard${navToken}`);
    $('#link-projects').attr('href', `/api/projects-view${navToken}`); 
    $('#link-profile').attr('href', `/api/profile-view${navToken}`);

    // 4. Ambil Profil & Tentukan Hak Akses
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.user || res.data;
        // Normalisasi role untuk pengecekan
        currentUserRole = (user.role?.name || user.role || 'employee').toLowerCase();
        
        $('#user-info-text').text(`Sesi: ${user.role?.name || user.role} | ${user.department?.name || user.department}`);
        
        // Hanya Admin/Manager yang bisa akses fitur CRUD
        if (currentUserRole !== 'employee') {
            $('#btn-create-project, #admin-actions, #btn-add-team-det').removeClass('hidden');
            loadUserList(); 
        }
        
        fetchProjects(1);
    }).fail(function(xhr) {
        if (xhr.status === 401) logout();
    });

    // 5. Event Handlers
    $('#form-project').submit(handleProjectSubmit);
    $('#form-add-member').submit(handleMemberSubmit);
    $('#search-input').on('keyup', function() { 
        fetchProjects(1, $(this).val()); 
    });
    $('#logout-btn').click(() => logout());
});

/**
 * AMBIL DATA PROJEK (Handle Laravel Pagination)
 */
function fetchProjects(page = 1, search = '') {
    const url = search 
        ? `${API_URL}/projects/search?search=${encodeURIComponent(search)}` 
        : `${API_URL}/projects?page=${page}`;

    $.get(url, function(res) {
        // Laravel paginate menyimpan array di 'data'
        const projects = res.data || []; 
        const $list = $('#project-list').empty();

        if (projects.length === 0) {
            $list.append('<tr><td colspan="3" class="p-10 text-center font-bold text-slate-400 uppercase tracking-widest">Tidak ada projek ditemukan</td></tr>');
            return;
        }

        projects.forEach(p => {
            $list.append(`
                <tr onclick="showProjectDetail(${p.id})" class="cursor-pointer hover:bg-blue-50/50 transition-all border-b border-slate-100 group">
                    <td class="p-8">
                        <p class="text-lg font-black text-slate-800 italic uppercase leading-none group-hover:text-blue-600">${p.name}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1 line-clamp-1">${p.description || 'Klik untuk rincian...'}</p>
                    </td>
                    <td class="p-8 text-center text-xs font-black text-slate-500 italic">
                        ${p.start_date || '-'} / ${p.end_date || '-'}
                    </td>
                    <td class="p-8 text-right">
                        <span class="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 uppercase transition-all tracking-widest">Detail →</span>
                    </td>
                </tr>
            `);
        });

        if (!search && res.links) renderPagination(res);
    });
}

/**
 * RENDER TOMBOL PAGINASI
 */
function renderPagination(res) {
    const $c = $('#pagination-container').empty();
    if (!res.links || res.links.length <= 3) return;
    
    res.links.forEach(link => {
        if (!link.url) return;
        const pageNum = new URL(link.url).searchParams.get('page');
        const label = link.label.replace('&laquo; Previous', '←').replace('Next &raquo;', '→');
        const activeClass = link.active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
            : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50';

        $c.append(`
            <button onclick="fetchProjects(${pageNum})" 
                class="h-10 w-10 rounded-xl font-black text-xs transition-all ${activeClass}">
                ${label}
            </button>
        `);
    });
}

/**
 * TAMPILKAN DETAIL PROJEK & TIM
 */
window.showProjectDetail = function(id) {
    selectedProjectId = id;
    $.get(`${API_URL}/projects/${id}`, function(res) {
        const p = res.data;
        $('#det-name').text(p.name);
        $('#det-desc').text(p.description || 'Tidak ada deskripsi projek.');
        $('#det-start').text(p.start_date || '-');
        $('#det-end').text(p.end_date || '-');
        
        // Redirect ke halaman tugas dengan filter projek
        $('#btn-task-det').attr('onclick', `window.location.href='/api/tasks-view?token=${token}&project_id=${id}'`);

        // Render Anggota Tim dari Pivot Table
        const $teamList = $('#det-team-list').empty();
        const members = p.members || [];
        
        if (members.length === 0) {
            $teamList.append('<p class="text-xs font-bold text-slate-400 uppercase italic">Belum ada anggota tim.</p>');
        } else {
            members.forEach(m => {
                $teamList.append(`
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-3">
                        <div class="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs uppercase">${m.name.charAt(0)}</div>
                        <div>
                            <p class="text-[11px] font-black uppercase text-slate-800">${m.name}</p>
                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">${m.pivot?.role_in_project || 'Anggota'}</p>
                        </div>
                    </div>`);
            });
        }

        if (currentUserRole !== 'employee') {
            $('#btn-edit-det').attr('onclick', `openEditModal(${id})`);
            $('#btn-delete-det').attr('onclick', `deleteProject(${id})`);
        }

        $('#project-list-view').addClass('hidden');
        $('#project-detail-view').removeClass('hidden');
        $('#header-title').text('Detail Projek');
    });
}

/**
 * CRUD & MANAJEMEN TIM
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
        success: function() { 
            $('#modal-project').addClass('hidden'); 
            Swal.fire('Berhasil!', 'Data projek telah disinkronkan.', 'success');
            id ? showProjectDetail(id) : fetchProjects(1); 
        },
        error: (xhr) => Swal.fire('Gagal', xhr.responseJSON?.message || 'Terjadi kesalahan sistem', 'error')
    });
}

function handleMemberSubmit(e) {
    e.preventDefault();
    $.post(`${API_URL}/projects/${selectedProjectId}/add-member`, { 
        user_id: $('#select-user').val(),
        role: $('#member-role').val()
    }).done(function() { 
        $('#modal-team').addClass('hidden'); 
        Swal.fire('Berhasil!', 'Anggota baru telah bergabung dalam tim.', 'success');
        showProjectDetail(selectedProjectId); 
    }).fail((xhr) => Swal.fire('Gagal', xhr.responseJSON?.message || 'Cek koneksi database', 'error'));
}

window.deleteProject = (id) => { 
    Swal.fire({
        title: 'Hapus Projek?',
        text: "Seluruh data tugas terkait juga akan terhapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Hapus Projek'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({ 
                url: `${API_URL}/projects/${id}`, 
                method: 'DELETE', 
                success: function() {
                    Swal.fire('Dihapus!', 'Projek berhasil dibersihkan dari sistem.', 'success');
                    backToList();
                    fetchProjects(1);
                }
            }); 
        }
    });
};

// Fungsi Utility
function backToList() { $('#project-detail-view').addClass('hidden'); $('#project-list-view').removeClass('hidden'); $('#header-title').text('Manajemen Projek'); }
function logout() { localStorage.clear(); window.location.href = '/api/login'; }
function openProjectModal() { $('#form-project')[0].reset(); $('#project-id').val(''); $('#modal-project-title').text('Buat Projek Baru'); $('#modal-project').removeClass('hidden'); }
function openTeamModal() { $('#modal-team').removeClass('hidden'); $('#member-role').val(''); }
function openEditModal(id) { 
    $.get(`${API_URL}/projects/${id}`, (res) => { 
        const p = res.data; 
        $('#project-id').val(p.id); 
        $('#project-name').val(p.name); 
        $('#project-desc-input').val(p.description); 
        $('#project-start-input').val(p.start_date); 
        $('#project-end-input').val(p.end_date); 
        $('#modal-project-title').text('Edit Data Projek'); 
        $('#modal-project').removeClass('hidden'); 
    }); 
}
function loadUserList() { 
    $.get(`${API_URL}/users`, (res) => {
        const $select = $('#select-user').empty().append('<option value="">Pilih Karyawan</option>');
        const list = Array.isArray(res) ? res : (res.data || []);
        list.forEach(u => $select.append(`<option value="${u.id}">${u.name}</option>`));
    }); 
}