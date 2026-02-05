````
# 🚀 Advanced Task Manager

A modern, full-stack Task Management application built with performance and UX in mind. Featuring a Glassmorphism UI, Dark/Light mode, and smooth animations.

## ✨ Features

- **🎨 Modern UI/UX:** Glassmorphism design with Framer Motion animations.
- **🌗 Dark & Light Mode:** Automatic system detection with a manual toggle switch.
- **⚡ Tech Stack:**
  - **Frontend:** React, Ionic Framework, Framer Motion.
  - **Backend:** NestJS (Node.js), TypeScript.
  - **Database:** PostgreSQL.
- **🐳 Dockerized:** Fully containerized for easy deployment (Frontend + Backend + DB).
- **🛡️ Safety:** Confirmation popups for critical actions (Delete).
- **🔎 Filtering:** Filter tasks by Status (Open, In Progress, Done) and Priority (Low, Medium, High).

## 🛠️ Installation & Running

You don't need Node.js or Postgres installed. Just **Docker**!

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd Task-Management
````

### 2. Run with Docker 🐳

This command will pull the images and start the full stack:

**Bash**

```
docker-compose up
```

Visit `http://localhost:3000` to see the app.

---

## Screenshots

Light Mode:

![LightMode](./screenshots/LightMode.png)

Dark Mode:![Dark Mode](./screenshots/DarkMode.png)

Web/Mobile App :

![Responsive](./screenshots/CrossPlatformApp.png)

```

## ⚠️ Important Note Regarding UI Theme

This application is built using **Ionic Framework**, which deeply integrates with your system's and browser's native color scheme preferences.

For the **best visual experience** (especially to enjoy the Glassmorphism effects and correct contrast):

- The app automatically detects your system preference on startup.
- If you switch modes manually using the toggle button ☀️/🌙, **it is recommended that your browser's theme matches the selected mode.**

> **Why?** Ionic components (like Modals and Alerts) inherit base styles from the browser's `prefers-color-scheme` media query. Keeping them in sync ensures 100% color consistency.
```

## Architecture

- **Frontend:** Communicates via REST API.
- **Backend:** NestJS handles business logic and connects to Postgres via TypeORM.
- **Database:** Data persistency using Docker Volumes.

---

Moaaz
