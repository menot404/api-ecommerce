// controllers/caegoriesCon
const Category = require('../models/Category');
const Product = require('../models/Product');
// GET /categories - Lister toutes

const getAllCategories = async(req, res, next)=>{
    try {
        const categories = await Category
            .find({isActive: true})
            .sort('name');
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
}

// GET /categories/:id - Récupérer une catégorie
const getCategoryById = async(req, res, next)=>{
    try {
        const category = await Category.findById(req.params.id);
        if(!category){
            return res.status(404).json({
                success: false,
                error: 'Catégorie non trouvée'
            })
        }

        // Compter les produits dans cette catégorie
        const productCount = await Product.countDocuments({category: category._id, isActive: true});
        category._doc.productCount = productCount; // Ajouter le count au document retourné

        return res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// POST /categories - Créer une catégorie

const createCategory = async(req, res, next)=>{
    try {
        const category = new Category(req.body);
        await category.save();
        return res.status(201).json({
            success: true,
            message: 'Catégorie créée avec succès',
            data: category
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// PUT /categories/:id - Mettre à jour
const updateCategory = async(req, res, next)=>{
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        category.slug = category.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
            .replace(/\s/g, '-'); // Remplacer les espaces par des tirets
        await category.save(); // Pour déclencher les middlewares

        if(!category){
            return res.status(404).json({
                success: false,
                error: 'Catégorie non trouvée',
            })
        }

        return res.status(200).json({
            success:true,
            message: 'Catégorie mise à jour avec succcès',
            data: category
        })
        } catch (error) {
        console.error(error);
        next(error);
    }
}

// DELETE /categories/:id - Supprimer
const deleteProduct = async(req, res, next)=>{
    try {
        // Vérifier si il y a des produits dans cette Catégorie
        const productCount = await Product.countDocuments({
            category: req.params.id
        });

        if(productCount > 0){
            return res.status(400).json({
                success: false,
                error: `Impossible de supprimer. ${productCount} produit(s) utilisent cette catégorie`
            })
        }

        const category = await Category.findByIdAndDelete(req.params.id); 

        if(!category){
            res.status(404).json({
                success: false,
                error: 'Catégorie non trouvée'
            })
        };

        res.status(200).json({
            success: true,
            message: 'Catégorie supprimée'
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteProduct
}