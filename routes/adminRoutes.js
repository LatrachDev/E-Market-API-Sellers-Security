const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { auth } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");

router.get("/logs", auth, isAdmin, (req, res) => {
  const logFilePath = path.join(__dirname, "..", "logs", "combined.log");

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({ message: "Aucun log trouvé" });
  }

  const logs = fs.readFileSync(logFilePath, "utf8");
  res.type("text/plain").send(logs);
});

module.exports = router;
