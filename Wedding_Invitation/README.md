# Browser Link

https://hwan-yeong.github.io/wedding_invitation/

# Wedding Invitation (Hwan-young & Ji-won)

This repository contains the source code for Hwan-young and Ji-won's mobile wedding invitation. It is a responsive, single-page web application.

## Features

- **Mobile-First Design**: Optimized for smartphones but works on desktop.
- **Event Details**: Date, Time, and Location.
- **Interactive Map**: Integration with Kakao Map (requires API Key) and direct links to KakaoNavi/Naver Map.
- **Gallery**: Photo gallery grid.
- **Countdown**: A real-time countdown timer to the wedding day.
- **RSVP & Guestbook**:
  - **Default Mode**: Saves data to the user's browser (LocalStorage) for demonstration.
  - **Production Mode**: Supports Firebase Firestore for real-time, shared data across all guests.

## Setup & Configuration

### 1. Basic Setup
The project consists of static HTML, CSS, and JavaScript files. No build process is required.

To view the site locally:
1. Open `index.html` in your web browser.

### 2. Enabling Real-Time Features (Firebase)
To make the RSVP and Guestbook work for all guests (shared data), you must configure Firebase:

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Add a **Web App** to your project.
3.  Copy the `firebaseConfig` object provided by Firebase.
4.  Open `js/firebase-config.js` in this repository.
5.  Replace the placeholder `const firebaseConfig = { ... }` with your actual configuration.
6.  In the Firebase Console, go to **Firestore Database** and create a database (start in **Test Mode** for development).
7.  Create two collections: `rsvp` and `guestbook`.

Once configured, the application will automatically switch from LocalStorage to Firestore.

### 3. Maps Configuration
To display the embedded map correctly:
1.  Get a Kakao JavaScript API Key from [Kakao Developers](https://developers.kakao.com/).
2.  Add your domain (e.g., `yourname.github.io` or `localhost`) to the allowed domains list in Kakao Developers console.
3.  Open `index.html` and find the Kakao script tag:
    ```html
    <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY"></script>
    ```
4.  Replace `YOUR_APP_KEY` (currently `ad5b8e77dd5d4e2d29139b67a7dafc72`) with your own key if the provided one stops working.

## Customization

- **Images**: Replace images in `assets/images/` with your own photos.
- **Text**: Edit `index.html` to change names, dates, and messages.
- **Colors/Fonts**: Modify `css/style.css`.

## Deployment

The site is designed to be hosted on GitHub Pages, Netlify, or Vercel. Just upload the files or push to your repository.
