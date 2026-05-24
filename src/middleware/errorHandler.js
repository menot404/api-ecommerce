// middleware/errorHandler

const errorHandler = (err, req, res, next)=>{
    console.error(`❌ Erreur: ${err.message}`);

    // Erreur de validation Mongoose
    if(err.name === 'ValidationError'){
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Erreur Validation',
            details: errors
        })
    }

    // Erreur CastError (ID invalide)
    if(err.name === 'CastError'){
        return res.status(400).json({
            success: false,
            error: `ID invalide: ${err.value}`
        })
    }

    // Erreur de duplication (email déjà existant)
    if(err.code === 11000){
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `Ce ${field} existe déjà. Veuillez en choisir un autre.`
        });
    }

    // Erreur par défaut
    res.status(500).json({
        success: false,
        error: err.message || 'Erreur serveur interne',
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
    next();
}

const notFound = (req, res, next) => {
    const error = new Error(`Route non trouvée - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
