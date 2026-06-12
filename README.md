# 🚀 Tracker - Premium Expense & Goal Management

A state-of-the-art, beautifully designed personal finance application built with React, Vite, and Supabase. 

Tracker helps you take control of your daily expenses, monitor your recurring subscriptions, achieve your savings goals, and intelligently manage your utility balances (like electricity).

## ✨ Features

- **💸 Expense Tracking**: Log daily expenses categorised by custom budgets.
- **📸 AI Receipt Scanning**: Upload a photo of a receipt and automatically extract the total amount using Tesseract.js OCR.
- **🎯 Savings Goals**: Set target amounts for things you love, add funds over time, and watch the progress bar fill up.
- **🔄 Subscription Management**: Track all your recurring bills and calculate your true monthly run-rate.
- **⚡ Smart Electricity Wallet**: Maintain a prepaid utility wallet that automatically deducts your estimated daily consumption.
- **📊 Analytics & PDF Exports**: Visualize your spending habits with interactive charts and export professional PDF reports.
- **☁️ Real-time Sync**: Everything is instantly backed up to a secure Supabase PostgreSQL database.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide (Icons)
- **State Management**: Zustand (with Persist Middleware)
- **Backend & Database**: Supabase (PostgreSQL, Auto-generated APIs)
- **Utilities**: Recharts (Data Viz), jsPDF & html2canvas (Reports), Tesseract.js (AI OCR)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A [Supabase](https://supabase.com/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project.
   - Run the provided SQL schema to generate the tables (`users`, `expenses`, `categories`, `subscriptions`, `goals`, etc).
   - Add your Supabase URL and Anon Key to `src/lib/supabase.ts`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📜 License
This project is open-source and available under the MIT License.
                                 