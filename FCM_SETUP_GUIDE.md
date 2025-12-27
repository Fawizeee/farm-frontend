# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging for push notifications in the Mufu Farm website.

## Prerequisites

1. A Google account
2. Access to Firebase Console (https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Enable Google Analytics (optional but recommended)

## Step 2: Add Web App to Firebase

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Mufu Farm Web")
3. Copy the Firebase configuration object that appears

## Step 3: Get Your Firebase Configuration

You'll need these values from the Firebase config:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId` (optional)

## Step 4: Generate VAPID Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on the **Cloud Messaging** tab
3. Under **Web configuration**, click **Generate key pair** next to "Web Push certificates"
4. Copy the generated key (this is your VAPID key)

## Step 5: Configure Environment Variables

Create a `.env` file in the `mufu-farm-ui` directory (or update existing one) with:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_here
```

## Step 6: Update Firebase Configuration Files

### Update `src/config/firebase.js`

The file already uses environment variables, so it should work automatically once you set up the `.env` file.

### Update `public/firebase-messaging-sw.js`

Replace the placeholder values in `public/firebase-messaging-sw.js` with your actual Firebase configuration:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
});
```

**Note:** For production, consider using environment variables or a build-time replacement script.

## Step 7: Backend Integration (Optional)

If you want to save FCM tokens to your backend, you'll need to create an endpoint:

**Endpoint:** `POST /notifications/register`

**Request Body:**
```json
{
  "token": "fcm_token_here",
  "deviceId": "device_id_here"
}
```

**Response:** `200 OK` or `201 Created`

Example implementation in Flask/FastAPI:

```python
@app.post("/notifications/register")
async def register_notification_token(token_data: dict):
    # Save token to database
    # token_data contains: token, deviceId
    return {"status": "success"}
```

## Step 8: Test Notifications

1. Start your development server: `npm start`
2. Visit your website
3. You should see a notification permission modal after 2 seconds
4. Click "Enable Notifications"
5. Check the browser console for the FCM token

## Step 9: Send Test Notification

### Using Firebase Console:

1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Enter your FCM token (from browser console)
4. Add notification title and body
5. Click "Test"

### Using Firebase Admin SDK (Backend):

```python
from firebase_admin import messaging

def send_notification(token, title, body):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )
    response = messaging.send(message)
    return response
```

## Troubleshooting

### Modal Not Showing

- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure you're using HTTPS (required for notifications in production)
- Check if notifications are already granted/denied

### Token Not Generated

- Verify VAPID key is correct
- Check browser console for errors
- Ensure service worker is registered
- Try clearing browser cache and reloading

### Notifications Not Received

- Verify FCM token is saved correctly
- Check Firebase Console for delivery status
- Ensure service worker is active
- Check browser notification settings

### Service Worker Issues

- Verify `firebase-messaging-sw.js` is in the `public` folder
- Check browser console for service worker errors
- Ensure Firebase scripts are loading correctly

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** in Firebase Console (if possible)
4. **Use HTTPS** in production (required for notifications)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (requires user interaction)
- Opera: Full support

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Support

If you encounter issues, check:
1. Browser console for errors
2. Firebase Console for delivery status
3. Service worker status in browser DevTools
4. Network tab for failed requests

