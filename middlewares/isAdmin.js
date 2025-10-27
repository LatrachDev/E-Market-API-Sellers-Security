 const isAdmin = (req, res, next) => {
  try {
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Accès refusé : vous devez être admin",
        data: {}
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Erreur serveur",
      data: { error: error.message }
    });
  }
};
module.exports=isAdmin;
