
document.addEventListener("DOMContentLoaded", () => {

    // 1. Tangkap Elemen DOM
    const mhsForm = document.querySelector("#mhsForm");
    const mhsIdInput = document.querySelector("#mhsId");
    const nimInput = document.querySelector("#nim");
    const namaInput = document.querySelector("#nama");
    const jurusanInput = document.querySelector("#jurusan");
    const emailInput = document.querySelector("#email");
    const btnSubmit = document.querySelector("#btnSubmit");
    const btnCancel = document.querySelector("#btnCancel");
    const formTitle = document.querySelector("#formTitle");
    const mhsTableBody = document.querySelector("#mhsTableBody");
    const alertMessage = document.querySelector("#alertMessage");

    // Elemen tambahan Modul 7
    const searchInput = document.querySelector("#searchInput");
    const totalMahasiswa = document.querySelector("#totalMahasiswa");

    let listMahasiswa = [];

    // 2. Fungsi Notifikasi
    const showAlert = (text, type = "success") => {
        alertMessage.textContent = text;
        alertMessage.className = `alert alert-${type}`;
        alertMessage.style.display = "block";

        setTimeout(() => {
            alertMessage.style.display = "none";
        }, 3000);
    };

    // 3. READ: Ambil Data Mahasiswa
    const loadMahasiswa = async () => {
        try {
            const res = await fetch("/api/mahasiswa");
            listMahasiswa = await res.json();

            // Update counter
            totalMahasiswa.textContent =
                `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;

            // Tampilkan data sesuai pencarian
            filterMahasiswa();

        } catch (err) {
            showAlert("Gagal memuat data dari server backend", "error");
        }
    };

    // 4. RENDER TABEL
    const renderTable = (data) => {
        mhsTableBody.innerHTML = "";

        if (data.length === 0) {
            mhsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Data mahasiswa tidak ditemukan.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach((mhs, idx) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${mhs.nim}</td>
                <td>${mhs.nama}</td>
                <td>${mhs.jurusan}</td>
                <td>${mhs.email}</td>
                <td>
                    <button class="btn-action btn-edit"
                        data-id="${mhs.id}">Edit</button>

                    <button class="btn-action btn-delete"
                        data-id="${mhs.id}">Hapus</button>
                </td>
            `;

            mhsTableBody.appendChild(tr);
        });
    };

    // 5. FITUR 1: PENCARIAN REAL-TIME
    const filterMahasiswa = () => {
        const keyword = searchInput.value.toLowerCase().trim();

        const hasilFilter = listMahasiswa.filter(mhs =>
            String(mhs.nama).toLowerCase().includes(keyword) ||
            String(mhs.nim).toLowerCase().includes(keyword)
        );

        renderTable(hasilFilter);
    };

    // Event listener pencarian
    searchInput.addEventListener("input", () => {
        filterMahasiswa();
    });

    // 6. CREATE & UPDATE: Submit Formulir
    mhsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            nim: nimInput.value.trim(),
            nama: namaInput.value.trim(),
            jurusan: jurusanInput.value,
            email: emailInput.value.trim()
        };

        const id = mhsIdInput.value;
        const isEdit = Boolean(id);

        // FITUR 2: VALIDASI NIM DUPLIKAT
        const nimSudahAda = listMahasiswa.some(mhs =>
            String(mhs.nim).trim().toLowerCase() ===
                payload.nim.toLowerCase() &&
            String(mhs.id) !== String(id)
        );

        if (nimSudahAda) {
            alert("NIM sudah terdaftar!");
            return;
        }

        const url = isEdit
            ? `/api/mahasiswa/${id}`
            : "/api/mahasiswa";

        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.success) {
                showAlert(result.message);
                resetForm();

                // Muat ulang data dan counter
                await loadMahasiswa();

            } else {
                showAlert(
                    "Terjadi kesalahan: " + result.message,
                    "error"
                );
            }

        } catch (err) {
            showAlert("Gagal mengirim data ke server", "error");
        }
    });

    // 7. DELETE & EDIT: Event Delegation
    mhsTableBody.addEventListener("click", async (e) => {

        const button = e.target.closest("button[data-id]");

        if (!button) return;

        const id = Number(button.dataset.id);

        // MODE EDIT
        if (button.classList.contains("btn-edit")) {

            const targetMhs = listMahasiswa.find(
                m => Number(m.id) === id
            );

            if (targetMhs) {
                mhsIdInput.value = targetMhs.id;
                nimInput.value = targetMhs.nim;
                namaInput.value = targetMhs.nama;
                jurusanInput.value = targetMhs.jurusan;
                emailInput.value = targetMhs.email;

                formTitle.textContent = "Edit Data Mahasiswa";
                btnSubmit.textContent = "Perbarui Mahasiswa";
                btnCancel.style.display = "inline-block";

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }

        // MODE DELETE
        else if (button.classList.contains("btn-delete")) {

            if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {

                try {
                    const res = await fetch(
                        `/api/mahasiswa/${id}`,
                        { method: "DELETE" }
                    );

                    const result = await res.json();

                    if (result.success) {
                        showAlert(result.message);

                        // Muat ulang data dan counter
                        await loadMahasiswa();
                    }

                } catch (err) {
                    showAlert(
                        "Gagal menghapus data dari server",
                        "error"
                    );
                }
            }
        }
    });

    // 8. Reset Form
    const resetForm = () => {
        mhsForm.reset();
        mhsIdInput.value = "";

        formTitle.textContent = "Tambah Mahasiswa Baru";
        btnSubmit.textContent = "Simpan Mahasiswa";
        btnCancel.style.display = "none";
    };

    btnCancel.addEventListener("click", resetForm);

    // 9. Ambil Data Pertama Kali
    loadMahasiswa();

});
