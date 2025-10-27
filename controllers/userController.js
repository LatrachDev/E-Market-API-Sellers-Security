const User = require("../models/user");
const { hashPassword, comparePassword } = require('../services/hash');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *           description: The user's full name
 *         email:
 *           type: string
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *       required:
 *         - fullname
 *         - email
 *         - password
 */

// get all users

/**
 * @swagger
 * /users:
 *   get:
 *     summary: get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users got successfully
 *       500:
 *         description: Server error
 */

async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "all users found",
      users: users,
    });
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

// find one specific user
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: get one specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User got successfully
 *       500:
 *         description: Server error
 */

async function getOneUser(req, res, next) {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: "user not found" });
    }
    res.status(200).json({
      message: "user found succesfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
}

// create a user
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Email already exists or invalid input
 *       500:
 *         description: Server error
 */

async function createUser(req, res, next) {
  try {
    const { fullname, email, password, role } = req.body;
    
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const createdUser = await User.create({ fullname, email, password: hashedPassword, role });

    res.status(201).json({
      success: true,
      status: 200,
      message: "user created successfully",
      user: createdUser,
    });
  } catch (error) {
    next(error);
  }
}

// Delete user
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Server error
 */
async function deleteUser(req, res, next) {
  try {
    const user = User.findById();
    await User.deleteOne(user);
    res.status(200).json("user deleted successfully");
  } catch (error) {
    // throw error;
    next(error);
  }
}

module.exports = { getUsers, getOneUser, createUser, deleteUser };
