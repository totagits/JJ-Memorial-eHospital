# J & J Memorial e-Hospital — Staging & Production Deployment Guide

This guide details the complete deployment pipeline for **J & J Memorial e-Hospital**, connecting the GitHub repository (**`totagits/JJ-Memorial-eHospital`**) with the **Coolify Instance** (**`https://coolify.totaggroup.com`**) to enable automated CI/CD redeployments to the live staging server (**`https://jjmemorial-staging.totag.network`**).

---

## 1. System Architecture & Infrastructure Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER / WORKSTATION                     │
│               git push origin JJ-Memorial-staging               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 GITHUB REPOSITORY (totagits)                    │
│   • Repository: totagits/JJ-Memorial-eHospital                  │
│   • Branch: JJ-Memorial-staging                                 │
│   • Webhook: Dispatches HTTP POST payload on push event         │
└────────────────────────────────┬────────────────────────────────┘
                                 │  HTTP POST (Payload: JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               COOLIFY INSTANCE (Control Plane)                  │
│   • Host: https://coolify.totaggroup.com                        │
│   • Webhook Endpoint: /api/v1/deploy?uuid=<APP_UUID>            │
│   • Role: Authenticates webhook, clones commit, initiates build │
└────────────────────────────────┬────────────────────────────────┘
                                 │  Docker Build & Run
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER CONTAINER (Applet)                   │
│   • Stage 1 (Builder): node:20-alpine -> npm run build (dist/)  │
│   • Stage 2 (Runner):  nginx:1.27-alpine serving dist/ on :80  │
│   • Internal Port Binding: 127.0.0.1:3080:80                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │  Reverse Proxy
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                HOST NGINX + LET'S ENCRYPT SSL                   │
│   • Host Server: Ubuntu 24.04 LTS (2.24.115.245)                │
│   • Reverse Proxy: proxy_pass http://127.0.0.1:3080             │
│   • SSL Certificate: Let's Encrypt (TLS 1.3 / HTTP/2)           │
│   • Public URL: https://jjmemorial-staging.totag.network        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. GitHub Webhook Configuration for Coolify

The automated staging pipeline relies on a GitHub repository webhook that alerts Coolify whenever new code is merged or pushed to **`JJ-Memorial-staging`**.

### Step-by-Step Webhook Setup:

1. **Locate the Webhook URL in Coolify**:
   - Log in to your Coolify panel at **`https://coolify.totaggroup.com`**.
   - Navigate to your **Project** &rarr; select the **J & J Memorial e-Hospital** staging resource.
   - Click on the **Webhooks** tab in the resource settings.
   - Copy the **Deploy Webhook URL**. The format is:
     ```text
     https://coolify.totaggroup.com/api/v1/deploy?uuid=<YOUR_RESOURCE_UUID>
     ```

2. **Register the Webhook in GitHub**:
   - Open your GitHub repository webhook settings:  
     👉 **[https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks](https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks)**
   - Click the **Add webhook** button.
   - Configure the following fields:
     - **Payload URL**: Paste the Coolify Webhook URL copied in step 1.
     - **Content type**: Select **`application/json`** *(mandatory)*.
     - **Secret**: Leave blank (unless configured in Coolify).
     - **SSL verification**: Select **Enable SSL verification**.
     - **Which events would you like to trigger this webhook?**:  
       Select **Let me select individual events** &rarr; check **Pushes** (or select **Just the push event**).
     - **Active**: Ensure the checkbox is **Checked**.
   - Click **Add webhook** to save.

3. **Verify Webhook Delivery**:
   - In GitHub, click on the newly created webhook and scroll to **Recent Deliveries**.
   - You should see a `ping` event with a **green checkmark (HTTP 200 or 202)**, confirming Coolify received the event.

---

## 3. Coolify Build & Container Configuration

Ensure your Coolify application resource is configured with the following parameters:

| Configuration Item | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Repository** | `totagits/JJ-Memorial-eHospital` | GitHub repository path |
| **Target Branch** | `JJ-Memorial-staging` | Staging branch for active testing |
| **Build Pack** | **Dockerfile** | Uses the repository's root `Dockerfile` |
| **Port Expose** | `80` | Internal Nginx port inside the container |
| **Port Mapping** | `3080:80` | Host port mapped to internal container port |
| **Healthcheck Path** | `/` | Checks HTTP 200 on root endpoint |
| **Auto-Deploy** | **Enabled** | Rebuilds automatically on webhook triggers |

### Production Multi-Stage Dockerfile Execution:
```dockerfile
# Stage 1: Dependency resolution and production Vite build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: High-performance Nginx server
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Role-Based Access Control (RBAC) Architecture

To enforce clinical data privacy, statutory compliance, and Segregation of Duties (SoD) across departments, the platform implements **`RBACService`** and the **`withRoleAccess` Higher-Order Component (HOC)**.

### Core Roles Defined:
1. **`Admin`** — Full administrative oversight, facility telemetry, immutable audit surveillance, and user access management.
2. **`Doctor`** — Clinical diagnosis, ICD-11 coding, outpatient (OPD) charts, prescriptions, and lab/imaging orders.
3. **`Nurse`** — Emergency acute triage, vital sign acquisition, inpatient bed management (ADT), and medication timing.
4. **`Finance`** — Patient billing, insurance verification (Activa, AGI, Intrasur), cashier receipts (USD/LRD), and General Ledger.
5. **`Pharmacy`** — Formulary stock maintenance, prescription verification, antimicrobial ratio monitoring, and drug dispensing.

### Permission Levels (`AccessLevel`):
- **`NONE`** (0): No access. Component is blocked by the RBAC boundary.
- **`READ`** (1): Read-only viewing of departmental summaries and queues.
- **`WRITE`** (2): Can create records, record vitals, issue prescriptions, or post payments.
- **`ADMIN`** (3): Full departmental administrative authority and clinical sign-off.

---

## 5. How to Guard Components with `withRoleAccess` HOC

The `withRoleAccess` HOC wraps any workstation or route component, verifying that the authenticated user possesses the minimum required permission level for that specific module before rendering.

### Implementation Pattern in Code:

```tsx
import React from 'react';
import { withRoleAccess, RBACService } from '../services/rbacService';
import { ClinicalWorkstation } from './ClinicalWorkstation';
import { BillingCashierWorkstation } from './BillingCashierWorkstation';
import { PharmacyWorkstation } from './PharmacyWorkstation';

// 1. Guard Outpatient EMR: Requires at least READ permission
export const SecureClinicalWorkstation = withRoleAccess(
  ClinicalWorkstation,
  'opd',           // Module identifier
  'READ',          // Minimum required access level
  'Outpatient EMR' // Friendly display name for access-denied screen
);

// 2. Guard Patient Billing: Restricted from Doctors and Nurses
export const SecureBillingWorkstation = withRoleAccess(
  BillingCashierWorkstation,
  'billing',
  'WRITE',
  'Patient Billing & Invoicing'
);

// 3. Guard Pharmacy Dispense: Requires Pharmacy or Doctor write permission
export const SecurePharmacyWorkstation = withRoleAccess(
  PharmacyWorkstation,
  'pharmacy',
  'READ',
  'Pharmacy & Dispense'
);
```

### Route Guard Usage in `StaffWorkspace.tsx`:

```tsx
// Rendering route components safely within the workspace
<main className="flex-1 space-y-6">
  {/* Role Analytics Dashboard tailored to the active user */}
  <UserRoleDashboard currentUser={currentUser} onNavigateModule={m => setActiveModule(m)} />

  {/* Guarded Workstations */}
  {activeModule === 'opd' && (
    <SecureClinicalWorkstation 
      currentUser={currentUser} 
      onBreakGlass={() => setShowBreakGlassModal(true)} 
    />
  )}
  {activeModule === 'billing' && (
    <SecureBillingWorkstation 
      currentUser={currentUser} 
      onBreakGlass={() => setShowBreakGlassModal(true)} 
    />
  )}
  {activeModule === 'pharmacy' && (
    <SecurePharmacyWorkstation 
      currentUser={currentUser} 
      onBreakGlass={() => setShowBreakGlassModal(true)} 
    />
  )}
</main>
```

### What Happens When Access Is Denied:
1. The HOC intercepts rendering and displays the **RBAC Policy Boundary** card.
2. It details the required access level, the user's active role, and the authorized personnel.
3. It presents an **Emergency Break-Glass** button to allow clinical overrides for acute trauma cases, logging the reason to the immutable audit trail.

---

## 6. Manual Deployment & Rollback Procedures

If Coolify or the webhook is undergoing maintenance, you can deploy or rollback manually on the staging host:

### Manual Deployment on Server:
```bash
# SSH into staging server
ssh root@2.24.115.245

# Navigate to project directory
cd /opt/jj-memorial

# Pull latest staging code
git pull origin JJ-Memorial-staging

# Rebuild and run container
docker build -t jj-memorial-staging .
docker stop jj-memorial-app 2>/dev/null || true
docker rm jj-memorial-app 2>/dev/null || true
docker run -d --name jj-memorial-app --restart always -p 127.0.0.1:3080:80 jj-memorial-staging

# Verify container health
docker ps | grep jj-memorial-app
curl -I http://127.0.0.1:3080
```

### Rollback to a Previous Commit:
```bash
# Rollback git to target commit hash (e.g. 66c1617)
git checkout <COMMIT_HASH>

# Rebuild image
docker build -t jj-memorial-staging .
docker stop jj-memorial-app && docker rm jj-memorial-app
docker run -d --name jj-memorial-app --restart always -p 127.0.0.1:3080:80 jj-memorial-staging
```

---

## 7. Key Verification Endpoints

- **Live Staging Domain**: [https://jjmemorial-staging.totag.network](https://jjmemorial-staging.totag.network)
- **Coolify Control Panel**: [https://coolify.totaggroup.com](https://coolify.totaggroup.com)
- **GitHub Repository**: [https://github.com/totagits/JJ-Memorial-eHospital](https://github.com/totagits/JJ-Memorial-eHospital)
- **GitHub Branch**: [https://github.com/totagits/JJ-Memorial-eHospital/tree/JJ-Memorial-staging](https://github.com/totagits/JJ-Memorial-eHospital/tree/JJ-Memorial-staging)
- **GitHub Webhooks**: [https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks](https://github.com/totagits/JJ-Memorial-eHospital/settings/hooks)
