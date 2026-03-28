# Tirth & Rhea Wedding Website

A beautifully designed, static HTML/CSS/JS website for a Maharashtrian wedding, equipped with simple client-side access codes for personalized event viewing. Built to be quickly and easily deployed via GitHub Pages.

## Managing the Guest List

Since this website uses static files, the database of guests is located in `data/guests.json`.

### Structure of a guest entry

```json
{
  "privateCode": "HWR2001A",
  "displayName": "Tushar Pandit",
  "inviteTier": "HWR"
}
```

*   `privateCode`: The unique code the guest will enter on the website.
*   `displayName`: The personalized name displayed on the screen (e.g. "Hi, Tushar Pandit").
*   `inviteTier`: The access level for the guest. It determines which events they see. 

### Available Invite Tiers

*   **HWR**: Haldi and Mehndi Ceremony, Wedding Ceremony, and Reception.
*   **HW**: Haldi and Mehndi Ceremony, and Wedding Ceremony.
*   **WR**: Wedding Ceremony and Reception.
*   **W**: Wedding Ceremony only.
*   **R**: Reception only.

### Editing / Adding Guests
1. Open `data/guests.json` in a text editor (or directly via the GitHub website interface).
2. Add new JSON objects to the array using the format above. 
3. Make sure you use a trailing comma for all objects except the last one in the list.

### Manual verification still needed

A few source rows were ambiguous and should NOT be silently fabricated. These unresolved rows are:
- Avery (name visible, code missing)
- Travis (name visible, code missing)
- Ryan Ta (name visible, code missing)
- Ewan (name visible, code missing)
- WR2003M (code visible, name missing)
- WR2003N (code visible, name missing)
- WR2003O (code visible, name missing)

Please manually add these guests once their code/name pairing has been clarified.

## Deployment to GitHub Pages

Because this website uses entirely static architecture without a build step, deploying to GitHub Pages is incredibly simple.

1. Ensure all your files (`index.html`, `styles.css`, `script.js`, `data/guests.json`) are committed to the `main` or `master` branch in your GitHub repository.
2. In your GitHub repository, go to **Settings** > **Pages** (on the left sidebar).
3. Under **Build and deployment**, select **Source** -> **Deploy from a branch**.
4. In the **Branch** dropdown, select `main` (or `master`) and save.
5. After a minute or two, your website will be live. A green shield and link will appear at the top of the Github Pages settings.

## Important Note regarding Security

Because GitHub Pages hosts static, public files, the `data/guests.json` file is technically visible to anyone who knows exactly where to look via the web browser's Network/Developer tools. 

This means that this frontend-only validation approach is **not truly secure**. Anyone with technical knowledge could view the file, discover private codes, and see the guest list names. However, for a wedding website, the simplicity, low cost, and lack of backend maintenance for a static setup is often a worthy tradeoff for this lowered privacy. If true privacy is required later, we recommend swapping this statically fetched `.json` model for a simple backend endpoint connected to something like Supabase, Firebase, or an AWS Lambda function.