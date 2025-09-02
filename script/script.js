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
const pemasukanContainer = document.getElementById('pemasukan-container');
const totalContainer = document.getElementById('total-container');
const statusContainer = document.getElementById('status-container');

const pengeluaranBtn = document.getElementById('show-pengeluaran');
const pemasukanBtn = document.getElementById('show-pemasukan');
const totalBtn = document.getElementById('show-total');
const statusBtn = document.getElementById('show-status');

const desktopPengeluaranList = document.getElementById('pengeluaran-list-desktop');
const mobilePengeluaranList = document.getElementById('pengeluaran-list-mobile');
const desktopPemasukanList = document.getElementById('pemasukan-list-desktop');
const mobilePemasukanList = document.getElementById('pemasukan-list-mobile');
const totalList = document.getElementById('total-list');

const allContainers = [pengeluaranContainer, pemasukanContainer, totalContainer, statusContainer];
const allButtons = [pengeluaranBtn, pemasukanBtn, totalBtn, statusBtn];

// Helper function for button styling
const setActiveButton = (activeButton) => {
    allButtons.forEach(btn => btn.classList.remove('bottom-nav-active'));
    activeButton.classList.add('bottom-nav-active');
};

const showContainer = (containerToShow) => {
    allContainers.forEach(container => container.classList.add('hidden'));
    containerToShow.classList.remove('hidden');
};

// Atur tampilan awal
showContainer(pengeluaranContainer);
setActiveButton(pengeluaranBtn);

// Logika pergantian halaman
pengeluaranBtn.addEventListener('click', () => {
    showContainer(pengeluaranContainer);
    setActiveButton(pengeluaranBtn);
});

pemasukanBtn.addEventListener('click', () => {
    showContainer(pemasukanContainer);
    setActiveButton(pemasukanBtn);
});

totalBtn.addEventListener('click', () => {
    showContainer(totalContainer);
    setActiveButton(totalBtn);
});

statusBtn.addEventListener('click', () => {
    showContainer(statusContainer);
    setActiveButton(statusBtn);
});


// --- Logika Pengeluaran ---
const pengeluaranForm = document.getElementById('pengeluaran-form');
const expensesRef = ref(database, 'pengeluaran');

// Menambah data pengeluaran ke database
if (pengeluaranForm) {
    pengeluaranForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        const anggota = document.getElementById('anggota').value;
        const kategori = document.getElementById('kategori').value;
        const nominal = parseInt(document.getElementById('nominal').value);
        const deskripsi = document.getElementById('deskripsi').value;

        const newExpense = { tanggal: today, anggota, kategori, nominal, deskripsi };
        push(expensesRef, newExpense)
            .then(() => pengeluaranForm.reset())
            .catch((error) => console.error("Gagal menyimpan pengeluaran: ", error));
    });
}

// Membaca data pengeluaran real-time
onValue(expensesRef, (snapshot) => {
    const expenses = snapshot.val();
    desktopPengeluaranList.innerHTML = '';
    mobilePengeluaranList.innerHTML = '';
    
    if (expenses) {
        const sortedExpenses = Object.entries(expenses).sort(([, a], [, b]) => new Date(b.tanggal) - new Date(a.tanggal));

        sortedExpenses.forEach(([id, expense]) => {
            const row = document.createElement('tr');
            row.className = 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-input)] transition duration-300';
            row.innerHTML = `
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${expense.tanggal}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${expense.anggota}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${expense.kategori}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs font-normal text-[var(--color-text-primary)]">Rp ${expense.nominal.toLocaleString('id-ID')}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${expense.deskripsi}</td>
                <td class="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <button class="text-red-600 hover:text-red-900" onclick="deleteItem('${id}', 'pengeluaran')">Hapus</button>
                </td>
            `;
            desktopPengeluaranList.appendChild(row);

            const card = document.createElement('div');
            card.className = 'responsive-table-row';
            card.innerHTML = `
                <div class="responsive-table-cell" data-label="Tanggal"><span class="text-sm font-bold">${expense.tanggal}</span></div>
                <div class="responsive-table-cell" data-label="Anggota"><span class="text-sm text-[var(--color-text-secondary)]">${expense.anggota}</span></div>
                <div class="responsive-table-cell" data-label="Kategori"><span class="text-sm text-[var(--color-text-secondary)]">${expense.kategori}</span></div>
                <div class="responsive-table-cell" data-label="Nominal"><span class="text-sm font-bold text-[var(--color-text-primary)]">Rp ${expense.nominal.toLocaleString('id-ID')}</span></div>
                <div class="responsive-table-cell" data-label="Deskripsi"><span class="text-sm text-[var(--color-text-secondary)]">${expense.deskripsi}</span></div>
                <div class="responsive-table-cell" data-label="Aksi"><button class="text-red-600 hover:text-red-900 text-sm font-medium" onclick="deleteItem('${id}', 'pengeluaran')">Hapus</button></div>
            `;
            mobilePengeluaranList.appendChild(card);
        });
    }
});


