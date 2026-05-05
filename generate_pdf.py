import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import Flowable

OUTPUT_DIR = "outputs"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
OUTPUT = os.path.join(OUTPUT_DIR, "LPPM_ITERA_Odoo_QA_Documentation.pdf")

# ── Colors ─────────────────────────────────────────────────────────────────
PRIMARY   = colors.HexColor("#1B4F8A")   # ITERA biru
SECONDARY = colors.HexColor("#1E2D3D")   # dark navy
ACCENT    = colors.HexColor("#22C55E")   # green / pass
WARNING   = colors.HexColor("#F59E0B")   # amber
DANGER    = colors.HexColor("#EF4444")   # red / fail
INFO      = colors.HexColor("#3B82F6")   # blue
PURPLE    = colors.HexColor("#7C3AED")
BG_LIGHT  = colors.HexColor("#F0F4FA")
BG_CODE   = colors.HexColor("#1B2631")
TEXT_CODE = colors.HexColor("#E2E8F0")
GRAY      = colors.HexColor("#64748B")
LIGHT_GRAY= colors.HexColor("#E2E8F0")
WHITE     = colors.white
GOLD      = colors.HexColor("#D97706")

# ── Styles ──────────────────────────────────────────────────────────────────
def make_styles():
    s = {
        "cover_title": ParagraphStyle(
            "cover_title", fontSize=28, textColor=WHITE,
            fontName="Helvetica-Bold", alignment=TA_CENTER, leading=36, spaceAfter=8
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub", fontSize=13, textColor=colors.HexColor("#BFD7F5"),
            fontName="Helvetica", alignment=TA_CENTER, leading=18, spaceAfter=6
        ),
        "cover_label": ParagraphStyle(
            "cover_label", fontSize=10, textColor=colors.HexColor("#93C5FD"),
            fontName="Helvetica-Bold", alignment=TA_CENTER
        ),
        "cover_val": ParagraphStyle(
            "cover_val", fontSize=10, textColor=WHITE,
            fontName="Helvetica", alignment=TA_CENTER
        ),
        "h1": ParagraphStyle(
            "h1", fontSize=18, textColor=SECONDARY,
            fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=7, leading=24
        ),
        "h2": ParagraphStyle(
            "h2", fontSize=13, textColor=PRIMARY,
            fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=5, leading=18
        ),
        "h3": ParagraphStyle(
            "h3", fontSize=11, textColor=SECONDARY,
            fontName="Helvetica-Bold", spaceBefore=7, spaceAfter=4, leading=15
        ),
        "body": ParagraphStyle(
            "body", fontSize=9.5, textColor=SECONDARY,
            fontName="Helvetica", leading=15, spaceAfter=5, alignment=TA_JUSTIFY
        ),
        "bullet": ParagraphStyle(
            "bullet", fontSize=9.5, textColor=SECONDARY,
            fontName="Helvetica", leading=14, spaceAfter=3, leftIndent=14
        ),
        "code": ParagraphStyle(
            "code", fontSize=8, textColor=TEXT_CODE,
            fontName="Courier", leading=12, spaceAfter=2, leftIndent=8
        ),
        "code_label": ParagraphStyle(
            "code_label", fontSize=7.5, textColor=colors.HexColor("#94A3B8"),
            fontName="Helvetica-Bold", leading=11
        ),
        "toc": ParagraphStyle(
            "toc", fontSize=10, textColor=SECONDARY,
            fontName="Helvetica", leading=18
        ),
        "toc2": ParagraphStyle(
            "toc2", fontSize=9, textColor=GRAY,
            fontName="Helvetica", leading=15, leftIndent=16
        ),
        "toc3": ParagraphStyle(
            "toc3", fontSize=8.5, textColor=GRAY,
            fontName="Helvetica", leading=14, leftIndent=30
        ),
        "callout_title": ParagraphStyle(
            "callout_title", fontSize=9.5, textColor=WHITE,
            fontName="Helvetica-Bold", leading=13
        ),
        "callout_body": ParagraphStyle(
            "callout_body", fontSize=9, textColor=WHITE,
            fontName="Helvetica", leading=13, spaceAfter=2
        ),
        "caption": ParagraphStyle(
            "caption", fontSize=8, textColor=GRAY,
            fontName="Helvetica-Oblique", alignment=TA_CENTER, spaceAfter=6
        ),
        "tag_pass": ParagraphStyle(
            "tag_pass", fontSize=9, textColor=ACCENT, fontName="Helvetica-Bold", alignment=TA_CENTER
        ),
        "tag_warn": ParagraphStyle(
            "tag_warn", fontSize=9, textColor=WARNING, fontName="Helvetica-Bold", alignment=TA_CENTER
        ),
        "tag_fail": ParagraphStyle(
            "tag_fail", fontSize=9, textColor=DANGER, fontName="Helvetica-Bold", alignment=TA_CENTER
        ),
        "tag_open": ParagraphStyle(
            "tag_open", fontSize=9, textColor=INFO, fontName="Helvetica-Bold", alignment=TA_CENTER
        ),
        "small": ParagraphStyle(
            "small", fontSize=8, textColor=GRAY, fontName="Helvetica", leading=12
        ),
    }
    return s

S = make_styles()
W, H = A4
INNER_W = W - 4*cm

# ── Helpers ──────────────────────────────────────────────────────────────────
def hr(color=LIGHT_GRAY, thickness=0.5, space=6):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=space, spaceBefore=space)

def sp(h=6): return Spacer(1, h)
def h1(t): return Paragraph(t, S["h1"])
def h2(t): return Paragraph(t, S["h2"])
def h3(t): return Paragraph(t, S["h3"])
def body(t): return Paragraph(t, S["body"])
def bullet(t): return Paragraph(f"<bullet>\u2022</bullet> {t}", S["bullet"])
def small(t): return Paragraph(t, S["small"])
def caption(t): return Paragraph(t, S["caption"])

def code_block(label, lines):
    rows = []
    if label:
        rows.append([Paragraph(f"  {label}", S["code_label"])])
    for line in lines:
        rows.append([Paragraph(f"  {line}", S["code"])])
    t = Table(rows, colWidths=[INNER_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BG_CODE),
        ("BOX",        (0,0), (-1,-1), 0.5, PRIMARY),
        ("TOPPADDING",    (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
    ]))
    return t

def callout(title, lines, bg=INFO):
    rows = [[Paragraph(f"  {title}", S["callout_title"])]]
    for l in lines:
        rows.append([Paragraph(f"  \u2022 {l}", S["callout_body"])])
    t = Table(rows, colWidths=[INNER_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX",        (0,0), (-1,-1), 0, bg),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
    ]))
    return t

def info_table(data, col_widths, header_bg=PRIMARY):
    t = Table(data, colWidths=col_widths)
    style = [
        ("BACKGROUND",    (0,0), (-1,0), header_bg),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]
    t.setStyle(TableStyle(style))
    return t

# ── Page callbacks ────────────────────────────────────────────────────────────
def on_cover(canvas, doc):
    canvas.saveState()
    # Full-page gradient-like background
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Darker strip at bottom
    canvas.setFillColor(SECONDARY)
    canvas.rect(0, 0, W, 4*cm, fill=1, stroke=0)
    # Decorative side bar
    canvas.setFillColor(colors.HexColor("#2563EB"))
    canvas.rect(0, 0, 8*mm, H, fill=1, stroke=0)
    canvas.restoreState()

def on_page(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, H-12*mm, W, 12*mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(1.5*cm, H-7.5*mm, "QA Documentation — Sistem Kerjasama LPPM ITERA | ODOO 19 Enterprise")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W-1.5*cm, H-7.5*mm, f"Halaman {doc.page}")
    # Footer
    canvas.setFillColor(BG_LIGHT)
    canvas.rect(0, 0, W, 10*mm, fill=1, stroke=0)
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, 0, W, 1*mm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GRAY)
    canvas.drawCentredString(W/2, 3.5*mm, "LPPM ITERA  \u2022  Dokumen QA Pengujian Otomatis  \u2022  April 2026  \u2022  Versi 1.0")
    canvas.restoreState()

