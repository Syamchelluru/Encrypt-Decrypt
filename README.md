# 🏘️ Fix My Area - Civic Issue Reporting Platform

A modern web application that empowers citizens to report civic issues, track their progress, and work together to improve their communities.

## ✨ Features

### 👤 For Citizens
- **Report Issues**: Submit civic issues with photos and precise map locations
- **Vote & Support**: Upvote issues that matter to your community
- **Track Progress**: Monitor issue status from pending to resolved
- **Interactive Map**: View all issues in your area on an interactive map
- **Email Notifications**: Get updates when your reported issues are resolved

### 🛠️ For Administrators
- **Issue Management**: View, update, and manage all reported issues
- **Status Updates**: Change issue status and assign to team members
- **Analytics Dashboard**: Track resolution rates and community engagement
- **Filtering & Search**: Find issues by location, category, status, and more

### 🔐 Authentication & Security
- **OTP-based Login**: Secure email verification using Gmail SMTP
- **Role-based Access**: Separate interfaces for users and administrators
- **JWT Sessions**: Secure session management with HTTP-only cookies
- **Rate Limiting**: Protection against spam and abuse

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT + OTP via Nodemailer
- **File Upload**: Cloudinary integration
- **Maps**: MapLibre GL JS + OpenStreetMap
- **Styling**: Tailwind CSS with custom glassmorphism theme
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- Gmail account with App Password
- Cloudinary account (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fix-my-area.git
cd fix-my-area
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fixmyarea

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Gmail SMTP (for OTP emails)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-gmail-app-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: MapLibre token for premium features
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration Guide

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to the whitelist
4. Create a database user
5. Get your connection string and add it to `MONGODB_URI`

### Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use your Gmail address for `GMAIL_USER`
4. Use the generated app password for `GMAIL_PASS`

### Cloudinary Setup
1. Create a free Cloudinary account
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your environment variables

### MapLibre/OpenStreetMap
The app uses OpenStreetMap tiles by default (free). For premium features:
1. Create a MapBox account
2. Get your access token
3. Add it to `NEXT_PUBLIC_MAPBOX_TOKEN`

## 📱 Usage

### For Citizens
1. **Sign Up**: Create an account using email + OTP verification
2. **Report Issue**: Click "Report an Issue" and fill out the form
3. **Add Location**: Use the interactive map to pinpoint the exact location
4. **Upload Photos**: Add up to 5 photos to document the issue
5. **Track Progress**: Monitor your issues in the user dashboard
6. **Vote**: Support issues reported by other community members

### For Administrators
1. **Admin Access**: Contact system admin to upgrade your account
2. **Dashboard**: Access the admin dashboard to view all issues
3. **Manage Issues**: Update status, assign team members, add comments
4. **Analytics**: View community engagement and resolution statistics
5. **Filters**: Use advanced filtering to find specific issues

## 🗂️ Project Structure

```
fix-my-area/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── issues/        # Issue management
│   │   ├── admin/         # Admin-only endpoints
│   │   └── upload/        # File upload
│   ├── dashboard/         # Dashboard pages
│   ├── issue/            # Individual issue pages
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Map/              # Map-related components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── mongodb.ts        # Database connection
│   ├── nodemailer.ts     # Email utilities
│   └── cloudinary.ts     # File upload utilities
├── models/               # Database models
│   ├── User.ts           # User model
│   ├── Issue.ts          # Issue model
│   └── Vote.ts           # Vote model
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔒 Security Features

- **Input Validation**: All inputs are validated on both client and server
- **Rate Limiting**: OTP requests are rate-limited to prevent abuse
- **CORS Protection**: API routes include CORS headers
- **SQL Injection Prevention**: Using Mongoose ODM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: HTTP-only cookies and proper headers
- **File Upload Security**: File type and size validation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The app can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/fix-my-area/issues) page
2. Create a new issue with detailed information
3. Contact support at support@fixmyarea.com

## 🙏 Acknowledgments

- **OpenStreetMap** for providing free map tiles
- **Cloudinary** for image hosting and optimization
- **MongoDB Atlas** for database hosting
- **Vercel** for deployment platform
- **Next.js** team for the amazing framework

---

**Made with ❤️ for communities everywhere**

