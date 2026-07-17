# PayFlow - Premium UPI Money Transfer Application

PayFlow is a production-ready, modern, high-fidelity UPI Money Transfer and Digital Wallet frontend built with React 19, Vite, and Tailwind CSS. The app features a premium banking aesthetic tailored with a **blue and gold-yellow color theme** supporting complete desktop, tablet, and mobile responsiveness.

---

## 🚀 Live Development Server
The application is running locally. You can access it directly at:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 🛠️ Technology Stack
- **Framework**: React 19 & Vite (latest)
- **Styling**: Tailwind CSS & DaisyUI
- **Routing**: React Router DOM (with route guards and lazy loading)
- **Forms**: React Hook Form
- **State & Queries**: TanStack React Query (v5)
- **HTTP Client**: Axios (configured with centralized interceptors and mock adapters)
- **Real-Time Simulation**: Mock Socket.io client
- **Animations**: Framer Motion
- **Charts**: Chart.js & React Chartjs 2
- **Icons**: React Icons (Feather Icons)
- **Feedback**: React Hot Toast

---

## 📂 Production Folder Structure
The codebase follows clean architecture principles with distinct folders separating UI, layout logic, API routing, and state providers:

```
src/
 ├── assets/          # Static assets
 ├── components/      # Global reusable components (Navbar, Sidebar, Guards)
 ├── context/         # Auth, Theme, and Socket context providers
 ├── layouts/         # Layout shells (DashboardLayout, AuthLayout)
 ├── pages/           # Page views (Dashboard, Contacts, Wallet, Settings)
 │    └── auth/       # Auth pages (Login, Register, OTP, Password Reset)
 │    └── transfer/   # Money transfer modules (Send, Bank, Self, QR scan/generate)
 ├── routes/          # Code-split app route definitions
 ├── services/        # Centralized Axios configs and Socket adapters
 └── styles/          # Styling files (index.css)
```

---

## ⚙️ Key Architectural Implementations

### 1. Unified Theme switching
Theme configurations are loaded in `tailwind.config.js` under two custom DaisyUI definitions:
- **`payflowLight`**: High contrast sapphire blue (`#0F52BA`) primary brand color with golden yellow (`#D4AF37`) accents on an off-white background.
- **`payflowDark`**: Muted dark space-navy base (`#0B132B`) with soft gold highlights for optimal low-light legibility.

### 2. Client-Side Persistent Database Mocking
To run completely serverless in pure static hosts while maintaining full CRUD features (adding cards, linking banks, processing payments):
- All transactions, user details, contacts, notifications, and balances are initialized in `src/services/mockData.js` and persisted in `localStorage`.
- All modifications (making transfers, depositing funds, checking out) write directly to storage, maintaining state integrity even after full browser refreshes.

### 3. Centralized Axios Interceptors
The instance in `src/services/api.js` registers a custom `adapter` that intercepts matching API URLs, simulates a `300ms` network latency, and returns simulated HTTP responses (`200 OK`, `401 Unauthorized`, `201 Created`).
- It parses JWT tokens in header request configs.
- Automatically handles token refreshes: if a token expires, response interceptors send a request to `/api/auth/refresh`, renew the session, and seamlessly retry the original request.

### 4. Live Socket.io Simulations
The Socket.io client (`src/services/socket.js`) simulates an active socket connection.
- Broadcasts fluctuating "online users" numbers to the top header navbar.
- Listens to payment initiation requests (`start_payment_process`), returning live progress statuses ("Verifying credentials...", "Settling funds...") before declaring successful outcomes.
- Triggers periodic mock incoming transfer alerts, pushing custom toast banners.

---

## 🔧 Installation & Commands
To run the project locally or build for production:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start local development server**:
   ```bash
   npm run dev
   ```

3. **Build production bundle**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🔑 Demo Credentials
To sign into the dashboard panel instantly, use the pre-loaded credentials on the login screen:
- **Email**: `alex.morgan@payflow.com`
- **Password**: `password123`
- **Verification OTP**: `123456` (Used during password reset/forgot password flows)
