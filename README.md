# PR Warehouse Security - Frontend

A modern Multi-Tenant IoT Cloud Platform frontend built with Vite + React for monitoring warehouse devices, facilities, energy systems, and real-time analytics with Firebase integration and Agentic AI support.

---

# 🚀 Tech Stack

- React + Vite
- Firebase Authentication
- Firebase Firestore
- Firebase Realtime Database
- Firebase Storage
- WebSockets
- Tailwind CSS
- React Icons / Lucide Icons

---

# 📦 Project Setup

## 1. Clone Repository

```bash
git clone https://github.com/Atharva759/PR-FrontEnd
cd PR-FrontEnd
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables Setup

Create a `.env` file in the root directory.

```env
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECTID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MSG_SENDER_ID=""
VITE_FIREBASE_APPID=""
VITE_FIREBASE_MEASUREMENT_ID=""
VITE_FIREBASE_DB_URL="<YOUR_FIREBASE_RTDB_URL>"

VITE_FRONTEND_URL="<YOUR_FRONTEND_URL>"
VITE_BACKEND_URL="<YOUR_BACKEND_URL>"
VITE_WS_URL="<YOUR_WEBSOCKET_URL>"

VITE_AGENTIC_AI="<YOUR_AGENTIC_AI_URL>"
```

---

# 🔥 Firebase Configuration

Create a file:

```bash
firebase.js
```

Add the following configuration:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

import {
  ref,
  onValue,
  set
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  storage,
  database,
  googleProvider,
  onValue,
  ref,
  set
};
```

---

# 🔒 Firebase Realtime Database Rules

Configure the following rules inside:

Firebase Console → Realtime Database → Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null"
      }
    },

    "facilities": {
      "$fid": {
        ".read": "auth != null &&
          root.child('users').child(auth.uid).child('tenantId').val() === data.child('tenantId').val()",

        ".write": "auth != null &&
          root.child('users').child(auth.uid).child('role').val() === 'tenant_admin'"
      }
    },

    "devices_registry": {
      "$deviceId": {
        ".read": "auth != null &&
          (
            root.child('users').child(auth.uid).child('role').val() === 'super_admin' ||

            (
              root.child('users').child(auth.uid).child('tenantId').val() === data.child('tenantId').val() &&
              (
                root.child('users').child(auth.uid).child('role').val() === 'tenant_admin' ||

                root.child('users').child(auth.uid).child('facilityId').val() === data.child('facilityId').val()
              )
            )
          )",

        ".write": "auth != null &&
          root.child('users').child(auth.uid).child('role').val() === 'facility_admin' &&
          root.child('users').child(auth.uid).child('facilityId').val() === newData.child('facilityId').val()"
      }
    }
  }
}
```

---

# 👥 Role-Based Access Control (RBAC)

The platform supports hierarchical multi-tenant access:

| Role | Permissions |
|---|---|
| Super Admin | Access all tenants, facilities, and devices |
| Tenant Admin | Manage tenant facilities and users |
| Facility Admin | Manage facility devices |
| User | View assigned facility/device data |

---

# 🏢 Multi-Tenant Architecture

The platform supports:

- Multiple Tenants
- Multiple Facilities under each Tenant
- Device Registry Management
- Real-Time Device Monitoring
- Role-Based Authorization
- Secure Firebase Access Rules

---

# 🤖 Agentic AI Integration

Integrated AI Assistant URL:

```env
VITE_AGENTIC_AI="<YOUR_AGENTIC_AI_URL>"
```

Features:

- AI-powered analytics
- Device insights
- Energy monitoring assistance
- Smart recommendations

---

# ⚡ Running the Project

## Development Mode

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

# 🌐 WebSocket Integration

WebSocket endpoint:

```env
VITE_WS_URL="<YOUR_WEBSOCKET_URL>"
```

Used for:

- Real-time device updates
- Live telemetry
- Instant dashboard refresh
- Device status monitoring

---

# 📁 Recommended Project Structure

```bash
src/
├── api/
├── assets/
├── components/
├── pages/
├── firebase.js
└── App.jsx
```

---

# 🔐 Security Notes

- Never expose Firebase secrets publicly
- Configure proper Firebase Rules before deployment
- Use HTTPS and WSS endpoints in production
- Restrict Firebase Authentication domains

---

# 🚀 Deployment

Recommended Platforms:

- Frontend → Vercel
- Firebase → Authentication + Realtime DB + Firestore