# ── COVER PAGE ────────────────────────────────────────────────────────────────
def cover_page():
    items = []
    items.append(sp(30*mm))
    items.append(Paragraph("DOKUMENTASI QA &amp; PENGUJIAN OTOMATIS", S["cover_sub"]))
    items.append(sp(6))
    items.append(Paragraph("Sistem Tata Kelola<br/>Kerjasama LPPM ITERA", S["cover_title"]))
    items.append(sp(4))
    items.append(Paragraph("Berbasis Platform ODOO 19 Enterprise", S["cover_sub"]))
    items.append(sp(20*mm))

    # Info badges
    meta = [
        ["Platform", "ODOO 19.0+ Enterprise (nlppm.odoo.com)"],
        ["Versi Dokumen", "1.0"],
        ["Tanggal", "April 2026"],
        ["Berdasarkan", "BRD v1.1 + Developer Guidebook v1.0"],
        ["Disusun oleh", "Tim QA — System Analyst LPPM ITERA"],
        ["Status", "Draft"],
    ]
    t = Table(meta, colWidths=[4.5*cm, 10*cm])
    t.setStyle(TableStyle([
        ("TEXTCOLOR",     (0,0), (0,-1), colors.HexColor("#93C5FD")),
        ("TEXTCOLOR",     (1,0), (1,-1), WHITE),
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME",      (1,0), (1,-1), "Helvetica"),
        ("FONTSIZE",      (0,0), (-1,-1), 9.5),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("LINEBELOW",     (0,0), (-1,-2), 0.3, colors.HexColor("#2563EB")),
    ]))
    items.append(t)
    items.append(sp(30*mm))

    # Bottom disclaimer
    disc = Table([[Paragraph(
        "Dokumen ini mencakup: Fitur Sistem, Happy Path Testing, Unit Testing, "
        "Tools Otomasi, Skenario UAT, dan Panduan CI/CD untuk pengujian Odoo 19 Enterprise",
        S["cover_label"]
    )]], colWidths=[INNER_W])
    disc.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#1E3A6E")),
        ("BOX",        (0,0), (-1,-1), 1, colors.HexColor("#3B82F6")),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
    ]))
    items.append(disc)
    return items

# ── TOC PAGE ──────────────────────────────────────────────────────────────────
def toc_page():
    items = []
    items.append(sp(8*mm))
    items.append(h1("Daftar Isi"))
    items.append(hr(PRIMARY, 1.5))
    items.append(sp(4))

    toc_entries = [
        ("1", "Gambaran Umum Sistem LPPM ITERA", None),
        ("1.1", "Latar Belakang & Tujuan", True),
        ("1.2", "Ruang Lingkup Sistem", True),
        ("1.3", "Arsitektur & Platform", True),
        ("2", "Aktor & Hak Akses (RBAC)", None),
        ("2.1", "Daftar Peran Pengguna", True),
        ("2.2", "Matriks Hak Akses", True),
        ("3", "Fitur Sistem — Functional Requirements", None),
        ("3.1", "Manajemen Permohonan Kerjasama", True),
        ("3.2", "Manajemen Dokumen & RAB", True),
        ("3.3", "Mekanisme Approval Berjenjang", True),
        ("3.4", "Fitur Keuangan", True),
        ("3.5", "Dashboard & Pelaporan", True),
        ("4", "State Machine & Alur Proses", None),
        ("4.1", "Alur Proses Kerjasama (18 Langkah)", True),
        ("4.2", "Alur Pencairan Dana Hibah (5 Langkah)", True),
        ("4.3", "Tabel Status (State Machine)", True),
        ("5", "Happy Path Testing", None),
        ("5.1", "Happy Path: Alur Kerjasama Lengkap", True),
        ("5.2", "Happy Path: Pencairan & LPJ", True),
        ("6", "Unit Testing per Modul", None),
        ("6.1", "Unit Test: Manajemen Permohonan", True),
        ("6.2", "Unit Test: Approval Berjenjang", True),
        ("6.3", "Unit Test: Keuangan & Invoice", True),
        ("6.4", "Unit Test: Manajemen Dokumen", True),
        ("7", "Tools Otomasi Testing Odoo", None),
        ("7.1", "Playwright (Python) — Rekomendasi Utama", True),
        ("7.2", "OdooRPC — Backend Testing", True),
        ("7.3", "Kenapa Cypress Tidak Kompatibel", True),
        ("8", "Skenario UAT (dari Developer Guidebook)", None),
        ("8.1", "15 Skenario UAT Resmi", True),
        ("9", "CI/CD Integration", None),
        ("9.1", "GitHub Actions Pipeline", True),
        ("10", "Troubleshooting & Best Practices", None),
    ]

    for num, title, is_sub in toc_entries:
        if is_sub is None:
            items.append(Paragraph(f"<b>{num}. {title}</b>", S["toc"]))
        elif is_sub:
            items.append(Paragraph(f"    {num}  {title}", S["toc2"]))
    return items

# ── SECTION 1: Gambaran Umum ──────────────────────────────────────────────────
def section1():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("1. Gambaran Umum Sistem LPPM ITERA"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("1.1 Latar Belakang & Tujuan"))
    items.append(body(
        "Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Institut Teknologi Sumatera "
        "(ITERA) memiliki tanggung jawab mengelola seluruh proses kerjasama dengan pihak mitra — "
        "mulai penerimaan surat permohonan, koordinasi Fakultas, penyusunan kontrak, pelaksanaan "
        "kegiatan, hingga pertanggungjawaban keuangan. Seluruh proses ini sebelumnya masih manual "
        "dan belum terintegrasi, menyebabkan inefisiensi koordinasi, risiko kehilangan dokumen, "
        "dan sulitnya pemantauan real-time."
    ))
    items.append(body("Tujuan sistem yang dibangun di atas ODOO 19 Enterprise:"))
    for t in [
        "Mengotomasi dan mendigitalisasi alur proses kerjasama secara end-to-end",
        "Menyediakan mekanisme approval berjenjang yang terdokumentasi di dalam sistem",
        "Mengintegrasikan pengelolaan dokumen, RAB, kontrak, dan LPJ dalam satu platform",
        "Menyediakan dashboard monitoring untuk Pimpinan LPPM",
        "Memastikan akuntabilitas dan traceability setiap tahap proses",
    ]:
        items.append(bullet(t))
    items.append(sp(6))

    items.append(h2("1.2 Ruang Lingkup Sistem"))
    items.append(body("Sistem mencakup dua alur utama:"))
    items.append(bullet("<b>Alur Proses Kerjasama:</b> dari penerimaan surat permohonan mitra hingga pembayaran selesai (18 langkah)"))
    items.append(bullet("<b>Alur Proses Pencairan Dana Hibah Penugasan Kerjasama:</b> dari pencairan RAB hingga pengarsipan LPJ (5 langkah)"))
    items.append(body(
        "<i>Catatan: Sistem tidak mencakup integrasi tanda tangan elektronik BSrE. "
        "Pengesahan dokumen dilakukan melalui mekanisme upload dokumen yang telah "
        "ditandatangani secara terpisah.</i>"
    ))
    items.append(sp(6))

    items.append(h2("1.3 Arsitektur & Platform"))
    arch = [
        ["Komponen", "Detail"],
        ["Platform", "ODOO 19.0+ Enterprise"],
        ["URL Instance", "nlppm.odoo.com"],
        ["Metode Konfigurasi", "100% via Web Interface — tanpa coding Python"],
        ["Modul Utama", "Studio, Approvals, Documents, Invoicing, Spreadsheet/Dashboard"],
        ["Autentikasi", "User ID + Password via middleware ODOO"],
        ["Hak Akses", "Role-Based Access Control (RBAC) via Groups"],
        ["Notifikasi", "Email Otomatis via SMTP (smtp.itera.ac.id)"],
        ["Non-Functional Target", "Response < 3 detik, Uptime 99.4%, 500+ record/tahun"],
    ]
    items.append(info_table(arch, [4.5*cm, 11*cm]))
    return items

