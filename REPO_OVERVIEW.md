# 🚄 TiketKAI — Repository Overview

> **Platform pemesanan tiket kereta digital** — A full-stack train ticket booking and management system.

---

## 1. Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend Framework** | **Next.js 16** (Pages Router) | Hybrid SSR/CSR via `getServerSideProps` |
| **API Layer** | **Express 5** mounted inside Next.js API routes | All CRUD + auth handled by Express |
| **Database** | **SQLite** (dev) + **PostgreSQL** (production) | Auto-detection via `DATABASE_URL` env var |
| **Storage** | Local filesystem (dev) + **Vercel Blob** (production) | Image uploads |
| **Styling** | **Tailwind CSS 3** + custom CSS variables + Google Fonts ("Plus Jakarta Sans", "Space Grotesk") | Custom design system with warm, earthy tones |
| **Auth** | HMAC-signed cookie-based admin session | `tiketkai_admin` cookie |
| **Icons** | **Lucide React** | ~20 icon components used across the UI |
| **Image Handling** | `multer` (memory storage) → Vercel Blob or local FS | Max 4MB upload |
| **Package Manager** | npm | |
| **Migration Tooling** | Custom SQLite → PostgreSQL migration script | |

### Dependencies (key)

- `next@^16.2.5`, `react@^19.2.5`, `react-dom@^19.2.5`
- `express@^5.2.1`, `multer@^2.1.1`
- `better-sqlite3@^12.9.0`, `pg@^8.20.0`
- `@vercel/blob@^2.3.3`
- `lucide-react@^1.17.0`
- `cookie@^1.1.1` (for cookie parsing/serialization)
- `tailwindcss@^3.4.19`, `autoprefixer`, `postcss`

---

## 2. Architecture

```
pages/
├── _app.js                          # Root app wrapper
├── index.js                         # Public homepage (hero + booking + ticket listing)
├── jadwal.js                        # Schedule page (hardcoded data)
├── jadwal-status.js                 # Combined schedule + status view
├── status.js                        # Train status monitoring (live DB)
├── kereta.js                        # Full train data table (DB-backed)
├── kereta/[id].js                   # Train detail page (seat map, facilities)
├── pemesanan.js                     # Booking form (hardcoded demo)
├── checkout/[id].js                 # Checkout flow (DB-backed, real purchase API)
├── cek-pesanan.js                   # E-ticket display (query params)
├── status-pesanan.js                # Order tracking timeline (hardcoded demo)
├── riwayat.js                       # Order history (hardcoded demo)
├── api/[...path].js                 # Express API mount point
└── admin/
    ├── index.js                     # Admin login page
    ├── dashboard.js                 # Admin dashboard overview
    ├── kereta.js                    # CRUD management for trains
    ├── tambah.js                    # Add new train form
    ├── edit/[id].js                 # Edit train form
    ├── jadwal.js                    # Admin schedule viewer
    ├── status.js                    # Admin status viewer
    ├── laporan.js                   # Operational report (stats)
    └── laporan-keuangan.js          # Financial report (transactions, revenue, charts)

lib/
├── server.js                        # Express app (all API routes)
├── db.js                            # Database abstraction layer (SQLite + PostgreSQL)
├── auth.js                          # Cookie-based admin auth
├── train-utils.js                   # Data formatting, filtering, validation helpers
├── constants.js                     # App-wide constants
├── storage.js                       # File upload abstraction (local + Vercel Blob)
├── booking-context.js              # React Context for booking form state
├── page-auth.js                     # SSR auth guard helpers
└── query-string.js                  # URL query string builder

components/
├── public/                          # Public-facing React components
│   ├── PublicLayout.js              # Main layout shell (Head, Navbar, BookingProvider)
│   ├── Navbar.js                    # Navigation bar with dropdown profile
│   ├── BookingForm.js               # Search form (origin ↔ destination, date, passengers)
│   ├── PopularRoutes.js             # Quick route chips
│   ├── Pagination.js                # Page navigation component
│   ├── RecommendedTrain.js          # Sidebar recommendation card
│   └── TrainFilters.js              # Public search filters (unused?)
├── admin/
│   ├── AdminLayout.js               # Admin dashboard layout (sidebar + topbar)
│   ├── AdminTrainFilters.js         # Admin filter form
│   └── TrainForm.js                 # Reusable train create/edit form
├── jadwal/
│   ├── ScheduleCard.js              # Schedule card with timeline visualization
├── jadwal-status/
│   ├── SearchPanel.js               # Combined search + results panel
│   ├── StatusPanel.js               # Live status + stat cards
│   └── SubNav.js                    # Tab navigation
├── status/
│   └── StatusCard.js                # Status card for individual train
├── ui/
│   ├── EmptyState.js                # Empty/no-results state
│   ├── LoadingState.js              # Loading spinner
│   ├── Notification.js              # Toast notification (success/error/warning)
│   ├── MetricGrid.js                # Metric stat card grid
│   └── PageHeader.js                # Page header with title, description, meta, actions
├── StatusBadge.js                   # Reusable status badge (On Time / Delay / Dibatalkan)
└── TrainClassBadge.js               # Reusable class badge (Ekonomi / Bisnis / Eksekutif)

styles/
└── globals.css                      # Tailwind + comprehensive custom CSS design system (~1300 lines)

templates/                           # Legacy Flask Jinja2 templates (reference only)
static/                              # Legacy Flask static assets (reference only)
app.py                               # Legacy Flask app (reference only)
```

