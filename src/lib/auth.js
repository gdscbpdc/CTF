import { getUserRank } from './ranks';

export function getCurrentUser() {
  // Mock user for now
  return {
    id: '1',
    username: 'hackerman',
    email: 'hackerman@gdg.ae',
    points: 1250,
    rank: 'Elite Hacker',
    isAdmin: true,
    solvedChallenges: ['1', '2', '3'],
  };
}

export function registerUser(userData) {
  // Validate user registration data
  const { username, email, password } = userData;

  if (!username || username.length < 3) {
    return {
      success: false,
      message: 'Username must be at least 3 characters long',
    };
  }

  if (!email.includes('@')) {
    return {
      success: false,
      message: 'Invalid email address',
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // In a real app, hash the password and store in database
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    username,
    email,
    points: 0,
    solvedChallenges: [],
    rank: getUserRank(0),
    isAdmin: false,
    registeredAt: new Date(),
  };

  return {
    success: true,
    user: newUser,
    message: 'Registration successful!',
  };
}

export function loginUser(credentials) {
  const { username, password } = credentials;

  // Mock login - in real app, verify against stored credentials
  if (username === 'admin' && password === 'adminpass') {
    return {
      success: true,
      user: {
        id: '1',
        username: 'admin',
        isAdmin: true,
        points: 5000,
        rank: 'Cyber Ninja',
      },
    };
  }

  return {
    success: false,
    message: 'Invalid credentials',
  };
}
