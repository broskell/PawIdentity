# PawIdentity — Every Pet Deserves An Identity.

PawIdentity (also branded as **PawAadhar**) is a premium, minimal digital pet identity and recovery platform. Inspired by the design philosophies of MUJI, Apple Wallet, and Linear, PawIdentity provides a zero-friction, monochromatic interface for pet management and lost recovery telemetry.

---

## 📸 Verification Screenshots

### 1. Hero Layout (Cards Side-by-Side)
Features a centered title, call-to-action buttons, a floating QR Smart Tag, and Bruno's Pet Preview card.

![Hero Cards Side-by-Side](./screenshots/hero_side_by_side.png)

### 2. Sighting Sourced Recovery Profile (`/pet/bruno`)
Automatically logs visitor telemetry (coordinates, device type, browser) in the background on scanning and triggers owner notification alerts.

![Bruno Public Recovery Profile](./screenshots/pet_detail_bruno.png)

---

## 🚨 Problem Statement

Standard physical pet collars only contain a static phone number that can fade, get worn out, or go unanswered when a pet goes missing. Additionally, traditional tags do not notify the owner when they are found or scanned.

**PawIdentity** solves this by providing:
- **QR Smart Tags**: Each pet collar is fitted with a unique QR tag containing a slug-based profile link.
- **Instant Scan Telemetry**: Scanning the QR code prompts the visitor for browser geolocation, captures their device agent, logs the event to a database, and alerts the owner instantly via Twilio SMS.
- **Secure Profiles**: Displays crucial information (photo, name, emergency contacts, vaccination status) while hiding owner email, address, and medical records from the public.

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    Client[React + Vite + Tailwind CSS] -->|Firebase Auth JWT| Express[Node + Express Server]
    Express -->|Mongoose ORM| Mongo[(MongoDB Atlas)]
    Express -->|Media storage| Cloudinary[Cloudinary API]
    Express -->|SMS Telemetry| Twilio[Twilio SMS API]
    Visitor[Finder Device] -->|Scans QR tag| PetPage[Public Recovery Profile]
    PetPage -->|Logs location scan| Express
```

### Stack Components
- **Client (Frontend)**: React, Vite, Tailwind CSS v4, Framer Motion, React Router DOM, Axios, Firebase Client SDK.
- **Server (Backend)**: Node.js, Express.js (ES Modules configuration), Mongoose, Firebase Admin SDK, Cloudinary, Twilio, qrcode.
- **Database**: MongoDB Atlas.
- **State Management**: React Context API (No Redux).

---

## 🗄️ Database Models

1. **User**: Stores `name`, `email`, `firebaseUID`, `phone`, `profilePicture`, `role` (`owner`, `vet`, `shelter`, `admin`), `verified` status, and timestamps.
2. **Pet**: Stores `name`, `species`, `breed`, `gender`, `dob`, `weight`, `color`, `microchipId`, `photo`, `owner` (ref User), `qrTag` (ref QRTag), `isVaccinated` status, `status` (`active`, `missing`), `emergencyContacts` list (name, relation, phone), and timestamps.
3. **QRTag**: Logs `tagId` (e.g. `PID-2026-001`), `slug`, `pet` (ref Pet), `scanCount`, `lastScannedAt`, `status` (`active`, `inactive`), and timestamps.
4. **MedicalRecord**: Stores `pet` (ref Pet), `veterinarian` (ref User or string), `diagnosis`, `prescription`, `notes`, `attachments` (urls array), and timestamps.
5. **Vaccination**: Records `pet` (ref Pet), `vaccineName`, `dateAdministered`, `nextDueDate`, `batchNumber`, `verified`, and timestamps.
6. **LostPet**: Manages active missing listings: `pet` (ref Pet), `missingSince`, `reward`, `description`, `lastSeenCity`, `lastSeenLocation`, `latitude`, `longitude`, `status` (`missing`, `found`, `closed`), `foundAt`, `closedAt`, and timestamps.
7. **ScanLog**: Captures `pet` (ref Pet), `qrTag` (ref QRTag), `scannedAt`, `latitude`, `longitude`, `city`, `browser`, `device`, `ipAddress`, `ownerNotified`, and timestamps.
8. **Notification**: Links notifications to users: `user` (ref User), `title`, `message`, `type` (`scan`, `vaccine`, `lost`, `general`), `status` (`read`, `unread`), `metadata`, and timestamps.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster
- Firebase project, Cloudinary, and Twilio developer keys

### 1. Setup Backend Server
1. Navigate to `/server`.
2. Create a `.env` file containing:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_atlas_uri
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   ```
3. Install dependencies and seed mock data:
   ```bash
   npm install
   node utils/seed.js
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Setup Client Frontend
1. Navigate to `/client`.
2. Create a `.env` file containing:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SERVER_URL=http://localhost:3000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
