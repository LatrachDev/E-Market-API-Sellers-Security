
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    
    // accept les requêtes sans origin (Postman, , mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      
      callback(new Error('Non autorisé par CORS - Origin: ' + origin));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  //  add de headers autorisés
  allowedHeaders: ['Content-Type', 'Authorization'],
  //  Méthodes HTTP acceptés
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};

module.exports = { corsOptions };