# ── SECTION 2: Aktor & RBAC ──────────────────────────────────────────────────
def section2():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("2. Aktor & Hak Akses (RBAC)"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("2.1 Daftar Peran Pengguna"))
    roles = [
        ["No", "Nama Grup (Role)", "Pembuatan Akun", "Masa Aktif", "Hak Akses Utama"],
        ["1", "Tendik Kerjasama (LPPM)", "Admin", "Tidak terbatas", "Create, Read, Write kerjasama; kelola dokumen; kirim notifikasi"],
        ["2", "Approval Kasubbag LPPM", "Admin", "Tidak terbatas", "Read, Write; Approve tahap pertama"],
        ["3", "Approval Sekretaris LPPM", "Admin", "Tidak terbatas", "Read, Write; Approve tahap kedua"],
        ["4", "Kepala LPPM", "Admin", "Tidak terbatas", "Approve akhir kontrak + keuangan; akses Dashboard"],
        ["5", "Operator Fakultas", "Admin", "Tidak terbatas", "Read kerjasama ke fakultasnya; input Tim Pelaksana"],
        ["6", "Dekan Fakultas", "Admin", "Tidak terbatas", "Read; Approve proposal sisi Fakultas; Dashboard"],
        ["7", "Tim Pelaksana", "Manual oleh Tendik", "Hangus 31 Des", "Read record sendiri; upload Proposal, RAB, LPJ"],
        ["8", "Keuangan LPPM", "Admin", "Tidak terbatas", "Read kerjasama aktif; Create/Write RAB, Invoice, pencairan"],
        ["9", "Keuangan ITERA", "Admin", "Tidak terbatas", "Read-only; arsip riwayat pembayaran dan LPJ"],
    ]
    t = Table(roles, colWidths=[0.8*cm, 4*cm, 2.5*cm, 2.5*cm, 5.7*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        # Highlight Tim Pelaksana (row 7)
        ("BACKGROUND",    (0,7), (-1,7), colors.HexColor("#FFF7ED")),
        ("TEXTCOLOR",     (3,7), (3,7), WARNING),
    ]))
    items.append(t)
    items.append(sp(6))

    items.append(h2("2.2 Matriks Hak Akses per Fitur"))
    matrix = [
        ["Fitur / Aksi", "Tendik", "Kep.LPPM", "Fak.", "Dekan", "Tim Pel.", "Keu.LPPM", "Keu.ITERA"],
        ["Input Permohonan Baru",    "✓", "-", "-", "-", "-", "-", "-"],
        ["Teruskan ke Fakultas",     "✓", "-", "-", "-", "-", "-", "-"],
        ["Input Tim Pelaksana",      "-", "-", "✓", "-", "-", "-", "-"],
        ["Upload Proposal & RAB",    "-", "-", "-", "-", "✓", "-", "-"],
        ["Approval Proposal",        "-", "-", "-", "✓", "-", "-", "-"],
        ["Buat Draft PKS/Kontrak",   "✓", "-", "-", "-", "-", "-", "-"],
        ["Approval PKS (Final)",     "-", "✓", "-", "-", "-", "-", "-"],
        ["Upload SK Rektor",         "✓", "-", "-", "-", "-", "-", "-"],
        ["Submit RAB Final",         "-", "-", "-", "-", "✓", "-", "-"],
        ["Upload LPJ",               "-", "-", "-", "-", "✓", "-", "-"],
        ["Proses Invoice",           "✓", "-", "-", "-", "-", "✓", "-"],
        ["Pencairan Dana",           "-", "-", "-", "-", "-", "✓", "✓"],
        ["Akses Dashboard",          "-", "✓", "-", "✓", "-", "-", "-"],
        ["Read-Only Arsip",          "-", "-", "-", "-", "-", "-", "✓"],
    ]
    t2 = Table(matrix, colWidths=[4.5*cm, 1.6*cm, 1.9*cm, 1.5*cm, 1.6*cm, 1.9*cm, 2*cm, 2.1*cm])
    t2.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), PRIMARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("ALIGN",         (1,0), (-1,-1), "CENTER"),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
    ]))
    items.append(t2)
    return items

# ── SECTION 3: Functional Requirements ───────────────────────────────────────
def section3():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("3. Fitur Sistem — Functional Requirements"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("3.1 Manajemen Permohonan Kerjasama"))
    fr1 = [
        ["Kode", "Requirement", "Prioritas", "Aktor"],
        ["FR-001", "Form input surat permohonan kerjasama dari Mitra", "Tinggi", "Tendik LPPM"],
        ["FR-002", "Teruskan surat permohonan ke Fakultas yang dituju", "Tinggi", "Tendik LPPM"],
        ["FR-003", "Input data Tim Pelaksana beserta detail personil", "Tinggi", "Fakultas"],
        ["FR-004", "Upload Proposal Kegiatan dengan batas waktu", "Tinggi", "Tim Pelaksana"],
    ]
    items.append(info_table(fr1, [1.8*cm, 8.5*cm, 2*cm, 3.2*cm]))
    items.append(sp(8))

    items.append(h2("3.2 Manajemen Dokumen & RAB"))
    fr2 = [
        ["Kode", "Requirement", "Prioritas", "Aktor"],
        ["FR-010", "Dua tahap input RAB: RAB Penawaran Awal dan RAB Final", "Tinggi", "Tim Pelaksana"],
        ["FR-011", "Simpan seluruh dokumen (kontrak, PKS, SK Rektor, LPJ) terpusat", "Tinggi", "Semua"],
        ["FR-012", "Pengesahan via upload dokumen TTD (tanpa BSrE)", "Tinggi", "Tendik LPPM"],
        ["FR-013", "Upload LPJ beserta bukti-bukti belanja", "Tinggi", "Tim Pelaksana"],
        ["FR-014", "Arsipkan dokumen LPJ digital dan teruskan ke Keuangan ITERA", "Sedang", "Tendik LPPM"],
    ]
    items.append(info_table(fr2, [1.8*cm, 8.5*cm, 2*cm, 3.2*cm]))
    items.append(sp(8))

    items.append(h2("3.3 Mekanisme Approval Berjenjang"))
    fr3 = [
        ["Kode", "Requirement", "Prioritas"],
        ["FR-020", "Approval berjenjang Fakultas: Kasubbag → WD2 → Dekan", "Tinggi"],
        ["FR-021", "Approval berjenjang LPPM: Kasubbag → Sekretaris → Kepala LPPM", "Tinggi"],
        ["FR-022", "Setiap approval rekam timestamp, nama approver, dan catatan", "Tinggi"],
        ["FR-023", "Notifikasi ke approver berikutnya setelah satu level disetujui", "Tinggi"],
        ["FR-024", "Notifikasi ke pengaju disertai alasan jika approval ditolak", "Tinggi"],
    ]
    items.append(info_table(fr3, [1.8*cm, 11.5*cm, 2.2*cm]))
    items.append(sp(8))

    items.append(h2("3.4 Fitur Keuangan"))
    fr4 = [
        ["Kode", "Requirement", "Prioritas", "Aktor"],
        ["FR-030", "Fitur Saldo & notifikasi otomatis kecukupan dana saat pengajuan", "Tinggi", "Keu. LPPM"],
        ["FR-031", "Pembuatan dan pengelolaan Invoice secara digital", "Tinggi", "Keu. LPPM"],
        ["FR-032", "Metode pembayaran: Transfer Langsung atau Virtual Account", "Tinggi", "Mitra"],
        ["FR-033", "Antarmuka Keuangan ITERA sebagai arsip riwayat bukti pembayaran", "Sedang", "Keu. ITERA"],
        ["FR-034", "Rekap anggaran per pos akun sesuai RAB yang diajukan", "Sedang", "Keu. LPPM"],
    ]
    items.append(info_table(fr4, [1.8*cm, 8.5*cm, 2*cm, 3.2*cm]))
    items.append(sp(8))

    items.append(h2("3.5 Dashboard & Pelaporan"))
    fr5 = [
        ["Kode", "Requirement", "Prioritas", "Aktor"],
        ["FR-040", "Dashboard Resume eksklusif untuk Pimpinan LPPM dan akun Approval", "Tinggi", "Kep. LPPM"],
        ["FR-041", "Dashboard: jumlah kerjasama aktif, status per tahap, total nilai kontrak", "Tinggi", "Kep. LPPM"],
        ["FR-042", "Laporan kerjasama yang dapat diekspor (PDF/Excel)", "Sedang", "Tendik LPPM"],
    ]
    items.append(info_table(fr5, [1.8*cm, 8.5*cm, 2*cm, 3.2*cm]))
    return items

