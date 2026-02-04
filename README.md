# QualitasNexusWeb Frontend

Modern React frontend application built with Next.js, integrated with the QualitasNexus backend (.NET API).

## 🏗️ Architecture

**Tech Stack:**
- Next.js 13+ (React framework)
- TypeScript (strict mode)
- PrimeReact (UI components)
- Next.js App Router

**Key Features:**
- 🔐 JWT-based authentication with refresh tokens
- 🏢 Multi-tenant support
- 👤 User profile management with image upload
- 🔑 Password change functionality
- 📱 Responsive design
- ⚡ Server components with client-side interactivity

## 📋 Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: 8+ or **yarn**
- **Backend**: QualitasNexus API running on `localhost:5030` (or configured URL)

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Configure your backend URL and tenant:

```ini
# Backend API base URL (development: http://localhost:5030, production: https://api.example.com)
NEXT_PUBLIC_BACKEND_API_BASE_URL=https://localhost:7030

# Tenant name (default: root)
NEXT_PUBLIC_BACKEND_TENANT=root
```

### 3. Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

### 4. Login

1. Navigate to `http://localhost:3000/auth/login`
2. Enter credentials:
   - **Email**: demo@example.com (or your test user)
   - **Password**: Your password
   - **Tenant**: root (or your tenant)
3. On success, you'll be redirected to the dashboard

## 📁 Project Structure

```
app/
├── (full-page)/          # Full-screen layouts (auth, landing)
│   └── auth/
│       └── login/        # Login page
├── (main)/               # Protected routes with sidebar layout
│   ├── pages/
│   │   ├── profile/      # User profile management
│   │   └── [others]/
│   ├── components/       # Reusable components (ProfileForm, PasswordForm, etc.)
│   └── layout.tsx        # Protected layout with authentication check
├── api/                  # Backend proxy routes (Next.js API)
│   ├── auth/             # Authentication endpoints (login, logout, refresh)
│   ├── me/               # Current user profile
│   └── profile/          # Profile update
└── layout.tsx            # Root layout

lib/
├── api/                  # API client functions (centralized)
├── config/               # Configuration (API URLs, endpoints)
├── constants/            # Constants (validation rules, messages)
├── validators/           # Validation functions
└── utils/                # Utility functions (auth, cookies, files)

hooks/
├── useProfile.ts         # Profile state management hook
└── [others]/

types/
├── profile.ts            # Profile-related types
└── [others]/

layout/
├── AppTopbar.tsx         # Top navigation bar
└── [other layout components]/
```

## 🔐 Authentication Flow

1. **Login Request** → `POST /api/auth/login` → Backend `POST /api/v1/identity/token/issue`
2. **Token Storage** → Tokens stored in HttpOnly cookies (secure)
3. **Auto Refresh** → Tokens automatically refreshed before expiry
4. **Protected Routes** → `app/(main)/layout.tsx` checks authentication
5. **Logout** → `POST /api/auth/logout` clears cookies

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📚 Feature Modules

### Profile Management (`app/(main)/pages/profile/`)
- View and edit user information (name, email read-only, phone)
- Upload/change profile picture with preview
- Change password with validation
- Real-time validation feedback

### Authentication (`app/api/auth/`, `app/(full-page)/auth/`)
- Secure JWT-based login
- Token refresh with 14-minute expiry
- Automatic session refresh before token expiry
- Logout with cookie cleanup

## 🎨 Styling

- **PrimeFlex**: Responsive grid system
- **PrimeReact**: Pre-built UI components
- **Sass**: Advanced styling capabilities
- **CSS Classes**: PrimeReact utility classes (p-button, p-invalid, etc.)

## 🔌 API Integration

All API communication goes through Next.js proxy routes:

```
Frontend Request → /api/[endpoint] → Backend /api/v1/[endpoint]
```

This approach:
- Keeps backend URL hidden from browser
- Enables secure cookie handling (HttpOnly)
- Centralizes error handling
- Allows request/response manipulation

## 🐛 Troubleshooting

### "Backend connection failed"
- Check backend is running: `https://localhost:7030` (or your configured URL)
- Verify `NEXT_PUBLIC_BACKEND_API_BASE_URL` in `.env.local`
- Check CORS configuration on backend

### "Token invalid/expired"
- Clear cookies and login again
- Check system time is synchronized
- Verify token refresh is working: `/api/auth/refresh`

### "HTTPS certificate error"
- For development: Use `http://localhost:5030` without HTTPS
- For production: Ensure backend has valid SSL certificate

## 📖 Code Quality

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Linting**: ESLint configured
- **Formatting**: Prettier for consistent code style
- **Validation**: Form validation with clear error messages
- **Error Handling**: Centralized error handling with user-friendly messages

## 🤝 Contributing

Follow AI-GUIDELINES.md for development standards and best practices.

## 📄 License

[Add your license here]