---

## 3. Features

### Public (User-Facing)

| Feature | Status | Notes |
|---|---|---|
| **Homepage** — hero greeting, booking search form, popular routes, ticket listing with pagination | ✅ Live (DB-backed) | |
| **Ticket Search** — filter by origin, destination, date, class, and price range | ✅ Server-side & client-side | SSR initial + client-side fetch |
| **Train Schedule** — timeline cards with departure/arrival, duration, class, price, seats | ⚠️ Hardcoded data | `/jadwal` uses static array |
| **Train Detail Page** — description, route visualization, facilities grid, interactive seat map | ✅ Live (DB-backed) | `/kereta/[id]` |
| **Status Monitoring** — live train status with stats summary, searchable grid | ✅ Live (DB-backed) | `/status` with `getAllTrains` |
| **Checkout Flow** — full form (name, email, phone, payment method, quantity), price summary, real API call | ✅ Live (DB-backed) | Creates `pembelian` record |
| **E-Ticket Display** — boarding pass UI with QR placeholder, booking code, passenger details | ⚠️ Query-param driven | `/cek-pesanan` |
| **Order Tracking** — timeline-based status tracker (booking → payment → confirmation → boarding → completed) | ⚠️ Hardcoded demo | `/status-pesanan` |
| **Order History** — searchable/filterable history list with status badges | ⚠️ Hardcoded demo | `/riwayat` |
| **Booking Form** (standalone) — full passenger form with seat selection, validation | ⚠️ Hardcoded demo | `/pemesanan` |
| **Combined Schedule + Status** — split-screen layout with live status cards and search panel | ⚠️ Hardcoded data | `/jadwal-status` |

### Admin Panel

| Feature | Status | Notes |
|---|---|---|
| **Admin Login** — password-based session with HMAC-signed cookie | ✅ | Cookie: `tiketkai_admin` |
| **Dashboard** — stat overview, filterable train table, CRUD actions | ✅ Live (DB-backed) | `/admin/dashboard` |
| **Train Management** — paginated, filterable list with edit/delete | ✅ Live (DB-backed) | `/admin/kereta` |
| **Add Train** — form with auto-price suggestion by class, image preview | ✅ Live (DB-backed) | `/admin/tambah` |
| **Edit Train** — pre-filled form with image upload/replace | ✅ Live (DB-backed) | `/admin/edit/[id]` |
| **Schedule Viewer** — table of all train schedules | ✅ Live (DB-backed) | `/admin/jadwal` |
| **Status Viewer** — table of all train statuses | ✅ Live (DB-backed) | `/admin/status` |
| **Operational Report** — on-time rate, disruption analysis | ✅ Live (DB-backed) | `/admin/laporan` |
| **Financial Report** — revenue, transactions, tickets sold; period tabs (today/week/month/all) + custom date range + daily bar chart + paginated transaction table | ✅ Live (DB-backed) | `/admin/laporan-keuangan` |

