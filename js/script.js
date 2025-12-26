// ==========================================
// 1. DATA LAPAK (KOORDINAT MANUAL BERJEJER)
// ==========================================

// Daftar makanan random untuk simulasi
const randomMenu = ["Nasi Goreng", "Sate Padang", "Es Teh Solo", "Bakso Malang", "Mie Ayam", "Gado-Gado", "Soto Betawi"];

function generateData(shiftName) {
    let data = [];
    
    // Koordinat berjejer memanjang (Sesuai kode asli kamu)
    const lokasiLapak = [
        [-6.1744, 106.82867], [-6.1745, 106.8287], [-6.1746, 106.8287], [-6.1747, 106.8287],
        [-6.1748, 106.8287], [-6.1749, 106.8287], [-6.1750, 106.8287], [-6.1751, 106.8287],
        [-6.1752, 106.8287], [-6.1753, 106.8287], [-6.1754, 106.8287], [-6.1755, 106.8287],
        [-6.1756, 106.8287], [-6.1757, 106.8287], [-6.1758, 106.8287], [-6.1759, 106.8287],
        [-6.1760, 106.8287], [-6.1761, 106.8287], [-6.1762, 106.8287], [-6.1763, 106.8287],
        [-6.1764, 106.82866], [-6.1765, 106.82860], [-6.1767, 106.82845]
    ];

    lokasiLapak.forEach((kord, index) => {
        let status = "tersedia";
        let pedagang = "-";
        let jualan = "-";

        // Simulasi Awal: Pagi ganjil terisi, Malam genap terisi
        if (shiftName === 'pagi' && index % 2 === 0) {
            status = "terisi"; 
            pedagang = "Bpk. Budi";
            jualan = "Bubur Ayam";
        } else if (shiftName === 'malam' && index % 2 !== 0) {
            status = "terisi"; 
            pedagang = "Ibu Siti";
            jualan = "Sate Madura";
        }

        data.push({
            id: `${shiftName}-${index}`,
            kode: `A-${index + 1}`,
            status: status,
            pedagang: pedagang,
            jualan: jualan,
            lat: kord[0],
            lng: kord[1]
        });
    });
    return data;
}

const dataPagi = generateData('pagi');
const dataMalam = generateData('malam');

// --- KIRIM TOTAL KAPASITAS KE ADMIN ---
const totalKapasitas = dataPagi.length + dataMalam.length;
localStorage.setItem('totalKapasitas', totalKapasitas);

// STATE
let currentData = dataPagi;
let currentShift = 'pagi';
let selectedLapak = null;

// ==========================================
// 2. LOGIKA RENDER (GRID & PETA)
// ==========================================
const gridContainer = document.getElementById('gridDisplay');

