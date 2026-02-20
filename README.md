# Facebook Lead Ads Webhook for sar outdoors

Automatically receives Facebook lead ads, saves to Google Sheets, and sends email notifications.

## Features

✅ Facebook webhook verification
✅ Receives lead data automatically
✅ Saves to Google Sheets
✅ Sends email to karan@saroutdoors.com and info@saroutdoors.com
✅ Deployed on Railway (free tier)

## Setup Instructions

### 1. Google Sheets API Setup (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable Google Sheets API:
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: `facebook-leads-webhook`
   - Click "Create and Continue"
   - Skip optional steps
5. Generate Key:
   - Click on the service account email
   - Go to "Keys" tab
   - "Add Key" → "Create new key" → JSON
   - Download the JSON file
6. Share Google Sheet:
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (from JSON: `client_email`)
   - Give "Editor" access

### 2. Gmail App Password (2 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password

### 3. Deploy to Railway (5 minutes)

1. Go to: https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect this repository
6. Add environment variables:
   - `VERIFY_TOKEN` = `sar_leadgen_verify_2026`
   - `SPREADSHEET_ID` = `1p8UxlnNKSoTStyZb8m9mKMA9ShLhvOsPdy0NhGVxa6g`
   - `SHEET_NAME` = Your sheet tab name
   - `GOOGLE_CREDENTIALS` = Paste entire JSON from step 1
   - `EMAIL_USER` = Your Gmail address
   - `EMAIL_PASSWORD` = App password from step 2
7. Deploy!

### 4. Configure Facebook

1. Go to Facebook Developers
2. Select your app
3. Webhooks → Configure
4. **Callback URL**: `https://your-railway-app.railway.app/webhook`
5. **Verify Token**: `sar_leadgen_verify_2026`
6. Subscribe to `leadgen` field

## Local Testing

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

## Troubleshooting

- **Webhook verification fails**: Check VERIFY_TOKEN matches exactly
- **No data in sheets**: Check service account has editor access
- **No emails**: Check Gmail app password and "Less secure app access"

## Support

Built for sar outdoors by Master ⚙️
