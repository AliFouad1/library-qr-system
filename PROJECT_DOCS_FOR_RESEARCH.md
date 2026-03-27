# Library QR System — Project Documentation for Graduation Research (Chapter 3)

> **Intended Use:** This document provides full technical details for writing Chapter 3 of a university graduation project. Chapter 3 typically covers: System Design, Architecture, Implementation, Tools & Technologies, Database Design, and System Modules.

---

## Project Title
**QR Code-Based Smart Library Management System**

---

## Project Summary

This project is a web-based library management system that uses QR codes to streamline library operations including book cataloging, borrowing, returning, and shelf organization. The system targets university or public libraries and supports multiple user roles (Admin, Staff, and Regular Users). It is built as a Single Page Application (SPA) using modern frontend technologies with a RESTful backend API.

Key innovation: Each book is assigned a unique QR code. Users or staff can scan the QR code to instantly view book details, availability, and location, without typing or searching manually.

---

## Chapter 3 Outline Suggestion

Chapter 3 should cover the following sections:

1. System Architecture Overview
2. Technologies and Tools Used (with justification)
3. System Modules and Functionality
4. Database Design (Entities and Relationships)
5. User Interface Design
6. Authentication and Security
7. QR Code Integration
8. Internationalization (Multi-language Support)
9. API Design and Communication
10. Deployment

---

## 1. System Architecture

### Architecture Pattern
The system follows a **Client-Server architecture** with a clear separation between:
- **Frontend (Client):** React-based SPA running in the browser
- **Backend (Server):** RESTful API server (separate project, not included here)
- **Database:** Managed by the backend (relational database inferred from data models)

### Frontend Architecture Pattern
The frontend follows a **component-based architecture** with:
- **Pages** — Top-level views mapped to routes
- **Components** — Reusable UI building blocks
- **Context (Global State)** — Authentication state shared across the app
- **Services** — Abstracted API communication layer
- **i18n** — Internationalization layer for Arabic/English support

### Communication
- The frontend communicates with the backend exclusively via **HTTP REST API** using the `axios` library.
- All API requests (except login and public book detail) require a **JWT Bearer Token** in the `Authorization` header.
- Base URL is configurable via environment variable: `VITE_API_URL`.

---

## 2. Technologies and Tools Used

### Frontend Framework
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI component library (SPA framework) |
| React Router DOM | 6.20.1 | Client-side routing and navigation |
| Vite | 5.0.8 | Build tool and development server |

**Justification for React:** React was chosen for its component reusability, large ecosystem, virtual DOM for performance, and wide adoption in industry. Vite was chosen over Create React App for its significantly faster hot-module-replacement (HMR) during development.

### Styling
| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.3.6 | Utility-first CSS framework |
| PostCSS | 8.4.32 | CSS transformation and processing |
| Autoprefixer | 10.4.16 | Automatic vendor prefixing for browser compatibility |

**Justification for Tailwind CSS:** Tailwind provides rapid UI development through utility classes, eliminates context-switching between CSS files, and makes responsive design straightforward via responsive prefixes (sm:, md:, lg:).

### API Communication
| Technology | Version | Purpose |
|---|---|---|
| Axios | 1.6.2 | HTTP client for REST API calls |

**Justification:** Axios was preferred over the native Fetch API for its automatic JSON transformation, request/response interceptors (used for token injection and 401 handling), and cleaner error handling.

### QR Code
| Technology | Version | Purpose |
|---|---|---|
| html5-qrcode | 2.3.8 | Camera-based QR code scanning in the browser |

**Justification:** `html5-qrcode` provides a cross-browser, camera-based QR scanning experience without requiring native apps or external scanners, making it accessible on any modern smartphone or desktop with a camera.

### Internationalization
| Technology | Version | Purpose |
|---|---|---|
| i18next | 23.7.6 | Internationalization framework |
| react-i18next | 13.5.0 | React bindings for i18next |
| i18next-browser-languagedetector | 7.2.0 | Automatic browser language detection |