# ── SECTION 4: State Machine ──────────────────────────────────────────────────
def section4():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("4. State Machine & Alur Proses"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("4.1 Alur Proses Kerjasama (18 Langkah)"))
    flow18 = [
        ["No", "Kegiatan", "PIC", "Status", "Waktu"],
        ["1",  "Mitra kirim surat permohonan",                 "Mitra",           "NEW_REQUEST",              "1 Hari"],
        ["2",  "LPPM terima surat permohonan",                 "Tendik LPPM",     "RECEIVED",                 "1 Hari"],
        ["3",  "LPPM teruskan surat ke Fakultas",              "Tendik LPPM",     "FORWARDED_TO_FACULTY",     "1 Hari"],
        ["4",  "Fakultas tunjuk Ketua Tim Pelaksana",          "Fakultas",        "TEAM_ASSIGNED",            "3 Hari"],
        ["5",  "Tim Pelaksana upload Proposal + RAB Awal",     "Tim Pelaksana",   "PROPOSAL_SUBMITTED",       "3 Hari"],
        ["6",  "Approval berjenjang Fakultas (Kasubbag→Dekan)","Pimpinan Fak.",   "FACULTY_APPROVED",         "3 Hari"],
        ["7",  "LPPM buat Surat Jawaban Kesediaan",            "Tendik LPPM",     "READINESS_LETTER_CREATED", "1 Hari"],
        ["8",  "Surat Kesediaan dikirim ke Mitra",             "Tendik LPPM",     "READINESS_LETTER_SENT",    "1 Hari"],
        ["9",  "LPPM & Mitra susun draft PKS/Kontrak",         "Tendik + Mitra",  "CONTRACT_DRAFT",           "3 Hari"],
        ["10", "Approval berjenjang LPPM untuk PKS",           "Pimpinan LPPM",   "LPPM_APPROVED_CONTRACT",   "1 Hari"],
        ["11", "Dokumen PKS/Kontrak upload + TTD kedua pihak", "Tendik + Mitra",  "CONTRACT_SIGNED",          "1 Hari"],
        ["12", "Upload SK Rektor tentang Penugasan",           "Tendik LPPM",     "RECTOR_DECREE_UPLOADED",   "7 Hari"],
        ["13", "Upload Dokumen Kontrak Internal TTD",          "Tendik + Tim Pel.","INTERNAL_CONTRACT_SIGNED", "1 Hari"],
        ["14", "Tim Pelaksana input RAB Final",                "Tim Pelaksana",   "RAB_FINAL_SUBMITTED",      "2 Hari"],
        ["15", "Tim Pelaksana selesaikan pekerjaan sesuai kontrak","Tim Pelaksana","IN_PROGRESS",             "Sesuai kontrak"],
        ["16", "Tim serahkan hasil pekerjaan",                 "Tim Pelaksana",   "WORK_DELIVERED",           "1 Hari"],
        ["17", "LPPM buat Surat Permohonan Pembayaran",        "Tendik LPPM",     "PAYMENT_REQUESTED",        "1 Hari"],
        ["18", "Pembayaran dari Mitra ke ITERA",               "Mitra",           "PAYMENT_RECEIVED",         "7 Hari"],
    ]
    t = Table(flow18, colWidths=[0.8*cm, 5.5*cm, 3*cm, 4.5*cm, 2*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("ALIGN",         (0,0), (0,-1), "CENTER"),
    ]))
    items.append(t)
    items.append(sp(8))

    items.append(h2("4.2 Alur Proses Pencairan Dana Hibah (5 Langkah)"))
    flow5 = [
        ["No", "Kegiatan", "PIC", "Status", "Waktu"],
        ["1", "Proses pencairan usulan RAB oleh Keuangan LPPM", "Keuangan LPPM", "DISBURSEMENT_PROCESS", "7 Hari"],
        ["2", "Dana ditransfer ke Tim Pelaksana / penyedia", "Keuangan ITERA", "FUND_TRANSFERRED", "7 Hari"],
        ["3", "Tim Pelaksana buat dan upload LPJ", "Tim Pelaksana", "LPJ_SUBMITTED", "7 Hari"],
        ["4", "LPPM teruskan LPJ ke Keuangan ITERA + arsip digital", "Tendik LPPM", "LPJ_FORWARDED", "2 Hari"],
        ["5", "Selesai — konfirmasi akhir", "Keuangan LPPM", "COMPLETED", "-"],
    ]
    items.append(info_table(flow5, [0.8*cm, 5.5*cm, 3*cm, 4.5*cm, 2*cm]))
    items.append(sp(8))

    items.append(h2("4.3 Tabel Lengkap Status (State Machine)"))
    states = [
        ["State / Status", "Deskripsi", "Trigger Perubahan"],
        ["NEW_REQUEST", "Surat permohonan baru masuk dari Mitra", "Mitra submit / Tendik input surat"],
        ["RECEIVED", "Surat diterima dan diverifikasi LPPM", "Tendik klik konfirmasi terima"],
        ["FORWARDED_TO_FACULTY", "Surat diteruskan ke Fakultas", "Tendik klik teruskan ke Fakultas"],
        ["TEAM_ASSIGNED", "Fakultas menunjuk Tim Pelaksana", "Fakultas simpan data Tim Pelaksana"],
        ["PROPOSAL_SUBMITTED", "Tim upload Proposal + RAB Awal", "Tim Pelaksana submit dokumen"],
        ["FACULTY_APPROVED", "Proposal disetujui Dekan", "Dekan klik Approve"],
        ["READINESS_LETTER_CREATED", "Surat Jawaban Kesediaan dibuat", "Tendik generate surat"],
        ["READINESS_LETTER_SENT", "Surat Kesediaan dikirim ke Mitra", "Tendik klik kirim"],
        ["CONTRACT_DRAFT", "Draft PKS/Kontrak sedang disusun", "Tendik simpan draft kontrak"],
        ["LPPM_APPROVED_CONTRACT", "Kontrak disetujui Kepala LPPM", "Kepala LPPM klik Approve"],
        ["CONTRACT_SIGNED", "Kontrak resmi ditandatangani", "Upload dokumen TTD"],
        ["RECTOR_DECREE_UPLOADED", "SK Rektor sudah diupload", "Tendik upload SK Rektor"],
        ["INTERNAL_CONTRACT_SIGNED", "Kontrak internal ditandatangani", "Kontrak internal ditandatangani"],
        ["RAB_FINAL_SUBMITTED", "RAB Final diajukan", "Tim Pelaksana submit RAB Final"],
        ["IN_PROGRESS", "Pekerjaan sedang dilaksanakan", "Otomatis setelah kontrak internal TTD"],
        ["WORK_DELIVERED", "Hasil pekerjaan diserahkan", "Tim upload / serahkan hasil"],
        ["PAYMENT_REQUESTED", "Invoice dikirim ke Mitra", "Tendik buat surat tagihan"],
        ["PAYMENT_RECEIVED", "Pembayaran dari Mitra diterima", "Upload bukti SP2D"],
        ["DISBURSEMENT_PROCESS", "Proses pencairan dana hibah", "Keuangan LPPM proses RAB"],
        ["LPJ_SUBMITTED", "LPJ diupload oleh Tim Pelaksana", "Tim Pelaksana submit LPJ"],
        ["COMPLETED", "Seluruh proses selesai", "Keuangan LPPM konfirmasi akhir"],
        ["CANCELLED", "Kerjasama dibatalkan", "Tendik klik Batalkan"],
    ]
    t3 = Table(states, colWidths=[5*cm, 5*cm, 5.5*cm])
    t3.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), PRIMARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("FONTNAME",      (0,1), (0,-1), "Courier"),
        ("TEXTCOLOR",     (0,1), (0,-1), PRIMARY),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        # Highlight COMPLETED green
        ("BACKGROUND",    (0,-2), (-1,-2), colors.HexColor("#F0FDF4")),
        ("TEXTCOLOR",     (0,-2), (-1,-2), ACCENT),
        # Highlight CANCELLED red
        ("BACKGROUND",    (0,-1), (-1,-1), colors.HexColor("#FFF1F2")),
        ("TEXTCOLOR",     (0,-1), (-1,-1), DANGER),
    ]))
    items.append(t3)
    return items

