// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, onValue, set, remove, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// --- KONFIGURASI FIREBASE ---
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCulnRxNhJ1fpAvPZwVWIP8dN4lE9IjFQM",
    authDomain: "kleonweb-d7eba.firebaseapp.com",
    databaseURL: "https://kleonweb-d7eba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kleonweb-d7eba",
    storageBucket: "kleonweb-d7eba.firebasestorage.app",
    messagingSenderId: "569319427443",
    appId: "1:569319427443:web:5de716ffca7b291af5c906"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- Elemen HTML dan Pengaturan Tampilan ---
const pengeluaranContainer = document.getElementById('pengeluaran-container');
const statusContainer = document.getElementById('status-container');
const pengeluaranBtn = document.getElementById('show-pengeluaran');
const statusBtn = document.getElementById('show-status');

// Atur tampilan awal
pengeluaranContainer.classList.remove('hidden');
pengeluaranBtn.classList.add('bg-blue-600', 'text-white');
statusBtn.classList.add('bg-gray-200', 'text-gray-700');

// Logika pergantian halaman
pengeluaranBtn.addEventListener('click', () => {
    pengeluaranContainer.classList.remove('hidden');
    statusContainer.classList.add('hidden');
    pengeluaranBtn.classList.remove('bg-gray-200', 'text-gray-700');
    pengeluaranBtn.classList.add('bg-blue-600', 'text-white');
    statusBtn.classList.remove('bg-blue-600', 'text-white');
    statusBtn.classList.add('bg-gray-200', 'text-gray-700');
});

statusBtn.addEventListener('click', () => {
    statusContainer.classList.remove('hidden');
    pengeluaranContainer.classList.add('hidden');
    statusBtn.classList.remove('bg-gray-200', 'text-gray-700');
    statusBtn.classList.add('bg-blue-600', 'text-white');
    pengeluaranBtn.classList.remove('bg-blue-600', 'text-white');
    pengeluaranBtn.classList.add('bg-gray-200', 'text-gray-700');
});

// --- Logika Pengeluaran ---
const pengeluaranForm = document.getElementById('pengeluaran-form');
const pengeluaranList = document.getElementById('pengeluaran-list');
const expensesRef = ref(database, 'pengeluaran');

// Menambah data ke database saat formulir di-submit
if (pengeluaranForm) {
    pengeluaranForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        const anggota = document.getElementById('anggota').value;
        const kategori = document.getElementById('kategori').value;
        const nominal = parseInt(document.getElementById('nominal').value);
        const deskripsi = document.getElementById('deskripsi').value;

        console.log("Submitting new expense:", { anggota, kategori, nominal, deskripsi });

        const newExpense = {
            tanggal: today,
            anggota: anggota,
            kategori: kategori,
            nominal: nominal,
            deskripsi: deskripsi,
        };
        push(expensesRef, newExpense)
            .then(() => {
                pengeluaranForm.reset();
                console.log("Pengeluaran berhasil disimpan!");
            })
            .catch((error) => {
                console.error("Gagal menyimpan pengeluaran: ", error);
                alert("Gagal menyimpan pengeluaran. Periksa koneksi atau konfigurasi Firebase.");
            });
    });
}

// Membaca data real-time dari database
onValue(expensesRef, (snapshot) => {
    const expenses = snapshot.val();
    pengeluaranList.innerHTML = '';
    if (expenses) {
        const sortedExpenses = Object.entries(expenses).sort(([, a], [, b]) => {
            return new Date(b.tanggal) - new Date(a.tanggal);
        });

        sortedExpenses.forEach(([id, expense]) => {
            const row = document.createElement('tr');
            row.className = 'bg-white hover:bg-gray-50 transition duration-300';
            row.innerHTML = `
                <td class="px-2 py-2 whitespace-nowrap text-xs text-gray-500">${expense.tanggal}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-gray-500">${expense.anggota}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-gray-500">${expense.kategori}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs font-normal text-gray-900">Rp ${expense.nominal.toLocaleString('id-ID')}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-gray-500">${expense.deskripsi}</td>
                <td class="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <button class="text-red-600 hover:text-red-900" onclick="deleteExpense('${id}')">Hapus</button>
                </td>
            `;
            pengeluaranList.appendChild(row);
        });
    }
});

// Fungsi untuk menghapus data
window.deleteExpense = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
        remove(ref(database, `pengeluaran/${id}`));
    }
};

// --- Logika Status Anggota ---
const statusGrid = document.getElementById('status-grid');
const statusRef = ref(database, 'statusAnggota');
const anggotaKeluarga = ['Ayah', 'Ibu', 'Anak'];

// Membaca data real-time dari database untuk status
onValue(statusRef, (snapshot) => {
    const statusData = snapshot.val();
    if (statusGrid) {
        statusGrid.innerHTML = '';
        anggotaKeluarga.forEach(anggota => {
            const status = statusData && statusData[anggota] && statusData[anggota].status ? statusData[anggota].status : 'Di Dalam';
            const reason = statusData && statusData[anggota] && statusData[anggota].reason ? statusData[anggota].reason : '';

            const card = document.createElement('div');
            card.className = `status-card bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-4 transform transition-all duration-300 ${status === 'Di Dalam' ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500'}`;

            card.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span class="text-4xl">${status === 'Di Dalam' ? '🏠' : '🚗'}</span>
                    <p class="text-xl font-bold text-gray-800">${anggota}</p>
                </div>
                <p class="text-lg text-gray-600">${status === 'Di Dalam' ? 'Di Dalam Rumah' : `Sedang di Luar`}</p>
                ${reason ? `<p class="text-sm text-gray-500 italic">(${reason})</p>` : ''}
                <button onclick="toggleStatus('${anggota}')" class="w-full py-2 rounded-md font-semibold transition-colors duration-300 ${status === 'Di Dalam' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}">
                    ${status === 'Di Dalam' ? 'Keluar Rumah' : 'Masuk Rumah'}
                </button>
            `;
            statusGrid.appendChild(card);
        });
    }
});

// Fungsi untuk mengubah status dengan alasan
window.toggleStatus = async (anggota) => {
    const anggotaRef = ref(database, `statusAnggota/${anggota}`);
    try {
        const snapshot = await get(anggotaRef);
        const currentData = snapshot.val();
        const currentStatus = currentData && currentData.status ? currentData.status : 'Di Dalam';

        let newStatus;
        let newReason = '';

        if (currentStatus === 'Di Dalam') {
            const reasonInput = prompt('Anda keluar rumah. Apa alasannya?');
            if (reasonInput === null || reasonInput.trim() === '') {
                alert('Alasan tidak boleh kosong!');
                return;
            } else {
                newStatus = 'Di Luar';
                newReason = reasonInput.trim();
            }
        } else {
            newStatus = 'Di Dalam';
            newReason = '';
        }

        await set(anggotaRef, {
            status: newStatus,
            reason: newReason
        });
        console.log("Status berhasil diperbarui!");
    } catch (error) {
        console.error("Gagal memperbarui status: ", error);
        alert("Gagal memperbarui status. Periksa koneksi atau konfigurasi Firebase.");
    }
};