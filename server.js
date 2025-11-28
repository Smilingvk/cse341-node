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
    secure: process.env.NODE_ENV === 'production',
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
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the API</h1>
    <p>Logged in: ${req.session.user ? 'Yes' : 'No'}</p>
    ${req.session.user ? `<p>User: ${req.session.user.displayName || req.session.user.username}</p>` : ''}
    <a href="/auth/login">Login with GitHub</a><br>
    <a href="/auth/logout">Logout</a><br>
    <a href="/api-docs">API Documentation</a>
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