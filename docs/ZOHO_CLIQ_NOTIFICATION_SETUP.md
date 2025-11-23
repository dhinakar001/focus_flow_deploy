# Zoho Cliq Notification Setup Guide

Complete guide for setting up and using Zoho Cliq notifications in FocusFlow.

## Overview

FocusFlow supports sending notifications to Zoho Cliq via two methods:
1. **Incoming Webhook** (Recommended for quick setup)
2. **OAuth Token** (For authenticated bot messages)

## Method 1: Incoming Webhook (Recommended)

### Step 1: Create Incoming Webhook in Zoho Cliq

1. Open your Zoho Cliq organization
2. Go to **Settings** → **Integrations** → **Incoming Webhooks**
3. Click **Create Incoming Webhook**
4. Configure:
   - **Name**: FocusFlow Notifications
   - **Channel**: Select target channel
   - **Description**: FocusFlow productivity notifications
5. Click **Create**
6. **Copy the webhook URL** (keep it secure!)

### Step 2: Configure Environment Variable

Add webhook URL to your environment:

```bash
# .env
ZOHO_CLIQ_WEBHOOK_URL=https://cliq.zoho.com/incomingwebhook/your-webhook-id
```

Or use it directly in API calls (see usage below).

### Step 3: Test Webhook

```bash
curl -X POST http://localhost:4000/notify/cliq \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://cliq.zoho.com/incomingwebhook/your-webhook-id",
    "title": "Test Notification",
    "message": "This is a test from FocusFlow",
    "type": "info"
  }'
```

## Method 2: OAuth Token (For Bot Messages)

### Step 1: Register Zoho Cliq App

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click **Add Client**
3. Select **Server-based Applications**
4. Configure:
   - **Client Name**: FocusFlow Bot
   - **Homepage URL**: Your app URL
   - **Authorized Redirect URIs**: `https://your-domain.com/auth/callback`
5. Note your **Client ID** and **Client Secret**

### Step 2: Configure OAuth

Add to your `.env`:

```bash
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REDIRECT_URI=https://your-domain.com/auth/callback
ZOHO_SCOPES=ZohoCliq.bots.CREATE,ZohoCliq.bots.READ,ZohoCliq.bots.UPDATE
```

### Step 3: Get Channel ID

1. In Zoho Cliq, open the target channel
2. Click channel settings
3. Note the **Channel ID** from the URL or settings

### Step 4: Send Notification via OAuth

```bash
curl -X POST http://localhost:4000/notify/cliq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "accessToken": "your-oauth-access-token",
    "channelId": "channel-123",
    "title": "Focus Mode Started",
    "message": "You are now in focus mode. Messages will be blocked.",
    "type": "focus"
  }'
```

## API Endpoint

### POST /notify/cliq

Send a notification to Zoho Cliq.

**Authentication**: Optional

**Request Body**:

```json
{
  "webhookUrl": "https://cliq.zoho.com/incomingwebhook/...",  // Optional
  "accessToken": "oauth-token",                                // Optional
  "channelId": "channel-123",                                  // Optional (required with accessToken)
  "title": "Notification Title",                               // Required (if message not provided)
  "message": "Notification message",                           // Required (if title not provided)
  "type": "info",                                              // Optional: success, error, warning, info, focus
  "metadata": {                                                // Optional
    "userId": "user-123",
    "sessionId": "session-456"
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "method": "webhook",
    "status": 200,
    "data": {}
  }
}
```

## Frontend Usage

### Using the CliqNotificationButton Component

```jsx
import CliqNotificationButton from './components/CliqNotification/CliqNotificationButton';

function MyComponent() {
  const webhookUrl = import.meta.env.VITE_ZOHO_CLIQ_WEBHOOK_URL;

  return (
    <CliqNotificationButton
      webhookUrl={webhookUrl}
      title="Focus Session Started"
      message="You are now in focus mode for 50 minutes"
      type="focus"
      metadata={{ sessionId: '123' }}
      onSuccess={(result) => console.log('Sent!', result)}
      onError={(error) => console.error('Failed:', error)}
    >
      Notify Team
    </CliqNotificationButton>
  );
}
```

### Using the API Service Directly

```javascript
import { notificationApi } from './services/notificationApi';

// Send notification
await notificationApi.sendCliqNotification({
  webhookUrl: 'https://cliq.zoho.com/incomingwebhook/...',
  title: 'Focus Session Complete',
  message: 'Great job! You completed a 50-minute focus session.',
  type: 'success'
});

// Or use helper methods
await notificationApi.success('Success!', 'Task completed');
await notificationApi.error('Error', 'Something went wrong');
await notificationApi.focus('Focus Mode', 'Starting focus session');
```

## Notification Types

| Type | Emoji | Use Case |
|------|-------|----------|
| `success` | ✅ | Task completion, achievements |
| `error` | ❌ | Errors, failures |
| `warning` | ⚠️ | Warnings, alerts |
| `info` | ℹ️ | General information |
| `focus` | 🎯 | Focus mode events |

## Example Use Cases

