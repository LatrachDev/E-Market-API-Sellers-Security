const User = require('../models/user');
const { hashPassword, comparePassword } = require('../services/hash');
const { generateToken } = require('../services/jwt');

exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already taken' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ fullname, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}