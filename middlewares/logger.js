const express = require("express");
const logger = (req, res, next) => {
    req.time = new Date().toISOString();
    console.log(req.time, req.method, req.hostname, req.path);
    
    next();
};

module.exports = logger;