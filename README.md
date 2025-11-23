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

## Updating Content

The website loads content from `/villa-content.json`. 

**To update the live site:**
1.  Open the Admin Panel (`/admin`) locally.
2.  Make your edits.
3.  Click **"Download Content File"**.
4.  Replace the existing `public/villa-content.json` file in your project with the new downloaded file.
5.  Commit and push your changes (or redeploy).

## Deployment (Cloud Run / Netlify / Vercel)

Since this is a static site (SPA), it can be deployed to any static hosting provider.

**Build Command:** `npm run build`
**Output Directory:** `dist`
