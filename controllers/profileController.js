const User = require("../models/user");
const { hashPassword } = require("../services/hash");

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
}

exports.updateProfile = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found'
            });
        }
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        if (password) {
            user.password = await hashPassword(password);
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { 
                id: user._id,
                fullname: user.fullname,
                email: user.email,
            }
        });
    } catch (error) {
        next(error);
    }
}   