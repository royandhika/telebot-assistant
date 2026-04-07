# 🤖 Butler AI: Personal Assistant & ETL Data Pipeline

[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Prisma%20%7C%20MySQL%20%7C%20Docker-blue)](#)

**Butler AI** adalah asisten pribadi pintar berbasis LLM yang dirancang khusus untuk mengubah percakapan santai di Telegram menjadi data yang terstruktur. Fokus utamanya adalah membantu kamu mengelola tugas (*Task Management*) dan mempermudah proses pendaftaran sumber data seperti database atau file.

Sebagai proyek portofolio **Data Engineering**, sistem ini menekankan pada **integritas data, desain skema yang scalable, dan efisiensi alur pemrosesan pesan otomatis.**

---

## 🏗️ Arsitektur Sistem & Alur Data

Butler AI bekerja dengan membagi pemrosesan menjadi dua jalur utama:

### 1. Ingestion Pipeline (Input & Parsing)
Mengubah bahasa natural dari chat menjadi entri database yang rapi. Misalnya, kamu cukup chat "Tolong buatkan task meeting besok jam 10 pagi", dan AI akan mengekstrak detailnya secara otomatis.
![Input diagram](assets/input_task.png)

### 2. Action Pipeline (Retrieval & Management)
Mengelola data yang sudah ada, mulai dari melihat daftar tugas hingga mengupdate status pekerjaan langsung melalui bot.
![Request diagram](assets/request_task.png)

---

## 🚀 Fitur Utama

- **Natural Language Task Management:** Tidak perlu isi form kaku. Cukup bicara seperti biasa, dan bot akan mencatat judul, kategori, prioritas, hingga deadline tugasmu.
- **Command Shortcuts:** Akses cepat menggunakan perintah:
  - `/create_task` - Membuat tugas baru.
  - `/view_task` - Melihat daftar tugas aktif.
  - `/edit_task` - Mengubah detail atau status tugas.
- **Database Registration:** Daftarkan koneksi database (MySQL, Postgres, dll) cukup lewat chat untuk keperluan monitoring atau ETL ke depannya.
- **Experimental Data Ingestion:** Pipeline awal untuk pemrosesan data (seperti file Excel/CSV) yang akan dikonversi menjadi data siap olah di database.
- **Dockerized Environment:** Seluruh sistem siap dijalankan dalam container, memastikan kemudahan deployment di mana saja.

---

## 🛠️ Tech Stack yang Digunakan

- **Runtime:** [Node.js](https://nodejs.org/) - Engine utama untuk menangani webhook dan logika bot.
- **ORM:** [Prisma](https://www.prisma.io/) - Mengelola skema database dengan *type-safety* yang tinggi.
- **Database:** [MySQL](https://www.mysql.com/) - Penyimpanan relasional untuk user, task, dan log aktivitas.
- **Infrastructure:** [Docker](https://www.docker.com/) - Isolasi environment agar sistem berjalan konsisten.
- **AI Logic:** OpenAI GPT-5 Nano - Otak di balik ekstraksi entitas dan pemahaman bahasa natural.

---

## 📊 Desain Skema Database (The Core)

Kami merancang database yang ter-normalisasi untuk mendukung skalabilitas fitur di masa depan.

```prisma
// Contoh model inti di Prisma
model Task {
    id          Int       @id @default(autoincrement())
    taskType    String    @map("task_type") // project, enhance, bugfix, adhoc
    title       String
    status      String    @default("todo") // todo, doing, done
    priority    String    @default("medium")
    dueDate     DateTime? @map("due_date")
    userId      BigInt    @map("user_id")
    // ... relasi ke User & Project
}
```

---

## 🛠️ Instalasi & Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/royandhika/telebot-assistant.git
   cd telebot-assistant
   npm install
   ```

2. **Konfigurasi Environment:**
   Buat file `.env` di dalam folder `telebot` dan isi:
   ```env
   BOT_TOKEN=your_telegram_bot_token
   DATABASE_URL="mysql://user:pass@localhost:3306/telebot_db"
   OPENAI_API_KEY=your_api_key
   ```

3. **Migrasi Database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Jalankan dengan Docker:**
   ```bash
   docker-compose up -d
   ```

---

## 📈 Roadmap Masa Depan
- [ ] **Advanced Excel/CSV Ingestion:** Integrasi penuh dengan modul Python (`data-processor`) untuk pengolahan file besar.
- [ ] **Vector Search (RAG):** Pencarian tugas menggunakan konteks semantik.
- [ ] **Notification System:** Pengingat otomatis saat mendekati deadline tugas.

---
Developed with ❤️