### Charts & Visualization
| Technology | Version | Purpose |
|---|---|---|
| Recharts | 2.10.3 | Data visualization charts for dashboard |

### Icons
| Technology | Version | Purpose |
|---|---|---|
| Lucide React | 0.294.0 | Consistent SVG icon library |

---

## 3. System Modules and Functionality

### 3.1 Authentication Module
- **Login Page:** Email and password form with error feedback and loading indicator.
- **JWT Token Management:** Token stored in `localStorage`, injected automatically into all API requests via Axios interceptors.
- **Session Persistence:** On app load, the system calls `getCurrentUser()` to validate the stored token and restore user session.
- **Auto Logout:** Any `401 Unauthorized` API response triggers automatic logout and redirect to login.
- **Demo Credentials Display:** Login page shows demo credentials for each role (Admin, Staff, User) for testing purposes.

### 3.2 Dashboard Module
Accessible to all authenticated users. Displays:
- **Statistics Cards:**
  - Total Books in library
  - Available Books (not borrowed)
  - Active Borrowings (currently borrowed)
  - Overdue Books (past due date)
- **Quick Action Links:** Shortcut buttons to Books, Borrow, and QR Scanner pages.
- **System Information:** Displays current user's name, role, and system status.
- Data fetched from `/api/reports/dashboard` endpoint.

### 3.3 Book Management Module
Accessible to **Admin** and **Staff** roles only (write operations). Regular users can view.

Features:
- **Book Listing:** Grid/list view of all books with cover images, title, author, category, shelf location, and availability status.
- **Search:** Real-time search with 500ms debounce to reduce unnecessary API calls. Searches by title, author, or ISBN.
- **Add Book:** Modal form with fields: Title, Author, ISBN, Description, Publication Year, Category, Shelf, Total Copies. Restricted to Admin/Staff.
- **Edit Book:** Pre-populated modal form for updating book details. Restricted to Admin/Staff.
- **Delete Book:** Confirmation-based delete action. Restricted to Admin/Staff.
- **Book Cover Upload:** Separate API call to upload a cover image for a book.
- **Availability Indicator:** Color-coded badge showing available/unavailable status.
- **QR Code Display:** Each book detail shows its generated QR code image.

### 3.4 Borrowing Management Module
Accessible to **Admin** and **Staff** roles.

Features:
- **Active Borrowings List:** Table showing all active loans with borrower name, book title, borrow date, expected return date, and status (BORROWED/OVERDUE).
- **New Borrowing:** Modal form to record a new book loan — selects user, book, and due date.
- **Return Book:** Staff marks a book as returned, updating inventory availability.
- **Extend Borrowing:** Extends the due date by a specified number of additional days.
- **Status Indicators:** Color-coded rows — yellow for active, red for overdue, green for returned.
- **Due Date Tracking:** Automatic overdue detection based on `expectedReturnDate` vs. current date.

### 3.5 QR Code Scanner Module
- **Camera Scanning:** Uses device camera via `html5-qrcode` library to scan QR codes.
- **Two Scan Modes:**
  - **Book Mode:** Scans a book's QR code to view book details.
  - **Shelf Mode:** Scans a shelf QR code to view shelf information and books on it.
- **Manual Fallback:** Text input to manually enter a book or shelf ID if camera is unavailable.
- **Real-time Feedback:** Shows scan result immediately after successful scan.

### 3.6 Public Book Detail Module
- **No Authentication Required:** Accessible without login via direct URL `/book/:bookId`.
- **Purpose:** When a user scans a book's QR code, they are directed to this page.
- **Displays:**
  - Book cover image
  - Title, Author, ISBN, Publication Year
  - Category and Shelf Location
  - Availability status (available copies count)
  - Book description
  - The book's QR code image
- **Bilingual:** Supports English and Arabic display.
- **Use Case:** Library visitors can scan any book to check its details and availability before approaching staff.

---

## 4. Database Design

### Entities and Attributes

