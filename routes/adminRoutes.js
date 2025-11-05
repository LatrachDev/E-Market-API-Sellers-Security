// routes/adminRoutes.js

const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

const auth = require('../middlewares/auth')
const { role } = require('../middlewares/role')

// ✅ Route accessible uniquement aux admins
router.get('/logs', auth, role('admin'), (req, res) => {
  const logFilePath = path.join(__dirname, '..', 'logs', 'combined.log')

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({
      status: 'error',
      message: 'Aucun log trouvé',
    })
  }

  try {
    const logs = fs.readFileSync(logFilePath, 'utf8')
    res.type('text/plain').send(logs)
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Impossible de lire les logs',
    })
  }
})

module.exports = router
