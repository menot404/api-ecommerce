// models/Product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est requis'],
        maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est requise'],
        maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },
    price: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    originalPrice: {
        type: Number
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Le stock ne peut pas être négatif'],
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        trim: true
    },
    reviews: [reviewSchema],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    specifications: {
        type: Map,
        of: String
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index composé pour recherche performante
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });

// Méthode virtuelle pour calculer la réduction
productSchema.virtual('discount').get(function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Méthode pour mettre à jour le rating moyen
productSchema.methods.updateRating = function () {
    if (this.reviews.length === 0) {
        this.rating.average = 0;
        this.rating.count = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating.average = sum / this.reviews.length;
        this.rating.count = this.reviews.length;
    }
};

// Méthode statique pour rechercher des produits
productSchema.statics.search = function (query) {
    return this.find({ $text: { $search: query } });
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;