
# Visualisasi Data - Amanda Listiana

Visualisasi data interaktif untuk tugas *Visualisasi Data* berbasis dataset Open University Learning Analytics Dataset (OULAD). Aplikasi ini dibangun dengan Vite + React + TypeScript dan memadukan gaya glassmorphism, dark/light mode adaptif, serta enam jenis visualisasi (bar, line, pie, histogram, scatter, choropleth) dengan interaksi filter lintas komponen.

## ✨ Sorotan Fitur
- **Dashboard responsif** dengan kartu KPI, bar chart outcome, line chart aktivitas mingguan, donut demografi, histogram nilai, dan peta choropleth UK.
- **Explorer Modul & Mahasiswa**: scatter plot dengan brush, histogram, tabel TanStack virtualized, sparkline per mahasiswa, ekspor CSV/PNG, serta modal detail.
- **Insight otomatis** dalam bahasa Indonesia yang memperbarui narasi sesuai filter aktif dan dapat disalin.
- **Glassmorphism + animasi halus** menggunakan Tailwind CSS, lucide-react, dan framer-motion.
- **Mode terang/gelap/system** dengan persistensi localStorage.

## 🗃️ Dataset & Justifikasi
- **Sumber utama**: OULAD (Open University Learning Analytics Dataset) — lebih dari 32.000 mahasiswa dan jutaan interaksi VLE.
- **Relevansi kampus**: memuat informasi lengkap (demografi, hasil belajar, aktivitas VLE) sehingga cocok untuk analitik akademik dan kebijakan intervensi.
- **Novelty**: jarang digunakan pada tugas kelas lokal, menawarkan kombinasi numerik + kategorikal, memungkinkan eksplorasi mendalam (drill-down modul, risk profiling).
- **Fallback sintetis**: `npm run seed:synthetic` menghasilkan dataset besar (≥50.000 mahasiswa, >250k interaksi) dengan struktur serupa untuk demo offline.

## 🧱 Struktur Proyek
```
public/
  data/oulad/{raw,agg}
  geo/uk-regions.geo.json
src/
  components/{charts,map,ui}
  features/{dashboard,filters,modules,students,insights}
  lib/{analytics,dataContext,dataLoader,format,store,theme,types,utils}
  pages/{App.tsx,main.tsx,routes.tsx}
  styles/{index.css,tailwind.css}
scripts/
  fetch_oulad.mjs
  prepare_oulad.mjs
  generate_synthetic.mjs
```

## 🚀 Mulai
### Prasyarat
- Node.js ≥ 20
- npm ≥ 10

### Instalasi
```bash
npm install
```

### Pipeline Data
1. **Unduh data mentah** (opsional jika sudah tersedia):
   ```bash
   npm run fetch:data
   ```
   Jika gagal, unduh manual dari https://analyse.kmi.open.ac.uk/open_dataset/download kemudian simpan file CSV berikut di `public/data/oulad/raw/`:  
   `studentInfo.csv`, `courses.csv`, `studentVle.csv`, `assessments.csv`, `studentAssessment.csv`, `vle.csv`.

2. **Siapkan agregasi**:
   ```bash
   npm run prepare:data
   ```
   - Validasi schema memakai Zod.
   - Hitung agregat mingguan, distribusi skor, outcome demografis, outcome modul, choropleth region, serta tabel aktivitas mahasiswa.

3. **Fallback sintetis** (jika data asli tidak tersedia):
   ```bash
   npm run seed:synthetic
   ```
   Menghasilkan file di `public/data/oulad/agg/` dengan jumlah mahasiswa besar dan distribusi realistis.

> Catatan: Repo sudah berisi contoh agregasi mini agar `npm run dev` dapat langsung dijalankan.

### Pengembangan
```bash
npm run dev
```

### Build & Preview
```bash
npm run build
npm run preview
```

### Lint & Format
```bash
npm run lint
npm run format
```

## 🌐 Deploy ke Vercel / Netlify
1. Jalankan `npm run build`.
2. Deploy folder `dist/` ke Vercel/Netlify dengan pengaturan standar Vite (command `npm run build`, output `dist`).
3. Pastikan file agregasi (`public/data/oulad/agg/*`) ikut terdeploy.

## 🧠 Insight Otomatis
Setiap visualisasi menampilkan paragraf insight 2–4 kalimat yang menjelaskan:
- Tujuan chart & cara membaca.
- Highlight angka penting sesuai filter aktif.
- Rekomendasi intervensi kebijakan kampus.
- Contoh interpretasi (misal modul dengan risiko tinggi, region yang butuh dukungan).

Insight ini juga dirangkum di halaman *Insight* dan dapat disalin melalui tombol **Salin Insight**.

## 🔐 Lisensi & Etika Data
- OULAD dirilis untuk tujuan riset pendidikan secara anonym. Gunakan sesuai ketentuan Open University.
- Dataset sintetis hanya untuk demo/internal; tidak mewakili data riil mahasiswa.

Selamat bereksplorasi! 🎓📊