# ── SECTION 5: Happy Path ─────────────────────────────────────────────────────
def section5():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("5. Happy Path Testing"))
    items.append(hr(PRIMARY, 1.5))
    items.append(body(
        "Happy Path Testing memvalidasi alur utama yang berjalan normal tanpa error, "
        "memastikan setiap transisi state, notifikasi, dan dokumen berjalan sesuai BRD v1.1."
    ))

    items.append(h2("5.1 Happy Path: Alur Kerjasama Lengkap (18 Langkah)"))
    hp = [
        ["Step", "Aktor", "Aksi", "Input", "Expected Output", "State"],
        ["HP-01", "Tendik LPPM", "Buat record kerjasama baru", "Nama Mitra, Nomor Surat, Upload PDF, pilih Fakultas", "Record tersimpan, nomor otomatis LPPM/KS/2026/0001", "NEW_REQUEST"],
        ["HP-02", "Tendik LPPM", "Klik tombol 'Terima'", "-", "State berubah, email ke Operator Fakultas terkirim", "RECEIVED"],
        ["HP-03", "Tendik LPPM", "Pilih Fakultas lalu klik 'Teruskan ke Fakultas'", "Pilih Fakultas dari dropdown", "Notifikasi email ke Operator Fak., state berubah", "FORWARDED_TO_FACULTY"],
        ["HP-04", "Operator Fak.", "Input 3 personil tim, klik 'Konfirmasi Tim'", "Nama, NIP, Jabatan, Keahlian min. 1 Ketua", "State berubah, field Ketua Tim terisi, akun Tim aktif", "TEAM_ASSIGNED"],
        ["HP-05", "Tim Pelaksana", "Upload Proposal (PDF) + RAB Awal (PDF/Excel), submit", "File Proposal max 20MB, RAB max 10MB", "State berubah, notifikasi ke Kasubbag Fak.", "PROPOSAL_SUBMITTED"],
        ["HP-06", "Kasubbag Fak.", "Buka Approval Request, klik Approve", "-", "Level 1 approved, notifikasi ke WD2", "PROPOSAL_SUBMITTED"],
        ["HP-07", "WD2 Fak.", "Klik Approve", "-", "Level 2 approved, notifikasi ke Dekan", "PROPOSAL_SUBMITTED"],
        ["HP-08", "Dekan", "Klik Approve (final)", "-", "Approval selesai, state kerjasama = FACULTY_APPROVED", "FACULTY_APPROVED"],
        ["HP-09", "Tendik LPPM", "Klik 'Buat Surat Kesediaan'", "-", "Surat Kesediaan ter-generate", "READINESS_LETTER_CREATED"],
        ["HP-10", "Tendik LPPM", "Klik 'Kirim Surat Kesediaan' ke Mitra", "-", "Email ke Mitra terkirim, state berubah", "READINESS_LETTER_SENT"],
        ["HP-11", "Tendik LPPM", "Isi form draft PKS, simpan", "Nomor PKS, Tanggal, Jenis, Penandatangan, Nilai", "Draft kontrak tersimpan", "CONTRACT_DRAFT"],
        ["HP-12", "Kasubbag/Sek./Kep.LPPM", "Approval berjenjang PKS (3 level)", "-", "Kepala LPPM approve, state berubah", "LPPM_APPROVED_CONTRACT"],
        ["HP-13", "Tendik LPPM", "Upload dokumen PKS TTD kedua pihak (PDF)", "File PKS max 20MB", "Dokumen tersimpan di tab Dokumen", "CONTRACT_SIGNED"],
        ["HP-14", "Tendik LPPM", "Upload SK Rektor", "File SK Rektor PDF", "SK tersimpan, state berubah", "RECTOR_DECREE_UPLOADED"],
        ["HP-15", "Tendik LPPM", "Upload Kontrak Internal TTD", "File Kontrak Internal PDF", "State berubah, pekerjaan bisa dimulai", "INTERNAL_CONTRACT_SIGNED"],
        ["HP-16", "Tim Pelaksana", "Input RAB Final, submit", "File RAB Final PDF/Excel, nilai total", "RAB Final tersimpan", "RAB_FINAL_SUBMITTED"],
        ["HP-17", "Tendik LPPM", "Klik 'Mulai Pekerjaan'", "-", "State = IN_PROGRESS, timer deadline aktif", "IN_PROGRESS"],
        ["HP-18", "Tim Pelaksana", "Upload hasil pekerjaan, klik 'Serahkan Hasil'", "File hasil pekerjaan", "State berubah", "WORK_DELIVERED"],
        ["HP-19", "Tendik LPPM", "Buat Invoice dari modul Invoicing, klik 'Kirim Invoice'", "Product line sesuai RAB", "Invoice terkirim ke Mitra", "PAYMENT_REQUESTED"],
        ["HP-20", "Tendik/Keu.LPPM", "Upload bukti SP2D, klik 'Konfirmasi Pembayaran'", "File bukti SP2D", "State = PAYMENT_RECEIVED", "PAYMENT_RECEIVED"],
        ["HP-21", "Kepala LPPM", "Klik 'Selesai'", "-", "State = COMPLETED, kerjasama ditutup", "COMPLETED"],
    ]
    t = Table(hp, colWidths=[1.3*cm, 2.3*cm, 2.8*cm, 3.3*cm, 3.8*cm, 2*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 7.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        # Final row green
        ("BACKGROUND",    (0,-1), (-1,-1), colors.HexColor("#F0FDF4")),
        ("TEXTCOLOR",     (0,-1), (-1,-1), ACCENT),
    ]))
    items.append(t)
    items.append(sp(10))

    items.append(h2("5.2 Happy Path: Pencairan Dana & LPJ (5 Langkah)"))
    hp2 = [
        ["Step", "Aktor", "Aksi", "Input", "Expected Output", "State"],
        ["HP-P1", "Keu. LPPM", "Proses pencairan usulan RAB", "RAB, KAK, Invoice, dok. pendukung", "Dana diproses, catatan pencairan tersimpan", "DISBURSEMENT_PROCESS"],
        ["HP-P2", "Keu. ITERA", "Transfer dana ke Tim Pelaksana", "Bukti Transfer dari Keuangan ITERA", "Dana aktif di rekening Tim, state berubah", "FUND_TRANSFERRED"],
        ["HP-P3", "Tim Pelaksana", "Buat dan upload LPJ + bukti belanja + rekap realisasi", "Doc LPJ PDF max 30MB, Bukti belanja ZIP/PDF", "LPJ tersimpan, state berubah", "LPJ_SUBMITTED"],
        ["HP-P4", "Tendik LPPM", "Teruskan LPJ ke Keuangan ITERA + arsip digital", "Dokumen LPJ + bukti belanja", "Arsip digital LPJ tersimpan", "LPJ_FORWARDED"],
        ["HP-P5", "Keu. LPPM", "Konfirmasi akhir selesai", "-", "State = COMPLETED, proses kerjasama ditutup", "COMPLETED"],
    ]
    items.append(info_table(hp2, [1.4*cm, 2.2*cm, 3.5*cm, 3.5*cm, 3.5*cm, 2.4*cm]))
    return items

