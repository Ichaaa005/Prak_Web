// Data awal proyek. Data ini menjadi sumber utama daftar proyek.
const projects = [
    {
        id: 1,
        title: "LokerIn",
        description: "Sistem informasi lowongan kerja untuk membantu pengguna mencari dan mengelola informasi pekerjaan.",
        category: "Web App",
        technologies: ["HTML", "CSS", "PHP", "MySQL"],
        budget: 2500000,
        completed: true
    },
    {
        id: 2,
        title: "Prabu Daging Sapi",
        description: "Sistem penjualan frozen meat untuk membantu pengelolaan produk dan transaksi.",
        category: "Web App",
        technologies: ["PHP", "MySQL", "HTML", "CSS"],
        budget: 3500000,
        completed: false
    }
];

const projectForm = document.getElementById("project-form");
const titleInput = document.getElementById("project-title");
const categoryInput = document.getElementById("project-category");
const budgetInput = document.getElementById("project-budget");
const completedInput = document.getElementById("project-completed");
const searchInput = document.getElementById("project-search");
const categoryFilter = document.getElementById("category-filter");
const projectList = document.getElementById("project-list");
const formMessage = document.getElementById("form-message");

// Mengubah angka menjadi format rupiah Indonesia.
function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

// Menghitung ulang statistik berdasarkan data proyek terbaru.
function updateStats() {
    document.getElementById("stat-total-projects").textContent = projects.length;

    const totalBudget = projects.reduce((total, project) => total + project.budget, 0);
    document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);

    const completedCount = projects.filter(project => project.completed).length;
    document.getElementById("stat-completed-projects").textContent = completedCount;
}

// Menampilkan proyek yang sesuai dengan pencarian dan filter kategori.
function renderProjects() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProjects = projects.filter(project => {
        const matchesName = project.title.toLowerCase().includes(keyword);
        const matchesCategory =
            selectedCategory === "Semua" || project.category === selectedCategory;

        return matchesName && matchesCategory;
    });

    if (filteredProjects.length === 0) {
        projectList.innerHTML = '<p class="empty-message">Tidak ada proyek yang cocok dengan pencarian atau kategori ini.</p>';
        return;
    }

    projectList.innerHTML = filteredProjects.map(project => {
        const statusClass = project.completed ? "status-completed" : "status-pending";
        const statusText = project.completed ? "Selesai" : "Dalam Pengerjaan";
        const technologies = project.technologies
            .map(technology => escapeHTML(technology))
            .join(", ");

        return `
            <article class="project-card">
                <div class="project-info">
                    <span class="project-category">${escapeHTML(project.category)}</span>
                    <h3>${escapeHTML(project.title)}</h3>
                    <p>${escapeHTML(project.description || "Belum ada deskripsi proyek.")}</p>
                    <p><strong>Teknologi:</strong> ${technologies || "-"}</p>
                    <p class="project-budget">Anggaran: ${formatRupiah(project.budget)}</p>
                    <div class="project-actions">
                        <button type="button" class="button-status" data-action="toggle" data-id="${project.id}">
                            Ubah Status
                        </button>
                        <button type="button" class="button-delete" data-action="delete" data-id="${project.id}">
                            Hapus Proyek
                        </button>
                    </div>
                </div>
                <span class="project-status ${statusClass}">${statusText}</span>
            </article>
        `;
    }).join("");
}

// Mengamankan teks yang dimasukkan pengguna sebelum ditampilkan sebagai HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Form: validasi dan tambahkan proyek baru ke array.
projectForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const budget = Number(budgetInput.value);
    const completed = completedInput.checked;

    if (!title) {
        showFormMessage("Judul proyek tidak boleh kosong.", true);
        titleInput.focus();
        return;
    }

    if (!category) {
        showFormMessage("Silakan pilih kategori proyek.", true);
        categoryInput.focus();
        return;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
        showFormMessage("Anggaran harus berupa angka lebih besar dari 0.", true);
        budgetInput.focus();
        return;
    }

    projects.push({
        id: Date.now(),
        title,
        description: "Proyek ditambahkan melalui formulir.",
        category,
        technologies: [],
        budget,
        completed
    });

    projectForm.reset();
    categoryFilter.value = "Semua";
    searchInput.value = "";
    showFormMessage("Proyek berhasil ditambahkan.");
    updateStats();
    renderProjects();
});

function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
}

// Live search: hasil berubah setiap kali pengguna mengetik.
searchInput.addEventListener("input", renderProjects);

// Filter kategori bekerja bersama pencarian.
categoryFilter.addEventListener("change", renderProjects);

// Event delegation: satu listener menangani tombol pada semua kartu proyek.
projectList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const projectId = Number(button.dataset.id);
    const action = button.dataset.action;
    const projectIndex = projects.findIndex(project => project.id === projectId);

    if (projectIndex === -1) return;

    if (action === "toggle") {
        projects[projectIndex].completed = !projects[projectIndex].completed;
    }

    if (action === "delete") {
        const confirmed = confirm(`Yakin ingin menghapus proyek "${projects[projectIndex].title}"?`);
        if (!confirmed) return;
        projects.splice(projectIndex, 1);
    }

    updateStats();
    renderProjects();
});

// Tampilkan data awal saat halaman siap.
updateStats();
renderProjects();