### Data Model

**`kereta`** (trains)
| Column | Type | Notes |
|---|---|---|
| id | INTEGER (PK, auto) | |
| nama | TEXT (required) | Train name |
| asal | TEXT | Origin station |
| tujuan | TEXT | Destination station |
| kelas | TEXT | Ekonomi / Bisnis / Eksekutif |
| harga | INTEGER | Price in IDR |
| tanggal | TEXT | Date string |
| jam | TEXT | Time string |
| status | TEXT | On Time / Delay / Dibatalkan |
| deskripsi | TEXT | Description |
| gambar | TEXT | Image filename or URL |
| kapasitas | INTEGER (default 48) | Total seats |
| kursi_tersedia | INTEGER (default 48) | Available seats |

**`pembelian`** (purchases)
| Column | Type | Notes |
|---|---|---|
| id | INTEGER (PK, auto) | |
| kereta_id | INTEGER (FK → kereta) | |
| nama_kereta | TEXT | |
| asal / tujuan / kelas | TEXT | Denormalized |
| harga_satuan | INTEGER | |
| jumlah_tiket | INTEGER | |
| total_harga | INTEGER | |
| nama_pembeli / email_pembeli / no_telepon | TEXT | Buyer info |
| metode_pembayaran | TEXT | Payment method |
| status_pembayaran | TEXT (default 'paid') | |
| tanggal_pembelian | DATETIME (auto) | |
| tanggal_keberangkatan | TEXT | |

---

## 4. Missing / Incomplete Things

### 🚨 Critical Missing Pieces

| Issue | Priority | Details |
|---|---|---|
| **No authentication system** | 🔴 High | Only simple password check (`ADMIN_PASSWORD` env var). No user accounts, no registration, no role-based access. Public users are a hardcoded "riee" string. |
| **No real payment integration** | 🔴 High | Checkout creates a `pembelian` record but never actually processes payment. No payment gateway (Midtrans, Xendit, etc.). |
| **No email/SMS notifications** | 🟠 Medium | No email or SMS sent after booking. No e-ticket delivery. |
| **No real-time updates** | 🟠 Medium | The "Live Monitoring" / "Real-time" labels are aspirational. Status updates require manual admin input. No WebSocket, SSE, or polling. |
| **No CI/CD configuration** | 🟠 Medium | No GitHub Actions, no lint/test scripts configured. |

### 🟡 Functional Gaps

| Gap | Details |
|---|---|
| **Hardcoded demo data on 4 pages** | `/jadwal`, `/pemesanan`, `/status-pesanan`, `/riwayat`, `/jadwal-status` all use static arrays instead of database queries |
| **No user registration/login** | Public users are anonymous. No way to save bookings, favorites, or passenger profiles. |
| **No seat reservation locking** | Seat selection UI exists on `/kereta/[id]` and `/pemesanan` but doesn't actually reserve/lock seats. Double-booking is possible. |
| **No booking cancellation flow** | No UI to cancel a booking. Admin can delete trains but there's no cancellation workflow. |
| **No refund/return handling** | Financial report shows revenue but has no refund tracking. |
| **No search/sort on schedule pages** | `/admin/jadwal` and `/admin/status` have no search or filter controls. |
| **No export functionality** | Financial/operational reports can't be exported to CSV/PDF. |
| **No mobile app / PWA** | No service worker, manifest, or install prompt. |
| **No rate limiting** | API endpoints have no rate limiting or brute-force protection. |
| **No input sanitization on display** | User-supplied data (train names, descriptions) is rendered directly without XSS protection (though Next.js auto-escapes in JSX). |
| **Hardcoded user name "riee"** | Appears in Navbar, hero greeting, and various places. Not configurable. |
| **No proper error pages** | Next.js default 404/500 pages. No customized error boundaries. |
| **No `.env.example` file** | Environment variables are documented in README but no template file exists. |
| **No database seed script** | No way to populate the database with sample data for development. |

