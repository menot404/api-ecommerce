const Order = require('../models/Order');

// GET /orders - Lister avec filtres

const getAllOrder = async(req, res, next)=>{
    try {
        const {
            page=1,
            limit=10,
            status,
            userId,
            sort = '-createAt'
        } = req.query;

        // By default
        const query = {};

        if(status){
            query.status = status;
        }

        if(userId){
            query.userId = userId;
        }

        const orders = await Order
            .find(query)
            .populate([
                { path: 'user', select: 'name email' },
                { path: 'items.product', select: 'name price images' }
            ])
            .limit(parseInt(limit)*1)
            .skip((parseInt(page)-1)*limit)
            .sort(sort);

            const countOrder = await Order.countDocuments(query);

            res.status(200).json({
                success: true,
                data: orders
            })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// POST /orders - Créer une commande

const createOrder = async(req, res, next)=>{
    try {
        const order = new Order(req.body);
        await order.save();

         // Populate avant de renvoyer

        await order.populate([
            { path: 'user', select: 'name email' },
            { path: 'items.product', select: 'name price' }
        ])
        
        res.status(201).json({
            success: true,
            message: 'Commande créée',
            data: order
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// GET /orders/:id - Récupérer une commande
const getOrderById = async(req, res, next)=>{
    try {
        const order = await Order
            .findById(req.params.id)
            .populate([
                { path: 'user', select: 'name email' },
                { path: 'items.product', select: 'name price' }
            ])

            if(!order){
                return res.status(404).json({
                    success: false,
                    error: 'Commande non trouvée'
                });
            };

            res.status(200).json({
                success: true,
                message: "Commmande Trouvée",
                data: order
            })
    } catch (error) {
        console.error(error);
        next(errror);
    }
}

// PUT /orders/:id/status - Mettre à jour le statut
const updateStatus = async(req, res, next)=>{
    try {
        const {status} = req.body;

        const order = await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({
                success: false,
                error: "Commande Non Trouvée"
            })
        };

        order.status = status;

        if(status === 'delivered'){
            order.deliveredAt = new Date();
        };

        await order.save();

        res.json({
            success: true,
            message: "Statut mis à jour",
            data: order
        })
    } catch (error) {
        next(error);
    }
}

// DELETE /orders/:id - Annuler une commande

const deleteOrder = async(req, res, next)=>{
    try {
        const order = await Order.findById(req.params.id);

        if(!order){
            res.status(404).json({
                success: false,
                error: "Commande non Trouvée"
            });
        };

        if(order.status !== "pending"){
            return res.status(400).json({
                succes: false,
                error: "Seule les commandes en attente peuvent être annulées"
            })
        };

        order.status = 'cancelled'
        await order.save();
        res.json({
        success: true,
        message: 'Commande annulée'
    });
    } catch (error) {
        next(error);
    }
}

// GET /orders/user/:userId - Commandes d'un utilisateur
const getOrderOfUser = async(req, res, next)=>{
    try {
        const orders = await Order
            .find({user: req.params.userId})
            .populate('items.product', 'name price images')
            .sort('-createdAt');
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllOrder,
    createOrder,
    getOrderById,
    updateStatus,
    deleteOrder,
    getOrderOfUser
}