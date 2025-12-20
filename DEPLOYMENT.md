# Deploying to Hostinger VPS

This guide explains how to deploy your dockerized application to a Hostinger VPS (Ubuntu 20.04/22.04 recommended).

## Prerequisites
1. **Access to VPS**: You need the IP address and root password (or SSH key).
2. **Git** (Recommended): The easiest way to transfer code is to push your project to GitHub and clone it on the VPS.

## Step 1: Transfer Code to VPS

### Option A: Using Git (Recommended)
1. Push your code to a GitHub repository.
2. SSH into your VPS:
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```
3. Clone the repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <REPO_NAME>
   ```

### Option B: Using SCP (If no Git)
Run this command **from your local machine (Windows Terminal/Powershell)**:
```powershell
# Copy project folder to VPS (replace path and IP)
scp -r C:\Users\ABY\Desktop\project\esportsdaily root@<YOUR_VPS_IP>:/root/esportsdaily
```

## Step 2: Run Deployment Script

1. SSH into the VPS (if not already there):
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```
2. Navigate to the project directory:
   ```bash
   cd esportsdaily
   ```
3. Make the script executable:
   ```bash
   chmod +x deploy.sh
   ```
4. Run the script:
   ```bash
   ./deploy.sh
   ```

## Step 3: Verify
- Open your browser and visit: `http://<YOUR_VPS_IP>`
- You should see the application running.

## Troubleshooting
- **Logs**: To see backend/frontend logs, run:
  ```bash
  docker compose logs -f
  ```
- **Rebuild**: If you make changes, pull the latest code and run `./deploy.sh` again.