// Inisialisasi Map
const map = L.map('map').setView([-6.1754, 106.8287], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let markersLayer = L.layerGroup().addTo(map);

function renderApp() {
    gridContainer.innerHTML = "";
    markersLayer.clearLayers();

    currentData.forEach(item => {
        // --- A. RENDER GRID KARTU ---
        const card = document.createElement('div');
        card.className = `lapak-card ${item.status}`;
        
        card.innerHTML = `
            <div style="font-size:24px;">⛺</div>
            <b>${item.kode}</b><br>
            <span style="font-size:11px; color:#555;">${item.status.toUpperCase()}</span>
        `;
        
        if (item.status === 'tersedia') {
            card.onclick = () => openModal(item);
        } else {
            card.onclick = () => alert(`Info Lapak ${item.kode}\nPedagang: ${item.pedagang}\nJualan: ${item.jualan}`);
        }
        gridContainer.appendChild(card);


        // --- B. RENDER MAP MARKER ---
        let color = item.status === 'tersedia' ? '#10B981' : '#EF4444'; 
        
        const circle = L.circleMarker([item.lat, item.lng], {
            color: color, 
            fillColor: color, 
            fillOpacity: 0.9, 
            radius: 10
        }).addTo(markersLayer);

        // -- LOGIKA POPUP INFORMASI --
        let popupContent = "";

        if (item.status === 'tersedia') {
            popupContent = `
                <div style="text-align:center">
                    <b style="font-size:14px; color:#10B981">${item.kode}</b><br>
                    <span>Lapak Kosong</span><br>
                    <button onclick="document.getElementById('btn-trigger-modal').click()" style="margin-top:5px; font-size:10px; cursor:pointer;">Klik Sewa</button>
                </div>
            `;
        } else {
            popupContent = `
                <div style="min-width:150px; font-family:sans-serif;">
                    <div style="background:#EF4444; color:white; padding:5px; border-radius:4px 4px 0 0; text-align:center; font-weight:bold;">
                        ${item.kode} (Terisi)
                    </div>
                    <div style="padding:10px; border:1px solid #ccc; border-top:none; border-radius:0 0 4px 4px; background:#fff;">
                        <div style="margin-bottom:5px;">
                            <span style="color:#888; font-size:11px;">👤 Nama Penjual:</span><br>
                            <b>${item.pedagang}</b>
                        </div>
                        <div>
                            <span style="color:#888; font-size:11px;">🍜 Menjual:</span><br>
                            <b style="color:#d97706;">${item.jualan}</b>
                        </div>
                    </div>
                </div>
            `;
        }

        circle.bindPopup(popupContent);
        
        circle.on('click', () => { 
            if(item.status === 'tersedia') {
                openModal(item); 
                circle.closePopup(); 
            }
        });
    });
}

function gantiShift(shift) {
    currentShift = shift;
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentData = shift === 'pagi' ? dataPagi : dataMalam;
    document.getElementById('info-shift').innerHTML = `Menampilkan data untuk <b>Shift ${shift.charAt(0).toUpperCase() + shift.slice(1)}</b>`;
    renderApp();
}

// ==========================================
// 3. LOGIKA MODAL (FORM BOOKING - DIPERBARUI)
// ==========================================
const modal = document.getElementById('bookingModal');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

function openModal(item) {
    selectedLapak = item;
    modal.style.display = 'flex'; 
    step1.style.display = 'block';
    step2.style.display = 'none';
    
    document.getElementById('modalTitle').innerText = `Sewa Lapak: ${item.kode}`;
    
    let jamOperasional = currentShift === 'pagi' ? "06.00 - 15.00 WIB" : "16.00 - 23.00 WIB";
    const bulanIni = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    document.getElementById('modalInfo').innerHTML = `
        <div style="display:grid; grid-template-columns: 100px 1fr; gap:5px; font-size:13px;">
            <div style="color:#666;">📅 Periode:</div> <b>${bulanIni}</b>
            <div style="color:#666;">⏰ Shift:</div> <b>${currentShift.toUpperCase()}</b>
            <div style="color:#666;">⏳ Jam Ops:</div> <b style="color:#d97706;">${jamOperasional}</b>
            <div style="color:#666;">💰 Biaya:</div> <b style="color:green;">Rp 50.000 / 28 Hari</b>
        </div>
        <div style="margin-top:10px; font-size:11px; color:#777; font-style:italic;">
            *Lokasi dikunci via GPS
        </div>
    `;

    // Reset Semua Input Form (Termasuk HP dan Email)
    document.getElementById('namaInput').value = "";
    document.getElementById('daganganInput').value = "";
    document.getElementById('nomorInput').value = "";
    document.getElementById('emailInput').value = "";
}

function closeModal() { modal.style.display = 'none'; }

function keStepPembayaran() {
    // Ambil nilai dari 4 input
    const nama = document.getElementById('namaInput').value;
    const jualan = document.getElementById('daganganInput').value;
    const nomor = document.getElementById('nomorInput').value;
    const email = document.getElementById('emailInput').value;

    // Validasi: Semua harus diisi
    if(!nama || !jualan || !nomor || !email) { 
        alert("Harap lengkapi semua data:\n- Nama\n- Dagangan\n- No WhatsApp\n- Email"); 
        return; 
    }
    
    step1.style.display = 'none';
    step2.style.display = 'block';
}

function kembaliKeForm() {
    step1.style.display = 'block';
    step2.style.display = 'none';
}

function konfirmasiBayar() {
    // Ambil Data Lagi untuk Disimpan
    const nama = document.getElementById('namaInput').value;
    const jualan = document.getElementById('daganganInput').value;
    const nomor = document.getElementById('nomorInput').value;
    const email = document.getElementById('emailInput').value;

    // Simpan ke LocalStorage (Termasuk Email dan No HP)
    let newData = {
        shift: currentShift, 
        kode: selectedLapak.kode, 
        nama: nama, 
        jualan: jualan,
        nomor: nomor, // Data Baru
        email: email, // Data Baru
        waktu: new Date().toLocaleTimeString(),
        tipe: 'Bulanan' 
    };
    
    let riwayat = JSON.parse(localStorage.getItem('databaseLapak')) || [];
    riwayat.push(newData);
    localStorage.setItem('databaseLapak', JSON.stringify(riwayat));

    // Update Data di Tampilan
    selectedLapak.status = 'terisi';
    selectedLapak.pedagang = nama;
    selectedLapak.jualan = jualan;

    // Notifikasi dengan Email
    alert(`✅ PEMBAYARAN BERHASIL!\n\nQR Code Izin Usaha telah dikirim ke email:\n📧 ${email}\n\nKode Lapak: ${selectedLapak.kode}`);
    closeModal();
    renderApp();
}

// ==========================================
// 4. SIMULASI OTOMATIS
// ==========================================
setInterval(function() {
    currentData.forEach(item => {
        if (Math.random() > 0.95) { // 5% Chance berubah status (Saya turunkan jadi 5% biar ga terlalu cepat ganti)
            if (item.status === 'tersedia') {
                item.status = 'terisi'; 
                item.pedagang = 'Pedagang (Auto)';
                item.jualan = randomMenu[Math.floor(Math.random() * randomMenu.length)];
            } else {
                item.status = 'tersedia'; 
                item.pedagang = '-';
                item.jualan = '-';
            }
        }
    });
    renderApp();
}, 10000); 

window.onclick = function(event) {
    if (event.target == modal) closeModal();
}

// Jalankan App
renderApp();