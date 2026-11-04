# Automated CI/CD Webhook Configuration Guide: Coolify & GitHub

This guide details the complete configuration process to link your GitHub repository (**`totagits/JJ-Memorial-eHospital`**) with **Coolify** (**`https://coolify.totaggroup.com`**). 

Once configured, any commit pushed to the **`JJ-Memorial-staging`** branch will automatically trigger Coolify to pull the repository, build the production multi-stage `Dockerfile`, and deploy the latest build to **`https://jjmemorial-staging.totag.network`** with zero downtime and valid Let's Encrypt SSL.

---

## Architecture Overview

```
[ Developer / AI Studio ]
          │
          ▼  git push
[ GitHub Repository: totagits/JJ-Memorial-eHospital ]
     └── Branch: JJ-Memorial-staging
          │
          ▼  HTTP POST Webhook Payload
[ Coolify Instance: https://coolify.totaggroup.com/ ]
          │
          ▼  Automated Container Rebuild
   docker build -t jj-memorial-staging .
   docker stop / rm old container
   docker run on internal port 3080
          │
          ▼  Reverse Proxy & Let's Encrypt TLS
[ Live Staging URL: https://jjmemorial-staging.totag.network ]
```

---

## Phase 1: Retrieve the Deployment Webhook from Coolify

1. Log in to your Coolify dashboard: **[https://coolify.totaggroup.com/](https://coolify.totaggroup.com/)**.
2. Select your **Project** and click on the **J & J Memorial e-Hospital** application.
3. In the application settings menu, click on **Webhooks** (or look for **Deploy Webhook** under the General/Configuration tab).
4. Look for the **Webhook Deployment URL**. It will look similar to:
   ```text
   https://coolify.totaggroup.com/api/v1/deploy?uuid=xxxx-xxxx-xxxx-xxxx
   ```
5. Click **Copy** to save the URL to your clipboard.

> **Tip:** Ensure the application's target branch in Coolify is set to **`JJ-Memorial-staging`** so Coolify checks out the correct branch on trigger.

---

## Phase 2: Method A — Automated Setup via Helper Script (Fastest)

We provide an automated helper script (`scripts/setup-coolify-webhook.sh`) in the repository that talks directly to the GitHub API to register the webhook.

### 1. Run the script with your parameters:
```bash
./scripts/setup-coolify-webhook.sh \
  --webhook-url "https://coolify.totaggroup.com/api/v1/deploy?uuid=YOUR_UUID_HERE" \
  --token "ghp_YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
```

### 2. Or run it interactively:
```bash
./scripts/setup-coolify-webhook.sh
```
The script will prompt you for the Webhook URL and your GitHub token, verify the repository permissions, and register the webhook.

### 3. Test Webhook Connectivity Only:
To verify that Coolify is accepting webhooks without creating a new hook on GitHub:
```bash
./scripts/setup-coolify-webhook.sh \
  --webhook-url "https://coolify.totaggroup.com/api/v1/deploy?uuid=YOUR_UUID_HERE" \
  --test-only
```

---

## Phase 3: Method B — Manual Setup via GitHub Web UI

If you prefer to configure the webhook manually through the GitHub web interface:

1. Open the repository's Webhook settings:  
   👉 **[https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks/new](https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks/new)**
2. Fill in the webhook form:
   - **Payload URL**: Paste your Coolify Webhook URL (`https://coolify.totaggroup.com/api/v1/deploy?uuid=...`).
   - **Content type**: Select **`application/json`**.
   - **Secret**: Leave blank unless you configured a Webhook Secret in Coolify.
   - **SSL verification**: Select **Enable SSL verification** (Coolify has valid certificates).
   - **Which events would you like to trigger this webhook?**:  
     Select **Just the `push` event**.
   - **Active**: Ensure the checkbox is **Checked**.
3. Click the green **Add webhook** button.

---

## Phase 4: Verification & Delivery Testing

### 1. In GitHub
- In **Settings** &rarr; **Webhooks**, click on the newly created webhook.
- Scroll down to the **Recent Deliveries** section.
- You will see a `ping` event. A green checkmark with **HTTP 200** or **HTTP 202** confirms GitHub successfully communicated with Coolify.

### 2. In Coolify
- Open your application at [https://coolify.totaggroup.com/](https://coolify.totaggroup.com/).
- Navigate to **Deployments** or **Logs**.
- You will see a new build queued or active with the commit message from `JJ-Memorial-staging`.

### 3. On Live Staging
- Open **[https://jjmemorial-staging.totag.network](https://jjmemorial-staging.totag.network)**.
- Refresh the page to verify the newly built commit is running live!

---

## Phase 5: Troubleshooting & Common FAQs

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **HTTP 401 / Unauthorized** | Invalid Webhook Token / UUID | Re-copy the webhook URL from Coolify and ensure no extra spaces or truncated characters were copied. |
| **HTTP 404 Not Found** | Application UUID does not exist or was deleted | In Coolify, verify the application resource ID. Re-generate the deploy webhook URL if needed. |
| **SSL Handshake Failure** | Coolify certificate untrusted | Ensure Coolify's domain (`coolify.totaggroup.com`) has a valid SSL certificate. In GitHub settings, temporary fallback is disabling SSL verification. |
| **Build Does Not Trigger on Push** | Webhook configured for wrong branch or inactive | Verify in GitHub Webhook settings that **Active** is checked and the push was made specifically to `JJ-Memorial-staging`. |

---

## Dockerfile & Build Specifications in Repository

The repository includes a production multi-stage build that Coolify executes automatically:
- **Builder Stage**: `node:20-alpine`, runs `npm install --legacy-peer-deps` and `npm run build`.
- **Server Stage**: `nginx:1.27-alpine`, mounts optimized `nginx.conf`, gzip compression, security headers (`X-Frame-Options`, `nosniff`), and serves `/app/dist` on port `80`.
- **Healthcheck**: Configured with 30s interval on `http://localhost/`.
