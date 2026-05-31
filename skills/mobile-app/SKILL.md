# Mobile App Skill

## Overview
React Native wrapper for BaseClaw dApps. Deploy your webpage as a native iOS/Android app.

## Features
- **Native App** — iOS and Android builds
- **Wallet Connect** — Deep linking to mobile wallets
- **Push Notifications** — Transaction alerts
- **Biometric Auth** — Face ID / fingerprint
- **Offline Mode** — View cached data
- **App Store Ready** — Auto-generate store listings

## Usage
```javascript
baseclaw.mobile.generate({
  project: 'MyToken',
  platform: 'both', // ios, android, or both
  features: ['wallet', 'notifications', 'biometric']
})
```

## Output
```
mytoken-app/
├── ios/
│   ├── MyToken.xcodeproj
│   └── Info.plist
├── android/
│   ├── app/
│   └── build.gradle
├── src/
│   ├── App.tsx
│   ├── components/
│   └── wallet/
└── package.json
```

## Build
```bash
cd mytoken-app
npm install
npx expo prebuild
npx expo run:ios
npx expo run:android
```

## App Store
- Auto-generate screenshots
- Pre-fill description from project
- Privacy policy generator
- App icon from logo

## Features
- **Wallet Connect v2** — Connect MetaMask Mobile, Rainbow, etc.
- **Transaction Signing** — Biometric confirmation
- **Push Notifications** — Webhook to Firebase/OneSignal
- **Deep Links** — Open app from URLs