#### User
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| email | String | Unique login email |
| fullName | String | User's display name |
| role | Enum | ADMIN, STAFF, USER |
| status | Enum | ACTIVE, INACTIVE |
| password | String | Hashed password (managed by backend) |

#### Book
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| title | String | Book title |
| author | String | Author name |
| isbn | String | ISBN code (unique) |
| description | Text | Book description |
| publicationYear | Integer | Year of publication |
| coverImage | String | URL to cover image |
| qrCode | String | QR code image URL or data |
| copiesTotal | Integer | Total copies in library |
| copiesAvailable | Integer | Currently available copies |
| categoryId | FK | Reference to Category |
| shelfId | FK | Reference to Shelf |

#### Category
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| name | String | Category name (e.g., Science, Literature) |

#### Shelf
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| shelfCode | String | Unique shelf identifier code |
| location | String | Physical description of shelf location |

#### Borrowing
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| userId | FK | Reference to User |
| bookId | FK | Reference to Book |
| borrowDate | DateTime | Date the book was borrowed |
| expectedReturnDate | DateTime | Due date |
| actualReturnDate | DateTime | Actual return date (null if not returned) |
| status | Enum | BORROWED, RETURNED, OVERDUE |

### Entity Relationship Summary
- A **User** can have many **Borrowings**
- A **Book** can have many **Borrowings** (one per copy, over time)
- A **Book** belongs to one **Category**
- A **Book** is placed on one **Shelf**
- A **Shelf** can hold many **Books**
- A **Category** can have many **Books**

---

## 5. User Interface Design

### Design Principles
- **Mobile-First Responsive Design:** Built with Tailwind CSS breakpoints (sm, md, lg) ensuring usability on phones, tablets, and desktops.
- **Consistent Visual Language:** Gradient color scheme (blue-purple-pink), card-based layouts, consistent shadow and border-radius usage.
- **Accessibility:** RTL support for Arabic, keyboard-navigable forms, ARIA-friendly structure.
- **Feedback-Rich:** Loading spinners for async operations, color-coded status badges, error messages, success alerts.

