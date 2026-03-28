# RSVP Backend Setup

Because your website is hosted statically on GitHub Pages, it cannot automatically save files back to this `rsvp` folder on the fly. However, we have built a tiny, free "backend" script that connects your website directly to a nicely formatted **Google Sheet**.

Follow these 5 steps to collect your RSVPs securely and beautifully using the file in this folder:

## 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new Blank spreadsheet.
2. Name it "Tirth & Rhea Wedding RSVPs".

## 2. Add the Script
1. In your new Google Sheet, click on **Extensions** > **Apps Script** in the top menu.
2. Delete any code in the editor, and paste the entire contents of the `Code.gs` file found in this folder.
3. Click the **Save** icon (the floppy disk).

## 3. Deploy the Script
1. In the top right corner of the Apps Script editor, click the big **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Under *Description*, type "RSVP V1".
4. Under *Execute as*, leave it as **Me (your email)**.
5. Under *Who has access*, change it to **Anyone**. *(This is required so the website can talk to the sheet!)*
6. Click **Deploy**. (You may need to quickly "Authorize access" for your own account).

## 4. Copy your Web App URL
Once deployed, Google will give you a long URL under "Web app". Click the "Copy" button.

## 5. Link it to your Website
1. Go back to your website code in your code editor.
2. Open `script.js`.
3. At the very top (line 11), find this line:
   `const RSVP_WEB_APP_URL = '';`
4. Paste your Google Script URL inside the quotes. It should look something like this:
   `const RSVP_WEB_APP_URL = 'https://script.google.com/macros/s/AKfyc.../exec';`
5. Save `script.js`, push your code via Git!

Your custom RSVPs will now appear beautifully organized in your Google Sheet whenever a guest clicks submit.