// --- Logika Pemasukan ---
const pemasukanForm = document.getElementById('pemasukan-form');
const incomeRef = ref(database, 'pemasukan');
const anggotaPemasukanSelect = document.getElementById('anggota-pemasukan');

// Menambah data pemasukan ke database
if (pemasukanForm) {
    pemasukanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        const anggota = anggotaPemasukanSelect.value;
        const sumber = document.getElementById('sumber-pemasukan').value;
        const nominal = parseInt(document.getElementById('nominal-pemasukan').value);

        const newIncome = { tanggal: today, anggota, sumber, nominal };
        push(incomeRef, newIncome)
            .then(() => pemasukanForm.reset())
            .catch((error) => console.error("Gagal menyimpan pemasukan: ", error));
    });
}

// Membaca data pemasukan real-time
onValue(incomeRef, (snapshot) => {
    const incomes = snapshot.val();
    desktopPemasukanList.innerHTML = '';
    mobilePemasukanList.innerHTML = '';
    
    if (incomes) {
        const sortedIncomes = Object.entries(incomes).sort(([, a], [, b]) => new Date(b.tanggal) - new Date(a.tanggal));

        sortedIncomes.forEach(([id, income]) => {
            const row = document.createElement('tr');
            row.className = 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-input)] transition duration-300';
            row.innerHTML = `
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${income.tanggal}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${income.anggota}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">${income.sumber}</td>
                <td class="px-2 py-2 whitespace-nowrap text-xs font-normal text-[var(--color-text-primary)]">Rp ${income.nominal.toLocaleString('id-ID')}</td>
                <td class="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <button class="text-red-600 hover:text-red-900" onclick="deleteItem('${id}', 'pemasukan')">Hapus</button>
                </td>
            `;
            desktopPemasukanList.appendChild(row);

            const card = document.createElement('div');
            card.className = 'responsive-table-row';
            card.innerHTML = `
                <div class="responsive-table-cell" data-label="Tanggal"><span class="text-sm font-bold">${income.tanggal}</span></div>
                <div class="responsive-table-cell" data-label="Anggota"><span class="text-sm text-[var(--color-text-secondary)]">${income.anggota}</span></div>
                <div class="responsive-table-cell" data-label="Sumber"><span class="text-sm text-[var(--color-text-secondary)]">${income.sumber}</span></div>
                <div class="responsive-table-cell" data-label="Nominal"><span class="text-sm font-bold text-[var(--color-text-primary)]">Rp ${income.nominal.toLocaleString('id-ID')}</span></div>
                <div class="responsive-table-cell" data-label="Aksi"><button class="text-red-600 hover:text-red-900 text-sm font-medium" onclick="deleteItem('${id}', 'pemasukan')">Hapus</button></div>
            `;
            mobilePemasukanList.appendChild(card);
        });
    }
});

