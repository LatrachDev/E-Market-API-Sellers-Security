const cors = require('cors');
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    // autoriser Postman ou curl (pas d'origin)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (allowedOrigins.includes(origin)) {
        // // Autoriser
      callback(null, true);
    } else {
    //   callback :une fonction fournie par la librairie cors.
    // bloquer 
      callback(new Error('Origin non autorisée'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
module.exports={corsOptions};
