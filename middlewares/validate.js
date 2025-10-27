const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            status: 400,
            message: "Validation Error",
            errors: error.errors 
        });
    }
}

module.exports = validate;