// Fungsi untuk menghapus data
window.deleteItem = (id, type) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${type === 'pengeluaran' ? 'pengeluaran' : 'pemasukan'} ini?`)) {
        remove(ref(database, `${type}/${id}`));
    }
};

// --- Logika Total Bulanan ---
const updateMonthlyTotals = (expenses, incomes) => {
    const monthlyData = {};

    // Proses pengeluaran
    if (expenses) {
        Object.values(expenses).forEach(expense => {
            const month = expense.tanggal.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { expenses: 0, incomes: 0 };
            }
            monthlyData[month].expenses += expense.nominal;
        });
    }

    // Proses pemasukan
    if (incomes) {
        Object.values(incomes).forEach(income => {
            const month = income.tanggal.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { expenses: 0, incomes: 0 };
            }
            monthlyData[month].incomes += income.nominal;
        });
    }

    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    totalList.innerHTML = '';

    if (sortedMonths.length > 0) {
        sortedMonths.forEach(month => {
            const data = monthlyData[month];
            const balance = data.incomes - data.expenses;
            const balanceClass = balance >= 0 ? 'total-positive' : 'total-negative';

            const card = document.createElement('div');
            card.className = 'bg-[var(--color-bg-input)] rounded-xl p-4 shadow-md';
            card.innerHTML = `
                <h4 class="text-lg font-bold text-[var(--color-text-primary)]">${month}</h4>
                <p class="text-[var(--color-text-secondary)]">Pengeluaran: <span class="text-[var(--color-status-out)] font-bold">Rp ${data.expenses.toLocaleString('id-ID')}</span></p>
                <p class="text-[var(--color-text-secondary)]">Pemasukan: <span class="text-[var(--color-status-in)] font-bold">Rp ${data.incomes.toLocaleString('id-ID')}</span></p>
                <p class="mt-2 text-md font-bold">
                    Saldo: <span class="${balanceClass}">Rp ${balance.toLocaleString('id-ID')}</span>
                </p>
            `;
            totalList.appendChild(card);
        });
    } else {
        totalList.innerHTML = `<p class="text-center text-[var(--color-text-secondary)]">Belum ada data untuk ditampilkan.</p>`;
    }
};

// Gabungkan listener untuk pengeluaran dan pemasukan
onValue(expensesRef, (expensesSnapshot) => {
    onValue(incomeRef, (incomesSnapshot) => {
        const expenses = expensesSnapshot.val();
        const incomes = incomesSnapshot.val();
        updateMonthlyTotals(expenses, incomes);
    });
});

// --- Logika Status Anggota & Tambah Anggota ---
const statusGrid = document.getElementById('status-grid');
const anggotaSelect = document.getElementById('anggota');
const tambahAnggotaForm = document.getElementById('tambah-anggota-form');
const anggotaBaruInput = document.getElementById('anggota-baru-input');
const anggotaRef = ref(database, 'anggotaKeluarga');
const statusRef = ref(database, 'statusAnggota');

// Fungsi untuk memperbarui dropdown dan status grid
const updateUI = (anggotaList) => {
    // Bersihkan dropdown dan status grid
    anggotaSelect.innerHTML = '';
    anggotaPemasukanSelect.innerHTML = '';
    if (statusGrid) {
        statusGrid.innerHTML = '';
    }

    // Isi ulang dropdown
    anggotaList.forEach(anggota => {
        const option1 = document.createElement('option');
        option1.value = anggota;
        option1.textContent = anggota;
        anggotaSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = anggota;
        option2.textContent = anggota;
        anggotaPemasukanSelect.appendChild(option2);
    });

    // Buat ulang status grid
    anggotaList.forEach(anggota => {
        onValue(ref(database, `statusAnggota/${anggota}`), (snapshot) => {
            const statusData = snapshot.val();
            const status = statusData && statusData.status ? statusData.status : 'Di Dalam';
            const reason = statusData && statusData.reason ? statusData.reason : '';
            
            const ringColor = status === 'Di Dalam' ? 'ring-[var(--color-status-in)]' : 'ring-[var(--color-status-out)]';
            const buttonClass = status === 'Di Dalam' 
                ? 'bg-[var(--color-status-out)] text-white hover:bg-[var(--color-status-out)]' 
                : 'bg-[var(--color-status-in)] text-white hover:bg-[var(--color-status-in)]';

            let existingCard = document.getElementById(`status-card-${anggota.replace(/\s+/g, '-')}`);
            if (!existingCard) {
                existingCard = document.createElement('div');
                existingCard.id = `status-card-${anggota.replace(/\s+/g, '-')}`;
                existingCard.className = `status-card bg-[var(--color-bg-secondary)] rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-4 transform transition-all duration-300 ring-2 ${ringColor}`;
                statusGrid.appendChild(existingCard);
            }

            existingCard.className = `status-card bg-[var(--color-bg-secondary)] rounded-2xl shadow-lg p-6 flex flex-col items-center space-y-4 transform transition-all duration-300 ring-2 ${ringColor}`;
            existingCard.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span class="text-4xl">${status === 'Di Dalam' ? '🏠' : '🚗'}</span>
                    <p class="text-xl font-bold text-[var(--color-text-primary)]">${anggota}</p>
                </div>
                <p class="text-lg text-[var(--color-text-secondary)]">${status === 'Di Dalam' ? 'Di Dalam Rumah' : `Sedang di Luar`}</p>
                ${reason ? `<p class="text-sm text-[var(--color-text-secondary)] italic">(${reason})</p>` : ''}
                <button onclick="toggleStatus('${anggota}')" class="w-full py-2 rounded-xl font-semibold transition-colors duration-300 ${buttonClass}">
                    ${status === 'Di Dalam' ? 'Keluar Rumah' : 'Masuk Rumah'}
                </button>
                <button onclick="deleteMember('${anggota}')" class="text-xs text-red-500 hover:text-red-700 mt-2">
                    Hapus Anggota
                </button>
            `;
        });
    });
};