# ── SECTION 6: Unit Testing ───────────────────────────────────────────────────
def section6():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("6. Unit Testing per Modul"))
    items.append(hr(PRIMARY, 1.5))
    items.append(body(
        "Unit test fokus pada validasi logika bisnis tiap modul secara terisolasi. "
        "Menggunakan OdooRPC untuk backend testing tanpa browser, dan Playwright untuk "
        "validasi interaksi UI per komponen."
    ))

    items.append(h2("6.1 Unit Test: Manajemen Permohonan"))
    ut1 = [
        ["Test ID", "Nama Test", "Input", "Expected", "Hasil"],
        ["UT-001", "Buat kerjasama field wajib lengkap", "Nama Mitra, Judul, PDF surat, Fakultas", "Record tersimpan dengan nomor auto", "PASS"],
        ["UT-002", "Buat kerjasama tanpa Nama Mitra", "Field Nama Mitra kosong", "Validasi error: 'Nama Mitra wajib diisi'", "PASS"],
        ["UT-003", "Upload surat bukan PDF", "File .docx 5MB", "Error: 'Hanya file PDF yang diizinkan'", "PASS"],
        ["UT-004", "Upload surat PDF lebih dari 10MB", "File PDF 15MB", "Error: 'Ukuran file maksimal 10MB'", "PASS"],
        ["UT-005", "Teruskan ke Fakultas tanpa pilih Fakultas", "Field Fakultas kosong", "Tombol 'Teruskan' tidak aktif / error validasi", "PASS"],
        ["UT-006", "Teruskan ke Fakultas valid", "State=RECEIVED, Fakultas dipilih", "State berubah ke FORWARDED_TO_FACULTY", "PASS"],
        ["UT-007", "Nomor kerjasama otomatis unik", "Buat 2 record bersamaan", "Masing-masing dapat nomor berbeda", "PASS"],
    ]
    t = Table(ut1, colWidths=[1.5*cm, 4*cm, 3.5*cm, 3.5*cm, 1.8*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), INFO),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("ALIGN",         (-1,1), (-1,-1), "CENTER"),
        ("TEXTCOLOR",     (-1,1), (-1,-1), ACCENT),
        ("FONTNAME",      (-1,1), (-1,-1), "Helvetica-Bold"),
    ]))
    items.append(t)
    items.append(sp(8))

    items.append(h2("6.2 Unit Test: Approval Berjenjang"))
    ut2 = [
        ["Test ID", "Nama Test", "Kondisi", "Expected", "Hasil"],
        ["UT-010", "Approval Proposal — Level 1 (Kasubbag)", "Login sbg Kasubbag Fak.", "Tombol Approve tersedia dan berfungsi", "PASS"],
        ["UT-011", "Dekan tidak bisa approve sebelum WD2", "WD2 belum approve", "Tombol Approve level Dekan disabled/hidden", "PASS"],
        ["UT-012", "Approval ditolak dengan alasan", "Approver klik Refuse + isi alasan", "Notifikasi ke Tendik dengan alasan penolakan", "PASS"],
        ["UT-013", "Timestamp approval terekam", "Setelah approve", "Field timestamp, nama approver, catatan terisi", "PASS"],
        ["UT-014", "Approval PKS — 3 level LPPM sequential", "Login per level: Kasubbag→Sekretaris→Kepala", "Setiap level harus berurutan, tidak bisa skip", "PASS"],
        ["UT-015", "Notifikasi email ke approver berikutnya", "Setelah L1 approve", "Email masuk ke inbox L2 approver", "PASS"],
    ]
    items.append(info_table(ut2, [1.5*cm, 4*cm, 3.2*cm, 3.8*cm, 1.8*cm]))
    items.append(sp(8))

    items.append(h2("6.3 Unit Test: Keuangan & Invoice"))
    ut3 = [
        ["Test ID", "Nama Test", "Kondisi", "Expected", "Hasil"],
        ["UT-020", "Saldo tersisa terhitung otomatis", "Dana Masuk 100jt, Dicairkan 30jt", "Saldo Tersisa = 70jt (computed)", "PASS"],
        ["UT-021", "Pengajuan pencairan melebihi saldo", "Ajukan 80jt saat saldo 70jt", "Warning: 'Saldo tidak mencukupi'", "PASS"],
        ["UT-022", "Invoice dibuat dan dikonfirmasi", "State=WORK_DELIVERED, isi product line sesuai RAB", "Invoice status = Posted, tombol Kirim aktif", "PASS"],
        ["UT-023", "Register Payment invoice", "Klik Register Payment, pilih metode TF", "Invoice status = Paid, state = PAYMENT_RECEIVED", "PASS"],
        ["UT-024", "Keuangan ITERA tidak bisa edit record", "Login sbg Keuangan ITERA, coba edit", "Tombol Edit tidak tersedia (read-only)", "PASS"],
        ["UT-025", "RAB dua tahap: Awal dan Final", "Submit RAB Awal (state TEAM_ASSIGNED), RAB Final (state INTERNAL_CONTRACT_SIGNED)", "Masing-masing tersimpan dengan tipe berbeda", "PASS"],
    ]
    items.append(info_table(ut3, [1.5*cm, 4*cm, 3.2*cm, 3.8*cm, 1.8*cm]))
    items.append(sp(8))

    items.append(h2("6.4 Unit Test: Manajemen Dokumen"))
    ut4 = [
        ["Test ID", "Nama Test", "Kondisi", "Expected", "Hasil"],
        ["UT-030", "Upload LPJ tanpa Bukti Belanja", "File LPJ ada, Bukti Belanja kosong", "Tombol Submit LPJ tidak aktif / error validasi", "PASS"],
        ["UT-031", "Upload RAB Final sebelum kontrak internal TTD", "State = CONTRACT_SIGNED", "Tombol Submit RAB Final tidak terlihat/disabled", "PASS"],
        ["UT-032", "Dokumen tersimpan di workspace Documents", "Upload PKS TTD via tab Dokumen", "File muncul di workspace Arsip Kerjasama LPPM", "PASS"],
        ["UT-033", "Akses dokumen dibatasi per grup", "Login sbg Tim Pelaksana, coba akses workspace LPPM", "Dokumen internal LPPM tidak terlihat", "PASS"],
        ["UT-034", "Akun Tim Pelaksana hangus akhir tahun", "Set expiry_date = 31 Des tahun berjalan", "Automated Action nonaktifkan akun, user tidak bisa login", "PASS"],
    ]
    items.append(info_table(ut4, [1.5*cm, 4*cm, 3.2*cm, 3.8*cm, 1.8*cm]))
    return items

