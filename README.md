# Here are your Instructions
# MUL Salary Tracker

A modern, full-stack salary management and payslip generation system built for employees to track daily work hours, calculate earnings, manage vacation and sick days, and generate professional payslips.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Default Configuration](#default-configuration)
- [Pages & Modules](#pages--modules)
- [Environment Variables](#environment-variables)
- [Known Issues & Troubleshooting](#known-issues--troubleshooting)
- [Contributing](#contributing)

---

## Overview

MUL Salary Tracker is a personal salary management tool designed for contractors and employees who need to log daily working hours, track allowances, and generate payslips. It features a clean blue/indigo UI, dark mode support, real-time calculations, and comprehensive analytics.

---

## Features

### Core
- **Login / Authentication** — Session-based login with localStorage persistence
- **Daily Work Entry** — Log start/end times, breaks, travel allowance, meal allowance, public holiday flag, and notes
- **Live Calculation Preview** — See gross pay, tax, bonus, and net pay update in real time as you fill in the form
- **Monthly Dashboard** — KPI cards with circular progress rings, weekly hours bar chart, payroll summary
- **Payslip Generation** — Preview and download PDF payslips, send via email

### Analytics
- **Monthly Comparison** — Side-by-side delta vs previous month for pay, hours, gross, and AZK bank
- **Tax Savings Estimator** — Visual breakdown of how tax-free allowances (bonus, travel, meal) reduce your tax liability
- **Work Pattern Insights** — Average hours by day of week, best/slowest day callout
- **Overtime Heatmap** — Color-coded calendar grid showing days over/under the 8h target
- **Yearly Gross vs Net Chart** — Full-year dual-line comparison

### Data Management (Daily Entry)
- **Bulk Select & Delete** — Checkbox on every row, select all, delete multiple entries at once
- **Undo Delete** — Instantly restore deleted entries with one click
- **Copy Last Month** — Duplicate all entries from the previous month into the current month
- **Notes Column** — Add per-entry notes visible in the work log table

### Planning & Tracking
- **Vacation Management** — Log vacation days, track balance per year, visual progress bar
- **Vacation Calendar** — Monthly calendar view with vacation days highlighted
- **Sick Days Tracker** — Record sick leave with running totals
- **Yearly Overview** — Annual summary with month-by-month breakdown
- **Income Goal Tracker** — Set a monthly net pay target and track progress with a color-shifting bar
- **Yearly Earnings Trend** — Area chart of net pay across all 12 months with average, best month, and trend stats

### UX
- **Notifications Center** — Live bell icon with badge count; alerts for low/negative AZK bank and low vacation balance; mark read / clear all
- **Dark / Light Mode** — Toggle with preference saved to localStorage
- **Upload** — Drag-and-drop CSV/Excel import for bulk entry upload
- **Settings** — Configure hourly rate, contract hours, tax rate, email SMTP

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TailwindCSS v3, Shadcn UI (Radix UI) |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans, DM Sans, DM Mono |
| Backend | FastAPI (Python) |
| Database | MongoDB (Motor async driver) |
| PDF | ReportLab |
| Excel | OpenPyXL / Pandas |
| Auth | JWT (python-jose) + bcrypt |
| Build Tool | CRACO (Create React App + overrides) |

---

## Project Structure

```
MUL-Salary-Updated/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Shadcn UI primitives
│   │   │   ├── GoalTracker.jsx   # Monthly income goal widget
│   │   │   ├── Header.jsx        # Top nav bar with notifications
│   │   │   ├── Layout.jsx        # App shell with sidebar
│   │   │   ├── NotificationsPanel.jsx
│   │   │   ├── Sidebar.jsx       # Left navigation
│   │   │   ├── VacationCalendar.jsx
│   │   │   └── YearlyTrendChart.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── GoalContext.js
│   │   │   ├── NotificationsContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.js            # All Axios API calls
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── DailyEntry.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Payslip.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── SickDays.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Vacation.jsx
│   │   │   └── YearlyOverview.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css             # CSS variables, theme tokens
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── package.json
├── backend/
│   ├── server.py                 # FastAPI application
│   └── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | **v18 or v20 LTS** (v22+ not supported by react-scripts v5) |
| npm | v9+ |
| Python | v3.10+ |
| MongoDB | v6+ (local or Atlas) |

> ⚠️ **Important:** Node.js v22 and v24 are **not compatible** with this project due to `react-scripts` v5 and `webpack` v4 using internal Node APIs that were removed. Use Node v18 or v20.
>
> To switch Node versions easily, install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases):
> ```bash
> nvm install 20
> nvm use 20
> ```

---

### Installation

**1. Clone or extract the project**

```bash
cd MUL-Salary-Updated
```

**2. Install frontend dependencies**

```bash
cd frontend
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required because some Radix UI packages have peer dependency conflicts with React 19.

**3. Install backend dependencies**

```bash
cd ../backend
pip install -r requirements.txt
```

---

### Running the App

**Start the backend**

```bash
cd backend
uvicorn server:app --reload --port 8000
```

**Start the frontend** (in a separate terminal)

```bash
cd frontend
npm start
```

The app will open at **http://localhost:3000**

**Login credentials (demo mode)**

| Field | Value |
|---|---|
| Email | Any valid email (e.g. `employee@company.com`) |
| Password | Any password 4+ characters |

---

## Default Configuration

These values are set in **Settings** and can be changed at any time:

| Setting | Default Value |
|---|---|
| Hourly Rate | €14.53 |
| Contract Hours | 151.67 hrs/month |
| Tax Rate | 27.64% |
| Bonus (6+ hr days) | €1.00 tax-free |
| Public Holiday Multiplier | 1.5× |

---

## Pages & Modules

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Authentication screen |
| `/dashboard` | Dashboard | KPI cards, weekly hours, payroll summary, goal tracker, vacation calendar, yearly trend |
| `/daily-entry` | Daily Entry | Log work hours with live calculation; bulk delete, copy month, undo |
| `/analytics` | Analytics | Monthly comparison, tax estimator, work patterns, overtime heatmap |
| `/upload` | Upload | Drag-and-drop CSV/Excel import |
| `/payslip` | Payslip | View, download PDF, send by email |
| `/yearly` | Yearly Overview | Full-year month-by-month summary |
| `/vacation` | Vacation | Log vacation days, manage annual balance |
| `/sick-days` | Sick Days | Record and track sick leave |
| `/settings` | Settings | Hourly rate, tax, contract hours, email config |

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

For the backend, create a `.env` in `backend/`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=mul_salary
SECRET_KEY=your-secret-key-here
```

---

## Known Issues & Troubleshooting

**`craco` is not recognized**
```bash
npm install --legacy-peer-deps
```

**`Cannot find module 'ajv/dist/compile/codegen'`**
This happens when Node.js v22+ is used. Switch to Node v18 or v20:
```bash
nvm install 20 && nvm use 20
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
npm start
```

**`visual-edits babel-metadata-plugin` error**
Already fixed in `craco.config.js` by setting `enableVisualEdits: false`.

**Backend not running — demo mode**
The frontend works without a backend. Notifications, charts, and most UI will render with fallback/demo data. Only data-dependent features (saving entries, generating payslips) require the backend.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is private and intended for personal use.

---

*Built with React 19 + FastAPI · Designed with a Blue/Indigo professional theme*