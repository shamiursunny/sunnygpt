# SunnyGPT Prime Edition - Feature Documentation

## Overview
SunnyGPT Prime Edition is a multi-tenant SaaS AI chat application with OAuth authentication, user portal, and admin dashboard.

## New Features Added

### 1. Authentication System
- **OAuth Providers**: Google, GitHub, Facebook
- **JWT Session Strategy**: 30-day session duration
- **Route Protection**: Middleware-based authentication
- **User Roles**: Admin and User roles

### 2. User Portal
- **Private Chat Interface**: Each user has their own chat history
- **Chat Management**: Create, select, and delete chats
- **Real-time Messaging**: Send and receive AI responses
- **Responsive Design**: Works on desktop and mobile

### 3. Admin Dashboard
- **User Management**: View all registered users
- **Role Assignment**: Users can be assigned admin role
- **User Analytics**: View user join dates and chat counts
- **Protected Routes**: Only accessible to admin users

### 4. Email Notifications
- **Welcome Emails**: Sent to new users on registration
- **Admin Notifications**: Alerts when new users sign up
- **SMTP Support**: Configurable via environment variables

### 5. API Routes
- **Authentication**: `/api/auth/*` for OAuth endpoints
- **Chat API**: `/api/chat`, `/api/chats`, `/api/messages`
- **Protected Routes**: All API routes require authentication
- **Admin APIs**: `/api/admin/users` for user management

## Environment Variables Required

### OAuth Credentials
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SECRET=your_generated_auth_secret
```

### Email (Optional)
```
SMTP_GMAIL_USER=your@gmail.com
SMTP_GMAIL_PASSWORD=your_app_password
# OR
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=SunnyGPT <noreply@example.com>
```

## Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
- Login Page: OAuth button rendering, sign-in flow
- Portal Layout: Navigation, user info display
- Middleware: Route protection logic
- Email Service: SMTP configuration checks
- Auth Configuration: OAuth providers, session settings

## Project Structure

```
sunnygpt/
├── src/
│   ├── app/
│   │   ├── login/              # OAuth login page
│   │   ├── portal/             # User portal (chat)
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   │       ├── auth/           # NextAuth endpoints
│   │       ├── chat/           # Chat API
│   │       ├── chats/          # Chat management
│   │       ├── messages/       # Message API
│   │       └── admin/          # Admin APIs
│   ├── __tests__/              # Test files
│   ├── auth.ts                 # NextAuth configuration
│   ├── middleware.ts           # Route protection
│   └── lib/
│       ├── email-service.ts    # Email notifications
│       └── prisma.ts           # Database client
├── prisma/
│   └── schema.prisma           # Database schema
└── vitest.config.ts            # Test configuration
```

## Deployment

### Vercel Deployment
The application is configured for Vercel deployment with automatic builds on git push.

### Environment Setup
1. Add environment variables in Vercel dashboard
2. Set up OAuth credentials in Vercel
3. Configure database connection string
4. Optionally add SMTP for email features

## Security Features

1. **JWT-based Sessions**: Stateless authentication
2. **Role-based Access Control**: Admin vs User permissions
3. **Protected API Routes**: Authentication required for all APIs
4. **Middleware Protection**: Automatic route guarding
5. **Secure Password Handling**: bcrypt for any password storage

## Known Limitations

1. **Email**: Requires SMTP configuration to send emails
2. **OAuth**: Requires valid OAuth credentials for each provider
3. **Database**: Requires PostgreSQL database (Neon recommended for free tier)

## Future Enhancements

- Email/password authentication
- User profile settings
- Chat export/import
- AI model selection
- Usage analytics dashboard