# Fitness Tracker - Modern Health & Fitness Web Application

![Fitness Tracker](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Tech-Hono%20%2B%20D1%20%2B%20TypeScript-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, full-featured fitness tracking web application built with Hono framework, Cloudflare D1 database, and a sleek dark mode UI with neon accents.

## 🌟 Live Demo

**Production URL**: https://3000-i4402eiqu4x4nicixk7ys-a402f90a.sandbox.novita.ai

**Demo Login**:
- Email: `demo@fitness.com`
- Password: `demo123`

## ✨ Features

### ✅ Currently Implemented

#### 1. **User Dashboard**
- Real-time fitness summary
- Daily calorie tracking
- Step counter
- Workout minutes
- Water intake monitoring
- Weight tracking
- Workout streak counter with fire icon

#### 2. **Workout Tracker**
- Add workouts with multiple types (Chest, Back, Legs, Cardio, etc.)
- Track duration in minutes
- Calculate calories burned
- Add notes for each workout
- View complete workout history
- Delete workouts
- Color-coded workout type badges

#### 3. **Daily Habits Tracker**
- Track water intake (glasses)
- Monitor sleep hours
- Count daily steps
- Track meditation minutes
- Visual progress bars for each habit
- Quick increment/decrement buttons
- Save daily habits to database

#### 4. **Goals Management**
- Set weight loss goals
- Track workout minute goals
- Monitor daily step goals
- Set calorie burn targets
- Add deadline dates
- Update progress in real-time
- Visual progress indicators
- Delete completed or unwanted goals

#### 5. **Progress Analytics**
- **Workout Analytics**:
  - Calories burned chart (last 7 days)
  - Workout duration line chart
  - Workout types distribution (doughnut chart)
- **Weight Progress**: 
  - 30-day weight history chart
- **Habits Tracking**: 
  - 7-day habits comparison chart
  - Multi-line chart for water, sleep, and steps

#### 6. **User Profile**
- Editable profile information
- Update height, weight, age
- Account information display
- Automatic weight history tracking

#### 7. **UI/UX Features**
- **Dark Mode**: Full dark theme with gray-900 background
- **Neon Colors**: Green (#39FF14), Blue (#00D9FF), Pink (#FF006E), Purple (#8B5CF6)
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Smooth Animations**: Fade-in effects, hover transitions
- **Glass Morphism**: Cards with backdrop blur effects
- **Neon Glow Effects**: Subtle glow on interactive elements
- **Sidebar Navigation**: Collapsible on mobile
- **Loading States**: Beautiful loading screens
- **Toast Notifications**: Success/error messages

## 🎯 Functional Entry Points (API Endpoints)

### Authentication
- `POST /api/auth/login` - User login
  - Body: `{ email, password }`
- `POST /api/auth/register` - User registration
  - Body: `{ email, password, name }`

### User Profile
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile
  - Body: `{ name, height, weight, age }`

### Dashboard
- `GET /api/dashboard/:userId` - Get dashboard summary (habits, workouts, weight, streak)

### Workouts
- `GET /api/workouts/:userId?limit=50` - Get workout history
- `POST /api/workouts` - Add new workout
  - Body: `{ user_id, workout_type, duration, calories_burned, notes, workout_date }`
- `DELETE /api/workouts/:id` - Delete workout

### Daily Habits
- `GET /api/habits/:userId?start_date=&end_date=` - Get habits for date range
- `POST /api/habits` - Update or create daily habits
  - Body: `{ user_id, habit_date, water_intake, sleep_hours, steps, meditation_minutes }`

### Goals
- `GET /api/goals/:userId` - Get user goals
- `POST /api/goals` - Create new goal
  - Body: `{ user_id, goal_type, target_value, deadline }`
- `PUT /api/goals/:id` - Update goal progress
  - Body: `{ current_value }`
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/weight/:userId?days=30` - Get weight history
- `GET /api/analytics/workouts/:userId?days=7` - Get workout analytics
- `GET /api/analytics/habits/:userId?days=7` - Get habits analytics

## 📊 Data Models

### Users
```sql
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT)
- name (TEXT)
- height (REAL)
- weight (REAL)
- age (INTEGER)
- created_at (DATETIME)
```

### Workouts
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- workout_type (TEXT)
- duration (INTEGER - minutes)
- calories_burned (INTEGER)
- notes (TEXT)
- workout_date (DATE)
- created_at (DATETIME)
```

### Daily Habits
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- habit_date (DATE)
- water_intake (INTEGER - glasses)
- sleep_hours (REAL)
- steps (INTEGER)
- meditation_minutes (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)
- UNIQUE(user_id, habit_date)
```

### Goals
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- goal_type (TEXT)
- target_value (REAL)
- current_value (REAL)
- deadline (DATE)
- created_at (DATETIME)
```

### Weight History
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- weight (REAL)
- recorded_date (DATE)
- created_at (DATETIME)
```

## 💻 Technology Stack

### Backend
- **Hono** - Lightweight, fast web framework
- **Cloudflare Workers** - Edge runtime
- **Cloudflare D1** - Distributed SQLite database
- **TypeScript** - Type-safe development

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS (CDN)
- **JavaScript (Vanilla)** - No framework overhead
- **Font Awesome** - Icon library (CDN)
- **Chart.js** - Data visualization (CDN)
- **Axios** - HTTP client (CDN)

### Development Tools
- **Vite** - Build tool and dev server
- **Wrangler** - Cloudflare CLI
- **PM2** - Process manager
- **Git** - Version control

## 🚀 User Guide

### Getting Started

1. **Login**: Use the demo credentials or register a new account
   - Demo: `demo@fitness.com` / `demo123`

2. **Dashboard**: View your daily fitness summary
   - See today's calories, workout minutes, steps, and water intake
   - Check your workout streak
   - View progress on active goals

3. **Track Workouts**:
   - Click "Add Workout" button
   - Select workout type (Chest, Back, Legs, Cardio, etc.)
   - Enter duration and calories burned
   - Add optional notes
   - Save to history

4. **Update Daily Habits**:
   - Navigate to "Daily Habits"
   - Use +/- buttons or type directly
   - Track water, sleep, steps, and meditation
   - Save at end of day

5. **Set Goals**:
   - Go to "Goals" page
   - Click "Add Goal"
   - Choose goal type (weight, workout, steps, calories)
   - Set target value and deadline
   - Update progress regularly

6. **View Analytics**:
   - Check "Analytics" page
   - See 7-day workout trends
   - Track 30-day weight progress
   - Compare daily habits over time

7. **Edit Profile**:
   - Navigate to "Profile"
   - Update name, age, height, weight
   - Changes save automatically

### Tips
- **Consistency is key**: Log daily for accurate streak tracking
- **Set realistic goals**: Start small and build up
- **Use notes**: Add workout notes to track what worked
- **Check analytics weekly**: Adjust your routine based on data

## 📁 Project Structure

```
fitness-tracker/
├── src/
│   └── index.tsx              # Main Hono application & API routes
├── public/
│   └── static/
│       ├── app.js            # Frontend JavaScript (51KB)
│       └── styles.css        # Custom CSS with neon theme
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── seed.sql                  # Demo data for testing
├── wrangler.jsonc           # Cloudflare configuration
├── vite.config.ts           # Vite build configuration
├── ecosystem.config.cjs     # PM2 process configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

## 🔧 Installation & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**:
```bash
git clone <repository-url>
cd fitness-tracker
```

2. **Install dependencies**:
```bash
npm install
```

3. **Setup database**:
```bash
# Apply migrations
npm run db:migrate:local

# Seed demo data
npm run db:seed
```

4. **Build the project**:
```bash
npm run build
```

5. **Start development server**:
```bash
# Using PM2 (recommended)
pm2 start ecosystem.config.cjs

# Or using npm script
npm run dev:sandbox
```

6. **Access the application**:
- Local: http://localhost:3000
- Login with: `demo@fitness.com` / `demo123`

### Available Scripts

```bash
npm run dev              # Vite dev server
npm run dev:sandbox      # Wrangler Pages dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run deploy          # Deploy to Cloudflare Pages
npm run db:migrate:local  # Apply migrations locally
npm run db:migrate:prod   # Apply migrations to production
npm run db:seed          # Seed demo data
npm run db:reset         # Reset local database
npm run clean-port       # Kill process on port 3000
npm run test            # Test local server
```

### PM2 Commands

```bash
pm2 list                      # List all processes
pm2 logs fitness-tracker      # View logs
pm2 restart fitness-tracker   # Restart app
pm2 stop fitness-tracker      # Stop app
pm2 delete fitness-tracker    # Remove from PM2
```

## 🌐 Deployment

### Deploy to Cloudflare Pages

1. **Create D1 database**:
```bash
npx wrangler d1 create fitness-tracker-production
```

2. **Update `wrangler.jsonc`** with your database ID

3. **Apply migrations**:
```bash
npm run db:migrate:prod
```

4. **Deploy**:
```bash
npm run deploy
```

## 📝 Code Comments

The codebase is well-documented with comments throughout:

- **Backend (`src/index.tsx`)**: Each API route has descriptive comments
- **Frontend (`public/static/app.js`)**: Functions are organized into sections with clear headers
- **CSS (`public/static/styles.css`)**: Utility classes and effects are documented

## 🎨 Design System

### Colors
- **Background**: Gray-900 (#111827)
- **Cards**: Gray-800 (#1F2937)
- **Borders**: Gray-700 (#374151)
- **Text**: Gray-100 (#F3F4F6)
- **Neon Green**: #39FF14 (Primary)
- **Neon Blue**: #00D9FF (Secondary)
- **Neon Pink**: #FF006E (Accent)
- **Neon Purple**: #8B5CF6 (Accent)

### Typography
- **Headings**: Bold, White
- **Body**: Gray-300 to Gray-400
- **Icons**: Font Awesome 6.4.0

### Components
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Progress Bars**: Neon gradient fills
- **Charts**: Chart.js with neon color scheme

## 🔒 Data Persistence

All data is stored in **Cloudflare D1 Database** (SQLite):
- User profiles and authentication
- Workout history
- Daily habits tracking
- Goals and progress
- Weight history

**Local Development**: Uses `.wrangler/state/v3/d1` for local SQLite
**Production**: Uses Cloudflare's globally distributed D1 database

## 🎯 Features Not Yet Implemented

- Social features (friends, challenges)
- Meal planning and nutrition tracking
- Exercise library with videos
- Workout templates and programs
- Mobile app (PWA capabilities exist but not packaged)
- Push notifications for reminders
- Export data to CSV/PDF
- Dark/Light theme toggle (currently dark only)
- Password reset functionality
- Email verification

## 🚀 Recommended Next Steps

1. **Add Authentication Improvements**:
   - Implement JWT tokens
   - Add password hashing (bcrypt)
   - Email verification
   - Password reset flow

2. **Enhance Analytics**:
   - Add more chart types
   - Custom date range selection
   - Export reports
   - Personal records tracking

3. **Social Features**:
   - User profiles
   - Friend system
   - Challenges and competitions
   - Leaderboards

4. **Mobile Enhancements**:
   - Install as PWA
   - Offline support
   - Camera integration for progress photos

5. **Nutrition Module**:
   - Meal tracking
   - Calorie counter
   - Macronutrient tracking
   - Recipe database

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Hono, Cloudflare Workers, and modern web technologies**

**Deployment Status**: ✅ Active  
**Last Updated**: March 11, 2026  
**Version**: 1.0.0
