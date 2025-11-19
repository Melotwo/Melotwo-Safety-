# AI Safety Checklist Generator

A React-based tool powered by Google Gemini to generate comprehensive safety checklists for various industries.

## 🚀 Firebase Deployment Setup

This project is configured for **Firebase Hosting** with automated deployments via **GitHub Actions**.

### 1. Prerequisites
- A [Firebase](https://console.firebase.google.com/) account.
- A [GitHub](https://github.com/) repository.
- A Google Gemini API Key.

### 2. Configure Firebase

1.  **Create a Project**: Go to the Firebase Console and create a new project.
2.  **Install Firebase Tools** (if not already installed):
    ```bash
    npm install -g firebase-tools
    ```
3.  **Login**:
    ```bash
    firebase login
    ```
4.  **Update Project ID**:
    - Open the `.firebaserc` file in your code editor.
    - Replace `"your-project-id"` with your actual Firebase Project ID (found in Project Settings).
    - Open `.github/workflows/deploy.yml` and replace `projectId: your-project-id` with your actual ID.

### 3. Configure GitHub Secrets

To enable the automated workflow, you need to add secrets to your GitHub repository:

1.  Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**.
2.  **Add `API_KEY`**:
    - Name: `API_KEY`
    - Value: Your Google Gemini API Key.
3.  **Add `FIREBASE_SERVICE_ACCOUNT`**:
    - In the Firebase Console, go to **Project Settings** > **Service accounts**.
    - Click **Generate new private key**. This downloads a JSON file.
    - Open the JSON file, copy the *entire* content.
    - Back in GitHub Secrets, create a new secret named `FIREBASE_SERVICE_ACCOUNT`.
    - Paste the JSON content as the value.

### 4. Deployment

**Automatic Deployment**:
- Any push to the `main` branch will trigger the GitHub Action defined in `.github/workflows/deploy.yml`.
- It will build the application (injecting the API Key) and deploy it to Firebase Hosting.

**Manual Deployment (Optional)**:
If you want to deploy from your local machine:
```bash
# Create a .env file with API_KEY=your_key
npm run build
firebase deploy
```

## 🛠️ Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_actual_api_key_here
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
