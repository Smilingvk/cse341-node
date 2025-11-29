// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./config/passport');
const mongodb = require('./data/database');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Cambiado temporalmente para debugging
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', require('./routes/auth'));

// GitHub callback directo (sin /auth prefix)
app.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/',
    failureMessage: true 
  }),
  (req, res) => {
    console.log('=== CALLBACK DEBUG ===');
    console.log('User authenticated:', req.user ? (req.user.username || req.user.displayName) : 'NO USER');
    console.log('Session ID:', req.sessionID);
    console.log('Session before save:', req.session);
    
    // Guardar usuario en sesión
    req.session.user = req.user;
    
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.redirect('/?error=session-save-failed');
      }
      console.log('Session saved successfully');
      console.log('Session after save:', req.session);
      res.redirect('/');
    });
  }
);

app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

// Root route - mejorada para debugging
app.get('/', (req, res) => {
  console.log('=== HOME PAGE DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Session.user:', req.session ? req.session.user : 'NO SESSION');
  console.log('req.user:', req.user);
  
  const isLoggedIn = req.session && req.session.user;
  const userName = isLoggedIn ? (req.session.user.displayName || req.session.user.username) : 'Guest';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Home</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .status { padding: 10px; border-radius: 5px; margin: 20px 0; }
        .logged-in { background-color: #d4edda; color: #155724; }
        .logged-out { background-color: #f8d7da; color: #721c24; }
        a { display: inline-block; margin: 10px 10px 10px 0; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        a:hover { background-color: #0056b3; }
        .debug { background: #f0f0f0; padding: 10px; margin: 20px 0; font-family: monospace; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Welcome to the API</h1>
      <div class="status ${isLoggedIn ? 'logged-in' : 'logged-out'}">
        <strong>Status:</strong> ${isLoggedIn ? '✅ Logged in' : '❌ Not logged in'}<br>
        <strong>User:</strong> ${userName}
      </div>
      <div>
        ${!isLoggedIn ? '<a href="/auth/login">🔐 Login with GitHub</a>' : '<a href="/auth/logout">🚪 Logout</a>'}
        <a href="/api-docs">📚 API Documentation</a>
      </div>
      ${isLoggedIn ? '<p>✅ You can now use protected endpoints (POST, PUT, DELETE) in the API documentation!</p>' : '<p>ℹ️ Login to access protected endpoints (POST, PUT, DELETE)</p>'}
      <div class="debug">
        <strong>Debug Info:</strong><br>
        Session ID: ${req.sessionID || 'none'}<br>
        Has Session: ${req.session ? 'yes' : 'no'}<br>
        Session User: ${req.session && req.session.user ? 'yes' : 'no'}
      </div>
    </body>
    </html>
  `);
});

// 404 fallback
app.use((req, res) => res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`));

// Initialize database and start server
mongodb.initDb((err) => {
  if (err) {
    console.error('DB init error:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Running on port ${port}`);
  });
});