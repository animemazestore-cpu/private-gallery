# Production Deployment Guide

Follow this guide to deploy the Private Gallery application to production (Next.js hosted on Vercel + Supabase backend).

---

## 1. Supabase Backend Setup

### A. Database Migrations
Run the following SQL migrations in order in your Supabase SQL Editor (or apply them via the Supabase CLI):

1. **`supabase/migrations/0001_init_photos.sql`**:
   - Creates the `photos` and `settings` tables.
   - Enables Row Level Security (RLS) on both tables with default deny-all policies.
2. **`supabase/migrations/0002_rate_limits.sql`**:
   - Creates the `rate_limits` table for tracking failed authentication attempts.
   - Enables RLS on the table with default deny-all policies.

### B. Storage configuration
1. In the Supabase dashboard, navigate to **Storage**.
2. Create a new bucket.
3. Set the bucket name to **`photos`**.
4. **Crucial Security setting**: Ensure the bucket is set to **Private** (do NOT toggle "Public").
5. By default, private buckets restrict direct HTTP access, requiring signed URLs (which the Next.js server resolves dynamically for authorized sessions).

---

## 2. Environment Variables Configuration

Configure the following environment variables in your hosting provider's dashboard (e.g., Vercel Project Settings > Environment Variables):

| Variable Name | Description | Visibility / Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL (e.g. `https://xxx.supabase.co`). | Browser-visible (Public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Anonymous API key. | Browser-visible (Public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Project **service_role** API key. Bypasses RLS to write uploads and read private objects. | **Server-Only (Private)** |
| `VISITOR_PIN_HASH` | Hashed visitor access PIN (e.g., `pbkdf2$100000$salt$hash`). Generate this hash using the utility script below. | **Server-Only (Private)** |
| `ADMIN_AUTH_SECRET` | Secret passphrase used for admin dashboard login and signing session cookies. | **Server-Only (Private)** |

### How to Generate the `VISITOR_PIN_HASH`:
Run this command in your terminal before deploying to generate a secure PBKDF2 hash of your chosen access PIN:
```bash
node scripts/hash-pin.js <your-chosen-visitor-pin>
```
Copy the generated `pbkdf2$...` output line directly into your environment variable settings.

---

## 3. Web Hosting Setup (Vercel)

1. Import your repository into **Vercel**.
2. Under **Framework Preset**, select **Next.js**.
3. Add the 5 environment variables listed in Section 2.
4. Deploy the project.
5. Vercel automatically runs the production build:
   - Compiles TypeScript files and runs code validation.
   - Generates static templates and compiles dynamic server actions.
   - Validates that `server-only` libraries (like `lib/supabase/server.ts`) are not imported by Client Components.

---

## 4. Post-Deployment Smoke Test (Verification)

Once the application is live, run these steps to verify security:

1. **Lock Screen Integrity**:
   - Open a new Incognito browser window.
   - Navigate to the deployment URL.
   - Verify that the page shows the locked "Protected Gallery" unlock screen.
2. **Failed Auth Verification**:
   - Enter an incorrect PIN (e.g., `9999`).
   - Confirm that the UI shakes and displays the generic error `"Invalid PIN."`.
3. **Access Control Check**:
   - Try to navigate directly to `/gallery` in the URL bar.
   - Verify that you are redirected back to the lock screen `/`.
   - Try to call `GET /api/gallery` in the browser dev tools. Confirm it returns status `401 Unauthorized`.
4. **Successful Auth Verification**:
   - Enter your correct visitor PIN.
   - Verify that the app redirects to `/gallery` and displays the photo grid.
   - Tap a thumbnail to open the Lightbox viewer. Confirm keyboard arrow buttons navigate next/prev and Escape closes the view.
5. **Admin Access Isolation**:
   - Navigate to `/admin/dashboard` in the browser.
   - Verify that you are redirected back to `/admin/login`.
6. **Admin Credentials Check**:
   - Try logging in with a random password. Verify it fails.
   - Enter the correct password (configured in `ADMIN_AUTH_SECRET`).
   - Verify that the Admin Dashboard loads, showing the dropzone and photo table.
7. **Upload & Delete Smoke Test**:
   - Drag/select a valid JPEG/PNG photo in the dropzone and click **Start Upload**.
   - Verify success badge.
   - Go back to the visitor gallery tab, refresh, and confirm the photo appears.
   - Return to the Admin Dashboard and click **Delete** on the uploaded photo. Confirm dialog warning.
   - Confirm the photo is removed from the manager listing and disappears from the visitor gallery page.
