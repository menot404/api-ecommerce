// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String, // Garder le nom au cas où le produit est supprimé
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    deliveredAt: Date,
    notes: String
}, {
    timestamps: true
});

// Index
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Méthode virtuelle pour nombre d'items
orderSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Méthode statique pour statistiques utilisateur
orderSchema.statics.getUserStats = async function (userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId) ;
    const stats = await this.aggregate([
        { $match: { user: userObjectId} },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$totalAmount' },
                avgOrderValue: { $avg: '$totalAmount' }
            }
        }
    ]);

    return stats;
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;