const NodeCache = require('node-cache');

// Cache avec TTL de 5 minutes par défaut
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60 // Vérification toutes les minutes
});

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Générer une clé unique basée sur l'URL et les paramètres
    const key = req.originalUrl || req.url;
    
    // Vérifier si la réponse est en cache
    const cachedResponse = cache.get(key);av
    
    if (cachedResponse) {
      console.log(`Cache HIT pour: ${key}`);
      return res.json(cachedResponse);
    }
    
    // Intercepter la méthode json pour mettre en cache
    const originalJson = res.json;
    res.json = function(data) {
      // Mettre en cache seulement les réponses de succès
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        console.log(`Cache SET pour: ${key}`);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Fonction pour vider le cache
const clearCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.del(key);
      }
    });
  } else {
    cache.flushAll();
  }
};

module.exports = { cacheMiddleware, clearCache, cache };