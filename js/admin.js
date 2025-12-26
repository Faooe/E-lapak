// ==========================================
// 1. LOGIN SYSTEM (DENGAN AUTO REFRESH)
// ==========================================
function loginPetugas() {
    const nip = document.getElementById('nip').value;
    const pass = document.getElementById('pass').value;

    if(nip === 'admin' && pass === '123') {
        // Animasi transisi halus
        const loginSec = document.getElementById('login-section');
        loginSec.style.opacity = '0';
        loginSec.style.transition = '0.5s';
        
        setTimeout(() => {
            loginSec.style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'flex';
            
            // 1. Load Data Pertama Kali
            updateDashboard();

            // 2. AKTIFKAN REALTIME: Update otomatis setiap 2 detik
            setInterval(updateDashboard, 2000); 

        }, 500);

    } else {
        alert("⚠️ Login Gagal!\nNIP: admin\nPass: 123");
    }
}

// Fungsi Wrapper untuk update semua (Tabel + Statistik)
function updateDashboard() {
    renderTableAdmin();
    hitungStatistik();
}

function logout() {
    if(confirm("Apakah anda yakin ingin keluar?")) {
        location.reload();
    }
}

// ==========================================
// 2. RENDER TABEL (MENCEGAH KEDIP)
// ==========================================
function renderTableAdmin() {
    const filterShift = document.getElementById('filterShiftAdmin').value;
    const tbody = document.getElementById('tabelData');
    
    // Ambil Data dari LocalStorage
    let dataBooking = JSON.parse(localStorage.getItem('databaseLapak')) || [];
    
    // Filter Data
    let filteredData = dataBooking.filter(item => item.shift === filterShift);

    // Siapkan HTML sementara
    let htmlContent = "";

    if (filteredData.length === 0) {
        htmlContent = `
            <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">
                    <i class="fas fa-folder-open" style="font-size:24px; margin-bottom:10px; display:block;"></i>
                    Belum ada data booking untuk shift ini.
                </td>
            </tr>`;
    } else {
        filteredData.forEach(item => {
            htmlContent += `
                <tr>
                    <td><span style="background:#f1f5f9; padding:5px 10px; border-radius:5px; font-weight:bold; color:#334155;">${item.kode}</span></td>
                    <td style="font-weight:600;">${item.nama}</td>
                    <td>${item.jualan}</td>
                    <td>
                        <span class="badge-lunas">
                            <i class="fas fa-check"></i> LUNAS (QRIS)
                        </span>
                    </td>
                    <td style="color:#64748b; font-size:13px;">${item.waktu}</td>
                </tr>
            `;
        });
    }

    // Hanya update HTML jika ada perubahan data (biar tabel tidak kedip-kedip saat realtime)
    if (tbody.innerHTML !== htmlContent) {
        tbody.innerHTML = htmlContent;
    }
}

// ==========================================
// 3. HITUNG STATISTIK (SUDAH DINAMIS & BULANAN)
// ==========================================
function hitungStatistik() {
    let dataBooking = JSON.parse(localStorage.getItem('databaseLapak')) || [];
    
    // 1. Hitung Total Booking (Realtime)
    let totalBooking = dataBooking.length;
    
    // 2. Hitung Pendapatan (REVISI: TARIF BULANAN 50.000)
    let pendapatan = totalBooking * 50000; 
    
    // 3. Hitung Sisa Lapak (DINAMIS)
    // Ambil total kapasitas yang dikirim dari script.js
    let totalKapasitas = parseInt(localStorage.getItem('totalKapasitas')) || 46;
    
    let sisa = totalKapasitas - totalBooking;

    // Pastikan sisa tidak minus (safety check)
    if (sisa < 0) sisa = 0;

    // Update Angka di Dashboard
    document.getElementById('totalBooking').innerText = totalBooking + " Unit";
    document.getElementById('totalPendapatan').innerText = "Rp " + pendapatan.toLocaleString('id-ID');
    document.getElementById('sisaLapak').innerText = sisa + " Unit";
}