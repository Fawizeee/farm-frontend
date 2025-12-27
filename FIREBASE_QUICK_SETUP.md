# Quick Firebase Setup

Your backend already has Firebase configured (project ID: `farm-d9d1e`). To enable push notifications in the frontend, follow these steps:

## Step 1: Get Firebase Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **farm-d9d1e**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app yet, click the web icon `</>` to add one
6. Copy the configuration values (they look like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "farm-d9d1e.firebaseapp.com",
  projectId: "farm-d9d1e",
  storageBucket: "farm-d9d1e.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 2: Get VAPID Key

1. In the same **Project Settings** page, go to the **Cloud Messaging** tab
2. Scroll to **Web configuration** section
3. Under **Web Push certificates**, click **Generate key pair** (if you don't have one yet)
4. Copy the generated key

## Step 3: Create .env File

Create a file named `.env` in the `mufu-farm-ui` directory with the following content:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_from_step_1
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_from_step_1
REACT_APP_FIREBASE_PROJECT_ID=farm-d9d1e
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_from_step_1
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_from_step_1
REACT_APP_FIREBASE_APP_ID=your_app_id_from_step_1
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_from_step_1
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_from_step_2
```

**Replace all the placeholder values with your actual values from Firebase Console.**

## Step 4: Update Service Worker

Update `mufu-farm-ui/public/firebase-messaging-sw.js` with your Firebase config (replace the placeholder values):

```javascript
firebase.initializeApp({
  apiKey: "your_api_key_here",
  authDomain: "your_auth_domain_here",
  projectId: "farm-d9d1e",
  storageBucket: "your_storage_bucket_here",
  messagingSenderId: "your_messaging_sender_id_here",
  appId: "your_app_id_here",
  measurementId: "your_measurement_id_here"
});
```

## Step 5: Restart Development Server

After creating the `.env` file, restart your React development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

You should now see: `Firebase initialized successfully` in the console instead of the configuration message.

## Troubleshooting

- **Still seeing "Firebase not configured"**: Make sure the `.env` file is in the `mufu-farm-ui` directory (same level as `package.json`)
- **Values not loading**: React requires environment variables to start with `REACT_APP_` prefix
- **Service worker errors**: Make sure you updated `firebase-messaging-sw.js` with the same config values

For more detailed instructions, see `FCM_SETUP_GUIDE.md`.

