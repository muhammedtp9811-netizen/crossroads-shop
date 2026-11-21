# Login codes (OTP) — free setup

Customers can log in with a 6-digit code sent to their phone. It is optional:
the store works without an account.

There are three ways to deliver the code. The first one costs nothing.

---

## 1. Free: your own Android phone sends the SMS

Any old Android phone with a SIM can send the code. The site calls a webhook,
a free app on the phone turns that call into an SMS, and the phone sends it
from your SIM.

**What you need**

- An Android phone that stays on and connected (Wi-Fi is enough).
- A SIM with SMS (your normal recharge).
- A free app that has a **webhook trigger** and a **send SMS** action.
  MacroDroid is the easiest free one.

**Steps (MacroDroid, about 2 minutes)**

1. On an Android phone with a SIM, install **MacroDroid** from the Play Store.
   Open it and allow **SMS** permission when asked.
2. Tap **Add Macro**.
3. **Triggers → Add → Webhook (URL)**:
   - Identifier: `otp`
   - Tap the pink **+** to add two **text variables** named exactly `num`
     and `msg` (the names must match the URL below).
   - Tap the copy icon to copy the URL. It looks like:
     `https://trigger.macrodroid.com/<your-device-id>/otp`
4. **Actions → Add → Send SMS**:
   - Number: choose the variable **num**.
   - Message: choose the variable **msg**.
5. Tap the tick to save. Name it `Crossroads OTP`.
6. In the store: **Admin → Settings → Login codes (OTP)** → *SMS gateway URL*,
   paste the URL **with the two placeholders filled in**:

   ```
   https://trigger.macrodroid.com/<your-device-id>/otp?num={phone}&msg={msg}
   ```

   The site replaces `{phone}` with the customer's number (already starting
   with `91`) and `{msg}` with the full message text. `{code}` also works if an
   app needs the 6 digits on their own.
7. Tap **Save SMS settings**.
8. Type your own 10-digit mobile number in **Send a test to** and tap
   **Send test code**. The phone should text you the code within a few seconds.
   Test from a second phone (or have someone test the real login) so you see
   the message arrive.

**Keep it reliable**

- The phone must have internet (mobile data or Wi-Fi) — the site's request
  reaches it over the internet.
- Keep it charged/plugged in and exclude MacroDroid from **battery
  optimization** so Android does not delay the macro.
- Sending from a SIM to Indian numbers uses your normal SMS pack; there is no
  per-message fee from any provider.

The site calls the URL with a normal GET request (what MacroDroid expects).
If a URL has no `{...}` placeholders, the site instead POSTs JSON:
`{"to":"91XXXXXXXXXX","message":"..."}`.

**Cost:** nothing beyond your normal SMS pack. Works for every Indian number,
with no registration.

---

## 2. Fast2SMS (paid shortcut, free credits on signup)

1. Create an account at fast2sms.com.
2. Copy the API key from the dashboard.
3. Admin → Settings → Login codes (OTP) → paste it in *Fast2SMS API key*.
4. Save and send a test code.

Signup includes free credits, so this is a quick way to try it. After that it
is pay-as-you-go (a few paise per SMS). If you use the `otp` route, the
message template must be approved on their dashboard first; the default `q`
route is meant for testing.

---

## 3. Textbelt (optional)

Set `TEXTBELT_KEY` in Netlify environment variables to enable Textbelt.
The free key `textbelt` allows **one message per day** for testing. A paid key
removes the limit.

---

## When nothing is set up

If no option is configured, the login screen shows the code on screen and
labels it as such, so you can still test the flow. As soon as any option above
works, the code is no longer shown and the message is only sent by SMS.

## Good to know

- Codes expire after 10 minutes, allow 5 attempts, and can be resent every 30 seconds.
- A phone number can request at most 60 codes per hour.
- Customers are never told about SMS costs or providers.
- To stop texted codes, remove the gateway URL and the Fast2SMS key in Settings.