### 🟢 Polish & DX Improvements

| Improvement | Details |
|---|---|
| **No TypeScript** | Entire codebase is plain JavaScript. No type safety. |
| **No testing** | Zero unit, integration, or E2E tests. |
| **No linting/formatting config** | No ESLint, Prettier, or Husky setup. |
| **No API documentation** | Express routes have no OpenAPI/Swagger docs. |
| **No logging/monitoring** | No structured logging, no error tracking (Sentry, etc.). |
| **Inconsistent data patterns** | Some pages use `getServerSideProps` + DB, others use hardcoded arrays. The `/pemesanan` page simulates an API call that doesn't actually persist. |
| **Legacy Flask files still present** | `app.py`, `templates/`, `static/`, `requirements.txt` remain as dead reference code. |
| **Duplicate checkout pages** | Both `/checkout/[id]` (DB-backed) and `/pemesanan` (hardcoded) exist with similar but different workflows. |
| **No Docker setup** | No Dockerfile or docker-compose for containerized development. |

---

## 5. API Routes (Express)

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ❌ | Health check |
| `GET` | `/trains` | ❌ | Get all trains (with filters) |
| `GET` | `/trains/:id` | ❌ | Get single train |
| `POST` | `/trains` | ✅ Admin | Create train (multipart) |
| `POST` | `/trains/:id` | ✅ Admin | Update train (multipart) |
| `POST` | `/trains/:id/delete` | ✅ Admin | Delete train |
| `GET` | `/schedule` | ❌ | Get schedule rows |
| `GET` | `/statuses` | ❌ | Get status rows |
| `GET` | `/report` | ❌ | Get operational report stats |
| `POST` | `/checkout` | ❌ | Create purchase |
| `GET` | `/purchases` | ❌ | Get all purchases |
| `GET` | `/purchases/summary` | ❌ | Purchase summary by period |
| `POST` | `/auth/login` | ❌ | Admin login (form POST, redirect) |
| `POST` | `/auth/logout` | ❌ | Admin logout (redirect) |

---

## 6. Visual Design

The project has a **custom, well-crafted design system**:

- **Warm, earthy palette**: Brand orange (`#f37021`), navy (`#0f2743`), cream backgrounds
- **Glassmorphism effects**: `backdrop-blur`, semi-transparent surfaces
- **Generous rounding**: `16px`–`28px` border radii
- **Gradient accents**: Orange gradients on CTAs, navy gradients on hero panels
- **Micro-interactions**: Hover animations, transitions, floating CTAs with pulse animation
- **Design tokens**: CSS custom properties for colors, shadows, radii
- **Two layouts**: Public (warm/light) and Admin (dark sidebar, content area)
- **Responsive**: Mobile-first breakpoints at 768px, 1024px, 1200px
- **Typography**: "Plus Jakarta Sans" for body, "Space Grotesk" for headings/numbers

---

## 7. Quick Start

```bash
npm install
# Set ADMIN_PASSWORD in .env.local
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | ✅ | Admin login password (default: `admin123`) |
| `SECRET_KEY` | ❌ | HMAC signing key for auth cookie |
| `DATABASE_URL` | ❌ | PostgreSQL connection string |
| `POSTGRES_URL` | ❌ | Fallback for Vercel |
| `BLOB_READ_WRITE_TOKEN` | ❌ | Vercel Blob token |
| `COOKIE_SECURE` | ❌ | Set `1` for secure cookies outside Vercel |

---

*Generated from repository analysis. Last updated: June 2026.*
