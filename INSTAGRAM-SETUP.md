# Instagram auto-post setup

Your store can publish a product to your Instagram page as a **feed post** and (optionally) a **Story** the moment you add or import a product.

This uses Meta's official **Instagram Graph API**. It is free, but Instagram requires a one-time setup. There is no safe way to do it with your Instagram password, and any tool that asks for your password is a risk to your account.

---

## What you need

- Instagram account switched to **Professional → Business** (Creator accounts work for some calls, Business is safest).
- That Instagram account linked to a **Facebook Page** you own.
- A free **Meta developer app** with the Instagram Graph API.
- A **long-lived access token** with these permissions:
  - `instagram_basic`
  - `instagram_content_publish`
  - `pages_show_list`
  - `pages_read_engagement`

---

## Step 1 — Prepare Instagram

1. Open Instagram → **Settings → Account type and tools → Switch to professional account → Business**.
2. Connect it to a Facebook Page (create a Page for Crossroads if you do not have one).
3. Keep the account public while testing. Private accounts cannot be published to.

## Step 2 — Create the Meta app

1. Go to <https://developers.facebook.com/apps> → **Create app**.
2. Choose **Other → Business** (or "Business" type), give it any name.
3. In the app dashboard, add the product **Instagram Graph API**.
4. Under **App settings → Basic**, note the **App ID** and **App secret**.

## Step 3 — Find your Instagram user ID

1. Open **Tools → Graph API Explorer**.
2. Select your app.
3. Request a user token with:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.
4. Run this query (replace `PAGE_ID`):
   ```
   PAGE_ID?fields=instagram_business_account{id,username}
   ```
   The `id` inside `instagram_business_account` is your **Instagram user ID** (it starts with `1784...`).

## Step 4 — Get a long-lived token

Short-lived tokens expire in about an hour. Exchange the token for a long-lived one (about 60 days):

```
https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=APP_ID
  &client_secret=APP_SECRET
  &fb_exchange_token=SHORT_LIVED_TOKEN
```

Or use **Access Token Debugger → Extend Access Token**. Paste the result into the admin panel.

> The token is stored server-side in Netlify Blobs. It is never sent to customers. When it expires, generate a new one and paste it again.

## Step 5 — Connect the store

1. Open `https://crossroads-shopping.netlify.app/#admin` → **Settings**.
2. Scroll to **Instagram auto-post**.
3. Paste the **Instagram user ID** and **access token**.
4. Tick **Post automatically when I add a product** and, if you want, **Also post a Story**.
5. Tap **Save Instagram settings**, then **Test connection**.
6. It should say `Connected to @yourhandle`.

After that, every new product (including imported JVECOMB2B products) is posted automatically. You can also tap **Post to IG** next to any product.

---

## What gets posted

- **Feed post:** first product photo, caption with the name, description, price, delivery line, product link and hashtags.
- **Story:** the same photo as an image Story (no caption).

Instagram limits API publishing to **25 posts per 24 hours** per account.

### Photo rules

- Feed images must be **JPEG** and publicly reachable over HTTPS. Store images are public; supplier images are public.
- Story images look best at **9:16**. A square photo is accepted but may be cropped or padded by Instagram.
- If a product has no photo, posting is refused with a clear message.

---

## Music (important)

Instagram **does not allow adding music through the API**. Its music library is licensed for in-app use only, and image posts/Stories have no audio track at all.

What this means:

- Auto-post works for the photo, caption, hashtags, link and Story.
- To add a song, open the post/Story in the Instagram app and use the music sticker or the Reel music picker (a few taps).
- A fully automatic Reel with music would need a generated video with royalty-free audio (for example via Cloudinary or another video service). That is a separate integration and has its own costs. Ask if you want it built.

---

## Troubleshooting

| Message | Meaning |
|---|---|
| `Add your Instagram user ID and access token first` | Credentials are not saved. |
| `Invalid OAuth access token` | Token expired or wrong. Generate a long-lived token again. |
| `The user is not an Instagram Business account` | Switch the account to Business and link a Facebook Page. |
| `Media posted before ...` / rate limit | Wait 24 hours; the API allows 25 posts/day. |
| `Only photo or video can be accepted as media type` | Use a JPEG photo URL; PNG may be rejected. |
| `Insufficient permissions` | The token is missing `instagram_content_publish`; regenerate it. |

### App review

While the Meta app is in **Development mode**, publishing usually works for accounts that have a role on the app (admin/tester). To publish for other accounts or after switching the app to **Live**, Meta may ask you to complete **App Review** for `instagram_content_publish`. For your own store account, development mode is normally enough.

---

## Alternative without a developer app

If the setup feels too heavy:

- **Meta Business Suite** can schedule Facebook + Instagram posts manually for free.
- **Buffer / Later / Metricool** have free tiers and can auto-post, but they do not read your website products automatically.
- The store's **Post to IG** button is the only option that uses your own product data and is free.

---

## Easier option: Semi-automatic posting (no Meta app needed)

If the Meta app setup is too complex, the store already has a built-in fallback:

1. In Admin → Products, click **"Post to IG"** next to any product.
2. A dialog opens with:
   - The product photo(s) (right-click → Save Image, or use the Save photo link)
   - The auto-generated caption with hashtags (click **Copy caption**)
   - Step-by-step instructions
3. Click **"Open Instagram"** → create a new post → upload the saved photo → paste the caption → add music (optional) → Share.

This takes ~10 seconds per product and needs no Facebook account, no tokens, no API. The Meta API method above is only needed if you want fully hands-off posting.

When you eventually complete the Meta setup and connect it in Admin → Settings → Instagram, the same "Post to IG" button will auto-post without these steps.
