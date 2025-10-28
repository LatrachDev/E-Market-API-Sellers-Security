const express = require('express');
const { getUsers, getOneUser, createUser, deleteUser,promoteUserToSeller, demoteSellerToUser } = require('../controllers/userController');
const validate  = require('../middlewares/validate');
const userSchema  = require('../validators/userValidation');
const router = express.Router()

router.get('/', getUsers);
router.get('/:id', getOneUser);
router.post('/', validate(userSchema), createUser);
router.delete('/:id', deleteUser);
router.put('/promote/:id', promoteUserToSeller);
router.put('/demote/:id', demoteSellerToUser);

module.exports = router;