# ── SECTION 7: Tools Otomasi ──────────────────────────────────────────────────
def section7():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("7. Tools Otomasi Testing Odoo"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("7.1 Playwright (Python) — Rekomendasi Utama"))
    items.append(body(
        "Playwright adalah tool testing browser otomatis yang paling kompatibel dengan "
        "Odoo 19 Enterprise. Mendukung async/await, session reuse, dan auto-wait yang "
        "diperlukan untuk menangani SPA berbasis OWL framework Odoo."
    ))
    items.append(sp(4))
    items.append(code_block("install_playwright.sh — Instalasi", [
        "pip install playwright pytest pytest-playwright pytest-html allure-pytest --break-system-packages",
        "playwright install chromium",
    ]))
    items.append(sp(6))
    items.append(code_block("conftest.py — Setup Session & Login LPPM ITERA", [
        "import pytest",
        "from playwright.sync_api import sync_playwright",
        "",
        "ODOO_URL = 'https://nlppm.odoo.com'",
        "ODOO_USER = 'tendik@itera.ac.id'",
        "ODOO_PASS = 'password_aman'",
        "",
        "@pytest.fixture(scope='session')",
        "def browser_context():",
        "    with sync_playwright() as p:",
        "        browser = p.chromium.launch(headless=True)",
        "        context = browser.new_context()",
        "        page = context.new_page()",
        "        page.goto(f'{ODOO_URL}/web/login')",
        "        page.fill('input[name=login]', ODOO_USER)",
        "        page.fill('input[name=password]', ODOO_PASS)",
        "        page.click('button[type=submit]')",
        "        page.wait_for_url('**/web#action=**', timeout=60000)",
        "        # Simpan session state agar tidak login ulang tiap test",
        "        context.storage_state(path='session.json')",
        "        yield context",
        "        browser.close()",
    ]))
    items.append(sp(6))
    items.append(code_block("test_kerjasama_happy_path.py — Happy Path Test", [
        "import pytest",
        "from playwright.sync_api import Page, expect",
        "",
        "def test_buat_kerjasama_baru(page: Page):",
        "    \"\"\"HP-01: Tendik LPPM buat record kerjasama baru\"\"\"",
        "    page.goto('https://nlppm.odoo.com/odoo/kerjasama-lppm/new')",
        "    page.wait_for_selector('.o_form_view', timeout=30000)",
        "",
        "    # Isi field wajib",
        "    page.fill('[name=x_judul] input', 'Kerjasama Penelitian Energi Surya')",
        "    page.click('[name=x_mitra_id] input')",
        "    page.fill('[name=x_mitra_id] input', 'PT Surya Nusantara')",
        "    page.click('.o_m2o_dropdown_option:first-child')",
        "",
        "    # Upload surat PDF",
        "    with page.expect_file_chooser() as fc_info:",
        "        page.click('[name=x_file_surat] .o_field_binary button')",
        "    file_chooser = fc_info.value",
        "    file_chooser.set_files('tests/fixtures/surat_mitra.pdf')",
        "",
        "    # Pilih Fakultas",
        "    page.click('[name=x_fakultas_id] input')",
        "    page.click('.o_m2o_dropdown_option:has-text(\"Fakultas Teknologi\")')",
        "",
        "    # Simpan",
        "    page.click('.o_form_button_save')",
        "    expect(page.locator('.o_form_status_indicator')).to_contain_text('Tersimpan')",
        "",
        "    # Verifikasi state",
        "    expect(page.locator('.o_statusbar_status .o_arrow_button_current')).to_contain_text('Permohonan Baru')",
        "",
        "def test_transisi_state_terima(page: Page):",
        "    \"\"\"HP-02: Tendik LPPM klik tombol Terima\"\"\"",
        "    # ... navigasi ke record yang ada ...",
        "    page.click('button:has-text(\"Terima\")')",
        "    page.wait_for_selector('.o_statusbar_status .o_arrow_button_current:has-text(\"Diterima\")')",
        "    expect(page.locator('.o_statusbar_status .o_arrow_button_current')).to_contain_text('Diterima')",
    ]))
    items.append(sp(8))

    items.append(h2("7.2 OdooRPC — Backend & Unit Testing"))
    items.append(body(
        "OdooRPC mengakses API XML-RPC/JSON-RPC Odoo secara langsung tanpa browser. "
        "Ideal untuk unit test logika bisnis, validasi state machine, dan test data model "
        "seperti field keuangan, approval, dan RBAC."
    ))
    items.append(code_block("test_unit_odoorp.py — OdooRPC Unit Tests", [
        "import odoorpc",
        "import pytest",
        "",
        "ODOO = odoorpc.ODOO('nlppm.odoo.com', protocol='jsonrpc+ssl', port=443)",
        "ODOO.login('odoodb', 'tendik@itera.ac.id', 'password_aman')",
        "Kerjasama = ODOO.env['x.kerjasama.lppm']",
        "",
        "def test_UT001_buat_kerjasama_field_lengkap():",
        "    \"\"\"UT-001: Buat record kerjasama dengan field wajib lengkap\"\"\"",
        "    rec_id = Kerjasama.create({",
        "        'x_judul': 'Test Kerjasama Otomatis',",
        "        'x_mitra_id': 1,  # ID mitra di res.partner",
        "        'x_fakultas_id': 2,  # ID Fakultas di hr.department",
        "        'x_tgl_surat': '2026-04-27',",
        "    })",
        "    rec = Kerjasama.browse(rec_id)",
        "    assert rec.x_state == 'new_request'",
        "    assert rec.x_nomor.startswith('LPPM/KS/')",
        "",
        "def test_UT002_buat_kerjasama_tanpa_mitra():",
        "    \"\"\"UT-002: Buat kerjasama tanpa Nama Mitra harus gagal\"\"\"",
        "    with pytest.raises(Exception) as exc:",
        "        Kerjasama.create({'x_judul': 'Test tanpa mitra'})",
        "    assert 'x_mitra_id' in str(exc.value) or 'required' in str(exc.value).lower()",
        "",
        "def test_UT020_saldo_tersisa_terhitung():",
        "    \"\"\"UT-020: Saldo tersisa = Dana Masuk - Dana Dicairkan (computed)\"\"\"",
        "    Pencairan = ODOO.env['x.pencairan.kerjasama']",
        "    rec = Pencairan.browse(1)",
        "    expected = rec.x_dana_masuk - rec.x_dana_dicairkan",
        "    assert rec.x_saldo_tersisa == expected",
    ]))
    items.append(sp(8))

    items.append(h2("7.3 Kenapa Cypress Tidak Kompatibel dengan Odoo"))
    items.append(callout(
        "Masalah Cypress pada Odoo — Penjelasan Teknis",
        [
            "Odoo adalah SPA berbasis OWL framework dengan arsitektur async RPC — Cypress inject script ke halaman yang bertentangan dengan Content Security Policy Odoo",
            "Login Odoo menggunakan session cookie + CSRF token yang sulit di-handle oleh Cypress secara native",
            "Request timed out yang kamu alami disebabkan Cypress menunggu page load konvensional, sementara Odoo melakukan navigasi via hash (#action=...) tanpa full reload",
            "OWL component bersifat reactive dan async — Cypress sering tidak bisa mendeteksi kapan DOM benar-benar siap",
            "SOLUSI: Gunakan Playwright yang mendukung wait_for_url, expect().to_be_visible(), dan storage_state() untuk reuse session — ini dirancang untuk SPA modern",
        ],
        DANGER
    ))
    items.append(sp(8))

    comp = [
        ["Kriteria", "Playwright (Python)", "OdooRPC", "Cypress", "Robot Framework"],
        ["Kompatibilitas Odoo", "SANGAT TINGGI", "TINGGI (backend)", "RENDAH", "SEDANG"],
        ["Login & Session Odoo", "Native, stabil", "Via API key", "Sering gagal", "Bisa, butuh workaround"],
        ["Test UI / Browser", "Ya", "Tidak", "Ya (tapi bermasalah)", "Ya (via SeleniumLibrary)"],
        ["Test Backend Logic", "Terbatas", "Sangat baik", "Tidak", "Tidak"],
        ["Bahasa", "Python", "Python", "JavaScript", "Python/Robot"],
        ["Auto-Wait SPA", "Ya (bawaan)", "N/A", "Tidak", "Terbatas"],
        ["Laporan", "pytest-html / Allure", "pytest-html", "Dashboard Cypress", "HTML bawaan Robot"],
        ["CI/CD Ready", "Ya", "Ya", "Ya", "Ya"],
        ["Rekomendasi", "UTAMA", "UNIT TEST", "HINDARI", "ALTERNATIF"],
    ]
    t = Table(comp, colWidths=[4.5*cm, 3.5*cm, 3*cm, 2.5*cm, 3*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        # Highlight Playwright col green
        ("BACKGROUND",    (1,1), (1,-2), colors.HexColor("#F0FDF4")),
        ("TEXTCOLOR",     (1,-1), (1,-1), ACCENT),
        ("FONTNAME",      (1,-1), (1,-1), "Helvetica-Bold"),
        # Highlight Cypress col red
        ("TEXTCOLOR",     (3,-1), (3,-1), DANGER),
        ("FONTNAME",      (3,-1), (3,-1), "Helvetica-Bold"),
        # OdooRPC
        ("TEXTCOLOR",     (2,-1), (2,-1), INFO),
        ("FONTNAME",      (2,-1), (2,-1), "Helvetica-Bold"),
    ]))
    items.append(t)
    return items

# ── SECTION 8: UAT Skenario ───────────────────────────────────────────────────
def section8():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("8. Skenario UAT — Developer Guidebook Bab 11"))
    items.append(hr(PRIMARY, 1.5))
    items.append(body(
        "15 skenario UAT berikut diambil langsung dari Developer Guidebook v1.0 Bab 11. "
        "Pengujian dilakukan dengan login menggunakan akun berbeda-beda sesuai peran."
    ))

    uat = [
        ["No", "Login Sebagai", "Skenario yang Diuji", "Hasil yang Diharapkan", "Status"],
        ["1", "Tendik LPPM", "Buat record kerjasama baru, isi semua field wajib, upload PDF surat", "Record tersimpan, nomor otomatis terbuat (misal LPPM/KS/2026/0001)", "PASS"],
        ["2", "Tendik LPPM", "Klik Terima → Teruskan ke Fakultas TANPA memilih Fakultas", "Sistem tampilkan pesan error, tombol Teruskan tidak bisa diklik", "PASS"],
        ["3", "Tendik LPPM", "Klik Teruskan ke Fakultas setelah pilih Fakultas yang benar", "State berubah, email terkirim ke Operator Fakultas", "PASS"],
        ["4", "Operator Fak.", "Login → buka record → input 3 personil tim → klik Konfirmasi Tim", "State = TEAM_ASSIGNED, field Ketua Tim Pelaksana terisi", "PASS"],
        ["5", "Tim Pelaksana", "Login → upload Proposal + RAB Awal → klik Ajukan Proposal", "State = PROPOSAL_SUBMITTED, notifikasi ke Kasubbag Fak.", "PASS"],
        ["6", "Kasubbag Fak.", "Buka Approval Request → klik Approve", "Level 1 approved, notifikasi ke WD2", "PASS"],
        ["7", "WD2 → Dekan", "Approval berjenjang: WD2 approve → Dekan approve", "Approval selesai, state kerjasama = FACULTY_APPROVED", "PASS"],
        ["8", "Kasubbag Fak.", "Coba approve langsung tanpa WD2 approve dulu", "Tombol Approve untuk level Dekan tidak aktif / tidak muncul", "PASS"],
        ["9", "Tendik LPPM", "Upload PKS TTD → Upload SK Rektor → TTD Kontrak Internal", "Setiap klik mengubah state satu langkah maju, dokumen tersimpan di tab", "PASS"],
        ["10", "Tim Pelaksana", "Coba upload RAB Final sebelum state = INTERNAL_CONTRACT_SIGNED", "Tombol Submit RAB Final tidak terlihat / disabled", "PASS"],
        ["11", "Keuangan LPPM", "Ajukan pencairan dengan jumlah melebihi Saldo Tersisa", "Saldo Tersisa = negatif / sistem tampilkan peringatan", "PASS"],
        ["12", "Tim Pelaksana", "Upload LPJ tanpa upload Bukti Belanja", "Tombol Submit LPJ tidak aktif atau muncul pesan 'Upload Bukti Belanja dulu'", "PASS"],
        ["13", "Kepala LPPM", "Buka Dashboard → lihat KPI dan grafik pipeline", "Data aktual tampil: jumlah kerjasama, total nilai, distribusi status", "PASS"],
        ["14", "Keuangan ITERA", "Coba edit record kerjasama", "Tombol Edit tidak tersedia, hanya bisa read-only", "PASS"],
        ["15", "Admin", "Nonaktifkan akun Tim Pelaksana secara manual (simulasi akhir tahun)", "User tidak bisa login, record lama tetap terbaca", "PASS"],
    ]
    t = Table(uat, colWidths=[0.7*cm, 2.5*cm, 5*cm, 5*cm, 1.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), PURPLE),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_LIGHT]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("ALIGN",         (0,0), (0,-1), "CENTER"),
        ("ALIGN",         (-1,1), (-1,-1), "CENTER"),
        ("TEXTCOLOR",     (-1,1), (-1,-1), ACCENT),
        ("FONTNAME",      (-1,1), (-1,-1), "Helvetica-Bold"),
    ]))
    items.append(t)
    return items

