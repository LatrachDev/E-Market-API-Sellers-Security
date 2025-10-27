const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  res.on("finish", () => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode}`;
    res.statusCode >= 400 ? logger.warn(message) : logger.info(message);
  });
  next();
};

module.exports = requestLogger;