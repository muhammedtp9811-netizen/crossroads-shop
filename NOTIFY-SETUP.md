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

---

## 2. Email (free) — good backup

Resend gives 3,000 free emails a month.

1. Create an account at https://resend.com and copy an API key.
2. Netlify → your project → **Project configuration → Environment variables**:
   - `RESEND_API_KEY` = your key
   - `ALERT_EMAIL` = the Gmail address that should receive orders
3. Redeploy (see the note at the bottom).

Note: with the free `onboarding@resend.dev` sender you can only send to the email
address that owns the Resend account.

---

## 3. Telegram (free) — fastest and most reliable

1. In Telegram, message **@BotFather**, send `/newbot`, choose a name.
   It replies with a token like `123456:ABC-DEF...`.
2. Send any message to your new bot.
3. Message **@userinfobot** to get your numeric chat id.
4. Netlify environment variables:
   - `TELEGRAM_BOT_TOKEN` = the token
   - `TELEGRAM_CHAT_ID` = your numeric id
5. Redeploy.

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
