// ============================================
// GLOBAL STATE & CONFIG
// ============================================

const API_BASE = '';
let currentUser = null;
let currentPage = 'dashboard';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format date to YYYY-MM-DD
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

// Get today's date
function getTodayDate() {
  return formatDate(new Date());
}

// Format number with commas
function formatNumber(num) {
  return num ? num.toLocaleString() : 0;
}

// Calculate percentage
function calculatePercentage(current, target) {
  if (!target) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-neon-green' : 'bg-red-500';
  toast.className = `fixed top-4 right-4 ${bgColor} text-gray-900 px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Get workout badge class
function getWorkoutBadgeClass(type) {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('chest')) return 'workout-badge-chest';
  if (typeLower.includes('back')) return 'workout-badge-back';
  if (typeLower.includes('leg')) return 'workout-badge-legs';
  if (typeLower.includes('cardio')) return 'workout-badge-cardio';
  return 'workout-badge-default';
}

// ============================================
// AUTHENTICATION
// ============================================

async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      currentUser = response.data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser.name;
    navigateToPage('dashboard');
  }
}

// ============================================
// NAVIGATION
// ============================================

function navigateToPage(pageName) {
  currentPage = pageName;
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });
  
  // Load page content
  const pageContent = document.getElementById('page-content');
  pageContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-neon-green"></i></div>';
  
  switch (pageName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'workouts':
      loadWorkoutsPage();
      break;
    case 'habits':
      loadHabitsPage();
      break;
    case 'goals':
      loadGoalsPage();
      break;
    case 'analytics':
      loadAnalyticsPage();
      break;
    case 'profile':
      loadProfilePage();
      break;
  }
}

// ============================================
// DASHBOARD PAGE
// ============================================

async function loadDashboard() {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/${currentUser.id}`);
    const data = response.data;
    
    const goalsResponse = await axios.get(`${API_BASE}/api/goals/${currentUser.id}`);
    const goals = goalsResponse.data.goals;
    
    const html = `
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-white">
            <i class="fas fa-home text-neon-green mr-3"></i>
            Dashboard
          </h1>
          <div class="streak-badge">
            <i class="fas fa-fire"></i>
            <span>${data.streak} Day Streak</span>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid-dashboard mb-8">
          <!-- Calories Burned -->
          <div class="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <i class="fas fa-fire text-xl text-gray-900"></i>
              </div>
              <span class="text-3xl font-bold text-neon-green">${formatNumber(data.workouts.total_calories)}</span>
            </div>
            <h3 class="text-gray-400 text-sm font-medium">Calories Burned Today</h3>
          </div>
          
          <!-- Workout Minutes -->
          <div class="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                <i class="fas fa-dumbbell text-xl text-gray-900"></i>
              </div>
              <span class="text-3xl font-bold text-neon-blue">${data.workouts.total_minutes}</span>
            </div>
            <h3 class="text-gray-400 text-sm font-medium">Workout Minutes</h3>
          </div>
          
          <!-- Steps -->
          <div class="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center">
                <i class="fas fa-walking text-xl text-gray-900"></i>
              </div>
              <span class="text-3xl font-bold text-neon-pink">${formatNumber(data.habits.steps)}</span>
            </div>
            <h3 class="text-gray-400 text-sm font-medium">Steps Today</h3>
          </div>
          
          <!-- Water Intake -->
          <div class="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-green rounded-lg flex items-center justify-center">
                <i class="fas fa-tint text-xl text-gray-900"></i>
              </div>
              <span class="text-3xl font-bold text-neon-blue">${data.habits.water_intake}</span>
            </div>
            <h3 class="text-gray-400 text-sm font-medium">Glasses of Water</h3>
          </div>
        </div>
        
        <!-- Quick Actions & Goals -->
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <!-- Quick Habits Update -->
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">
              <i class="fas fa-calendar-check text-neon-green mr-2"></i>
              Today's Habits
            </h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Water (${data.habits.water_intake} / 8 glasses)</span>
                  <span class="text-neon-green">${calculatePercentage(data.habits.water_intake, 8)}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${calculatePercentage(data.habits.water_intake, 8)}%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Steps (${formatNumber(data.habits.steps)} / 10,000)</span>
                  <span class="text-neon-blue">${calculatePercentage(data.habits.steps, 10000)}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${calculatePercentage(data.habits.steps, 10000)}%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-400">Sleep (${data.habits.sleep_hours} / 8 hours)</span>
                  <span class="text-neon-pink">${calculatePercentage(data.habits.sleep_hours, 8)}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${calculatePercentage(data.habits.sleep_hours, 8)}%"></div>
                </div>
              </div>
              <button onclick="navigateToPage('habits')" class="btn-primary w-full mt-4">
                <i class="fas fa-edit mr-2"></i>
                Update Habits
              </button>
            </div>
          </div>
          
          <!-- Active Goals -->
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">
              <i class="fas fa-bullseye text-neon-green mr-2"></i>
              Active Goals
            </h2>
            <div class="space-y-4">
              ${goals.length === 0 ? `
                <p class="text-gray-400 text-center py-4">No goals set yet</p>
                <button onclick="navigateToPage('goals')" class="btn-primary w-full">
                  <i class="fas fa-plus mr-2"></i>
                  Add Your First Goal
                </button>
              ` : goals.slice(0, 3).map(goal => `
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-300 capitalize">${goal.goal_type} Goal</span>
                    <span class="text-neon-green">${goal.current_value} / ${goal.target_value}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculatePercentage(goal.current_value, goal.target_value)}%"></div>
                  </div>
                </div>
              `).join('')}
              ${goals.length > 0 ? `
                <button onclick="navigateToPage('goals')" class="btn-secondary w-full mt-4">
                  View All Goals
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Quick Add Workout -->
        <div class="glass-card rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-plus-circle text-neon-green mr-2"></i>
            Quick Add Workout
          </h2>
          <button onclick="navigateToPage('workouts')" class="btn-primary">
            <i class="fas fa-dumbbell mr-2"></i>
            Log Workout
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('page-content').innerHTML = `
      <div class="text-center text-red-400 py-8">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Failed to load dashboard</p>
      </div>
    `;
  }
}

