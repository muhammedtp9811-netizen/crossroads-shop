# Google Social Login setup

Your store supports "Continue with Google" login for customers. This is optional — customers can also log in with phone OTP.

## What you need

- A free **Google Cloud project** with OAuth 2.0 credentials.

## Step 1 — Create a Google Cloud project

1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name it "Crossroads Shopping" → **Create**
4. Make sure the project is selected (top bar)

## Step 2 — Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **"External"** → **Create**
3. Fill in:
   - App name: `Crossroads Shopping`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue** through all steps (Scopes, Test users, Summary)
5. No need to add scopes — the default (email, profile, openid) is enough

## Step 3 — Create OAuth 2.0 credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials" → "OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Crossroads Web`
5. Under **"Authorized JavaScript origins"**, add:
   ```
   https://crossroads-shopping.netlify.app
   ```
   (Also add `http://localhost` if testing locally)
6. Under **"Authorized redirect URIs"**, leave empty (not needed for GIS)
7. Click **"Create"**
8. Copy the **Client ID** (looks like `123456789-abc...xyz.apps.googleusercontent.com`)

## Step 4 — Add the Client ID to your store

1. Open `index.html` in your repository
2. Find `const GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID";`
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
4. Commit and push — Netlify auto-deploys

## Step 5 — Test it

1. Open your store → click the account icon (top right)
2. Click **"Continue with Google"**
3. A Google sign-in popup appears → choose your account
4. You should see "Logged in as [your name]"
5. A welcome email is sent to your Google email (if Resend is configured)

## What happens when a customer logs in with Google

- Their name and email are stored locally (not sent to your server as a password)
- Their name is pre-filled at checkout
- They can rate and review products
- A welcome email is sent to their Google email (if email service is configured)
- They can log out anytime

## Notes

- Google Sign-In works in **Development mode** without App Review for your own testing
- For production (other users), you may need to publish the OAuth consent screen (Google may require verification for sensitive scopes, but email/profile are non-sensitive)
- The Client ID is public (it's in your HTML) — this is normal and safe for client-side OAuth
- If you don't set up Google login, the button shows a helpful message and customers use phone OTP instead

## Alternative: No setup needed

If you skip this setup, the "Continue with Google" button still appears but shows a message: "Google login not set up yet." Customers can still log in with phone OTP. Everything else works normally.
