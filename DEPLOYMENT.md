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
- **Rebuild**: If you make changes, pull the latest code and run `./deploy.sh` again.

## Automated Deployment (GitHub Actions)

A `deploy.yml` file has been added to automatically deploy changes when you push to `main`.

### Setup
1. Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following:
   - `HOST`: Your VPS IP address (e.g., `69.62.77.40`).
   - `USERNAME`: VPS username (usually `root`).
   - `KEY`: Your **Private SSH Key** content.
     - *Note*: You might need to generate an SSH key pair (`ssh-keygen`), add the public key to `~/.ssh/authorized_keys` on the VPS, and paste the private key here.
   - `PORT`: SSH port (default `22`).

Once set up, every `git push origin main` will automatically update the server.

---

## 🔑 How to get KEY and PORT?

### 1. PORT
- The default SSH port is **22**. Unless you changed it, use `22`.

### 2. KEY (SSH Private Key)
You need to generate an SSH Key pair and give the **Public Key** to your VPS, while saving the **Private Key** in GitHub Secrets.

#### Step A: Generate Key Pair (Local Machine)
Run this in your terminal (Git Bash or Powershell):
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
- Press Enter to accept the default file location.
- Press Enter for no passphrase (recommended for CI/CD).
- This creates two files (usually in `~/.ssh/` or `C:\Users\You\.ssh\`):
    - `id_rsa` (PRIVATE Key - **Secret**)
    - `id_rsa.pub` (PUBLIC Key - **Public**)

#### Step B: Add Public Key to VPS
1. Copy the content of `id_rsa.pub`.
2. Login to your VPS: `ssh root@<VPS_IP>`
3. Run:
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   ```
4. Paste the public key content into this file.
5. Save and Exit (`Ctrl+X`, `Y`, `Enter`).
6. Set permissions:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

#### Step C: Add Private Key to GitHub
1. Copy the content of `id_rsa` (The **Private** key).
2. Go to GitHub > Settings > Secrets > Actions.
3. Create `KEY` and paste the content.

