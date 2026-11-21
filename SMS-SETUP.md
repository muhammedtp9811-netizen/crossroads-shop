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

**Steps**

1. Install MacroDroid on the phone and give it permission to send SMS.
2. Create a macro:
   - **Trigger:** *Webhook (URL)*. Add two variables, for example `num` and `msg`.
   - **Action:** *Send SMS*. Number = the `num` variable, message = `msg`.
3. The trigger shows a URL, something like
   `https://trigger.macrodroid.com/abc123?num=[num]&msg=[msg]`.
4. Open **Admin → Settings → Login codes (OTP)** and paste the URL in
   *SMS gateway URL*, replacing the values with the placeholders the site uses:
   - `{phone}` → the customer's number, already with `91` in front
   - `{msg}` → the full message text
   - `{code}` → just the 6-digit code, if your app needs it separately

   Example:
   ```
   https://trigger.macrodroid.com/abc123?num={phone}&msg={msg}
   ```
5. Save, then type your own number in **Send a test to** and tap
   **Send test code**. You should get the SMS in a few seconds.

The site calls the URL with a normal GET request (that is what these apps
expect). If the URL has no `{...}` placeholders, the site instead POSTs JSON:
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
