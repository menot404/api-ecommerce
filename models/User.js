//models/User
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit avoir au moins 2 caractères'],
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email:{
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        lowercase:true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
        minlength: [6, "Le mot de passe doit avoir au moins 6 caractères"]
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'seller'],
            message: "{VALUE} n'est pas un rôle valide"
        },
        default: 'user'
    },
    avatar: {
        type: String,
        default: "https://via.placeholder.com/150"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
    },
    address: {
        street: String,
        city: String,
        country: String,
        zipCode: String
    }

}, {timestamps: true});

// Index pour optimiser les recherches
//userSchema.index({email: 1});
userSchema.index({name: 'text'}); // Recherche textuelle sur le nom

// Méthode virtuelle (ne sera pas stockée en DB)
userSchema.virtual('fullInfo').get(function(){
    return `${this.name} <${this.email}>`;
})

// Méthode d'instance
userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.password;  // Ne jamais renvoyer le mot de passe
    return userObject;
}

// Méthode statique
userSchema.statics.findByEmail = function(email){
    return this.findOne({email: email.toLowerCase().trim()});
}

// Middleware pre-save
userSchema.pre('save', function(){
    console.log(`🔒 Sauvegarde de l'utilisateur: ${this.email}`);
})

const User = mongoose.model('User', userSchema);
module.exports = User;