# ShareBox

ShareBox is a React application for authenticated image uploads and expiring
share links.

## Technology

- React and Vite
- Firebase Authentication
- Cloud Firestore for user, file, and share-link metadata
- Cloudinary for JPG, JPEG, and PNG media

There is no custom Node.js server or Firebase Storage dependency. The browser
communicates with Firebase and Cloudinary directly.

## Run locally

From PowerShell:

```powershell
cd "D:\Final Year\sem VII\LAB\CC lab\project\sharebox\client"
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

To create a production build:

```powershell
npm run build
```

To preview that build:

```powershell
npm run preview
```

## Deploy to Vercel

1. Push the project to GitHub, including the `client/` folder.
2. In Vercel, select **Add New Project** and import the repository.
3. Set **Root Directory** to `client`.
4. Use these project settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. Deploy the project.

The client includes `client/vercel.json`, which makes direct visits and refreshes
work for routes such as `/login`, `/files`, and `/share/<token>`.

### Firebase settings after deployment

1. Copy the Vercel domain, for example `sharebox-example.vercel.app`.
2. Open Firebase Console → **Authentication** → **Settings** →
   **Authorized domains**.
3. Add the Vercel domain. Add a custom domain too if one is configured.
4. Confirm that the rules in `firestore.rules` are published in Firestore.

No Vercel environment variables are required by the current client. Firebase
configuration is in `client/src/services/firebase.js`, and Cloudinary upload
configuration is in `client/src/services/cloudinary.js`.

### Cloudinary settings

Confirm that the `sharebox_unsigned` upload preset is still enabled for
unsigned **image** uploads. The application accepts only JPG, JPEG, and PNG
files up to 10 MB.

## Upload restrictions

- Supported formats: `.jpg`, `.jpeg`, and `.png`
- Maximum file size: 10 MB
- PDF and other file types are rejected

## Firebase setup

The Firebase project configuration is in
`client/src/services/firebase.js`. Publish the rules in `firestore.rules` to
Cloud Firestore before using a new Firebase project.

## Cloudinary setup

The upload configuration is in `client/src/services/cloudinary.js`. The
unsigned upload preset must allow image uploads and use the folder configured
there.
