'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');


// Esoteric Resources
const errorHandler = require('./error-handlers/500.js');
const notFound = require('./error-handlers/404.js');
const authRoutes = require('./auth/routes/routes.js');
const logger = require('./auth/middleware/logger.js');
const v1Routes = require('./auth/routes/v1.js');
const v2Routes = require('./auth/routes/v2.js');
// Prepare the express app
const app = express();

// App Level MW
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/',(req,res)=>{
  res.status(200).json({
    message:"welcome to your home"
  })
})
app.use(authRoutes);
app.use(logger);

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);


// Catchalls
app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
