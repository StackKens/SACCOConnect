**SACCOConnect** is a modern mobile application for Savings and Credit Cooperative Organizations (SACCOs). It empowers members to manage savings, apply for loans, track repayments, and receive announcements, while giving administrators powerful tools to manage members, review loan applications, and post updates.

## Problem Statement

Traditional SACCOs rely on manual ledgers, paper forms, and delayed communication. Members often wait days for loan approvals, miss contribution deadlines, and have no real-time visibility into their finances. Administrators struggle with inefficient record‑keeping and lack of digital tools. SACCOConnect solves this by providing a secure, real‑time mobile platform that digitizes the entire cooperative experience.

## Features

### For Members

- **Dashboard** – Overview of savings, loan balance, and next contribution date.
- **Savings** – Make contributions, view transaction history, see total saved.
- **Loans** – Apply for new loans, view active/paid loans, make repayments.
- **Statements** – Downloadable transaction history (PDF ready for integration).
- **Notifications** – Real‑time alerts for loan approvals, due dates, announcements.
- **Profile** – Manage account, switch between light/dark/system theme.

### For Administrators

- **Member Management** – Add, view, edit members with detailed profiles.
- **Loan Queue** – Review pending loan applications, approve or reject with notes.
- **Treasury** – Dashboard of total savings, loans disbursed, repayments collected.
- **Announcements** – Post and manage community announcements.
- **Settings** – Export data, manage admin profile, theme toggle.

### Technical Highlights

- **Role‑based routing** – Separate dashboards for members and admins.
- **Theme Toggle** – Light, dark, and system‑aware themes persisted via MMKV.
- **Offline‑first** – Data stored locally with `react-native-mmkv` for instant access.
- **Fast navigation** – Expo Router with file‑based routing and gesture support.
- **State management** – Zustand stores with persistence.

## Tech Stack

| Technology                        | Purpose                              |
| --------------------------------- | ------------------------------------ |
| React Native 0.85.3               | Mobile framework                     |
| Expo SDK 56                       | Development & build toolchain        |
| Expo Router 56.2.8                | File‑based navigation                |
| TypeScript 6.0.3                  | Type safety                          |
| Zustand 5.0.14                    | State management                     |
| react-native-mmkv 4.3.1           | High‑performance local storage       |
| react-native-nitro-modules 0.35.9 | Native module bridge (used by MMKV)  |
| react-native-reanimated 4.3.1     | Smooth animations                    |
| react-native-gesture-handler      | Touch interactions                   |
| Axios 1.17.0                      | API client (for backend integration) |

## Project Structure

SACCOConnect/
├── app/ # Expo Router screens
│ ├── (auth)/ # Onboarding, Login, Register
│ ├── (member)/ # Member dashboard & features
│ ├── (admin)/ # Admin dashboard & management
│ ├── src/ # Shared code (components, stores, utils, theme)
│ ├── \_layout.tsx # Root layout with auth guard
│ └── index.tsx # Redirect to onboarding
├── assets/ # Images, splash, icons
├── android/ # Native Android (prebuilt)
├── ios/ # Native iOS (prebuilt)
├── app.json # Expo configuration
├── tsconfig.json # TypeScript config with path alias @/\*
└── package.json # Dependencies

text

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android builds) or Xcode (for iOS, Mac only)

### Installation

```bash
# Clone the repository
git clone https://github.com/StackKens/SACCOConnect.git
cd SACCOConnect

# Install dependencies (use --legacy-peer-deps if needed)
npm install --legacy-peer-deps

# Prebuild native folders (if not present)
npx expo prebuild

# Run on Android (requires emulator or device)
npm run android

# Or run on iOS (Mac only)
npm run ios
Development Build (Recommended)
Because we use react-native-mmkv (custom native module), you must use a development build instead of Expo Go.

bash
# Create a development build
npx expo run:android   # for Android
# or
npx expo run:ios       # for iOS

# Then start Metro
npx expo start
Building for Production
bash
# Using EAS Build
eas build -p android --profile production
eas build -p ios --profile production
Environment Variables (Optional)
Create a .env file for API keys (if integrating with backend):

text
API_BASE_URL=https://your-api.com
Customization
Theme Colors
Edit app/src/theme/colors.ts to change the light/dark palettes.

Adding New Screens
Create a .tsx file inside the appropriate route group ((member) or (admin)).

Use ScreenWrapper for consistent layout.

Import shared components from @/app/src/components/ui.

Backend Integration
Replace mock data in auth.store.ts and screen files with actual API calls using Axios. The state management is ready for async actions.

Contributing
Fork the repository.

Create a feature branch (git checkout -b feature/amazing-feature).

Commit your changes (git commit -m 'Add amazing feature').

Push to the branch (git push origin feature/amazing-feature).

Open a Pull Request.

License
Distributed under the MIT License. See LICENSE for more information.

Contact
StackKens – @stackkens

Project Link: https://github.com/StackKens/SACCOConnect
```
