/**
 * ========================================
 * TASKS.JS - VIEW TUGAS LANGSUNG
 * ========================================
 */

const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

// Validasi Token
if (!token) window.location.href = 'login.html';

$.ajaxSetup({
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
});

$(document).ready(function() {
    loadUserProfile();

    // AMBIL PROJECT ID DARI URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project_id');

    // LOGIKA UTAMA:
    // Jika ada ID -> Muat Tugas
    // Jika TIDAK ada ID -> Balik ke halaman Projek (karena tidak ada menu pilih projek disini lagi)
    if (projectId) {
        // Ambil nama projek dulu untuk judul
        getProjectDetails(projectId);
        // Lalu ambil tugasnya
        loadProjectTasks(projectId);
    } else {
        console.warn('Tidak ada project_id, kembali ke projects.html');
        window.location.href = 'projects.html';
    }

    $('#logout-btn').click(() => {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });
});

/**
 * 1. AMBIL DETAIL PROJEK (Untuk Judul Header)
 */
function getProjectDetails(id) {
    $.get(`${API_URL}/projects/${id}`)
        .done(function(res) {
            const name = res.data ? res.data.name : (res.name || 'Detail Projek');
            $('#current-project-name').text(name);
        })
        .fail(function() {
            $('#current-project-name').text('Projek Tidak Ditemukan');
        });
}

/**
 * 2. AMBIL DAFTAR TUGAS
 */
function loadProjectTasks(projectId, page = 1) {
    const $tbody = $('#task-list-body');
    // Loading indicator halus (jika pindah page)
    if(page > 1) $tbody.css('opacity', '0.5');

    $.get(`${API_URL}/projects/${projectId}/tasks?page=${page}`)
        .done(function(res) {
            $tbody.empty().css('opacity', '1');
            
            // Handle Data Structure (Laravel Paginate)
            let tasks = [];
            let total = 0;

            if (res.tasks && res.tasks.data) {
                tasks = res.tasks.data;
                total = res.tasks.total;
            } else if (res.data) {
                tasks = res.data;
                total = tasks.length;
            }

            $('#task-count-badge').text(`${total} TUGAS DITEMUKAN`);

            if (tasks.length === 0) {
                $tbody.html('<tr><td colspan="3" class="p-24 text-center font-bold text-blue-300 italic uppercase text-xs">Belum ada tugas di projek ini</td></tr>');
            } else {
                tasks.forEach(task => {
                    const progress = getProgressFromStatus(task.status);
                    const statusClass = getStatusColor(task.status);
                    
                    $tbody.append(`
                        <tr class="hover:bg-blue-50/40 transition-colors group">
                            <td class="p-10">
                                <p class="font-black text-xl text-blue-900 group-hover:text-blue-600 transition-colors">${task.title || task.name}</p>
                                <p class="text-[11px] text-blue-400 font-bold uppercase mt-2 tracking-widest">
                                    Prioritas: <span class="text-blue-600">${task.priority || 'Normal'}</span>
                                </p>
                            </td>
                            <td class="p-10 text-center font-bold text-blue-500 font-mono text-sm">
                                ${formatDate(task.due_date)}
                            </td>
                            <td class="p-10 text-right">
                                <div class="flex flex-col items-end">
                                    <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase mb-2 ${statusClass}">
                                        ${task.status}
                                    </span>
                                    <div class="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-600 rounded-full" style="width: ${progress}%"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `);
                });
            }

            // Render Pagination (Jika ada object tasks)
            if (res.tasks) renderPagination(res.tasks, projectId);
        })
        .fail(function(xhr) {
            $tbody.html(`
                <tr>
                    <td colspan="3" class="p-10 text-center text-red-400 font-bold">
                        Gagal memuat tugas.<br>
                        <span class="text-xs font-normal text-slate-400">Error: ${xhr.status}</span>
                    </td>
                </tr>
            `);
        });
}

/**
 * PAGINASI (Tombol Halaman)
 */
function renderPagination(meta, projectId) {
    const $container = $('#project-pagination');
    if (!meta || !meta.last_page || meta.last_page <= 1) {
        $container.empty();
        return;
    }

    let html = '';
    for (let i = 1; i <= meta.last_page; i++) {
        const active = i === meta.current_page ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-400 border border-blue-100 hover:bg-blue-50';
        html += `<button onclick="loadProjectTasks(${projectId}, ${i})" class="h-10 w-10 rounded-xl font-bold text-sm transition-all ${active}">${i}</button>`;
    }
    $container.html(html);
}

// --- UTILITIES ---

function loadUserProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data || res;
        $('#nav-user-name').text(user.name);
        $('#nav-user-dept').text(`${user.department || 'Staff'} | ${user.role || 'Employee'}`);
        $('#nav-initial').text(user.name.substring(0, 2).toUpperCase());
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try { return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); } 
    catch (e) { return dateStr; }
}

function getProgressFromStatus(status) {
    if (!status) return 0;
    const map = { 'todo': 0, 'doing': 50, 'review': 75, 'done': 100 };
    return map[status.toLowerCase()] || 0;
}

function getStatusColor(status) {
    const map = { 
        'todo': 'bg-slate-100 text-slate-500', 
        'doing': 'bg-blue-100 text-blue-600', 
        'review': 'bg-yellow-100 text-yellow-600', 
        'done': 'bg-emerald-100 text-emerald-600' 
    };
    return map[status ? status.toLowerCase() : ''] || 'bg-slate-100';
}