// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const usersRouter = require('./routes/users');
const app = express();

const port = process.env.PORT || 3000;
app.use(bodyParser.json()); // o app.use(express.json());

app.use('/users', usersRouter);

// 404 fallback
app.use((req,res) => res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`));

mongodb.initDb((err) => {
  if (err) {
    console.error('DB init error:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`Running on port ${port}`);
  });
});
