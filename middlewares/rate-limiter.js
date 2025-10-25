const { rateLimit } = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,//  max tentatives 
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

//  create des limiters
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, 
  'Trop de tentatives de connexion, veuillez réessayer plus tard'
);

const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requêtes
  'Trop de requêtes, veuillez réessayer plus tard'
);
// for payement or somthing comme ca 
const strictLimiter = createLimiter(
  60 * 1000, // 1 minute
  10, 
  'Trop de requêtes, veuillez ralentir'
);


module.exports = {
   
  authLimiter,
  apiLimiter,
  strictLimiter,
};

