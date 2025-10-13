const express = require('express');
const { getUsers, getOneUser, createUser, deleteUser } = require('../controllers/userController');
const validate  = require('../middlewares/validate');
const userSchema  = require('../validators/userValidation');
const router = express.Router()

router.get('/', getUsers);
router.get('/:id', getOneUser);
router.post('/', validate(userSchema), createUser);
router.delete('/:id', deleteUser);

module.exports = router;