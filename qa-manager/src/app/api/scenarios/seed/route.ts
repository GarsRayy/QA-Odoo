import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const initialScenarios = [
  { 
    code: "HP-01", 
    name: "Akses Sistem: Semua Role", 
    category: "Happy Path",
    description: "Verifikasi login multi-akun untuk memastikan semua role memiliki akses dashboard.",
    roles: ["Tendik", "Dekan", "Tim Pelaksana"],
    steps: ["Buka halaman login", "Input Email & Password", "Klik 'Log masuk'", "Verifikasi Dashboard muncul"],
    expected_result: "Seluruh role berhasil masuk ke portal Odoo.",
    file_path: "hp-01-akses-sistem.spec.ts"
  },
  { 
    code: "HP-02", 
    name: "Registrasi: #002 Dia Bisa", 
    category: "Happy Path",
    description: "Tendik LPPM membuat record awal kerjasama 'Kerjasama Membangun ITBEH'.",
    roles: ["Tendik LPPM"],
    steps: ["Klik button 'Baru'", "Isi Name: '#002 Dia Bisa'", "Isi Perihal: 'Kerjasama Membangun ITBEH'", "Pilih Mitra: 'Stevanus'", "Upload file: 'dummy-surat.pdf'", "Klik button 'Surat Diterima'"],
    expected_result: "Record kerjasama terbuat dengan status 'Surat Diterima'.",
    file_path: "hp-02-buat-kerjasama-surat-diterima.spec.ts"
  },
  { 
    code: "HP-03", 
    name: "Detailing: #002 Dia Bisa", 
    category: "Happy Path", 
    description: "Input detail nomor surat mitra 'KB/21/ITBEH/ITERA/2026' dan penyerahan di modul Approvals.",
    roles: ["Tendik LPPM"],
    steps: ["Buka record '#002 Dia Bisa'", "Input No. Surat Mitra: 'KB/21/ITBEH/ITERA/2026'", "Klik button 'Ajukan Persetujuan (FTI)'", "Buka Modul Persetujuan -> Menu Permintaan Saya", "Klik button 'Menyerahkan' pada record 'Akan Diajukan'"],
    expected_result: "Permohonan resmi diajukan ke Fakultas FTI.",
    file_path: "hp-03-isi-detail-ajukan-ke-fakultas.spec.ts"
  },
  { 
    code: "HP-04", 
    name: "Penugasan: TIM Kaciw (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Fakultas FTI menyetujui permohonan dan menugaskan TIM Kaciw.",
    roles: ["Fakultas FTI"],
    steps: ["Klik 'Setujui' di modul Persetujuan (Manajer)", "Buka record '#002 Dia Bisa' di Kerjasama LPPM", "Input Tim: 'TIM Kaciw', Ketua: 'Nanindya'", "Pilih Prodi: 'Teknik Arsitektur'", "Klik button 'Tugaskan Ketua Tim'"],
    expected_result: "Tim Kaciw resmi ditugaskan sebagai pelaksana.",
    file_path: "hp-04-persetujuan-penugasan-tim-fti.spec.ts"
  },
  { 
    code: "HP-05", 
    name: "Submission: RAB Merdeka (150 Juta)", 
    category: "Happy Path",
    description: "Tim Pelaksana mengunggah detail anggaran '(Proposal) & RAB Merdeka'.",
    roles: ["Tim Pelaksana"],
    steps: ["Buka tab Keuangan (RAB + LPJ)", "Isi Name: '(Proposal) & RAB Merdeka'", "Input Nilai RAB: '150.000.000'", "Klik button 'Ajukan Proposal dan RAB (FTI)'"],
    expected_result: "Anggaran dan proposal berhasil diajukan.",
    file_path: "hp-05-upload-proposal-rab-awal.spec.ts"
  },
  { 
    code: "HP-06", 
    name: "Persetujuan Akhir Proposal (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Approval proposal oleh Tendik dan Kepala LPPM (garisrayya).",
    roles: ["Tendik LPPM", "Kepala LPPM"],
    steps: ["Tendik klik 'Setujui' di modul Persetujuan", "Log out -> Login sebagai garisrayya", "Klik 'Setujui' pada permintaan yang sama"],
    expected_result: "Proposal resmi disetujui (FACULTY_APPROVED).",
    file_path: "hp-06-approval-proposal-dekan.spec.ts"
  },
  { 
    code: "HP-07", 
    name: "Surat Kesediaan ke Mitra (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Penerbitan surat jawaban kesediaan ITERA kepada mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Buka tab Dokumen", "Upload file Kesediaan", "Klik button 'Upload Kesediaan'", "Klik button 'Kirim Surat Kesedian ke Mitra'"],
    expected_result: "Surat kesediaan terkirim dan tercatat di sistem.",
    file_path: "hp-07-generate-surat-jawaban-kesediaan.spec.ts"
  },
  { 
    code: "HP-08", 
    name: "Kontrak PKS & Upload TTD (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Penyusunan draf kontrak PKS and upload dokumen hasil tanda tangan mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Klik button 'Susun Draft Kontrak'", "Upload file PKS yang sudah di-TTD", "Klik button 'Upload PKS TTD'"],
    expected_result: "Legalitas kontrak PKS resmi tersimpan.",
    file_path: "hp-08-penyusunan-draft-kontrak-pks-ttd-pks.spec.ts"
  },
  { 
    code: "HP-09", 
    name: "Legalitas: SK Rektor (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Unggah dokumen SK Rektor sebagai landasan hukum kegiatan.",
    roles: ["Tendik LPPM"],
    steps: ["Buka tab Dokumen", "Upload file SK Rektor", "Klik button 'Upload SK Rektor'"],
    expected_result: "SK Rektor terdaftar di record kerjasama.",
    file_path: "hp-09-upload-sk-rektor.spec.ts"
  },
  { 
    code: "HP-10", 
    name: "Kontrak Internal (SPK) (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Penyelesaian tanda tangan kontrak internal SPK.",
    roles: ["Tendik LPPM"],
    steps: ["Upload file TTD Kontrak Internal", "Klik button 'TTD Kontrak Internal'"],
    expected_result: "Status berubah menjadi 'INTERNAL_CONTRACT_SIGNED'.",
    file_path: "hp-10-kontrak-internal.spec.ts"
  },
  { 
    code: "HP-11", 
    name: "Mulai Pelaksanaan (RAB Final) (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Tim Pelaksana memulai kegiatan dan upload RAB Final.",
    roles: ["Tim Pelaksana"],
    steps: ["Buka tab Keuangan (RAB + LPJ)", "Upload file RAB Final", "Klik button 'Submit RAB Final'"],
    expected_result: "Status kerjasama aktif (In Progress).",
    file_path: "hp-11-upload-rab-final-dan-pelaksanaan-kerjasama.spec.ts"
  },
  { 
    code: "HP-12", 
    name: "Setor Hasil Pekerjaan (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Unggah dokumen bukti hasil pekerjaan (Deliverables).",
    roles: ["Tim Pelaksana"],
    steps: ["Buka tab Dokumen", "Upload file hasil", "Klik button 'Setor Hasil'"],
    expected_result: "Hasil pekerjaan terkirim untuk divalidasi.",
    file_path: "hp-12-memulai-pekerjaan-setor-hasil.spec.ts"
  },
  { 
    code: "HP-13", 
    name: "Penagihan (Billing Mitra) (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Pengiriman surat permohonan pembayaran ke mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Generate surat tagihan", "Klik button 'Kirim Surat Permohonan Pembayaran ke Mitra'"],
    expected_result: "Permohonan pembayaran terkirim ke mitra.",
    file_path: "hp-13-lppm-membuat-surat-permohonan-pembayaran-ke-mitra.spec.ts"
  },
  { 
    code: "HP-14", 
    name: "Finalisasi & Penyelesaian (#002 Dia Bisa)", 
    category: "Happy Path",
    description: "Penutupan record kerjasama oleh Kepala LPPM.",
    roles: ["Kepala LPPM", "Tendik LPPM"],
    steps: ["Log in sebagai Kepala LPPM", "Setujui penyelesaian", "Klik button 'Selesai'"],
    expected_result: "Record kerjasama resmi berstatus 'Completed'.",
    file_path: "hp-14-penyelesaian-kerjasama.spec.ts"
  }
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_scenarios')
      .upsert(initialScenarios, { onConflict: 'code' });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `${initialScenarios.length} scenarios seeded successfully!`,
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
