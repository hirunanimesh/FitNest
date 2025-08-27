# Using PWA in FitNest

This project implements Progressive Web App (PWA) features to provide an app-like experience for users. Below is a summary of how PWA is integrated, required files, libraries, and how it works.

## Libraries Used
- **next-pwa** (if using Next.js, otherwise skip)
- No extra libraries are strictly required for basic PWA support, but you may use icon generators or helpers as needed.

## Key Files
- `public/manifest.json`: Defines the PWA manifest (name, icons, theme color, etc.).
- `public/service-worker.js` (if custom SW is used): Handles caching and offline support.
- `frontend/components/pwa-install-prompt.tsx`: Custom React component to prompt users to install the PWA.
- `next.config.mjs`: (If using Next.js) May include PWA plugin configuration.

## How PWA Works in This Project
1. **Manifest & Service Worker**: The `manifest.json` and service worker enable the browser to recognize the app as a PWA, allowing installation and offline capabilities.
2. **Install Prompt**: The `PWAInstallPrompt` component listens for the `beforeinstallprompt` event and shows a custom UI to let users install the app to their device.
3. **User Experience**: When users visit the site, they may see an install prompt. If accepted, the app is added to their home screen and can be launched like a native app.

## Example: Install Prompt Component
- The `pwa-install-prompt.tsx` file uses React hooks to manage the install prompt event and display a custom modal for installation.

---

**Tip:**
- Make sure your `manifest.json` and icons are correctly set up in the `public/` folder.
- Test your PWA using Chrome DevTools > Lighthouse.

---

For more details, see the files mentioned above or refer to the [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).
