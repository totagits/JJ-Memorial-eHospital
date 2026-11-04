# Coolify Automated Deployment Setup

This repository (`totagits/JJ-Memorial-eHospital`, branch `JJ-Memorial-staging`) is configured for automated builds and deployment to Coolify at **https://coolify.totaggroup.com/**.

---

### Method 1: Coolify Deploy Webhook in GitHub Actions (Recommended)

1. **Log in to Coolify**: Go to [https://coolify.totaggroup.com/](https://coolify.totaggroup.com/).
2. **Find Your Application**: Click on your **J & J Memorial e-Hospital** staging resource.
3. **Copy Webhook URL**:
   - In the application dashboard, navigate to **Webhooks** or look for **Webhook Deployment URL** (e.g. `https://coolify.totaggroup.com/api/v1/deploy?uuid=...`).
   - Copy this URL.
4. **Add Secret in GitHub**:
   - Go to your repository: [https://github.com/totagits/JJ-Memorial-eHospital/settings/secrets/actions](https://github.com/totagits/JJ-Memorial-eHospital/settings/secrets/actions).
   - Click **New repository secret**.
   - Name: `COOLIFY_WEBHOOK_URL`
   - Value: Paste the copied Coolify webhook URL.
   - Click **Add secret**.
5. **Done!** Every time a commit is pushed to `JJ-Memorial-staging`, GitHub Actions will automatically call Coolify to build and deploy the container.

---

### Method 2: Direct GitHub Webhook in Repository Settings

Alternatively, you can have GitHub ping Coolify directly without GitHub Actions:

1. In Coolify, copy the **GitHub Webhook URL** for your application.
2. In GitHub, go to **Settings** &rarr; **Webhooks** &rarr; **Add webhook**:
   - **Payload URL**: Paste your Coolify webhook URL.
   - **Content type**: `application/json`
   - **Which events would you like to trigger this webhook?**: Select **Just the push event**.
   - Check **Active**.
   - Click **Add webhook**.

---

### Build Configuration in Coolify

- **Build Pack**: Dockerfile (automatically uses the repository's multi-stage `Dockerfile` and `nginx.conf`).
- **Port**: `80` (internally mapped by Nginx reverse proxy).
- **Branch**: `JJ-Memorial-staging`
