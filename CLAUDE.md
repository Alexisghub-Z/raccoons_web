# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raccoons Web is a landing page and management system for a motorcycle workshop (taller de motocicletas). The application includes:
- Public-facing landing page with services and contact information
- Service tracking system for customers to monitor their motorcycle repairs
- Appointment booking system
- Admin panel for managing services and appointments
- Google Calendar integration for appointment management

## Tech Stack

- **Frontend Framework:** React 19.2.0 with Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **Styling:** Pure CSS (no CSS framework)
- **Google Integration:** @react-oauth/google + gapi-script for Google Calendar API
- **PDF Generation:** jsPDF 2.5.2
- **WhatsApp Integration:** WhatsApp Web API (wa.me links)
- **Build Tool:** Vite with @vitejs/plugin-react
- **Linting:** ESLint 9.39.1

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Routing Structure

The app uses React Router with 4 main routes:
- `/` - HomePage: Public landing page with services, about, and contact sections
- `/admin` - AdminPage: Password-protected admin panel (password: `admin123`)
- `/seguimiento` - TrackingPage: Service tracking for customers
- `/citas` - AppointmentPage: Appointment booking form

### Data Storage

**LocalStorage-based:** The application uses browser localStorage for data persistence:
- Service data: `raccoons_services` key (includes evidence photos in Base64)
- Appointment data: `raccoons_appointments` key
- Authentication state: stored in sessionStorage (`admin_authenticated`)

To clear all data:
```javascript
localStorage.removeItem('raccoons_services')
localStorage.removeItem('raccoons_appointments')
```

### Component Organization

```
src/
├── components/          # Reusable components
│   ├── Header.jsx      # Main navigation header
│   ├── SplashScreen.jsx
│   ├── AdminPanel.jsx  # Service management interface
│   ├── AppointmentManagement.jsx
│   ├── ServiceTracking.jsx
│   └── GoogleCalendarConfig.jsx
├── pages/              # Route-level page components
│   ├── HomePage.jsx
│   ├── AdminPage.jsx
│   ├── TrackingPage.jsx
│   └── AppointmentPage.jsx
├── services/           # API and external service integrations
│   ├── googleCalendarService.js
│   ├── whatsappService.js  # WhatsApp messaging integration
│   └── pdfService.js       # PDF generation with jsPDF
├── config/             # Configuration files
│   └── googleConfig.js  # Google Calendar credentials
├── App.jsx             # Router setup and splash screen logic
└── main.jsx            # React entry point
```

### Service Management Flow

1. **Service Creation:** Admin creates service with auto-generated tracking code (format: `RCN-XXXXXXXXX`)
2. **WhatsApp Notification:** Optional automatic WhatsApp message sent to customer with tracking code
3. **Service States:** Recibido → En Diagnóstico → En Reparación → Listo para Entrega → Entregado
4. **Evidence Upload:** Admin can upload photos of work performed with descriptions
5. **Customer Tracking:** Customers use tracking code to view service status
6. **PDF Reports:** Generate professional PDFs with service details and evidence photos
7. **Data Persistence:** All services stored in localStorage (including Base64 images)

### Google Calendar Integration

**Configuration Required:**
- API Key and Client ID must be configured in `src/config/googleConfig.js`
- Full setup instructions in `GOOGLE_CALENDAR_SETUP.md`
- OAuth scopes: `https://www.googleapis.com/auth/calendar.events`

**Integration Features:**
- Creates calendar events when appointments are booked
- Updates event titles with status: `[PENDIENTE]`, `[CONFIRMADA]`, `[COMPLETADA]`, `[CANCELADA]`
- Sets 1-hour duration, includes customer details in description
- Configures reminders (24h email, 1h popup)
- Timezone: America/Mexico_City

**Key Functions in `googleCalendarService.js`:**
- `initGoogleAPI()` - Initialize Google API and OAuth client
- `handleAuthClick()` - Handle OAuth authorization flow
- `createCalendarEvent()` - Create new calendar event
- `updateCalendarEvent()` - Update existing event
- `deleteCalendarEvent()` - Remove calendar event
- `isAuthorized()` - Check if user is authorized

### Security Notes

⚠️ **Current Implementation is Demo-Level:**
- Admin password hardcoded as `admin123`
- Data stored in localStorage (not secure for production)
- Google credentials stored in source code (should use environment variables)
- No backend authentication or API layer

**For Production:**
- Implement proper backend with authentication
- Use database instead of localStorage
- Store Google credentials as environment variables
- Add HTTPS, CSRF protection, and proper session management
- Add `.gitignore` entry for `googleConfig.js` with real credentials

## Styling Approach

- All styles are in dedicated `.css` files next to components
- Global styles in `App.css` and `index.css`
- No CSS preprocessors or CSS-in-JS
- Responsive design with mobile menu in Header

## Admin Panel Access

**URL:** `/admin`
**Password:** `admin123`
**Features:**
- Service management (create, edit, delete, view)
- Appointment management
- Google Calendar configuration and connection status

## Important Files

- `ADMIN_README.md` - Admin panel documentation (Spanish)
- `GOOGLE_CALENDAR_SETUP.md` - Complete Google Calendar setup guide (Spanish)
- `NUEVAS_FUNCIONALIDADES.md` - Documentation for WhatsApp and PDF features (Spanish)
- `.gitignore` - Standard Vite/React ignore patterns

## Known Limitations

- No backend - all data is client-side only
- No real authentication system
- Service codes not guaranteed to be globally unique (generated client-side)
- Google Calendar credentials should not be committed to version control
- **LocalStorage size limit (~5-10MB)** - evidence photos in Base64 can fill up quickly
- WhatsApp integration uses web links (not WhatsApp Business API)
- PDF generation is client-side (can be slow for large evidence sets)
