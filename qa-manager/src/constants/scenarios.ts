export const INITIAL_SCENARIOS = [
  {
    code: "HP-01",
    name: "Otentikasi: Multi-Role Access Control",
    description: "Validasi akses keamanan dan otorisasi dashboard untuk role Tendik, Dekan, dan Tim Pelaksana.",
    roles: ["Tendik", "Dekan", "Tim Pelaksana"],
    file_path: "hp-01-partnership.spec.ts",
    steps: [
      "Buka URL Login Odoo",
      "Input kredensial role spesifik (Username/Password)",
      "Klik tombol 'Log masuk' (btn-primary)",
      "Navigasi ke menu 'Kerjasama LPPM'",
      "Verifikasi elemen dashboard muncul sesuai role"
    ],
    expected_result: "Pengguna berhasil masuk dan elemen menu 'Kerjasama LPPM' dapat diakses tanpa error 403."
  },
  {
    code: "HP-02",
    name: "Registrasi: Inisiasi Kerjasama Baru",
    description: "Pembuatan record kerjasama awal dengan pengunggahan dokumen surat masuk dari mitra.",
    roles: ["Tendik LPPM"],
    file_path: "hp-02-buat-kerjasama-surat-diterima.spec.ts",
    steps: [
      "Login sebagai Tendik LPPM",
      "Buka modul 'Kerjasama LPPM'",
      "Klik tombol 'New' untuk record baru",
      "Pilih Mitra dari dropdown 'Mitra'",
      "Upload file 'Surat_Masuk_Mitra.pdf'",
      "Klik 'Simpan' (Save)"
    ],
    expected_result: "Record kerjasama tercipta dengan status 'Draft' dan file attachment tersimpan."
  },
  {
    code: "HP-03",
    name: "Detailing: Input No. Surat & Pengajuan Fakultas",
    description: "Melengkapi metadata surat mitra dan melakukan submission permohonan ke modul Approvals.",
    roles: ["Tendik LPPM"],
    file_path: "hp-03-isi-detail-ajukan-ke-fakultas.spec.ts",
    steps: [
      "Buka record kerjasama status 'Draft'",
      "Input 'Nomor Surat Mitra'",
      "Pilih 'Fakultas' tujuan (misal: FTI)",
      "Klik tombol 'Ajukan ke Fakultas'",
      "Verifikasi status berubah menjadi 'Waiting Approval'"
    ],
    expected_result: "Data surat tersimpan dan workflow berpindah ke tahap Approval Fakultas."
  },
  {
    code: "HP-04",
    name: "Workflow: Approval Fakultas & Penugasan Tim",
    description: "Proses validasi oleh Fakultas dan penetapan struktur tim pelaksana (Ketua & Prodi).",
    roles: ["Fakultas FTI"],
    file_path: "hp-04-approval-fakultas-penugasan.spec.ts",
    steps: [
      "Login sebagai Manajer Fakultas",
      "Buka menu 'Approvals'",
      "Review detail pengajuan kerjasama",
      "Input nama 'Ketua Tim' dan 'Prodi'",
      "Klik tombol 'Approve'",
      "Verifikasi status berubah menjadi 'Approved by Faculty'"
    ],
    expected_result: "Pengajuan disetujui dan Tim Pelaksana resmi ditunjuk dalam sistem."
  },
  {
    code: "HP-05",
    name: "Financial: Pengajuan Proposal & RAB Awal",
    description: "Input detail anggaran dan pengunggahan draf proposal kegiatan oleh Tim Pelaksana.",
    roles: ["Tim Pelaksana"],
    file_path: "hp-05-input-proposal-rab.spec.ts",
    steps: [
      "Login sebagai Ketua Tim Pelaksana",
      "Buka menu 'My Projects'",
      "Upload dokumen 'Proposal_Kegiatan.pdf'",
      "Input baris anggaran (RAB) di tab 'Budget'",
      "Klik 'Submit Proposal'"
    ],
    expected_result: "Dokumen proposal terunggah dan draf anggaran masuk ke antrean verifikasi LPPM."
  },
  {
    code: "HP-06",
    name: "Validation: Multi-Stage Approval Proposal",
    description: "Verifikasi bertingkat oleh administrasi (Tendik) dan pimpinan (Kepala LPPM) untuk pengesahan anggaran.",
    roles: ["Tendik LPPM", "Kepala LPPM"],
    file_path: "hp-06-verifikasi-rab-lppm.spec.ts",
    steps: [
      "Login sebagai Tendik LPPM untuk cek kelengkapan",
      "Berikan catatan 'Verified' jika sesuai",
      "Login sebagai Kepala LPPM",
      "Klik tombol 'Verify RAB'",
      "Klik 'Approve Proposal'"
    ],
    expected_result: "Proposal dan RAB disahkan secara administratif oleh pimpinan LPPM."
  },
  {
    code: "HP-07",
    name: "Output: Penerbitan & Pengiriman Surat Kesediaan",
    description: "Dokumentasi jawaban resmi ITERA kepada mitra dan pengiriman via email/sistem.",
    roles: ["Tendik LPPM"],
    file_path: "hp-07-kirim-surat-kesediaan.spec.ts",
    steps: [
      "Buka record yang sudah disetujui",
      "Klik 'Generate Surat Kesediaan'",
      "Verifikasi data surat terisi otomatis",
      "Klik 'Send to Mitra'",
      "Verifikasi status 'Surat Dikirim'"
    ],
    expected_result: "Sistem menghasilkan dokumen PDF surat kesediaan dan mencatat log pengiriman."
  },
  {
    code: "HP-08",
    name: "Legalitas: Kontrak PKS & TTD Basah Mitra",
    description: "Penyusunan draf Perjanjian Kerja Sama (PKS) dan pengunggahan hasil tanda tangan mitra.",
    roles: ["Tendik LPPM"],
    file_path: "hp-08-upload-pks-mitra.spec.ts",
    steps: [
      "Siapkan draf PKS di sistem",
      "Terima dokumen fisik/scan dari mitra",
      "Upload file 'PKS_Signed_Mitra.pdf'",
      "Input 'Nomor PKS Mitra'",
      "Klik 'Save Legal Doc'"
    ],
    expected_result: "Dokumen legalitas utama tersimpan dan siap untuk proses SK Rektor."
  },
  {
    code: "HP-09",
    name: "Legalitas: Pengunggahan SK Rektor",
    description: "Integrasi landasan hukum kegiatan melalui pengunggahan dokumen SK Rektor.",
    roles: ["Tendik LPPM"],
    file_path: "hp-09-upload-sk-rektor.spec.ts",
    steps: [
      "Terima SK Rektor dari bagian Hukum",
      "Buka record kerjasama terkait",
      "Upload 'SK_Rektor_Kegiatan.pdf'",
      "Input 'Nomor SK Rektor'",
      "Klik 'Submit to Project Stage'"
    ],
    expected_result: "Landasan hukum lengkap, status kerjasama berlanjut ke 'Implementation'."
  },
  {
    code: "HP-10",
    name: "Compliance: Finalisasi Kontrak Internal (SPK)",
    description: "Penyelesaian alur tanda tangan Surat Perintah Kerja (SPK) untuk tim internal.",
    roles: ["Tendik LPPM"],
    file_path: "hp-10-finalisasi-spk-internal.spec.ts",
    steps: [
      "Generate dokumen SPK internal",
      "Kumpulkan tanda tangan digital/basah tim",
      "Upload 'SPK_Internal_Signed.pdf'",
      "Klik 'Finalize Compliance'"
    ],
    expected_result: "Seluruh aspek kepatuhan legal terpenuhi baik eksternal maupun internal."
  },
  {
    code: "HP-11",
    name: "Pelaksanaan: Aktivasi Project via RAB Final",
    description: "Tahap memulai pekerjaan fisik/kegiatan melalui aktivasi RAB Final oleh Tim Pelaksana.",
    roles: ["Tim Pelaksana"],
    file_path: "hp-11-aktivasi-rab-final.spec.ts",
    steps: [
      "Buka dashboard proyek",
      "Klik 'Confirm RAB Final'",
      "Input tanggal mulai pelaksanaan",
      "Klik 'Activate Project'",
      "Verifikasi status 'In Progress'"
    ],
    expected_result: "Project aktif di sistem dan anggaran siap untuk dilakukan penagihan/invoicing."
  },
  {
    code: "HP-12",
    name: "Deliverables: Penyetoran Hasil Pekerjaan",
    description: "Dokumentasi luaran kerjasama (Laporan/Produk) oleh Tim Pelaksana ke sistem.",
    roles: ["Tim Pelaksana"],
    file_path: "hp-12-upload-laporan-deliverables.spec.ts",
    steps: [
      "Login sebagai Pelaksana",
      "Buka tab 'Deliverables'",
      "Upload 'Laporan_Akhir_Pekerjaan.pdf'",
      "Input link produk (jika ada)",
      "Klik 'Submit Deliverables'"
    ],
    expected_result: "Hasil pekerjaan terunggah dan dapat diperiksa oleh pimpinan LPPM."
  },
  {
    code: "HP-13",
    name: "Financial: Invoicing & Billing Mitra",
    description: "Proses penagihan pembayaran termin/akhir kepada mitra berdasarkan hasil pekerjaan.",
    roles: ["Tendik LPPM"],
    file_path: "hp-13-generate-invoice-mitra.spec.ts",
    steps: [
      "Buka tab 'Invoicing'",
      "Klik 'Create Invoice'",
      "Input termin pembayaran",
      "Generate PDF Invoice",
      "Klik 'Mark as Sent'"
    ],
    expected_result: "Invoice berhasil dibuat dan tercatat dalam sistem keuangan kerjasama."
  },
  {
    code: "HP-14",
    name: "Closing: Final Review & Penutupan Kerjasama",
    description: "Review menyeluruh terhadap dokumen dan keuangan sebelum record ditutup resmi.",
    roles: ["Kepala LPPM", "Tendik LPPM"],
    file_path: "hp-14-penutupan-kerjasama.spec.ts",
    steps: [
      "Verifikasi semua pembayaran lunas",
      "Verifikasi semua deliverables diterima",
      "Klik tombol 'Close Record'",
      "Verifikasi status berubah menjadi 'Archived/Completed'"
    ],
    expected_result: "Record kerjasama ditutup secara permanen dan masuk ke dalam arsip laporan tahunan."
  },
  {
    code: "NP-01",
    name: "Negative: Login Failure & Access Control",
    description: "Validasi penolakan sistem terhadap kredensial salah dan pembatasan akses menu antar role.",
    roles: ["Global"],
    file_path: "np-01-negative-scenarios.spec.ts",
    steps: [
      "Input wrong password for Admin",
      "Try to access Admin menu with Pelaksana account",
      "Verify 'Access Denied' message appears"
    ],
    expected_result: "Sistem memberikan pesan error yang tepat dan memblokir akses tidak sah."
  },
  {
    code: "NP-02",
    name: "Negative: Invalid File Upload",
    description: "Pengujian pembatasan tipe file dan ukuran file pada modul kerjasama.",
    roles: ["Tendik LPPM"],
    file_path: "np-02-invalid-upload.spec.ts",
    steps: [
      "Upload .exe file instead of .pdf",
      "Upload file larger than 10MB",
      "Verify system validation error"
    ],
    expected_result: "Sistem menolak file dan menampilkan peringatan 'Format/Ukuran Tidak Didukung'."
  }
];