### Pages Summary
| Page | Route | Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/` | All authenticated users |
| Books | `/books` | All authenticated users (edit: Admin/Staff only) |
| Borrow Management | `/borrow` | Admin/Staff only |
| QR Scanner | `/scanner` | All authenticated users |
| Public Book Detail | `/book/:id` | Public (no login required) |

### Navigation
- **Desktop:** Horizontal top navigation bar with gradient background, user name display, logout button, language toggle.
- **Mobile:** Hamburger menu collapsing navigation links.
- **Language Toggle:** EN/AR button in navigation that switches entire app language and text direction.

### Color-Coded Status System
| Status | Color | Meaning |
|---|---|---|
| Available | Green | Book can be borrowed |
| Unavailable | Red | All copies are borrowed |
| Borrowed | Yellow | Active loan |
| Overdue | Red | Past due date |
| Returned | Green | Successfully returned |

---

## 6. Authentication and Security

### Authentication Flow
1. User submits email and password on the Login page.
2. Frontend sends `POST /api/auth/login` with credentials.
3. Backend validates and returns a JWT token.
4. Token is stored in `localStorage`.
5. All subsequent API requests include `Authorization: Bearer <token>` header (injected by Axios interceptor).
6. On page load, `GET /api/auth/me` is called to validate the token and restore session.
7. On logout, token is removed from `localStorage` and user is redirected to login.

### Role-Based Access Control (RBAC)
Three roles with different permissions:

| Feature | User | Staff | Admin |
|---|---|---|---|
| View Dashboard | ✓ | ✓ | ✓ |
| View Books | ✓ | ✓ | ✓ |
| Add/Edit/Delete Books | ✗ | ✓ | ✓ |
| View Borrowings | ✗ | ✓ | ✓ |
| Create/Return Borrowings | ✗ | ✓ | ✓ |
| Scan QR Codes | ✓ | ✓ | ✓ |
| View Public Book Detail | Public | Public | Public |

### Security Measures
- JWT-based stateless authentication (no server-side sessions).
- Automatic 401-triggered logout prevents use of expired tokens.
- Protected routes in React Router prevent unauthorized page access on the frontend.
- Role checks on UI components prevent unauthorized actions from appearing in the interface.

---

## 7. QR Code Integration

### Overview
QR codes are central to the system's identity. Each book in the library is assigned a unique QR code generated and stored by the backend.

### Scanning Workflow
1. A library user or staff member opens the QR Scanner page.
2. The browser requests camera access via the `html5-qrcode` library.
3. The user points the camera at a book's QR code label.
4. The library decodes the QR code to extract a book ID or shelf ID.
5. The frontend sends the ID to the backend (`POST /api/qr/scan-book` or `POST /api/qr/scan-shelf`).
6. The backend returns the relevant book or shelf information.
7. The user is shown the book detail page or shelf information.

### Public Access via QR
A key feature: QR codes on book labels link directly to the **Public Book Detail Page** (`/book/:bookId`). This page:
- Requires no login.
- Displays full book information and availability.
- Is accessible from any smartphone browser by scanning the QR code.
- Supports Arabic and English.

This allows library visitors to check book availability without staff assistance.

### QR Code Display
- QR code images are stored and served by the backend.
- They are displayed as `<img>` elements on the Book Detail page.
- White background and padding ensure reliable scanability.

---

## 8. Internationalization (Multi-language Support)

### Supported Languages
- **English (en)** — Default language, LTR text direction
- **Arabic (ar)** — RTL text direction, full translation

### Implementation
- Uses `i18next` framework with `react-i18next` bindings.
- Translation strings are stored in JSON files:
  - `src/i18n/locales/en.json` — English translations
  - `src/i18n/locales/ar.json` — Arabic translations
- The `i18next-browser-languagedetector` plugin automatically detects the user's browser language on first visit.
- Language preference is saved in `localStorage` for persistence across sessions.

### RTL Support
- When Arabic is active, `dir="rtl"` is applied to the HTML document.
- CSS rules in `index.css` flip layout directions, margins, and paddings for RTL context.
- Tailwind CSS utility classes handle most directional styling, with additional custom RTL overrides.

### Translation Coverage
All user-facing text is translated including:
- Navigation menu items
- Dashboard statistics labels
- Book management labels and form fields
- Borrowing management labels
- Login page text
- Error and success messages
- Public book detail page content
- Buttons and action labels

---

## 9. API Design and Communication

### API Base URL
```
VITE_API_URL=http://localhost:5000/api
```
(Configurable via environment variable for different deployment environments)

### Authentication Endpoint
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/login` | Login with email and password | No |
| GET | `/auth/me` | Get current authenticated user | Yes |

### Books Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/books` | Get all books (supports search/pagination params) | Yes |
| GET | `/books/:id` | Get a single book by ID | No (public) |
| POST | `/books` | Create a new book | Yes (Admin/Staff) |
| PUT | `/books/:id` | Update a book | Yes (Admin/Staff) |
| DELETE | `/books/:id` | Delete a book | Yes (Admin/Staff) |
| GET | `/books/stats` | Get book statistics | Yes |
| POST | `/books/:id/cover` | Upload a cover image | Yes (Admin/Staff) |

### Borrowing Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/borrowings` | Get all borrowing records | Yes (Admin/Staff) |
| POST | `/borrowings` | Create a new borrowing | Yes (Admin/Staff) |
| PUT | `/borrowings/:id/return` | Mark a book as returned | Yes (Admin/Staff) |
| PUT | `/borrowings/:id/extend` | Extend due date | Yes (Admin/Staff) |
| GET | `/borrowings/stats` | Borrowing statistics | Yes |

### QR Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/qr/scan-book` | Process a scanned book QR code | Yes |
| POST | `/qr/scan-shelf` | Process a scanned shelf QR code | Yes |

