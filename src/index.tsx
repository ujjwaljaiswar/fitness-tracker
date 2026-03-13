import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// AUTHENTICATION API ROUTES
// ============================================

// Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, height, weight, age FROM users WHERE email = ? AND password = ?'
    ).bind(email, password).first()
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    return c.json({ success: true, user })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Register endpoint
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }
    
    // Insert new user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    ).bind(email, password, name).run()
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first()
    
    return c.json({ success: true, user })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// ============================================
// USER PROFILE API ROUTES
// ============================================

// Get user profile
app.get('/api/user/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, height, weight, age FROM users WHERE id = ?'
    ).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

// Update user profile
app.put('/api/user/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const { name, height, weight, age } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE users SET name = ?, height = ?, weight = ?, age = ? WHERE id = ?'
    ).bind(name, height, weight, age, userId).run()
    
    // Also add to weight history if weight changed
    if (weight) {
      await c.env.DB.prepare(
        'INSERT INTO weight_history (user_id, weight, recorded_date) VALUES (?, ?, DATE("now"))'
      ).bind(userId, weight).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// ============================================
// DASHBOARD API ROUTES
// ============================================

// Get dashboard summary
app.get('/api/dashboard/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's habits
    const habits = await c.env.DB.prepare(
      'SELECT * FROM daily_habits WHERE user_id = ? AND habit_date = ?'
    ).bind(userId, today).first()
    
    // Get today's workouts summary
    const workouts = await c.env.DB.prepare(
      'SELECT SUM(duration) as total_minutes, SUM(calories_burned) as total_calories, COUNT(*) as workout_count FROM workouts WHERE user_id = ? AND workout_date = ?'
    ).bind(userId, today).first()
    
    // Get current weight
    const weightRecord = await c.env.DB.prepare(
      'SELECT weight FROM users WHERE id = ?'
    ).bind(userId).first()
    
    // Get workout streak
    const streakResult = await c.env.DB.prepare(`
      WITH RECURSIVE dates(date, streak) AS (
        SELECT DATE('now'), 0
        UNION ALL
        SELECT DATE(date, '-1 day'), streak + 1
        FROM dates
        WHERE EXISTS (
          SELECT 1 FROM workouts 
          WHERE user_id = ? AND workout_date = DATE(date, '-1 day')
        )
        AND streak < 365
      )
      SELECT MAX(streak) as streak FROM dates
    `).bind(userId).first()
    
    return c.json({
      habits: habits || { water_intake: 0, sleep_hours: 0, steps: 0, meditation_minutes: 0 },
      workouts: {
        total_minutes: workouts?.total_minutes || 0,
        total_calories: workouts?.total_calories || 0,
        workout_count: workouts?.workout_count || 0
      },
      weight: weightRecord?.weight || 0,
      streak: streakResult?.streak || 0
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// ============================================
// WORKOUTS API ROUTES
// ============================================

// Get all workouts for user
app.get('/api/workouts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = c.req.query('limit') || '50'
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC, created_at DESC LIMIT ?'
    ).bind(userId, limit).all()
    
    return c.json({ workouts: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch workouts' }, 500)
  }
})

// Add new workout
app.post('/api/workouts', async (c) => {
  try {
    const { user_id, workout_type, duration, calories_burned, notes, workout_date } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO workouts (user_id, workout_type, duration, calories_burned, notes, workout_date) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(user_id, workout_type, duration, calories_burned, notes, workout_date).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to add workout' }, 500)
  }
})

// Delete workout
app.delete('/api/workouts/:id', async (c) => {
  try {
    const workoutId = c.req.param('id')
    
    await c.env.DB.prepare(
      'DELETE FROM workouts WHERE id = ?'
    ).bind(workoutId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete workout' }, 500)
  }
})

// ============================================
// HABITS API ROUTES
// ============================================

// Get habits for date range
app.get('/api/habits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const startDate = c.req.query('start_date') || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM daily_habits WHERE user_id = ? AND habit_date BETWEEN ? AND ? ORDER BY habit_date DESC'
    ).bind(userId, startDate, endDate).all()
    
    return c.json({ habits: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch habits' }, 500)
  }
})

// Update or create habit for today
app.post('/api/habits', async (c) => {
  try {
    const { user_id, habit_date, water_intake, sleep_hours, steps, meditation_minutes } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT INTO daily_habits (user_id, habit_date, water_intake, sleep_hours, steps, meditation_minutes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, habit_date) 
      DO UPDATE SET 
        water_intake = excluded.water_intake,
        sleep_hours = excluded.sleep_hours,
        steps = excluded.steps,
        meditation_minutes = excluded.meditation_minutes,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user_id, habit_date, water_intake, sleep_hours, steps, meditation_minutes).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update habits' }, 500)
  }
})

// ============================================
// GOALS API ROUTES
// ============================================

// Get user goals
app.get('/api/goals/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    
    return c.json({ goals: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch goals' }, 500)
  }
})

// Add new goal
app.post('/api/goals', async (c) => {
  try {
    const { user_id, goal_type, target_value, deadline } = await c.req.json()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO goals (user_id, goal_type, target_value, deadline) VALUES (?, ?, ?, ?)'
    ).bind(user_id, goal_type, target_value, deadline).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to add goal' }, 500)
  }
})

// Update goal progress
app.put('/api/goals/:id', async (c) => {
  try {
    const goalId = c.req.param('id')
    const { current_value } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE goals SET current_value = ? WHERE id = ?'
    ).bind(current_value, goalId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update goal' }, 500)
  }
})

// Delete goal
app.delete('/api/goals/:id', async (c) => {
  try {
    const goalId = c.req.param('id')
    
    await c.env.DB.prepare(
      'DELETE FROM goals WHERE id = ?'
    ).bind(goalId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete goal' }, 500)
  }
})

// ============================================
// ANALYTICS API ROUTES
// ============================================

// Get weight history
app.get('/api/analytics/weight/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const days = c.req.query('days') || '30'
    
    const { results } = await c.env.DB.prepare(
      'SELECT weight, recorded_date FROM weight_history WHERE user_id = ? ORDER BY recorded_date DESC LIMIT ?'
    ).bind(userId, days).all()
    
    return c.json({ weightHistory: results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch weight history' }, 500)
  }
})

// Get workout analytics
app.get('/api/analytics/workouts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const days = c.req.query('days') || '7'
    
    // Get workouts by date
    const { results: dailyWorkouts } = await c.env.DB.prepare(`
      SELECT 
        workout_date,
        COUNT(*) as workout_count,
        SUM(duration) as total_duration,
        SUM(calories_burned) as total_calories
      FROM workouts 
      WHERE user_id = ? 
      AND workout_date >= DATE('now', '-' || ? || ' days')
      GROUP BY workout_date
      ORDER BY workout_date ASC
    `).bind(userId, days).all()
    
    // Get workouts by type
    const { results: workoutsByType } = await c.env.DB.prepare(`
      SELECT 
        workout_type,
        COUNT(*) as count,
        SUM(duration) as total_duration,
        SUM(calories_burned) as total_calories
      FROM workouts 
      WHERE user_id = ? 
      AND workout_date >= DATE('now', '-' || ? || ' days')
      GROUP BY workout_type
      ORDER BY count DESC
    `).bind(userId, days).all()
    
    return c.json({ 
      dailyWorkouts: dailyWorkouts || [],
      workoutsByType: workoutsByType || []
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch workout analytics' }, 500)
  }
})

// Get habits analytics
app.get('/api/analytics/habits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const days = c.req.query('days') || '7'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        habit_date,
        water_intake,
        sleep_hours,
        steps,
        meditation_minutes
      FROM daily_habits 
      WHERE user_id = ? 
      AND habit_date >= DATE('now', '-' || ? || ' days')
      ORDER BY habit_date ASC
    `).bind(userId, days).all()
    
    return c.json({ habitsHistory: results || [] })
  } catch (error) {
    return c.json({ error: 'Failed to fetch habits analytics' }, 500)
  }
})

// ============================================
// DEFAULT ROUTE - FRONTEND
// ============================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fitness Tracker - Track Your Health Journey</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  neon: {
                    green: '#39FF14',
                    blue: '#00D9FF',
                    pink: '#FF006E',
                    purple: '#8B5CF6'
                  }
                }
              }
            }
          }
        </script>
    </head>
    <body class="dark bg-gray-900 text-gray-100">
        <!-- Loading Screen -->
        <div id="loading-screen" class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
            <div class="text-center">
                <i class="fas fa-dumbbell fa-3x text-neon-green animate-pulse mb-4"></i>
                <p class="text-xl text-gray-300">Loading Fitness Tracker...</p>
            </div>
        </div>

        <!-- Login Screen -->
        <div id="login-screen" class="hidden fixed inset-0 bg-gray-900 flex items-center justify-center z-40">
            <div class="max-w-md w-full mx-4">
                <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <div class="text-center mb-8">
                        <i class="fas fa-dumbbell text-5xl text-neon-green mb-4"></i>
                        <h1 class="text-3xl font-bold text-white">Fitness Tracker</h1>
                        <p class="text-gray-400 mt-2">Track your health journey</p>
                    </div>
                    
                    <div class="space-y-4">
                        <input type="email" id="login-email" placeholder="Email" 
                               class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green">
                        <input type="password" id="login-password" placeholder="Password" 
                               class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green">
                        
                        <button id="login-btn" 
                                class="w-full py-3 bg-neon-green text-gray-900 font-bold rounded-lg hover:bg-opacity-80 transition">
                            Login
                        </button>
                        
                        <div class="text-center text-gray-400 text-sm mt-4">
                            Demo: demo@fitness.com / demo123
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main App Container -->
        <div id="app-container" class="hidden">
            <!-- Sidebar -->
            <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-30 transform transition-transform duration-300">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-8">
                        <div class="flex items-center">
                            <i class="fas fa-dumbbell text-2xl text-neon-green mr-3"></i>
                            <h1 class="text-xl font-bold text-white">Fitness Tracker</h1>
                        </div>
                        <button id="sidebar-close" class="lg:hidden text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <nav class="space-y-2">
                        <a href="#" data-page="dashboard" class="nav-link active flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-home w-6"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" data-page="workouts" class="nav-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-dumbbell w-6"></i>
                            <span>Workouts</span>
                        </a>
                        <a href="#" data-page="habits" class="nav-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-calendar-check w-6"></i>
                            <span>Daily Habits</span>
                        </a>
                        <a href="#" data-page="goals" class="nav-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-bullseye w-6"></i>
                            <span>Goals</span>
                        </a>
                        <a href="#" data-page="analytics" class="nav-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-chart-line w-6"></i>
                            <span>Analytics</span>
                        </a>
                        <a href="#" data-page="profile" class="nav-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition">
                            <i class="fas fa-user w-6"></i>
                            <span>Profile</span>
                        </a>
                    </nav>
                    
                    <button id="logout-btn" class="mt-8 w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700 transition">
                        <i class="fas fa-sign-out-alt w-6"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="lg:ml-64 min-h-screen">
                <!-- Top Bar -->
                <header class="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <button id="sidebar-toggle" class="lg:hidden text-gray-400 hover:text-white">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                    <div class="flex-1"></div>
                    <div class="flex items-center space-x-4">
                        <span id="user-name" class="text-gray-300"></span>
                        <i class="fas fa-user-circle text-2xl text-neon-green"></i>
                    </div>
                </header>

                <!-- Page Content -->
                <div class="p-6">
                    <div id="page-content"></div>
                </div>
            </main>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
