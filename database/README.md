# Supabase PostgreSQL Database Setup Guide

This guide walks you through setting up the persistent Supabase database for the **Cold-Call Assistant**.

---

## 1. Create a Supabase Project

1. Log in to [Supabase](https://supabase.com/).
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g., `cold-call-copilot`), and generate a secure database password.
4. Select the region closest to your backend (e.g., `us-east-1` or `eu-central-1`).
5. Click **Create new project** and wait ~2 minutes for the database to provision.

---

## 2. Apply Database Schema

1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Copy the entire contents of [`database/schema.sql`](file:///database/schema.sql) and paste it into the query editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. Confirm that the following tables and indexes were created:
   - `calls`
   - `call_stage_results`
   - `idx_calls_created_at`, `idx_calls_status`, `idx_stage_results_call_id`
   - Triggers: `trg_calls_updated_at`, `trg_stage_results_updated_at`

---

## 3. Retrieve API Credentials

1. In Supabase, go to **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Under **Project API keys**, find the **`service_role`** key (labeled *secret - bypasses Row Level Security*).
   > **Note:** The backend uses the `service_role` key to perform authorized CRUD operations on calls and stage results. Never expose this key in frontend code, browser bundles, or GitHub.

---

## 4. Configure Backend Environment

Add the retrieved credentials to your backend environment variables (in Render dashboard or local `.env`):

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Row-Level Security (RLS) Policy Summary

- **Service Role**: The backend communicates using `service_role`, which possesses full read/write/update access.
- **Client Shielding**: The frontend browser client never speaks directly to Supabase. All database transactions pass through the authenticated Express REST API with strict Zod payload validation.
- If direct public anonymous access is ever needed, uncomment the optional anon policies at the bottom of [`schema.sql`](file:///database/schema.sql).
