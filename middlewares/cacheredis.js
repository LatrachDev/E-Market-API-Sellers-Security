const client = require("../config/redisClient");

/**
 * Middleware général pour Redis cache avec TTL dynamique
 * @param {number} ttl - durée du cache en secondes
 */
function cacheManager(ttl = 600) {
  return async (req, res, next) => {
    const key = req.originalUrl; // clé dynamique basée sur l'URL

    try {
      if (req.method === "GET") {
        // Vérification du cache
        const cachedData = await client.get(key);
        if (cachedData) {
          console.log(`⚡ Cache hit: ${key}`);
          return res.json(JSON.parse(cachedData));
        }

        // Intercepter la réponse pour mettre en cache
        res.sendResponse = res.json;
        res.json = (data) => {
          client.setEx(key, ttl, JSON.stringify(data)); // TTL dynamique
          res.sendResponse(data);
        };

        next();
      } else if (["POST", "PUT", "DELETE"].includes(req.method)) {
        // Invalider le cache après modification
        res.sendResponse = res.json;
        res.json = async (data) => {
          await client.del(req.originalUrl); // supprime la clé correspondante
          res.sendResponse(data);
        };

        next();
      } else {
        next();
      }
    } catch (err) {
      console.error("Cache Manager Middleware Error:", err);
      next();
    }
  };
}

module.exports = cacheManager;
