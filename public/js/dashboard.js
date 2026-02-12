// Konfigurasi Dasar
const API_URL = 'http://localhost:8000/api'; 
const token = localStorage.getItem('api_token');

// 1. Inisialisasi & Cek Keamanan
if (!token) {
    window.location.href = 'login.html';
}

/**
 * Setup Global untuk jQuery AJAX
 * Ini menggantikan axios.defaults.headers.common
 */
$.ajaxSetup({
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});

/**
 * Mengambil data profil user
 */
function fetchProfile() {
    $.ajax({
        url: `${API_URL}/profile`,
        type: 'GET',
        success: function(res) {
            const user = res.data;
            $('#user-name').text(user.name);
            $('#user-dept').text(`${user.department} | ${user.role}`);
            
            // Mengisi inisial di navbar jika ada elemennya
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            $('#nav-initial').text(initials);
        },
        error: function(xhr) {
            handleError(xhr);
        }
    });
}

/**
 * Mengambil statistik dashboard
 */
function fetchStats() {
    $.get(`${API_URL}/dashboard/stats`, function(res) {
        $('#stat-projects').text(res.stats.project_count);
        $('#stat-tasks').text(res.stats.task_count_active);
    }).fail(function(err) {
        console.error("Gagal mengambil stats:", err);
    });
}

/**
 * Mengambil daftar proyek
 */
function fetchProjects() {
    $.get(`${API_URL}/projects`, function(res) {
        const projects = res.data;
        let html = '';

        projects.forEach(p => {
            html += `
                <div onclick="fetchTasks(${p.id}, '${p.name}')" 
                     class="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div class="flex justify-between items-center">
                        <p class="font-bold text-gray-700 group-hover:text-blue-600">${p.name}</p>
                        <span class="text-[10px] bg-gray-100 px-2 py-1 rounded capitalize">${p.status}</span>
                    </div>
                </div>`;
        });
        $('#project-list').html(html);
    }).fail(function(err) {
        console.error("Gagal mengambil proyek:", err);
    });
}

/**
 * Mengambil tugas berdasarkan proyek (Drill-down)
 */
function fetchTasks(projectId, projectName) {
    $('#active-project-name').text(projectName);
    const $tbody = $('#task-body');
    $tbody.html('<tr><td colspan="3" class="text-center py-10 text-blue-500">Memuat tugas...</td></tr>');
    
    $.get(`${API_URL}/projects/${projectId}/tasks`, function(res) {
        const tasks = res.tasks.data; // Response dari paginate(10)

        if (tasks.length === 0) {
            $tbody.html('<tr><td colspan="3" class="text-center py-10 text-gray-400">Belum ada tugas di proyek ini.</td></tr>');
            return;
        }

        let html = tasks.map(t => `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="py-4 font-medium text-gray-800">${t.title}</td>
                <td class="py-4 text-center text-sm text-gray-600">${t.due_date}</td>
                <td class="py-4 text-right">
                    <span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full 
                        ${t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
                        ${t.status}
                    </span>
                </td>
            </tr>
        `).join('');
        
        $tbody.html(html);
    }).fail(function(xhr) {
        const errorMsg = xhr.responseJSON?.message || 'Gagal memuat tugas';
        $tbody.html(`<tr><td colspan="3" class="text-center py-10 text-red-500 font-bold">${errorMsg}</td></tr>`);
    });
}

/**
 * Logout & Bersihkan Sesi
 */
function logout() {
    localStorage.removeItem('api_token');
    window.location.href = 'login.html';
}

function handleError(xhr) {
    if (xhr.status === 401) {
        logout();
    }
    console.error("API Error:", xhr);
}

/**
 * Jalankan Fungsi Saat Halaman Dimuat
 */
$(document).ready(function() {
    fetchProfile();
    fetchStats();
    fetchProjects();

    // Event Listener Logout
    $('#logout-btn').on('click', logout);
});