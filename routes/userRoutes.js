const express = require('express')
const {
  getUsers,
  getOneUser,
  createUser,
  deleteUser,
  promoteUserToSeller,
  demoteSellerToUser,
} = require('../controllers/userController')
const validate = require('../middlewares/validate')
const { registerSchema } = require('../validators/userValidation')
const router = express.Router()

router.get('/', getUsers)
router.post('/', validate(registerSchema), createUser)
router.delete('/:id', deleteUser)
router.put('/promote/:id', promoteUserToSeller)
router.put('/demote/:id', demoteSellerToUser)
router.get('/:id', getOneUser)

module.exports = router
