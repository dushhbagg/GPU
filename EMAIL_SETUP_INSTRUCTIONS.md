# 📧 EmailJS Configuration Guide

The website code is sending the email to the customer correctly, but your **EmailJS Dashboard** controls who actually receives it.

By default, EmailJS sends all emails to **you** (the admin). You must change this setting to send it to the **customer**.

## 🚀 How to Fix "Email Going to Me Instead of Customer"

1.  **Login** to your [EmailJS Dashboard](https://dashboard.emailjs.com/).
2.  Go to **Email Templates** on the left sidebar.
3.  Select your template (`template_lm5f6h7`).
4.  Look for the **"To Email"** field on the right side.
    - _Currently, it probably has your email address in it._
5.  **Change it** to exactly this:

    ```
    {{to_email}}
    ```

    _(I have updated the code to send this `to_email` variable)._

6.  **Click Save**.

---

### ✅ How it works

- **Code**: Sends `to_email: "customer@example.com"`
- **Dashboard**: Sees `{{to_email}}` in the "To" field → Replaces it with "customer@example.com".
- **Result**: Customer receives the email.

### 💡 Want Both? (Notification + Confirmation)

If you want to receive an email **AND** send one to the customer:

1.  Go to the **"Auto-Reply"** tab in your Template settings.
2.  Enable **Auto-Reply**.
3.  Set the "To Email" for the Auto-Reply to `{{to_email}}`.
4.  Keep the main "To Email" (in the Email Settings tab) as your own email address.
