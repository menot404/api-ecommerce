//models/Category
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    image: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

// Middleware pour générer le slug avant de sauvegarder
categorySchema.pre('save', function(){
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
            .replace(/\s/g, '-'); // Remplacer les espaces par des tirets
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;