// Tambah anggota keluarga baru
if (tambahAnggotaForm) {
    tambahAnggotaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMemberName = anggotaBaruInput.value.trim();
        if (newMemberName) {
            get(anggotaRef).then((snapshot) => {
                const anggotaList = snapshot.val() || ['Ayah', 'Ibu', 'Anak'];
                if (!anggotaList.includes(newMemberName)) {
                    const updatedList = [...anggotaList, newMemberName];
                    set(anggotaRef, updatedList);
                    anggotaBaruInput.value = '';
                    alert(`${newMemberName} berhasil ditambahkan!`);
                } else {
                    alert(`${newMemberName} sudah ada dalam daftar.`);
                }
            }).catch(error => {
                console.error("Gagal menambahkan anggota: ", error);
            });
        }
    });
}

// Membaca daftar anggota dari database
onValue(anggotaRef, (snapshot) => {
    const anggotaList = snapshot.val();
    if (anggotaList) {
        updateUI(anggotaList);
    } else {
        // Jika tidak ada data, inisialisasi dengan daftar default
        const defaultMembers = ['Ayah', 'Ibu', 'Anak'];
        set(anggotaRef, defaultMembers).then(() => {
            updateUI(defaultMembers);
        });
    }
});

// Fungsi untuk mengubah status
window.toggleStatus = async (anggota) => {
    const anggotaStatusRef = ref(database, `statusAnggota/${anggota}`);
    try {
        const snapshot = await get(anggotaStatusRef);
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

        await set(anggotaStatusRef, { status: newStatus, reason: newReason });
        console.log("Status berhasil diperbarui!");
    } catch (error) {
        console.error("Gagal memperbarui status: ", error);
        alert("Gagal memperbarui status. Periksa koneksi atau konfigurasi Firebase.");
    }
};

// Fungsi untuk menghapus anggota
window.deleteMember = (anggota) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${anggota}?`)) {
        get(anggotaRef).then((snapshot) => {
            const anggotaList = snapshot.val() || [];
            const updatedList = anggotaList.filter(item => item !== anggota);
            set(anggotaRef, updatedList).then(() => {
                remove(ref(database, `statusAnggota/${anggota}`));
                alert(`${anggota} berhasil dihapus.`);
            });
        });
    }
};

// --- Theme Toggler Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

// Function to apply the stored theme on page load
const applyTheme = (theme) => {
    if (theme === 'light') {
        body.classList.add('light-theme');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        body.classList.remove('light-theme');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
};

// Get theme from localStorage or default to 'dark'
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// Toggle theme on button click
themeToggleBtn.addEventListener('click', () => {
    const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});
