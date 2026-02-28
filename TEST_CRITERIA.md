# LeadHunter — Test Criteria

Use this file to manually verify each phase before approving the agent to continue.
Each test is a specific action you take and a specific result you should see.
If any test fails, reject the phase and describe what went wrong.

---

## Phase 1 — Project Scaffold & Database

### Setup
```bash
cd server
pip install -r requirements.txt
python app.py
```

### Tests

**1.1 — Server starts without errors**
- Run `python app.py`
- ✅ Terminal shows the Flask server running on port 8000 with no red error messages

**1.2 — Health check responds**
- Open browser or Postman: `GET http://localhost:8000/`
- ✅ Response is `{ "status": "ok" }`

**1.3 — Database file is created**
- After running `python app.py`, check the `server/` folder
- ✅ A `.db` file exists (e.g. `leadhunter.db`)

**1.4 — Tables are created correctly**
- Install a SQLite viewer (e.g. [DB Browser for SQLite](https://sqlitebrowser.org/) — free)
- Open the `.db` file
- ✅ Table `leads` exists with all expected columns: `id`, `place_id`, `name`, `category`, `rating`, `review_count`, `phone`, `address`, `lat`, `lng`, `distance`, `google_url`, `status`, `contacted_at`, `contact_method`, `found_at`
- ✅ Table `outreach_log` exists with columns: `id`, `lead_id`, `method`, `message_sent`, `response_received`, `sent_at`, `responded_at`

**1.5 — Restarting doesn't crash or duplicate tables**
- Stop the server (Ctrl+C) and run `python app.py` again
- ✅ Server starts cleanly again with no errors
- ✅ DB file is not duplicated or corrupted

**1.6 — .env.example exists**
- Check the project root
- ✅ `.env.example` file exists and contains all expected keys with no values filled in
- ✅ No real API keys are present in this file

---

## Phase 2 — Google Places Scan (Backend)

### Setup
- Make sure your `.env` file has `GOOGLE_PLACES_API_KEY` filled in
- Restart the server: `python app.py`

### Tests

**2.1 — Scan returns results**
- Send: `POST http://localhost:8000/api/leads/scan`
- Body:
```json
{
  "location": "Newmarket, Ontario",
  "radius_km": 5,
  "min_rating": 3.0,
  "max_rating": 5.0,
  "category": "restaurant"
}
```
- ✅ Response contains `new_leads_found` (a number) and a `leads` array
- ✅ Each lead has: `name`, `address`, `rating`, `phone`, `google_url`, `status`, `found_at`

**2.2 — Returned leads have no website**
- Look through the `leads` array in the response
- ✅ None of the businesses should have an obvious website (spot-check a few by Googling them)

**2.3 — Leads are saved to the database**
- After the scan, open your SQLite viewer and refresh the `leads` table
- ✅ The same businesses from the API response appear as rows in the database

**2.4 — Deduplication works**
- Run the exact same scan request a second time
- ✅ `new_leads_found` returns `0`
- ✅ No duplicate rows appear in the database

**2.5 — GET all leads works**
- Send: `GET http://localhost:8000/api/leads`
- ✅ Returns the same leads that were saved from the scan

**2.6 — GET single lead works**
- Copy the `id` of any lead from the previous response
- Send: `GET http://localhost:8000/api/leads/<id>`
- ✅ Returns just that one lead's data

**2.7 — Bad location is handled gracefully**
- Send the scan with `"location": "xyznotaplace99999"`
- ✅ Server returns a `400` or `422` error with a readable message — it does NOT crash

**2.8 — Try a different category**
- Run scan again with `"category": "hair salon"`
- ✅ Different businesses appear, still filtered to no-website only

---

## Phase 3 — Dashboard UI (Read Only)

### Setup
```bash
cd client
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser

### Tests

**3.1 — Dashboard loads without errors**
- Open the browser console (F12 → Console tab)
- ✅ Page loads with no red errors in the console
- ✅ The scan config panel and leads table are visible

**3.2 — Scan config panel has all inputs**
- ✅ Location text input is present
- ✅ Radius input or slider is present
- ✅ Min/max rating inputs are present
- ✅ Category dropdown is present
- ✅ "Scan Now" button is present

**3.3 — Scan Now button works**
- Fill in a location (e.g. "Newmarket, Ontario"), set radius to 5, ratings 3–5
- Click "Scan Now"
- ✅ Button shows a loading state while the request is in progress
- ✅ After completion, leads appear in the table below

**3.4 — Leads table shows correct data**
- ✅ Each row shows: business name, category, star rating, phone number, address, distance, status badge
- ✅ "New" status badge is visible on fresh leads

**3.5 — Google Maps link works**
- Click the Google link on any lead row
- ✅ Opens a new tab pointing to that business on Google Maps

**3.6 — Last scanned time updates**
- After a scan completes, check the UI near the Scan button
- ✅ A "Last scanned: [time]" label is visible and shows the current time

**3.7 — New leads count shows**
- ✅ After scanning, a count like "12 new leads found" appears
- Run the scan again immediately — ✅ count shows "0 new leads found"

**3.8 — Empty state works**
- If there is a way to view with no leads (fresh DB), the table should not just be blank
- ✅ A friendly "No leads yet — run a scan to get started" message appears

**3.9 — Page is usable on a standard laptop screen**
- ✅ Nothing is cut off or overflowing horizontally at 1280px wide
- ✅ Table is scrollable if there are many leads

---

## Phase 4 — AI Message Generation (Backend)

### Setup
- Make sure `ANTHROPIC_API_KEY` is set in `.env`
- Restart the server

### Tests

**4.1 — SMS message generates successfully**
- Pick any lead id from your database
- Send: `POST http://localhost:8000/api/leads/<id>/generate-message`
- Body: `{ "method": "sms" }`
- ✅ Response contains a `body` field with a short message
- ✅ Message is under 160 characters (count it — SMS limit)

**4.2 — SMS message is personalized**
- Read the message content
- ✅ The business name appears somewhere in the message
- ✅ The message references their type of business or industry
- ✅ There is a clear offer (building a website) and a call to action

**4.3 — Email message generates successfully**
- Send: `POST http://localhost:8000/api/leads/<id>/generate-message`
- Body: `{ "method": "email" }`
- ✅ Response contains both `subject` and `body` fields
- ✅ Body is friendly, readable, and under ~150 words

**4.4 — Email message is personalized**
- ✅ Business name is in the subject or opening line
- ✅ Their category/industry is referenced
- ✅ Offer to build a website is clear

**4.5 — Messages vary between calls**
- Call the same endpoint for the same lead three times
- ✅ The messages are not identical each time (slight variation is fine, complete repeat is a fail)

**4.6 — Invalid lead ID is handled**
- Send: `POST http://localhost:8000/api/leads/99999/generate-message`
- ✅ Returns a `404` with a readable error — does not crash

---

## Phase 5 — Outreach Panel UI

### Tests

**5.1 — Clicking a lead opens the panel**
- Click any lead row in the dashboard
- ✅ A side panel slides in from the right
- ✅ The panel shows the selected business's name, category, rating, phone, and address

**5.2 — Method selector works**
- ✅ SMS and Email options are visible (radio buttons, tabs, or dropdown)
- Switch between them — ✅ UI updates accordingly

**5.3 — Email method shows extra fields**
- Select Email
- ✅ A subject line field appears
- ✅ An email address input field appears

**5.4 — SMS method hides email fields**
- Select SMS
- ✅ Subject and email fields are hidden or disabled

**5.5 — Generate Message button works**
- Select SMS, click "Generate Message"
- ✅ Button shows loading state while waiting
- ✅ Message appears in the textarea after a few seconds

**5.6 — Message is editable**
- After generation, click into the textarea
- ✅ You can freely edit the message text

**5.7 — Regenerate gets a new message**
- Click "Regenerate" or "Generate Again"
- ✅ A new (slightly different) message replaces the old one

**5.8 — Panel closes**
- Click the X button or click outside the panel
- ✅ Panel closes and you're back to the leads table
- ✅ The leads table is still intact and unchanged

**5.9 — Send button is visible**
- ✅ A "Send" button is visible in the panel
- ✅ It is either disabled with a label like "Coming soon" or shows a placeholder — it should not silently fail

---

## Phase 6 — SMS Sending via Twilio

### Setup
- Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in `.env`
- Create a test lead in your DB manually (or via scan) using **your own phone number** as the phone field
- Restart the server

### Tests

**6.1 — SMS sends successfully**
- Open the outreach panel on your test lead
- Select SMS, generate a message, click Send
- ✅ You receive the SMS on your phone within ~10 seconds

**6.2 — Lead status updates after send**
- After sending, close the panel and look at the leads table
- ✅ The lead's status badge changed from "New" to "Contacted"

**6.3 — Outreach is logged in the database**
- Open your SQLite viewer, check the `outreach_log` table
- ✅ A new row exists with the correct `lead_id`, `method: "sms"`, the message text, and a `sent_at` timestamp

**6.4 — Sending twice logs twice**
- Send another SMS to the same lead
- ✅ A second row appears in `outreach_log`
- ✅ The lead status stays "Contacted" (not reset)

**6.5 — Outreach history is visible via API**
- Send: `GET http://localhost:8000/api/outreach/<lead_id>`
- ✅ Returns an array of all outreach logs for that lead

**6.6 — Missing phone number is handled**
- Create a test lead with no phone number
- Try to send an SMS
- ✅ Returns a clear error — does not crash or send to a blank number

---

## Phase 7 — Email Sending via Brevo

### Setup
- Fill in `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` in `.env`
- Use your own email address as the test lead's email
- Restart the server

### Tests

**7.1 — Email sends successfully**
- Open the outreach panel, select Email
- Enter your own email address in the email field
- Generate an email message, click Send
- ✅ You receive the email in your inbox within a few minutes
- ✅ The subject line matches what was generated

**7.2 — Email is not in spam**
- Check your spam/junk folder too
- ✅ Ideally lands in inbox (if it goes to spam, note it but don't fail the phase)

**7.3 — Lead status updates after send**
- ✅ Lead status changes to "Contacted" in the dashboard
- ✅ `contact_method` shows "email" in the database

**7.4 — Outreach is logged**
- Check `outreach_log` table in SQLite viewer
- ✅ Row exists with `method: "email"`, the message body, subject, and `sent_at`

**7.5 — Brevo dashboard confirms send**
- Log into your Brevo account → Transactional → Logs
- ✅ The sent email appears there

**7.6 — Missing email address is handled**
- Try to send email without entering an address in the email field
- ✅ UI shows a validation error before even calling the backend
- ✅ No API call is made

---

## Phase 8 — Webhook Response Tracking

### Setup
- Install ngrok: https://ngrok.com/download
- Run: `ngrok http 8000`
- Copy the `https://xxxx.ngrok.io` URL from the terminal
- Paste `https://xxxx.ngrok.io/api/webhooks/twilio` into Twilio Console → Phone Numbers → Your Number → Messaging → Webhook
- Restart the Flask server

### Tests

**8.1 — Twilio webhook receives reply**
- Reply to the SMS you received in Phase 6 from your own phone
- ✅ The ngrok terminal shows an incoming `POST /api/webhooks/twilio` request
- ✅ Flask server logs show the request was handled with no errors

**8.2 — Lead status updates to Responded**
- After replying, refresh the dashboard or wait for auto-refresh
- ✅ The lead's status badge changes to "Responded"

**8.3 — Reply message is saved**
- Check `outreach_log` in SQLite viewer
- ✅ The row for that lead now has `response_received` filled in with your reply text
- ✅ `responded_at` timestamp is set

**8.4 — Reply from unknown number is handled**
- From a phone number NOT linked to any lead, reply to your Twilio number
- ✅ Server handles it gracefully — no crash, no database error (log and ignore is acceptable)

**8.5 — Webhook endpoint is reachable**
- ✅ The endpoint responds via the ngrok URL — no 401 or 403 errors from your server

---

## Phase 9 — Outreach History & Status UI Polish

### Tests

**9.1 — Stats bar shows correct counts**
- Look at the top of the dashboard
- ✅ You can see: Total Leads, New, Contacted, Responded, Won counts
- ✅ Numbers match what's actually in your database (verify in SQLite viewer)

**9.2 — Lead detail page shows full history**
- Click through to a lead that has been contacted and has a response
- ✅ A timeline shows each outreach entry with: method, message sent, date/time
- ✅ If a reply was received, it appears under the sent message

**9.3 — Manual status overrides work**
- Open a lead and click "Mark as Not Interested"
- ✅ Status badge updates immediately
- ✅ Dashboard stats bar count updates too
- Open another lead and click "Mark as Won"
- ✅ Same behavior

**9.4 — Auto-refresh works**
- Have the dashboard open
- Trigger a webhook manually (reply to an SMS from your phone)
- Wait up to 30 seconds without clicking anything
- ✅ The lead's status updates on its own without a page refresh

**9.5 — Won leads look distinct**
- ✅ "Won" status has a visually distinct badge (e.g. green or gold) that stands out from others

**9.6 — Full end-to-end flow**
Run through the complete workflow as if using it for real:

1. Enter a location and click Scan Now → ✅ leads appear in the table
2. Click a lead → ✅ outreach panel opens with business details
3. Select SMS → Generate → edit the message slightly → Send → ✅ SMS received on your phone
4. Reply to the SMS → ✅ status updates to "Responded" automatically within 30 seconds
5. Open the lead detail → ✅ full timeline shows sent message and reply
6. Mark the lead as Won → ✅ stats bar updates to reflect it

✅ If all 6 steps work cleanly, the app is complete and ready to use.

---

## General Failure Checklist

If anything fails, check these before reporting to the agent:

- [ ] Is the Flask server actually running? (`python app.py` in the `server/` folder)
- [ ] Is the React dev server running? (`npm run dev` in the `client/` folder)
- [ ] Are all required keys filled in the `.env` file?
- [ ] Did you restart the Flask server after changing `.env`?
- [ ] Is ngrok running for webhook tests? (Phases 8+)
- [ ] Is the ngrok URL correctly pasted into Twilio's webhook setting?
- [ ] Are you checking the browser console (F12) for frontend errors?
- [ ] Are you checking the Flask terminal for backend errors?