### 1. Focus Session Started

```javascript
await notificationApi.sendCliqNotification({
  webhookUrl: process.env.ZOHO_CLIQ_WEBHOOK_URL,
  title: 'Focus Session Started',
  message: `Starting ${duration}-minute focus session. Messages will be blocked.`,
  type: 'focus',
  metadata: {
    duration: 50,
    userId: user.id
  }
});
```

### 2. Focus Session Complete

```javascript
await notificationApi.sendCliqNotification({
  webhookUrl: process.env.ZOHO_CLIQ_WEBHOOK_URL,
  title: 'Focus Session Complete',
  message: `Great work! You completed a ${duration}-minute focus session.`,
  type: 'success',
  metadata: {
    duration: 50,
    productivityScore: 85
  }
});
```

### 3. Distraction Detected

```javascript
await notificationApi.sendCliqNotification({
  webhookUrl: process.env.ZOHO_CLIQ_WEBHOOK_URL,
  title: 'Distraction Alert',
  message: `You received ${count} messages during your focus session.`,
  type: 'warning',
  metadata: {
    messageCount: count,
    sessionId: session.id
  }
});
```

## Environment Variables

### Required (choose one method)

**For Webhook Method:**
```bash
ZOHO_CLIQ_WEBHOOK_URL=https://cliq.zoho.com/incomingwebhook/your-webhook-id
```

**For OAuth Method:**
```bash
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REDIRECT_URI=https://your-domain.com/auth/callback
```

### Optional

```bash
# Default channel ID (if using OAuth)
ZOHO_DEFAULT_CHANNEL_ID=channel-123

# Cliq API base URL (usually default is fine)
ZOHO_CLIQ_API_BASE_URL=https://cliq.zoho.com/api/v2
```

## Security Best Practices

1. **Never commit webhook URLs** - Store in environment variables
2. **Use HTTPS** - Webhook URLs must be HTTPS
3. **Rotate webhooks** - Regenerate webhook URLs periodically
4. **Limit permissions** - Use webhooks with minimal required permissions
5. **Monitor usage** - Track notification frequency and patterns

## Troubleshooting

### Webhook Returns 404

**Issue**: Webhook URL not found

**Solutions**:
- Verify webhook URL is correct
- Check if webhook was deleted in Zoho Cliq
- Ensure webhook is active

### OAuth Returns 401

**Issue**: Invalid access token

**Solutions**:
- Refresh access token
- Verify token hasn't expired
- Check OAuth scopes are correct

### Notification Not Appearing

**Issue**: Notification sent but not visible

**Solutions**:
- Check channel permissions
- Verify bot has access to channel
- Check notification settings in Cliq
- Review Cliq API rate limits

### CORS Errors

**Issue**: CORS errors when calling from frontend

**Solutions**:
- Ensure backend CORS is configured
- Add frontend URL to `ALLOWED_ORIGINS`
- Use backend proxy for webhook calls

## Testing

### Unit Tests

Run notification tests:

```bash
npm test -- notify.test.js
```

### Manual Testing

1. **Test Webhook**:
```bash
curl -X POST http://localhost:4000/notify/cliq \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "YOUR_WEBHOOK_URL",
    "title": "Test",
    "message": "Testing webhook"
  }'
```

2. **Test OAuth**:
```bash
curl -X POST http://localhost:4000/notify/cliq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accessToken": "YOUR_ACCESS_TOKEN",
    "channelId": "YOUR_CHANNEL_ID",
    "title": "Test",
    "message": "Testing OAuth"
  }'
```

## Integration Examples

### Backend Service Integration

```javascript
// In your service file
const notificationService = require('./services/notificationService');

async function notifyFocusSessionStart(userId, duration) {
  try {
    await notificationService.sendNotification({
      webhookUrl: process.env.ZOHO_CLIQ_WEBHOOK_URL,
      title: 'Focus Session Started',
      message: `Starting ${duration}-minute focus session`,
      type: 'focus',
      metadata: { userId, duration }
    });
  } catch (error) {
    logger.error('Failed to send notification', error);
  }
}
```

### Frontend Integration

```jsx
// In your React component
import { useState } from 'react';
import { notificationApi } from '../services/notificationApi';

function FocusTimer() {
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const handleStart = async () => {
    // Start focus session...
    
    if (notifyEnabled) {
      await notificationApi.focus(
        'Focus Session Started',
        'You are now in focus mode'
      );
    }
  };

  return (
    <div>
      <button onClick={handleStart}>Start Focus</button>
      <label>
        <input
          type="checkbox"
          checked={notifyEnabled}
          onChange={(e) => setNotifyEnabled(e.target.checked)}
        />
        Notify team in Cliq
      </label>
    </div>
  );
}
```

## Next Steps

1. ✅ Set up webhook or OAuth credentials
2. ✅ Add environment variables
3. ✅ Test notification endpoint
4. ✅ Integrate into your application
5. ✅ Add notification triggers for key events

---

**Note**: For production, always use environment variables for webhook URLs and OAuth tokens. Never hardcode these values in your code.