// ============================================
// WORKOUTS PAGE
// ============================================

async function loadWorkoutsPage() {
  try {
    const response = await axios.get(`${API_BASE}/api/workouts/${currentUser.id}?limit=20`);
    const workouts = response.data.workouts;
    
    const html = `
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-white">
            <i class="fas fa-dumbbell text-neon-green mr-3"></i>
            Workouts
          </h1>
          <button onclick="showAddWorkoutModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Add Workout
          </button>
        </div>
        
        <!-- Workout History -->
        <div class="glass-card rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-4">Workout History</h2>
          
          ${workouts.length === 0 ? `
            <div class="text-center py-12">
              <i class="fas fa-dumbbell text-6xl text-gray-600 mb-4"></i>
              <p class="text-gray-400 text-lg">No workouts logged yet</p>
              <button onclick="showAddWorkoutModal()" class="btn-primary mt-4">
                <i class="fas fa-plus mr-2"></i>
                Add Your First Workout
              </button>
            </div>
          ` : `
            <div class="space-y-4">
              ${workouts.map(workout => `
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-neon-green transition">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="workout-badge ${getWorkoutBadgeClass(workout.workout_type)}">
                          ${workout.workout_type}
                        </span>
                        <span class="text-gray-400 text-sm">
                          <i class="fas fa-calendar mr-1"></i>
                          ${new Date(workout.workout_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div class="flex items-center gap-6 text-sm">
                        <span class="text-gray-300">
                          <i class="fas fa-clock text-neon-blue mr-2"></i>
                          ${workout.duration} min
                        </span>
                        <span class="text-gray-300">
                          <i class="fas fa-fire text-neon-green mr-2"></i>
                          ${workout.calories_burned} cal
                        </span>
                      </div>
                      ${workout.notes ? `
                        <p class="text-gray-400 text-sm mt-2">${workout.notes}</p>
                      ` : ''}
                    </div>
                    <button onclick="deleteWorkout(${workout.id})" class="text-red-400 hover:text-red-300 ml-4">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      
      <!-- Add Workout Modal -->
      <div id="add-workout-modal" class="hidden fixed inset-0 modal-overlay flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
          <h2 class="text-2xl font-bold text-white mb-4">Add Workout</h2>
          <form id="add-workout-form" class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Workout Type</label>
              <select id="workout-type" class="input-dark w-full" required>
                <option value="">Select type...</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Cardio">Cardio</option>
                <option value="Core">Core</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Duration (minutes)</label>
              <input type="number" id="workout-duration" class="input-dark w-full" min="1" required>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Calories Burned</label>
              <input type="number" id="workout-calories" class="input-dark w-full" min="1" required>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Date</label>
              <input type="date" id="workout-date" class="input-dark w-full" value="${getTodayDate()}" required>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Notes (optional)</label>
              <textarea id="workout-notes" class="input-dark w-full" rows="3"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="submit" class="btn-primary flex-1">
                <i class="fas fa-save mr-2"></i>
                Save Workout
              </button>
              <button type="button" onclick="hideAddWorkoutModal()" class="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // Add form submit handler
    document.getElementById('add-workout-form').addEventListener('submit', addWorkout);
  } catch (error) {
    console.error('Error loading workouts:', error);
  }
}

function showAddWorkoutModal() {
  document.getElementById('add-workout-modal').classList.remove('hidden');
}

function hideAddWorkoutModal() {
  document.getElementById('add-workout-modal').classList.add('hidden');
  document.getElementById('add-workout-form').reset();
}

async function addWorkout(e) {
  e.preventDefault();
  
  const workoutData = {
    user_id: currentUser.id,
    workout_type: document.getElementById('workout-type').value,
    duration: parseInt(document.getElementById('workout-duration').value),
    calories_burned: parseInt(document.getElementById('workout-calories').value),
    workout_date: document.getElementById('workout-date').value,
    notes: document.getElementById('workout-notes').value
  };
  
  try {
    await axios.post(`${API_BASE}/api/workouts`, workoutData);
    showToast('Workout added successfully!');
    hideAddWorkoutModal();
    loadWorkoutsPage();
  } catch (error) {
    console.error('Error adding workout:', error);
    showToast('Failed to add workout', 'error');
  }
}

async function deleteWorkout(id) {
  if (!confirm('Are you sure you want to delete this workout?')) return;
  
  try {
    await axios.delete(`${API_BASE}/api/workouts/${id}`);
    showToast('Workout deleted successfully!');
    loadWorkoutsPage();
  } catch (error) {
    console.error('Error deleting workout:', error);
    showToast('Failed to delete workout', 'error');
  }
}

// ============================================
// HABITS PAGE
// ============================================

async function loadHabitsPage() {
  try {
    const today = getTodayDate();
    const response = await axios.get(`${API_BASE}/api/habits/${currentUser.id}?start_date=${today}&end_date=${today}`);
    const todayHabits = response.data.habits[0] || {
      water_intake: 0,
      sleep_hours: 0,
      steps: 0,
      meditation_minutes: 0
    };
    
    const html = `
      <div class="fade-in">
        <h1 class="text-3xl font-bold text-white mb-6">
          <i class="fas fa-calendar-check text-neon-green mr-3"></i>
          Daily Habits
        </h1>
        
        <div class="glass-card rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-6">Track Today's Habits</h2>
          
          <form id="habits-form" class="space-y-6">
            <!-- Water Intake -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-green rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-tint text-xl text-gray-900"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold">Water Intake</h3>
                    <p class="text-gray-400 text-sm">Glasses of water</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" onclick="adjustHabit('water', -1)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" id="habit-water" value="${todayHabits.water_intake}" min="0" 
                         class="w-20 text-center bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold py-2">
                  <button type="button" onclick="adjustHabit('water', 1)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="progress-bar">
                <div id="water-progress" class="progress-fill" style="width: ${calculatePercentage(todayHabits.water_intake, 8)}%"></div>
              </div>
              <p class="text-gray-400 text-sm mt-2">Goal: 8 glasses</p>
            </div>
            
            <!-- Sleep Hours -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-bed text-xl text-gray-900"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold">Sleep</h3>
                    <p class="text-gray-400 text-sm">Hours of sleep</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" onclick="adjustHabit('sleep', -0.5)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" id="habit-sleep" value="${todayHabits.sleep_hours}" min="0" step="0.5"
                         class="w-20 text-center bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold py-2">
                  <button type="button" onclick="adjustHabit('sleep', 0.5)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="progress-bar">
                <div id="sleep-progress" class="progress-fill" style="width: ${calculatePercentage(todayHabits.sleep_hours, 8)}%"></div>
              </div>
              <p class="text-gray-400 text-sm mt-2">Goal: 8 hours</p>
            </div>
            
            <!-- Steps -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-walking text-xl text-gray-900"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold">Steps</h3>
                    <p class="text-gray-400 text-sm">Daily step count</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" onclick="adjustHabit('steps', -100)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" id="habit-steps" value="${todayHabits.steps}" min="0" step="100"
                         class="w-24 text-center bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold py-2">
                  <button type="button" onclick="adjustHabit('steps', 100)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="progress-bar">
                <div id="steps-progress" class="progress-fill" style="width: ${calculatePercentage(todayHabits.steps, 10000)}%"></div>
              </div>
              <p class="text-gray-400 text-sm mt-2">Goal: 10,000 steps</p>
            </div>
            
            <!-- Meditation -->
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center mr-4">
                    <i class="fas fa-spa text-xl text-gray-900"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold">Meditation</h3>
                    <p class="text-gray-400 text-sm">Minutes of meditation</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" onclick="adjustHabit('meditation', -5)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input type="number" id="habit-meditation" value="${todayHabits.meditation_minutes}" min="0" step="5"
                         class="w-20 text-center bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold py-2">
                  <button type="button" onclick="adjustHabit('meditation', 5)" class="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <div class="progress-bar">
                <div id="meditation-progress" class="progress-fill" style="width: ${calculatePercentage(todayHabits.meditation_minutes, 20)}%"></div>
              </div>
              <p class="text-gray-400 text-sm mt-2">Goal: 20 minutes</p>
            </div>
            
            <button type="submit" class="btn-primary w-full py-4 text-lg">
              <i class="fas fa-save mr-2"></i>
              Save Today's Habits
            </button>
          </form>
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // Add form submit handler
    document.getElementById('habits-form').addEventListener('submit', saveHabits);
  } catch (error) {
    console.error('Error loading habits:', error);
  }
}

function adjustHabit(type, amount) {
  const input = document.getElementById(`habit-${type}`);
  const currentValue = parseFloat(input.value) || 0;
  const newValue = Math.max(0, currentValue + amount);
  input.value = newValue;
  
  // Update progress bar
  let goal, progressBar;
  switch(type) {
    case 'water':
      goal = 8;
      progressBar = document.getElementById('water-progress');
      break;
    case 'sleep':
      goal = 8;
      progressBar = document.getElementById('sleep-progress');
      break;
    case 'steps':
      goal = 10000;
      progressBar = document.getElementById('steps-progress');
      break;
    case 'meditation':
      goal = 20;
      progressBar = document.getElementById('meditation-progress');
      break;
  }
  
  if (progressBar) {
    progressBar.style.width = `${calculatePercentage(newValue, goal)}%`;
  }
}

async function saveHabits(e) {
  e.preventDefault();
  
  const habitData = {
    user_id: currentUser.id,
    habit_date: getTodayDate(),
    water_intake: parseInt(document.getElementById('habit-water').value) || 0,
    sleep_hours: parseFloat(document.getElementById('habit-sleep').value) || 0,
    steps: parseInt(document.getElementById('habit-steps').value) || 0,
    meditation_minutes: parseInt(document.getElementById('habit-meditation').value) || 0
  };
  
  try {
    await axios.post(`${API_BASE}/api/habits`, habitData);
    showToast('Habits saved successfully!');
  } catch (error) {
    console.error('Error saving habits:', error);
    showToast('Failed to save habits', 'error');
  }
}

// ============================================
// GOALS PAGE (Part 1 - Continued in next part)
// ============================================

async function loadGoalsPage() {
  try {
    const response = await axios.get(`${API_BASE}/api/goals/${currentUser.id}`);
    const goals = response.data.goals;
    
    const html = `
      <div class="fade-in">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-white">
            <i class="fas fa-bullseye text-neon-green mr-3"></i>
            Goals
          </h1>
          <button onclick="showAddGoalModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Add Goal
          </button>
        </div>
        
        <!-- Goals List -->
        <div class="glass-card rounded-xl p-6">
          ${goals.length === 0 ? `
            <div class="text-center py-12">
              <i class="fas fa-bullseye text-6xl text-gray-600 mb-4"></i>
              <p class="text-gray-400 text-lg">No goals set yet</p>
              <button onclick="showAddGoalModal()" class="btn-primary mt-4">
                <i class="fas fa-plus mr-2"></i>
                Set Your First Goal
              </button>
            </div>
          ` : `
            <div class="space-y-4">
              ${goals.map(goal => {
                const percentage = calculatePercentage(goal.current_value, goal.target_value);
                const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                
                return `
                  <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h3 class="text-xl font-bold text-white capitalize">${goal.goal_type} Goal</h3>
                        ${goal.deadline ? `
                          <p class="text-gray-400 text-sm mt-1">
                            <i class="fas fa-calendar mr-1"></i>
                            ${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                          </p>
                        ` : ''}
                      </div>
                      <button onclick="deleteGoal(${goal.id})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                    
                    <div class="flex items-end justify-between mb-2">
                      <div class="flex-1">
                        <div class="flex justify-between text-sm mb-2">
                          <span class="text-gray-300">Progress</span>
                          <span class="text-neon-green font-bold">${percentage}%</span>
                        </div>
                        <div class="progress-bar h-4">
                          <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                      </div>
                      <div class="ml-6 text-right">
                        <p class="text-2xl font-bold text-white">${goal.current_value}</p>
                        <p class="text-gray-400 text-sm">/ ${goal.target_value}</p>
                      </div>
                    </div>
                    
                    <div class="flex gap-2 mt-4">
                      <input type="number" id="goal-update-${goal.id}" placeholder="New value" 
                             class="input-dark flex-1" value="${goal.current_value}">
                      <button onclick="updateGoalProgress(${goal.id})" class="btn-primary">
                        <i class="fas fa-sync mr-2"></i>
                        Update
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
      
      <!-- Add Goal Modal -->
      <div id="add-goal-modal" class="hidden fixed inset-0 modal-overlay flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
          <h2 class="text-2xl font-bold text-white mb-4">Add New Goal</h2>
          <form id="add-goal-form" class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Goal Type</label>
              <select id="goal-type" class="input-dark w-full" required>
                <option value="">Select type...</option>
                <option value="weight">Weight Loss</option>
                <option value="workout">Workout Minutes</option>
                <option value="steps">Daily Steps</option>
                <option value="calories">Calories Burned</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Target Value</label>
              <input type="number" id="goal-target" class="input-dark w-full" min="1" step="any" required>
            </div>
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">Deadline (optional)</label>
              <input type="date" id="goal-deadline" class="input-dark w-full">
            </div>
            <div class="flex gap-3">
              <button type="submit" class="btn-primary flex-1">
                <i class="fas fa-save mr-2"></i>
                Create Goal
              </button>
              <button type="button" onclick="hideAddGoalModal()" class="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // Add form submit handler
    document.getElementById('add-goal-form').addEventListener('submit', addGoal);
  } catch (error) {
    console.error('Error loading goals:', error);
  }
}

function showAddGoalModal() {
  document.getElementById('add-goal-modal').classList.remove('hidden');
}

function hideAddGoalModal() {
  document.getElementById('add-goal-modal').classList.add('hidden');
  document.getElementById('add-goal-form').reset();
}

async function addGoal(e) {
  e.preventDefault();
  
  const goalData = {
    user_id: currentUser.id,
    goal_type: document.getElementById('goal-type').value,
    target_value: parseFloat(document.getElementById('goal-target').value),
    deadline: document.getElementById('goal-deadline').value || null
  };
  
  try {
    await axios.post(`${API_BASE}/api/goals`, goalData);
    showToast('Goal created successfully!');
    hideAddGoalModal();
    loadGoalsPage();
  } catch (error) {
    console.error('Error adding goal:', error);
    showToast('Failed to create goal', 'error');
  }
}

async function updateGoalProgress(goalId) {
  const input = document.getElementById(`goal-update-${goalId}`);
  const newValue = parseFloat(input.value);
  
  if (!newValue || newValue < 0) {
    showToast('Please enter a valid value', 'error');
    return;
  }
  
  try {
    await axios.put(`${API_BASE}/api/goals/${goalId}`, {
      current_value: newValue
    });
    showToast('Goal updated successfully!');
    loadGoalsPage();
  } catch (error) {
    console.error('Error updating goal:', error);
    showToast('Failed to update goal', 'error');
  }
}

async function deleteGoal(id) {
  if (!confirm('Are you sure you want to delete this goal?')) return;
  
  try {
    await axios.delete(`${API_BASE}/api/goals/${id}`);
    showToast('Goal deleted successfully!');
    loadGoalsPage();
  } catch (error) {
    console.error('Error deleting goal:', error);
    showToast('Failed to delete goal', 'error');
  }
}

// ============================================
// ANALYTICS PAGE (Continued in next message due to length)
// ============================================

async function loadAnalyticsPage() {
  try {
    const days = 7;
    
    // Fetch analytics data
    const [workoutsRes, habitsRes, weightRes] = await Promise.all([
      axios.get(`${API_BASE}/api/analytics/workouts/${currentUser.id}?days=${days}`),
      axios.get(`${API_BASE}/api/analytics/habits/${currentUser.id}?days=${days}`),
      axios.get(`${API_BASE}/api/analytics/weight/${currentUser.id}?days=30`)
    ]);
    
    const workouts = workoutsRes.data;
    const habits = habitsRes.data.habitsHistory;
    const weightHistory = weightRes.data.weightHistory.reverse();
    
    const html = `
      <div class="fade-in">
        <h1 class="text-3xl font-bold text-white mb-6">
          <i class="fas fa-chart-line text-neon-green mr-3"></i>
          Analytics
        </h1>
        
        <!-- Charts Grid -->
        <div class="space-y-6">
          <!-- Workout Calories Chart -->
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Calories Burned (Last 7 Days)</h2>
            <div class="chart-container">
              <canvas id="calories-chart"></canvas>
            </div>
          </div>
          
          <!-- Workout Duration Chart -->
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Workout Duration (Last 7 Days)</h2>
            <div class="chart-container">
              <canvas id="duration-chart"></canvas>
            </div>
          </div>
          
          <!-- Workout Types Distribution -->
          ${workouts.workoutsByType.length > 0 ? `
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Workout Types Distribution</h2>
            <div class="chart-container">
              <canvas id="workout-types-chart"></canvas>
            </div>
          </div>
          ` : ''}
          
          <!-- Weight Progress -->
          ${weightHistory.length > 0 ? `
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Weight Progress (Last 30 Days)</h2>
            <div class="chart-container">
              <canvas id="weight-chart"></canvas>
            </div>
          </div>
          ` : ''}
          
          <!-- Habits Tracking -->
          ${habits.length > 0 ? `
          <div class="glass-card rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Daily Habits (Last 7 Days)</h2>
            <div class="chart-container">
              <canvas id="habits-chart"></canvas>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // Render charts
    renderAnalyticsCharts(workouts, habits, weightHistory);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

function renderAnalyticsCharts(workouts, habits, weightHistory) {
  // Chart.js default config
  Chart.defaults.color = '#9CA3AF';
  Chart.defaults.borderColor = 'rgba(75, 85, 99, 0.3)';
  
  // Calories Burned Chart
  const caloriesData = workouts.dailyWorkouts;
  if (caloriesData.length > 0) {
    new Chart(document.getElementById('calories-chart'), {
      type: 'bar',
      data: {
        labels: caloriesData.map(d => new Date(d.workout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Calories Burned',
          data: caloriesData.map(d => d.total_calories),
          backgroundColor: 'rgba(57, 255, 20, 0.5)',
          borderColor: '#39FF14',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Workout Duration Chart
  if (caloriesData.length > 0) {
    new Chart(document.getElementById('duration-chart'), {
      type: 'line',
      data: {
        labels: caloriesData.map(d => new Date(d.workout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Duration (minutes)',
          data: caloriesData.map(d => d.total_duration),
          backgroundColor: 'rgba(0, 217, 255, 0.1)',
          borderColor: '#00D9FF',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Workout Types Chart
  if (workouts.workoutsByType.length > 0) {
    const workoutTypes = workouts.workoutsByType;
    new Chart(document.getElementById('workout-types-chart'), {
      type: 'doughnut',
      data: {
        labels: workoutTypes.map(w => w.workout_type),
        datasets: [{
          data: workoutTypes.map(w => w.count),
          backgroundColor: [
            'rgba(57, 255, 20, 0.7)',
            'rgba(0, 217, 255, 0.7)',
            'rgba(255, 0, 110, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(233, 30, 99, 0.7)'
          ],
          borderColor: '#1F2937',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Weight Progress Chart
  if (weightHistory.length > 0) {
    new Chart(document.getElementById('weight-chart'), {
      type: 'line',
      data: {
        labels: weightHistory.map(w => new Date(w.recorded_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Weight (kg)',
          data: weightHistory.map(w => w.weight),
          backgroundColor: 'rgba(255, 0, 110, 0.1)',
          borderColor: '#FF006E',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#FF006E'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
  
  // Habits Chart
  if (habits.length > 0) {
    new Chart(document.getElementById('habits-chart'), {
      type: 'line',
      data: {
        labels: habits.map(h => new Date(h.habit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
          {
            label: 'Water (glasses)',
            data: habits.map(h => h.water_intake),
            borderColor: '#00D9FF',
            backgroundColor: 'rgba(0, 217, 255, 0.1)',
            tension: 0.4
          },
          {
            label: 'Sleep (hours)',
            data: habits.map(h => h.sleep_hours),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Steps (thousands)',
            data: habits.map(h => h.steps / 1000),
            borderColor: '#FF006E',
            backgroundColor: 'rgba(255, 0, 110, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

// ============================================
// PROFILE PAGE
// ============================================

async function loadProfilePage() {
  try {
    const response = await axios.get(`${API_BASE}/api/user/${currentUser.id}`);
    const user = response.data.user;
    
    const html = `
      <div class="fade-in">
        <h1 class="text-3xl font-bold text-white mb-6">
          <i class="fas fa-user text-neon-green mr-3"></i>
          Profile
        </h1>
        
        <div class="glass-card rounded-xl p-6 max-w-2xl">
          <div class="flex items-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center text-4xl text-gray-900 font-bold mr-6">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">${user.name}</h2>
              <p class="text-gray-400">${user.email}</p>
            </div>
          </div>
          
          <form id="profile-form" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">Name</label>
                <input type="text" id="profile-name" value="${user.name}" class="input-dark w-full" required>
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">Age</label>
                <input type="number" id="profile-age" value="${user.age || ''}" class="input-dark w-full" min="1" max="120">
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">Height (cm)</label>
                <input type="number" id="profile-height" value="${user.height || ''}" class="input-dark w-full" min="1" step="0.1">
              </div>
              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">Weight (kg)</label>
                <input type="number" id="profile-weight" value="${user.weight || ''}" class="input-dark w-full" min="1" step="0.1">
              </div>
            </div>
            
            <div class="pt-4">
              <button type="submit" class="btn-primary">
                <i class="fas fa-save mr-2"></i>
                Save Profile
              </button>
            </div>
          </form>
          
          <div class="mt-8 pt-8 border-t border-gray-700">
            <h3 class="text-lg font-bold text-white mb-4">Account Information</h3>
            <div class="space-y-2 text-gray-400">
              <p><i class="fas fa-envelope mr-2 text-neon-green"></i> ${user.email}</p>
              <p><i class="fas fa-calendar mr-2 text-neon-green"></i> Member since ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // Add form submit handler
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

async function updateProfile(e) {
  e.preventDefault();
  
  const profileData = {
    name: document.getElementById('profile-name').value,
    height: parseFloat(document.getElementById('profile-height').value) || null,
    weight: parseFloat(document.getElementById('profile-weight').value) || null,
    age: parseInt(document.getElementById('profile-age').value) || null
  };
  
  try {
    await axios.put(`${API_BASE}/api/user/${currentUser.id}`, profileData);
    currentUser.name = profileData.name;
    currentUser.height = profileData.height;
    currentUser.weight = profileData.weight;
    currentUser.age = profileData.age;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('user-name').textContent = currentUser.name;
    showToast('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    showToast('Failed to update profile', 'error');
  }
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLoginScreen();
  }
  
  // Login form handler
  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      showApp();
    } else {
      showToast('Invalid credentials', 'error');
    }
  });
  
  // Allow Enter key to login
  document.getElementById('login-email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
  document.getElementById('login-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
  
  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Navigation handlers
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      navigateToPage(page);
      
      // Close sidebar on mobile
      if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
      }
    });
  });
  
  // Sidebar toggle for mobile
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
  });
  
  document.getElementById('sidebar-close').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
  });
  
  // Initialize sidebar state
  if (window.innerWidth < 1024) {
    document.getElementById('sidebar').classList.add('-translate-x-full');
  }
});
