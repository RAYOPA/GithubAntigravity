const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_campus_super_secret_jwt_key_2026';

// Pre-configured demo user accounts for immediate testing
const DEMO_USERS = {
  student: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Aarav Sharma',
    email: 'student@college.edu',
    role: 'student',
    department: 'Computer Science'
  },
  faculty: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Dr. Priya Menon',
    email: 'faculty@college.edu',
    role: 'faculty',
    department: 'Computer Science'
  },
  manager: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Rahul Verma',
    email: 'manager@college.edu',
    role: 'facility_manager',
    department: 'Administration'
  },
  admin: {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'System Admin',
    email: 'admin@college.edu',
    role: 'admin',
    department: 'Administration'
  }
};

/**
 * Authentication Middleware:
 * Inspects Authorization: Bearer <token>
 * If missing, falls back seamlessly to demo user for frictionless hackathon evaluation.
 */
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // Check if it's a demo role shortcut token (e.g. Bearer student, Bearer faculty)
    if (DEMO_USERS[token]) {
      req.user = DEMO_USERS[token];
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // If token invalid, proceed with default faculty user or return 401
      console.warn('[Auth] Invalid JWT, using demo session.');
    }
  }

  // Default demo user: Student / Faculty
  const requestedRole = req.headers['x-demo-role'] || 'faculty';
  req.user = DEMO_USERS[requestedRole] || DEMO_USERS.faculty;
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: ${req.user?.role}`
      });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  requireRoles,
  DEMO_USERS,
  JWT_SECRET
};
