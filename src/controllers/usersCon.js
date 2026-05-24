const User = require('../models/User');

// controllers/usersCon

// GET /users - Lister avec pagination et filtres
const listUsers = async(req, res, next)=>{
    try {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            sort = '-createdAt'
        } = req.query;

        // Construire la query
        const query = {};

        if (search) {
            query.$or = [
                {name: {$regex: search, $options: 'i'}},
                { email: {$regex: search, $options: 'i'}}
            ]
        };

        if (role) {
            query.role = role;
        }

        // Exécuter la query
        const users = await User
            .find(query)
            .limit(parseInt(limit*1))
            .select('-password')
            .skip((parseInt(page)-1)*parseInt(limit))
            .sort(sort);

        // Compter le total pour la pagination
        const count = await User.countDocuments(query);
        res.status(200).json({
            success: true,
            count: users.length,
            total: count,
            totalPages: Math.ceil(count/limit),
            currentPage: parseInt(page),
            data: users
        });

    } catch (error) {
        next(error);
    }
}

// GET /users/:id - Récupérer un utilisateur par ID
const getUserById = async(req, res, next)=>{
    try {
        const user = await User
            .findById(req.params.id)
            .select('-password');
            
            if(!user){
                return res.status(404).json(
                    {
                        success: false,
                        error: "Utilistateur non trouvé"
                    }
                )
            }
            res.status(200).json({
                success: true,
                data: user
            });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// POST /users - Créer un utilisateur
const createUser = async(req, res, next)=>{
    try {
        const newUser = new User(req.body);
        const saveUser = await newUser.save();
        res.status(201).json({
            success: true,
            message: "Utilisateur créé avec succès",
            data: saveUser
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// PUT /users/:id - Mettre à jour
const updateUser = async(req, res, next)=>{
    try {
        await delete req.body.password; // Ne pas permettre de modifier le mot de passe via cette route
        const user = await User
            .findByIdAndUpdate(req.params.id, req.body,{
                new: true,
                runValidators: true
            })
            .select('-password');

            if(!user){
                return res.status(404).json({
                    success: false,
                    error: "Utilisateur non trouvé"
                })
            }
            res.status(200).json({
                success: true,
                message: "Utilisateur mis à jour avec succès",
                data: user
            })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// DELETE /users/:id - Supprimer
const deleteUser = async(req, res, next)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({
                success: false,
                error: "Utilisateur non trouvé"
            })
        }
        res.status(200).json({
            success: true,
            message: "Utilisateur supprimé avec succès"
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// GET /users/:id/stats - Statistiques utilisateur
const satsUser = async(req, res, next)=>{
    try {
        const Order = require('../models/Order');
        const stats =  await Order.getUserStats(req.params.id);
        res.json({
            success: true,
            data: stats[0] || {
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

module.exports = {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    satsUser
}