### Other Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | Get all book categories |
| GET | `/shelves` | Get all shelves |
| GET | `/reports/dashboard` | Get dashboard statistics |
| GET | `/users` | Get all users (Admin only) |

### Request/Response Format
- All requests and responses use **JSON** format.
- Axios automatically serializes/deserializes JSON.
- Request headers include `Content-Type: application/json` and `Authorization: Bearer <token>`.

---

## 10. Deployment

### Frontend Deployment
- Deployed on **Vercel** (as indicated by `vercel.json` configuration).
- `vercel.json` includes URL rewrite rules to support React Router's client-side routing:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
  This ensures all routes (e.g., `/books`, `/borrow`) are handled by React Router, not Vercel's server.

### Build Process
```bash
npm install       # Install dependencies
npm run dev       # Start development server (Vite)
npm run build     # Build for production (outputs to /dist)
npm run preview   # Preview production build locally
```

### Environment Variables
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 11. Project File Structure

```
library-qr-system/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Navigation bar, sidebar, footer wrapper
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication state (React Context API)
│   ├── i18n/
│   │   ├── index.js            # i18next configuration and setup
│   │   └── locales/
│   │       ├── en.json         # English translation strings
│   │       └── ar.json         # Arabic translation strings
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Dashboard with statistics
│   │   ├── Books.jsx           # Book listing and management
│   │   ├── BorrowBook.jsx      # Borrowing and return management
│   │   ├── PublicBookDetail.jsx # Public QR-accessible book detail
│   │   └── QRScanner.jsx       # QR code scanner interface
│   ├── services/
│   │   └── api.js              # Axios instance + all API endpoint functions
│   ├── App.jsx                 # Root component with routing definitions
│   ├── main.jsx                # React app entry point
│   └── index.css               # Global styles, Tailwind imports, RTL rules
├── index.html                  # HTML shell
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment settings
└── package.json                # Project dependencies and scripts
```

---

## 12. System Flow Diagrams (Descriptions for Drawing)

### Login Flow
```
User → Login Page → Enter email/password → POST /auth/login
     → Backend validates → Returns JWT Token
     → Store token in localStorage
     → Redirect to Dashboard
```

### Book Search Flow
```
User → Books Page → Types in search box
     → 500ms debounce → GET /books?search=query
     → Backend filters books → Returns list
     → Frontend renders book cards
```

### QR Scan to Book Detail Flow
```
Library Visitor → Scans QR Code on book label
               → Opens /book/:bookId in browser (no login needed)
               → GET /books/:id from API
               → Public Book Detail Page renders
               → Shows title, author, availability, QR code image
```

### Borrow Book Flow
```
Staff → Borrow Page → Click "New Borrowing"
     → Select User + Book + Due Date
     → POST /borrowings
     → Backend creates record, decrements copiesAvailable
     → Frontend refreshes list
```

### Return Book Flow
```
Staff → Borrow Page → Find active borrowing
     → Click "Return"
     → PUT /borrowings/:id/return
     → Backend updates status to RETURNED, increments copiesAvailable
     → Frontend refreshes list
```

---

## 13. Key Design Decisions and Justifications

| Decision | Choice | Justification |
|---|---|---|
| SPA vs. MPA | SPA (React) | Faster navigation, better UX, no full page reloads |
| State Management | Context API + useState | Sufficient complexity; Redux would be over-engineered |
| CSS Framework | Tailwind CSS | Fast development, consistent design, built-in responsive utilities |
| Build Tool | Vite | Faster than Webpack/CRA, native ESM support |
| Authentication | JWT + localStorage | Stateless, scalable, easy to implement with REST API |
| QR Library | html5-qrcode | Browser-native, no app required, cross-platform |
| i18n Framework | i18next | Industry standard, supports RTL, flexible |
| Deployment | Vercel | Free tier, CI/CD from git, excellent React/Vite support |
| API Client | Axios | Interceptors for token injection, better error handling than Fetch |

---

*This documentation was generated to support writing Chapter 3: System Design and Implementation of a university graduation research project.*
