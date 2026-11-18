# Order alerts — free setup

Every new order (UPI and online) sends one message with the full details:

```
🛒 New order — UPI payment claimed
Order #1042 · ₹1,399
Strom Series Headphones (M) x1
Mouse Pad x1

Muhammed · 8281036836
12 Example Street, Kochi 682001

UPI QR · UTR 412345678901 · PAID
18 Nov 2026, 4:32 pm IST
https://crossroads-shopping.netlify.app/#admin
```

WhatsApp is set up inside your own admin panel — no Netlify settings needed.
The other channels below are optional backups and are switched on with Netlify
environment variables.

---

## 1. WhatsApp (free) — recommended

Uses CallMeBot, a free personal-use service.

1. On the phone that has your WhatsApp, save this contact: **+34 644 41 87 20**
2. Open a chat with it on WhatsApp and send exactly:
   `I allow callmebot to send me messages`
3. The bot replies with `API Activated … APIKEY is 123456`. That number is your key.
4. Open your store admin → **Settings → Order alerts**, enter:
   - WhatsApp number **with country code, no + and no spaces** (e.g. `918281036836`)
   - the API key from step 3
5. Tap **Save WhatsApp alerts**, then **Send a test alert**.

You should get the test on WhatsApp immediately. If not, check the number and key.

> The free CallMeBot key is for personal use and can be rate-limited. It is fine
> for a small shop. If you ever need guaranteed delivery to many people, use
> WhatsApp Cloud API or Twilio — both are paid.

### If the bot does not reply

This is a CallMeBot problem, not your website. Try in this order:

1. Confirm the contact is **+34 644 41 87 20** exactly (a Spain number).
2. Send only: `I allow callmebot to send me messages` — no extra words, no emoji.
3. Wait 2 minutes. Still nothing? Send: `Recover APIKey`.
4. CallMeBot limits how often one number can ask. If both fail, wait 24 hours and
   repeat step 2.
5. Nothing after 24 hours means that number cannot use the free service. Use
   **Telegram** below instead — it is free, instant and has no such limit.

---

## 2. Email (free) — good backup

No Netlify settings needed; do it inside your admin panel.

1. Create an account at https://resend.com and copy an API key (starts with `re_`).
2. Open the store admin → **Settings → Order alerts → Email**, enter the address
   that should receive orders, paste the key, tap **Save and send test email**.
3. A test email arrives. Done.

The key is stored on the server and never returned by the public API.

> Resend's free `onboarding@resend.dev` sender can only send to the address that
> owns the Resend account. Use that same Gmail address here.

Netlify variables `RESEND_API_KEY` and `ALERT_EMAIL` still work and override the
saved values.

---

## 3. Telegram (free) — fastest and most reliable

No Netlify settings needed; do it inside your admin panel.

1. In Telegram, message **@BotFather** and send `/newbot`, pick a name.
   It replies with a token like `123456789:ABCdef...`.
2. Open the store admin → **Settings → Order alerts → Telegram**, paste the token,
   tap **Connect Telegram**.
3. It replies "Token is good (@yourbot). Now open Telegram, find @yourbot, tap Start…"
   if it needs you to start the chat. Do that, then tap **Connect Telegram** again.
4. A test message arrives in Telegram. Done.

The admin finds your chat id automatically. The token is stored on the server and
is never returned by the public API.

If you prefer Netlify variables: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` also work
and override the saved values.

---

## 4. Phone push with the ntfy app (free, no account)

1. Install the **ntfy** app (Android / iPhone).
2. Subscribe to a topic with a hard-to-guess name, for example
   `crossroads-orders-8f3k2`.
3. Netlify environment variable: `NTFY_TOPIC` = that exact topic name.
4. Redeploy.

---

## 5. Discord (free)

Server settings → Integrations → Webhooks → New webhook → copy URL.
Netlify environment variable `DISCORD_WEBHOOK` = the URL. Redeploy.

---

## About Instagram

Instagram does not let a website send you a direct message. Meta's messaging API
only allows a business to reply to someone who messaged it first, and it needs a
Business account, an app review and a public server — so there is no free,
automatic "DM me on Instagram" option.

Use WhatsApp (above) plus Telegram or email. If you still want orders in
Instagram, the practical option is to forward the Email alert to an address you
watch on your phone.

---

## Testing

Admin → **Settings → Order alerts → Send a test alert**. It uses the same code
path as a real order, so if the test arrives, real orders will too.

## After changing Netlify environment variables

Saving a variable does not rebuild the site by itself. Go to **Deploys → Trigger
deploy → Deploy site** (or push any commit) so the function picks up the new
variables.
