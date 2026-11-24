# Ready-to-paste email messages

Copy any block below into Gmail (or into Admin → Settings → **Send update to customers**).

---

## 1. Welcome email (sent automatically on Google login)

**Subject:**
```
Welcome to Crossroads Shopping!
```

**Body:**
```
Hi there,

Welcome to Crossroads Shopping! We are glad you are here.

Here is what you can do:
- Browse our latest products at https://crossroads-shopping.netlify.app/
- Track your orders anytime from the Track Order page
- Rate and review products you have purchased
- Get updates on new arrivals and offers

We deliver free across India in about 5 days.

If you have any questions, reply to this email or message us on Instagram @crossroads_shopping.

Happy shopping!
Crossroads Shopping Team
```

---

## 2. New arrivals / website update (paste into Admin → Send update to customers)

**Subject:**
```
New arrivals at Crossroads Shopping!
```

**Body:**
```
Hi!

We just added new products to our store. Check them out at https://crossroads-shopping.netlify.app/

Free delivery across India. Orders usually arrive in about 5 days.

Happy shopping!
Crossroads Shopping Team
```

---

## 3. Sale / offer announcement

**Subject:**
```
Special offer at Crossroads Shopping
```

**Body:**
```
Hi!

We have a special offer running now. Browse all products at https://crossroads-shopping.netlify.app/

Free delivery across India. Message us on Instagram @crossroads_shopping with any questions.

Crossroads Shopping Team
```

---

## 4. Thank you after order

**Subject:**
```
Thank you for your order - Crossroads Shopping
```

**Body:**
```
Hi,

Thank you for shopping with Crossroads Shopping. We have received your order.

You can track your order anytime from the Track Order page on our website:
https://crossroads-shopping.netlify.app/#track

We deliver free across India within 5 days.

If you have any questions, reply to this email or message us on Instagram @crossroads_shopping.

Crossroads Shopping Team
```

---

## How emails are sent

- **Resend** is connected and sending successfully (verified: welcome emails return `emailed: true`).
- Welcome emails go to the customer's email automatically when they log in with Google.
- Admin broadcasts send to every unique customer email captured from orders.
- To check status: Admin → Settings → Email alerts (`email: true` means Resend is active).
