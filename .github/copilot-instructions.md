# Mamta Bhojanalaya - AI Coding Agent Instructions

## Project Overview
Mamta Bhojanalaya is a **full-stack restaurant management web application** built with React + Vite, featuring user authentication, menu management, cart/ordering system, payments (Stripe), and admin dashboard. The backend is deployed at `https://masuk-kitchen-server.vercel.app`.

**Tech Stack:** React 18, Vite, Firebase Auth, Tailwind CSS + DaisyUI, React Query, Stripe, Axios, React Router v6

---

## Architecture & Data Flow

### User Authentication Flow
- **Auth Provider** (`src/Provider/AuthProvider.jsx`) manages all auth state using Firebase
- On login/signup, JWT token is generated via backend POST to `/jwt` endpoint
- Token stored in `localStorage` under key `'access-token'`
- Logout removes the token and clears auth state
- **Google OAuth** supported via `GoogleAuthProvider`

### HTTP Communication Pattern (Critical)
1. **Axios Interceptor Hook** (`src/Hooks/useAxiosInterceptor.jsx`) is THE standard for all secure API calls
   - Creates axios instance with `baseURL: 'https://masuk-kitchen-server.vercel.app'`
   - Auto-injects `Authorization: Bearer {token}` header on every request
   - Auto-logout if response is 401/403 and redirect to `/login`
2. **Always use** `useAxiosInterceptor()` instead of raw `fetch()` for protected routes
3. **Non-protected** data (like menu) uses plain `fetch()` or axios without interceptor

### Data Fetching Pattern
- **React Query** (`@tanstack/react-query`) used consistently for server state management
- Query keys follow pattern: `queryKey: ['resource', user?.email]` (includes email for user-scoped data)
- All custom hooks return: `[data, refetch, isLoading/isPending, isError]` array pattern (see `useCart`, `useMenu`, `useAdmin`)
- **Never use** useState + useEffect for fetching—use React Query instead

### Database & Collections
Backend MongoDB collections (inferred from hooks):
- `/menu` - Global menu items (cached indefinitely, accessed by all)
- `/carts?email=user@email` - User-specific cart (per-user, requires auth)
- `/users/{email}` - User profile + admin role check
- `/orders` - All orders (admin access)
- `/reservations` - Bookings system
- `/reviews` - User reviews

---

## Component Structure & Naming

### Directory Organization
```
src/Components/
├── AdminDashboard/     → Admin-only features (ManageOrder, ManageItem, AllUsers, etc.)
├── AuthComponent/      → Login, Register pages
├── CartPages/          → Cart display and management
├── Contact/            → Contact page
├── Home/               → Homepage + sub-components in HomeComponent/ subfolder
├── Menu/               → Menu listing page
├── Orderpage/          → Order placement (by category)
├── SharedComponent/    → Reusable UI (Header, Footer, ErrorPage, ItemShow, etc.)
├── UserDashboard/      → User account features (Payment, Reservations, OrderHistory, Reviews)
```

### Component Naming Conventions
- **PascalCase** for all component files and exports (e.g., `Homepage.jsx`, `PaymentForm.jsx`)
- **Sub-components** stored in folders with same name (e.g., `Home/HomeComponent/Banner.jsx`)
- **Shared components** in `SharedComponent/` if used across multiple feature areas
- **Dashboard layout** uses nested routing via `Dashboard.jsx` layout component

---

## Key Development Patterns

### 1. Protected Routes
- `PrivateRoute.jsx` - Requires user login (any authenticated user)
- `AdminRoute.jsx` - Requires both login AND admin role
- Both check `useAdmin()` hook which queries `/users/{email}` for admin status

### 2. UI/Styling Stack
- **Tailwind CSS** + **DaisyUI** components (`tailwind.config.js` includes daisyui plugin)
- DaisyUI classes: `badge`, `loading loading-spinner`, `hero`, `tabs`, `modal`, etc.
- **No CSS modules** — only inline Tailwind/DaisyUI (except `src/Components/UserDashboard/style.css` for payment-specific styles)
- Loading states use: `<span className='loading loading-spinner w-16 text-warning'></span>`

### 3. Form Handling
- **React Hook Form** used for complex forms (Login, Register, PaymentForm, AddReview)
- **SweetAlert2** (`Swal.mixin()`) for toasts and confirmations
- **React Hot Toast** (`toast.success()`, `toast.error()`) for simple notifications

### 4. Payment Integration
- **Stripe** via `@stripe/react-stripe-js`
- `loadStripe(import.meta.env.VITE_PAYMENT_GATEWAY_PUBLISH_K)` in `Payment.jsx`
- `PaymentForm.jsx` handles card validation and `confirmCardPayment()` flow
- Backend endpoint: POST `/create-payment-intent` (expects `{ price }`)

### 5. SEO & Metadata
- **React Helmet Async** wraps every page with `<Helmet>` to set page title/meta tags
- Example: `<Helmet><title>Payment | Mamta Bhojnalaya Restaurant</title></Helmet>`

### 6. Admin Operations
- Admin actions (mark order served, delete item) use PATCH/DELETE endpoints
- Success confirmations via Toast notifications with `refetch()` to update UI
- Example: `axiosSecure.patch('/orders/{id}', { status: 'served' })`

---

## Environment Variables (Vite)
File: `.env.local` (not in repo)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_PAYMENT_GATEWAY_PUBLISH_K=...  # Stripe public key
```

---

## Build & Deployment

### Development
```bash
npm install
npm run dev          # Starts Vite dev server on http://localhost:5173
```

### Production
```bash
npm run build        # Outputs to dist/ (configured in vite.config.js)
npm run lint         # ESLint check (eslint . --ext js,jsx)
npm run preview      # Preview built dist locally
```

### Firebase Hosting
Configured via `firebase.json`:
- Public folder: `dist/`
- SPA rewrite: all routes → `/index.html` (enables React Router)
- Deploy: `firebase deploy`

---

## Common Tasks & Code Locations

| Task | Location(s) |
|------|------------|
| Add menu item | `src/Components/AdminDashboard/AddAItem.jsx` |
| Manage cart | `src/Hooks/useCart.jsx` + `src/Components/CartPages/CartItem.jsx` |
| Create protected page | Use `PrivateRoute` wrapper + `useAxiosInterceptor()` |
| Add form validation | Use `react-hook-form` + `handleSubmit` |
| Show notifications | `toast.success()` (hot-toast) or `Swal.fire()` (sweetalert2) |
| Query user data | `useCart()`, `useAdmin()`, `useOrders()` custom hooks |
| Style new component | Tailwind classes + DaisyUI components in JSX |

---

## Anti-Patterns & Common Mistakes

❌ **Don't:**
- Use raw `fetch()` for authenticated requests → use `useAxiosInterceptor()`
- Fetch data in components with useState + useEffect → use React Query hooks
- Import/export from deeply nested paths → organize in `/Components` or `/Hooks`
- Mix Tailwind with CSS files → keep styling in className attributes

✅ **Do:**
- Always call `refetch()` after mutations to sync UI with backend
- Set `queryKey` with user context (email) for per-user data
- Check `isLoading` before rendering tables/lists (show spinner or skeleton)
- Use `Helmet` on every route-level page component

---

## Questions to Ask
When requirements are ambiguous:
1. Is this user data (use email in queryKey) or global data (cache indefinitely)?
2. Does this action require admin role (check `useAdmin` hook)?
3. Should this be a toast notification or modal confirmation (use Swal for destructive actions)?
4. Is this a protected route or public (PrivateRoute vs standard Route)?
