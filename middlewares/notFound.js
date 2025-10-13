function notFound(req, res, next) {
  res.status(404).json({
    error: "Not Found",
    message: `${req.method} ${req.originalUrl} not found`
  });
}

module.exports = notFound;