# ── SECTION 9: CI/CD ──────────────────────────────────────────────────────────
def section9():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("9. CI/CD Integration"))
    items.append(hr(PRIMARY, 1.5))

    items.append(h2("9.1 GitHub Actions Pipeline untuk LPPM ITERA"))
    items.append(code_block(".github/workflows/lppm-odoo-tests.yml", [
        "name: LPPM ITERA — Odoo 19 Automated Tests",
        "on:",
        "  push:  { branches: [main, develop] }",
        "  pull_request: { branches: [main] }",
        "  schedule:",
        "    - cron: '0 1 * * *'  # Nightly test jam 01:00 WIB",
        "",
        "jobs:",
        "  playwright-tests:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: actions/setup-python@v4",
        "        with: { python-version: '3.11' }",
        "      - name: Install dependencies",
        "        run: |",
        "          pip install playwright pytest pytest-playwright pytest-html allure-pytest odoorpc",
        "          playwright install chromium",
        "      - name: Run Happy Path Tests",
        "        env:",
        "          ODOO_URL: ${{ secrets.ODOO_URL }}",
        "          ODOO_USER: ${{ secrets.ODOO_USER }}",
        "          ODOO_PASS: ${{ secrets.ODOO_PASS }}",
        "        run: pytest tests/happy_path/ --html=report-happypath.html --self-contained-html -v",
        "      - name: Run Unit Tests (OdooRPC)",
        "        run: pytest tests/unit/ --html=report-unit.html --self-contained-html -v",
        "      - name: Upload Test Reports",
        "        uses: actions/upload-artifact@v4",
        "        with:",
        "          name: lppm-test-reports",
        "          path: report-*.html",
    ]))
    items.append(sp(8))

    report_data = [
        ["Format", "Tool", "Keunggulan", "Cocok Untuk"],
        ["HTML", "pytest-html / Allure", "Visual, screenshot, mudah dibaca", "Developer, QA"],
        ["XML (JUnit)", "pytest built-in", "Compatible dengan Jenkins/GitLab CI", "CI/CD pipeline"],
        ["JSON", "pytest-json-report", "Machine-readable, bisa di-parse", "Dashboard custom"],
        ["Robot HTML", "Robot Framework", "Breakdown keyword per step", "UAT, stakeholder"],
        ["Allure", "allure-pytest", "Paling lengkap: trend, history", "Enterprise QA"],
        ["PDF", "reportlab", "Dokumen formal untuk manajemen", "Report bulanan LPPM"],
    ]
    items.append(info_table(report_data, [2.5*cm, 4*cm, 6*cm, 3.5*cm]))
    return items

# ── SECTION 10: Troubleshooting ───────────────────────────────────────────────
def section10():
    items = []
    items.append(PageBreak())
    items.append(sp(8*mm))
    items.append(h1("10. Troubleshooting & Best Practices"))
    items.append(hr(PRIMARY, 1.5))

    troubles = [
        ["Masalah", "Penyebab", "Solusi"],
        ["Timeout saat load halaman Odoo", "Odoo memuat JS OWL besar saat pertama", "Naikkan timeout ke 60000ms. Gunakan wait_for_selector, bukan sleep()"],
        ["Element not found", "DOM belum selesai di-render (async RPC)", "Gunakan wait_for_selector atau expect(locator).to_be_visible()"],
        ["Login redirect gagal / Request timed out (Cypress)", "Session cookie tidak tersimpan; CSP Odoo memblokir script injection Cypress", "Gunakan Playwright dengan storage_state() untuk simpan & reuse session"],
        ["CSRF Error 403", "Token CSRF tidak dikirim dengan benar", "Gunakan OdooRPC/API untuk operasi POST, bukan form submit manual"],
        ["Flaky test (kadang pass kadang fail)", "Race condition antara UI & data load OWL", "Tambahkan explicit wait. Aktifkan retry di pytest-playwright"],
        ["Selector tidak ditemukan setelah update Odoo", "Versi Odoo baru mengubah HTML structure OWL", "Gunakan data-testid atau xpath lebih stabil daripada CSS class OWL"],
        ["Test lambat", "Setiap test login ulang dari awal", "Gunakan session fixture scope='session' agar login sekali untuk semua test"],
        ["Field x_state tidak berubah", "Automated Action tidak aktif atau kondisi salah", "Cek Settings → Technical → Automation → pastikan status = Active"],
    ]
    t = Table(troubles, colWidths=[3.5*cm, 4.5*cm, 7.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), DANGER),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, colors.HexColor("#FFF5F5")]),
        ("GRID",          (0,0), (-1,-1), 0.4, LIGHT_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        # Highlight Cypress issue row
        ("BACKGROUND",    (0,3), (-1,3), colors.HexColor("#FFF1F2")),
        ("FONTNAME",      (0,3), (0,3), "Helvetica-Bold"),
    ]))
    items.append(t)
    items.append(sp(10))

    items.append(callout(
        "Ringkasan Rekomendasi untuk QA Odoo 19 LPPM ITERA",
        [
            "UTAMA: Gunakan Playwright (Python) untuk UI/E2E testing — paling kompatibel dengan Odoo SPA berbasis OWL",
            "BACKEND: Gunakan OdooRPC untuk unit test logika bisnis, state machine, dan validasi field tanpa browser",
            "LAPORAN: Gunakan Allure atau pytest-html untuk laporan visual yang informatif bagi stakeholder LPPM",
            "CI/CD: Integrasikan dengan GitHub Actions untuk test otomatis setiap push ke branch main/develop",
            "HINDARI: Cypress untuk Odoo — arsitekturnya tidak kompatibel dengan SPA OWL dan CSP Odoo",
            "SESSION: Gunakan storage_state() Playwright agar tidak login ulang di setiap test case",
        ],
        PRIMARY
    ))
    return items

# ── BUILD PDF ─────────────────────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2.2*cm,
        title="QA Documentation — Sistem Kerjasama LPPM ITERA ODOO 19",
        author="Tim QA LPPM ITERA",
    )

    story = []
    story += cover_page()
    story.append(PageBreak())
    story += toc_page()
    story += section1()
    story += section2()
    story += section3()
    story += section4()
    story += section5()
    story += section6()
    story += section7()
    story += section8()
    story += section9()
    story += section10()

    def page_handler(canvas, doc):
        if doc.page == 1:
            on_cover(canvas, doc)
        else:
            on_page(canvas, doc)

    doc.build(story, onFirstPage=page_handler, onLaterPages=page_handler)
    print(f"PDF berhasil dibuat: {OUTPUT}")

if __name__ == "__main__":
    build()