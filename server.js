require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Facebook verification token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'sar_leadgen_verify_2026';

// Google Sheets setup
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';

// Email setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Facebook webhook verification (GET request)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', { mode, token });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verification failed!');
    res.sendStatus(403);
  }
});

// Facebook webhook events (POST request)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('📨 Webhook event received:', JSON.stringify(body, null, 2));

  if (body.object === 'page') {
    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadgenData = change.value;
          console.log('🎯 Lead received:', leadgenData);
          
          // Process the lead
          await processLead(leadgenData);
        }
      }
    }
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Process lead data
async function processLead(leadData) {
  try {
    // You'll need to fetch the actual lead data from Facebook Graph API
    // For now, we'll work with what we receive
    
    const leadInfo = {
      leadId: leadData.leadgen_id || 'N/A',
      pageId: leadData.page_id || 'N/A',
      formId: leadData.form_id || 'N/A',
      createdTime: leadData.created_time || new Date().toISOString(),
      adId: leadData.ad_id || 'N/A',
      adName: leadData.adgroup_name || 'N/A'
    };

    console.log('Processing lead:', leadInfo);

    // Save to Google Sheets
    await saveToGoogleSheets(leadInfo);

    // Send email notification
    await sendEmailNotification(leadInfo);

    console.log('✅ Lead processed successfully!');
  } catch (error) {
    console.error('❌ Error processing lead:', error);
  }
}

// Save lead to Google Sheets
async function saveToGoogleSheets(leadInfo) {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const values = [[
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      leadInfo.leadId,
      leadInfo.pageId,
      leadInfo.formId,
      leadInfo.adId,
      leadInfo.adName,
      leadInfo.createdTime
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    console.log('✅ Saved to Google Sheets');
  } catch (error) {
    console.error('❌ Error saving to Google Sheets:', error);
    throw error;
  }
}

// Send email notification
async function sendEmailNotification(leadInfo) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'karan@saroutdoors.com, info@saroutdoors.com',
      subject: '🎯 New Lead from Facebook!',
      html: `
        <h2>New Lead Received</h2>
        <p><strong>Lead ID:</strong> ${leadInfo.leadId}</p>
        <p><strong>Page ID:</strong> ${leadInfo.pageId}</p>
        <p><strong>Form ID:</strong> ${leadInfo.formId}</p>
        <p><strong>Ad ID:</strong> ${leadInfo.adId}</p>
        <p><strong>Ad Name:</strong> ${leadInfo.adName}</p>
        <p><strong>Created Time:</strong> ${leadInfo.createdTime}</p>
        <hr>
        <p><em>Automated notification from sar outdoors lead system</em></p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ sar outdoors Facebook Lead Webhook is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook`);
});
