/**
 * KONFIGURASI API & TOKEN
 */
const API_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('api_token');

if (!token) window.location.href = 'login.html';

$.ajaxSetup({
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
});

$(document).ready(function() {
    fetchProfile();
    loadProjects();

    // Event Logout
    $('#logout-btn').on('click', function() {
        localStorage.removeItem('api_token');
        window.location.href = 'login.html';
    });

    // Debounced Search
    let searchTimer;
    $('#search-input').on('input', function() {
        clearTimeout(searchTimer);
        const query = $(this).val();
        searchTimer = setTimeout(() => {
            query.length > 0 ? searchProjects(query) : loadProjects();
        }, 500);
    });
});

/**
 * FETCH PROFILE
 */
function fetchProfile() {
    $.get(`${API_URL}/profile`, function(res) {
        const user = res.data || res;
        $('#user-name').text(user.name);
        $('#user-dept').text(`${user.department} | ${user.role}`);
        $('#nav-initial').text(user.name.split(' ').map(n => n[0]).join('').toUpperCase());
    });
}

/**
 * LOAD SEMUA PROJEK (INDEX - PAGINATED)
 */
function loadProjects() {
    $.get(`${API_URL}/projects`, function(res) {
        // Karena paginate(10), data aslinya ada di res.data
        renderProjects(res.data || res);
    });
}

/**
 * SEARCH PROJEK
 */
function searchProjects(query) {
    // Sesuai $request->input('search') di Controller
    $.get(`${API_URL}/projects/search?search=${query}`, function(res) {
        // search() mengembalikan collection, data ada di res langsung
        renderProjects(res.data || res);
    });
}

/**
 * RENDER TAMPILAN GRID & TABLE
 */
function renderProjects(projects) {
    const $activeGrid = $('#active-projects');
    const $completedBody = $('#completed-projects-body');
    
    let activeHtml = '';
    let completedHtml = '';

    // Handle jika projects bukan array
    const dataArray = Array.isArray(projects) ? projects : [];

    const activeList = dataArray.filter(p => p.status !== 'done' && p.status !== 'completed');
    const completedList = dataArray.filter(p => p.status === 'done' || p.status === 'completed');

    // 1. Render Active Cards
    if (activeList.length === 0) {
        activeHtml = '<div class="col-span-full p-12 text-center text-slate-300 bg-white rounded-[2rem] border-2 border-dashed italic">Tidak ada projek berjalan.</div>';
    } else {
        activeList.forEach(p => {
            activeHtml += `
                <div onclick="window.location.href='tasks.html?project_id=${p.id}'" 
                     class="p-8 bg-white border border-slate-100 rounded-[2.5rem] cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all duration-500 group active:scale-95 shadow-sm">
                    <div class="h-14 w-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <h4 class="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">${p.name}</h4>
                    <p class="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 inline-block px-2 py-1 rounded-md">${p.status}</p>
                    <div class="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span>Mulai: ${p.start_date}</span>
                        <span class="text-blue-600">Buka Task &rarr;</span>
                    </div>
                </div>`;
        });
    }
    $activeGrid.html(activeHtml);

    // 2. Render Completed Table
    if (completedList.length === 0) {
        completedHtml = '<tr><td colspan="3" class="p-16 text-center text-slate-300 italic">Belum ada histori projek.</td></tr>';
    } else {
        completedList.forEach(p => {
            completedHtml += `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td class="p-8">
                        <p class="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">${p.name}</p>
                        <p class="text-[10px] text-emerald-500 font-black uppercase mt-1 tracking-widest">Status: Completed</p>
                    </td>
                    <td class="p-8 text-center text-sm text-slate-400 font-bold font-mono">
                        ${p.end_date}
                    </td>
                    <td class="p-8 text-right">
                        <button onclick="window.location.href='tasks.html?project_id=${p.id}'" 
                                class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            Buka Laporan
                        </button>
                    </td>
                </tr>`;
        });
    }
    $completedBody.html(completedHtml);
}