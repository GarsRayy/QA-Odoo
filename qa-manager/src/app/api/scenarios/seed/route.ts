import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const initialScenarios = [
  { 
    code: "HP-01", 
    name: "Otentikasi: Multi-Role Access Control", 
    category: "Happy Path",
    description: "Validasi akses keamanan dan otorisasi dashboard untuk role Tendik, Dekan, dan Tim Pelaksana.",
    roles: ["Tendik", "Dekan", "Tim Pelaksana"],
    steps: ["Buka URL Login Odoo", "Input kredensial", "Klik 'Log masuk'", "Verifikasi Dashboard"],
    expected_result: "Pengguna berhasil masuk dan menu 'Kerjasama LPPM' muncul.",
    file_path: "hp-01-partnership.spec.ts"
  },
  { 
    code: "HP-02", 
    name: "Registrasi: Inisiasi Kerjasama Baru", 
    category: "Happy Path",
    description: "Pembuatan record kerjasama awal dengan pengunggahan dokumen surat masuk.",
    roles: ["Tendik LPPM"],
    steps: ["Login Tendik", "Klik 'New'", "Pilih Mitra", "Upload Surat", "Klik Simpan"],
    expected_result: "Record terbuat dengan status 'Draft'.",
    file_path: "hp-02-buat-kerjasama-surat-diterima.spec.ts"
  },
  { 
    code: "HP-03", 
    name: "Detailing: Input No. Surat & Pengajuan", 
    category: "Happy Path",
    description: "Melengkapi metadata surat dan melakukan submission ke Approvals.",
    roles: ["Tendik LPPM"],
    steps: ["Input No. Surat", "Pilih Fakultas", "Klik Ajukan"],
    expected_result: "Status berubah menjadi 'Waiting Approval'.",
    file_path: "hp-03-isi-detail-ajukan-ke-fakultas.spec.ts"
  },
  { 
    code: "HP-04", 
    name: "Workflow: Approval & Penugasan Tim", 
    category: "Happy Path",
    description: "Validasi oleh Fakultas dan penetapan struktur tim pelaksana.",
    roles: ["Fakultas FTI"],
    steps: ["Login Fakultas", "Klik Approve", "Input Tim & Ketua"],
    expected_result: "Tim Pelaksana resmi ditunjuk.",
    file_path: "hp-04-persetujuan-penugasan-tim-fti.spec.ts"
  },
  { 
    code: "HP-05", 
    name: "Financial: Proposal & RAB Awal", 
    category: "Happy Path",
    description: "Input detail anggaran dan pengunggahan draf proposal.",
    roles: ["Tim Pelaksana"],
    steps: ["Upload Proposal", "Input RAB", "Klik Submit"],
    expected_result: "Proposal masuk antrean verifikasi LPPM.",
    file_path: "hp-05-upload-proposal-rab-awal.spec.ts"
  },
  { 
    code: "HP-06", 
    name: "Validation: Approval Proposal", 
    category: "Happy Path",
    description: "Verifikasi bertingkat oleh Tendik dan Kepala LPPM.",
    roles: ["Tendik LPPM", "Kepala LPPM"],
    steps: ["Verifikasi Tendik", "Approval Kepala LPPM"],
    expected_result: "Proposal disahkan pimpinan.",
    file_path: "hp-06-approval-proposal-dekan.spec.ts"
  },
  { 
    code: "HP-07", 
    name: "Output: Surat Kesediaan", 
    category: "Happy Path",
    description: "Penerbitan surat jawaban ITERA kepada mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Generate Surat", "Kirim ke Mitra"],
    expected_result: "PDF Surat Kesediaan terbit.",
    file_path: "hp-07-generate-surat-jawaban-kesediaan.spec.ts"
  },
  { 
    code: "HP-08", 
    name: "Legalitas: PKS & TTD Mitra", 
    category: "Happy Path",
    description: "Pengunggahan hasil tanda tangan kontrak PKS oleh mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Upload PKS TTD", "Input No. PKS"],
    expected_result: "Kontrak legal tersimpan.",
    file_path: "hp-08-penyusunan-draft-kontrak-pks-ttd-pks.spec.ts"
  },
  { 
    code: "HP-09", 
    name: "Legalitas: SK Rektor", 
    category: "Happy Path",
    description: "Integrasi SK Rektor sebagai landasan hukum.",
    roles: ["Tendik LPPM"],
    steps: ["Upload SK Rektor", "Input No. SK"],
    expected_result: "Landasan hukum lengkap.",
    file_path: "hp-09-upload-sk-rektor.spec.ts"
  },
  { 
    code: "HP-10", 
    name: "Compliance: SPK Internal", 
    category: "Happy Path",
    description: "Penyelesaian alur SPK untuk tim internal.",
    roles: ["Tendik LPPM"],
    steps: ["Upload SPK TTD"],
    expected_result: "Status INTERNAL_CONTRACT_SIGNED.",
    file_path: "hp-10-kontrak-internal.spec.ts"
  },
  { 
    code: "HP-11", 
    name: "Pelaksanaan: RAB Final", 
    category: "Happy Path",
    description: "Aktivasi project melalui upload RAB Final.",
    roles: ["Tim Pelaksana"],
    steps: ["Upload RAB Final", "Klik Submit"],
    expected_result: "Status In Progress.",
    file_path: "hp-11-upload-rab-final-dan-pelaksanaan-kerjasama.spec.ts"
  },
  { 
    code: "HP-12", 
    name: "Deliverables: Setor Hasil", 
    category: "Happy Path",
    description: "Dokumentasi luaran kerjasama ke sistem.",
    roles: ["Tim Pelaksana"],
    steps: ["Upload Hasil Pekerjaan"],
    expected_result: "Hasil tersimpan untuk divalidasi.",
    file_path: "hp-12-memulai-pekerjaan-setor-hasil.spec.ts"
  },
  { 
    code: "HP-13", 
    name: "Financial: Billing Mitra", 
    category: "Happy Path",
    description: "Proses penagihan pembayaran ke mitra.",
    roles: ["Tendik LPPM"],
    steps: ["Generate Tagihan", "Kirim ke Mitra"],
    expected_result: "Permohonan pembayaran terkirim.",
    file_path: "hp-13-lppm-membuat-surat-permohonan-pembayaran-ke-mitra.spec.ts"
  },
  { 
    code: "HP-14", 
    name: "Closing: Penutupan Kerjasama", 
    category: "Happy Path",
    description: "Final review dan pengarsipan kerjasama.",
    roles: ["Kepala LPPM"],
    steps: ["Approval Selesai"],
    expected_result: "Status Completed.",
    file_path: "hp-14-penyelesaian-kerjasama.spec.ts"
  },
  {
    code: "NP-01",
    name: "Negative: Login & Security",
    category: "Negative Path",
    description: "Validasi pembatasan akses dan login salah.",
    roles: ["All Roles"],
    steps: ["Input password salah", "Akses menu terlarang"],
    expected_result: "Akses diblokir sistem.",
    file_path: "np-01-negative-scenarios.spec.ts"
  },
  {
    code: "NP-02",
    name: "Negative: Invalid Upload",
    category: "Negative Path",
    description: "Validasi pembatasan tipe dan ukuran file.",
    roles: ["Tendik LPPM"],
    steps: ["Upload .exe", "Upload file > 10MB"],
    expected_result: "Sistem menolak file.",
    file_path: "np-02-invalid-upload.spec.ts"
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
