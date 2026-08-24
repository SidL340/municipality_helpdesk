# 🏛️ Smart Citizen Kiosk & Queue Management System
### (नागरिक सहायता कक्ष तथा बहुभाषिक टोकन व्यवस्थापन प्रणाली)

A full-stack, offline-first digital kiosk and queue management system designed for **Local Government Ward Offices in Nepal (स्थानीय तह वडा कार्यालय)**.

Built with **React.js, Node.js/Express, MySQL, Web Speech API (TTS), and Silent Network Laser Printing**.

---

## 🌟 Key Features

1. **Touch-Optimized Citizen Kiosk UI (नागरिक सहायता स्क्रिन)**:
   - Designed for touchscreen tablets mounted in the waiting area.
   - Categorized into **10 official local government divisions** according to the **Local Government Operation Act 2074 (स्थानीय सरकार सञ्चालन ऐन, २०७४)**.
   - **Multi-Language Support (बहुभाषिक समर्थन)**:
     - 🇳🇵 **नेपाली (Nepali)** (Universal standard)
     - 🌾 **मैथिली (Maithili)** (Madhesh / Terai)
     - 🌾 **भोजपुरी (Bhojpuri)** (Parsa, Bara, Rautahat)
     - 🏛️ **नेपाल भाषा (Newari)** (Kathmandu Valley)
     - 🌐 **English**
   - Dynamic display of Ward Officials (अध्यक्ष, सचिव), Contact Numbers, Municipality details, and Office Hours.

2. **Document Requirement Checklist (आवश्यक कागजात सूची)**:
   - Clear numbered checklists for each service (Original vs Copy, Photos, Witnesses).
   - Clear display of government fee (दस्तुर) and expected processing time (लाग्ने समय).

3. **Accessibility & Voice Assistant (ध्वनि सहायक - TTS)**:
   - Integrated with the **Web Speech API** (`window.speechSynthesis`).
   - Reads out required documents and citizen instructions aloud in the selected **mother tongue** for illiterate or elderly citizens.

4. **Direct / Silent Token & Form Laser Printing (प्रत्यक्ष टोकन छपाई)**:
   - When a citizen taps **"टोकन लिनुहोस् (Get Token)"**, the tablet communicates with the local Node.js server.
   - The server creates a formatted 80mm PDF token using `pdfkit` containing:
     - **Ward Name & Municipality Header**
     - **Huge Token Number (टोकन नं.)**
     - **Service Name (सेवा)**
     - **Counter/Desk to Visit (काउन्टर नं.)**
     - **Date & Timestamp (नेपाली मिति र समय)**
   - Sends it **silently to the locally networked Laser Printer** via `pdf-to-printer`, **completely bypassing browser print dialogs**.

5. **Administrative Dashboard (व्यवस्थापक प्यानल)**:
   - Secure JWT-authenticated dashboard for the Ward Secretary / Admin.
   - **Real-time Analytics**: Daily citizen footfall, Peak rush hours (चाप समय), and most requested services.
   - **CRUD Management**: Add/Edit/Disable Services, Document requirements, Desks/Counters, and Ward Officials contact information.

---

## 📐 Multi-Ward Scalability (100+ Ward Offices)

For rolling out across **100+ Ward Offices** across municipalities:
- **Edge Node Architecture**: Each ward runs its own local server (Old PC, Mini PC) on their local LAN.
- **Zero Internet Downtime**: System works 100% autonomously even during internet/fiber cuts.
- **Central Aggregation**: When internet is available, each ward syncs daily footfall and queue analytics upstream to the Central Municipality Cloud Portal.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or newer
- **MySQL Server**: (e.g. via XAMPP, WAMP, or standalone MySQL)
- Network connectivity between Tablet, Server PC, and Printer.

---

### Step 1: Database Setup
1. Make sure your MySQL server is running on `localhost:3306`.
2. Configure `.env` in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ward_kiosk
   DB_PORT=3306
   JWT_SECRET=ward-kiosk-nepal-super-secret-key-2024
   PORT=5000
   PRINTER_NAME=default
   ```
3. Run the database seed script:
   ```bash
   cd server
   npm install
   npm run seed
   ```
   *This automatically creates the database and populates 10 categories, 50+ services, document lists, and ward info.*

---

### Step 2: Start Backend Server
```bash
cd server
npm install
npm run dev
```
Backend will start on: **`http://localhost:5000`**

---

### Step 3: Start Client Application
```bash
cd client
npm install
npm run dev
```
Client kiosk will start on: **`http://localhost:3000`**

---

## 🔑 Default Login Credentials

- **Admin URL**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## 📱 Hardware & Kiosk Deployment Guide

### Setting up the Waiting Area Tablet:
1. Connect the tablet to the same Wi-Fi / Local Area Network as the Server PC.
2. Open Chrome/Edge browser on the tablet and visit:
   `http://<SERVER_LOCAL_IP>:3000` (e.g. `http://192.168.1.100:3000`).
3. Set the browser to **Kiosk Mode** / **Full Screen (F11)** or pin the app as a PWA (Progressive Web App).
4. Volume up tablet speakers for Text-to-Speech voice instructions.

### Laser Printer Setup:
1. Connect your Laser Printer to the Server PC (via USB or network share).
2. Set it as the default printer in Windows, or set `PRINTER_NAME="Your Printer Name"` in `server/.env`.
3. Whenever a citizen taps **"टोकन लिनुहोस्"**, the server silently dispatches the print job without prompting.
