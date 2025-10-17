function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    status: 404,
    error: "Not Found",
    message: `${req.method} ${req.originalUrl} not found`
  });
}

module.exports = notFound;