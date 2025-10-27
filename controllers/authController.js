const User = require('../models/user');
const { hashPassword, comparePassword } = require('../services/hash');
const { generateToken } = require('../services/jwt');

exports.register = async (req, res, next) => {
    const { fullname, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'This email is already taken'
            });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ fullname, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({
            success: true,
            status: 201,
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, nex) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                succress: false,
                status: 401,
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        // Send response with token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                jwt: token,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role
                }

            }
        });
    } catch (error) {
        next(error);
    }
}