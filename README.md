# Villa Luar Website

A modern React application for Villa Luar, featuring a CMS, AI-powered image descriptions, and a buyer chatbot.

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd villa-luar-website
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   Create a file named `.env` in the root directory.
    *   Add your Gemini API Key:
        ```env
        API_KEY=your_actual_api_key_here
        ```

4.  **Content File:**
    *   Ensure your `villa-content.json` file is placed inside a folder named `public/` at the root of the project.
    *   Example: `public/villa-content.json`.

## Running Locally

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the site.

## Building for Production

```bash
npm run build
```
This will generate a `dist/` folder containing the static files ready for deployment.

## Deployment Instructions

### Cloudflare Pages (Recommended)

1.  Log in to the Cloudflare Dashboard and go to **Workers & Pages**.
2.  Click **Create Application** > **Pages** > **Connect to Git**.
3.  Select your repository.
4.  **Build Settings:**
    *   **Framework preset:** Vite
    *   **Build command:** `npm run build`
    *   **Output directory:** `dist`
5.  **Environment Variables:**
    *   Add a variable named `API_KEY` with your Google Gemini API key value.
6.  Click **Save and Deploy**.

### Updating Content on Cloudflare

The website loads content from `/villa-content.json`. 

**To update the live site:**
1.  Open the Admin Panel (`/admin`) locally.
2.  Make your edits.
3.  Click **"Download Content File"**.
4.  Replace the existing `public/villa-content.json` file in your project code.
5.  Commit and push to GitHub. Cloudflare will automatically rebuild and deploy the new content.