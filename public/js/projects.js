/**
 * /js/projects.js
 * Integrasi penuh dengan ProjectController, UserController, dan ProfileController
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// Proteksi Halaman
if (!token) window.location.href = 'login.html';

// Global Header untuk semua request
$.ajaxSetup({
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});

let currentRole = '';

$(document).ready(function() {
    initPage();

    // Event Pencarian Dinamis
    let searchTimer;
    $('#search-input').on('keyup', function() {
        clearTimeout(searchTimer);
        const query = $(this).val();
        searchTimer = setTimeout(() => {
            fetchProjects(1, query);
        }, 500);
    });

    // Event Submit Form Projek (Tambah/Edit)
    $('#form-project').submit(handleProjectSubmit);

    // Event Submit Tambah Anggota Tim
    $('#form-add-member').submit(handleAddMember);

    // Logout
    $('#logout-btn').click(() => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
});

/**
 * 1. INISIALISASI HALAMAN & CEK ROLE
 */
function initPage() {
    $.get(`${API_URL}/profile`)
        .done(function(res) {
            currentRole = res.data.role.toLowerCase();
            $('#role-text').text(`Akses: ${res.data.role} | ${res.data.department}`);

            // Jika bukan Employee, tampilkan fitur Admin
            if (currentRole !== 'employee') {
                $('#btn-create-project').removeClass('hidden');
                $('#admin-team-form').removeClass('hidden');
                loadUserDropdown(); //
            }
            
            fetchProjects(1);
        })
        .fail(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
}

/**
 * 2. AMBIL DATA PROJEK (INDEX & SEARCH)
 */
function fetchProjects(page = 1, search = '') {
    const endpoint = search 
        ? `${API_URL}/projects/search?search=${search}` 
        : `${API_URL}/projects?page=${page}`;

    $.get(endpoint, function(res) {
        const $list = $('#project-list');
        $list.empty();

        // Data dari Laravel paginate() berada di properti 'data'
        const projects = res.data || res;

        if (projects.length === 0) {
            $list.html('<tr><td colspan="3" class="p-10 text-center italic text-slate-400 font-bold">Data tidak ditemukan.</td></tr>');
            return;
        }

        projects.forEach(p => {
            const isAdmin = currentRole !== 'employee';
            const buttons = `
                <div class="flex justify-end items-center space-x-2">
                    <button onclick="viewTeam(${p.id})" class="bg-slate-800 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase">Tim</button>
                    <button onclick="window.location.href='tasks.html?project_id=${p.id}'" class="bg-blue-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200">Tugas</button>
                    ${isAdmin ? `
                        <button onclick="openEditModal(${p.id})" class="bg-amber-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-200">Edit</button>
                        <button onclick="deleteProject(${p.id})" class="bg-red-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-200">Hapus</button>
                    ` : ''}
                </div>
            `;

            $list.append(`
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-8">
                        <p class="text-lg font-black text-slate-800 italic uppercase tracking-tighter">${p.name}</p>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${p.description || 'N/A'}</p>
                    </td>
                    <td class="p-8 text-center">
                        <span class="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-md">${p.start_date}</span>
                        <span class="mx-2 text-slate-300">&rarr;</span>
                        <span class="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-md">${p.end_date}</span>
                    </td>
                    <td class="p-8 text-right">${buttons}</td>
                </tr>
            `);
        });

        if (!search && res.links) renderPagination(res);
        else $('#pagination-container').empty();
    });
}

/**
 * 3. MANAJEMEN CRUD PROJEK
 */
function openCreateModal() {
    $('#form-project')[0].reset();
    $('#project-id').val('');
    $('#modal-title').text('Buat Projek Baru');
    $('#modal-project').removeClass('hidden');
}

function openEditModal(id) {
    $.get(`${API_URL}/projects/${id}`, function(res) {
        const p = res.data;
        $('#project-id').val(p.id);
        $('#project-name').val(p.name);
        $('#project-desc').val(p.description);
        $('#project-start').val(p.start_date);
        $('#project-end').val(p.end_date);
        $('#modal-title').text('Edit Projek');
        $('#modal-project').removeClass('hidden');
    });
}

function handleProjectSubmit(e) {
    e.preventDefault();
    const id = $('#project-id').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
    
    const data = {
        name: $('#project-name').val(),
        description: $('#project-desc').val(),
        start_date: $('#project-start').val(),
        end_date: $('#project-end').val()
    };

    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function() {
            $('#modal-project').addClass('hidden');
            Swal.fire('Berhasil!', 'Data projek telah diperbarui.', 'success');
            fetchProjects(1);
        },
        error: function(xhr) {
            Swal.fire('Gagal', xhr.status === 422 ? Object.values(xhr.responseJSON)[0][0] : 'Error sistem', 'error');
        }
    });
}

function deleteProject(id) {
    Swal.fire({
        title: 'Hapus Projek?',
        text: "Seluruh tugas terkait akan ikut terhapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/projects/${id}`,
                method: 'DELETE',
                success: () => {
                    Swal.fire('Berhasil!', 'Projek telah dihapus.', 'success');
                    fetchProjects(1);
                }
            });
        }
    });
}

/**
 * 4. MANAJEMEN TIM (Relasi Pivot)
 */
function viewTeam(id) {
    $('#member-project-id').val(id);
    const $teamList = $('#team-list');
    $teamList.html('<p class="text-sm text-slate-400">Memuat tim...</p>');
    $('#modal-team').removeClass('hidden');

    $.get(`${API_URL}/projects/${id}`, function(res) {
        // Asumsi relasi 'members' dimuat di backend
        const members = res.data.members || [];
        $teamList.empty();

        if (members.length === 0) {
            $teamList.append('<p class="text-xs font-bold text-slate-400 italic uppercase">Belum ada anggota tim.</p>');
        } else {
            members.forEach(m => {
                $teamList.append(`
                    <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                            <p class="text-sm font-black text-slate-800 uppercase italic">${m.name}</p>
                            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">${m.pivot.role_in_project}</p>
                        </div>
                    </div>
                `);
            });
        }
    });
}

function loadUserDropdown() {
    $.get(`${API_URL}/users`, function(users) {
        users.forEach(u => {
            $('#select-user').append(`<option value="${u.id}">${u.name}</option>`);
        });
    });
}

function handleAddMember(e) {
    e.preventDefault();
    const projectId = $('#member-project-id').val();
    const payload = {
        user_id: $('#select-user').val(),
        role: $('#member-role').val()
    };

    $.post(`${API_URL}/projects/${projectId}/add-member`, payload)
        .done(() => {
            Swal.fire('Berhasil!', 'Anggota tim baru ditambahkan.', 'success');
            viewTeam(projectId); // Refresh list anggota
            $('#form-add-member')[0].reset();
        })
        .fail(xhr => Swal.fire('Gagal', xhr.responseJSON.message, 'error'));
}

/**
 * 5. UTILITY (Pagination & Modal)
 */
function renderPagination(res) {
    const $container = $('#pagination-container');
    $container.empty();
    res.links.forEach(link => {
        const isActive = link.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 hover:bg-slate-100';
        const pageNum = link.url ? new URL(link.url).searchParams.get('page') : null;
        
        if (pageNum) {
            $container.append(`
                <button onclick="fetchProjects(${pageNum})" class="h-10 w-10 rounded-xl font-black text-xs transition-all ${isActive}">
                    ${link.label.replace('&laquo; Previous', '<').replace('Next &raquo;', '>')}
                </button>
            `);
        }
    });
}

function closeProjectModal() {
    $('#modal-project').addClass('hidden');
}