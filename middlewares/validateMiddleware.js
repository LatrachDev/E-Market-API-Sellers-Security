class ValidateMiddleware {
  validated = (schema) => {
    return async (req, res, next) => {
      try {
        // Vérifie que schema a bien la fonction validate
        if (!schema || typeof schema.validate !== "function") {
          throw new Error("Schema invalide !");
        }

        await schema.validate(req.body, { abortEarly: false });
        next();
      } catch (err) {
        res.status(400).json({ errors: err.message });
      }
    };
  };
}

module.exports = ValidateMiddleware;
