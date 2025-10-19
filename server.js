// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const usersRouter = require('./routes/users');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); // ruta al archivo
const cors = require('cors');
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
