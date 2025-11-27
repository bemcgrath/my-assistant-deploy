# My Assistant

A multi-agent AI assistant app with Personal Assistant and Health Coach features.

## Features

- **Personal Assistant**: Email drafts, calendar, reminders, goals, AI chat
- **Health Coach**: Track water, sleep, exercise, meals, weight with auto-tracked goals
- **Cross-Agent Insights**: Unified dashboard showing how health affects productivity
- **Data Visualization**: Charts for health trends over time
- **Data Persistence**: All data saved locally in browser
- **Import/Export**: Backup and restore your data as JSON or CSV

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Deployment Options

### Vercel (Recommended)

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repo
4. Vercel auto-detects Vite and deploys automatically
5. Your app will be live at `your-project.vercel.app`

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings are auto-detected
6. Click "Deploy site"

### GitHub Pages

1. Update `vite.config.js`:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
   })
   ```

2. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

3. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

4. Run:
   ```bash
   npm run deploy
   ```

### Manual Hosting

Build the project and upload the `dist/` folder contents to any static hosting:
- AWS S3
- Google Cloud Storage
- Firebase Hosting
- Any web server (Apache, Nginx)

## Project Structure

```
my-assistant/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx         # Main application code
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind CSS
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Data Storage

All data is stored in your browser's localStorage:
- `myassistant_userProfile` - User settings
- `myassistant_personalAssistant` - Goals, reminders, drafts, chat
- `myassistant_healthCoach` - Health logs, goals, settings

Data persists across sessions but:
- Is specific to the browser/device
- Can be lost if browser data is cleared
- Use Export feature for backups

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **localStorage** - Data persistence

## License

MIT
