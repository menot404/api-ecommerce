// Controller pour gérere les produits
const { findById } = require('../models/Order');
const Product = require('../models/Product');

// GET /products - Lister avec filtres avancés
const getAllProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            minPrice,
            maxPrice,
            brand,
            minRating,
            sort = '-createAt',
            featured
        } = req.query;

        // Construire la query
        const query = {};

        // Recherche textuelle
        if (search) {
            query.$text = { $search: search };
        };

        //Filtrage par catégorie
        if (category) {
            query.category = category;
        }

        // Filtrage par prix
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Filtrage par marque
        if (brand) {
            query.brand = brand;
        }

        // Filtarge par note minimale
        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating) };
        }

        // Filtrage par produit en vedette
        if (featured !== undefined) {
            query.isFeatured = featured === 'true';
        }

        // Exécuter la query
        const produits = await Product
            .find(query)
            .limit(parseInt(limit * 1))
            .skip(parseInt(page - 1) * parseInt(limit))
            .populate('category', 'name slug')
            .populate('seller', 'name email')
            .sort(sort);

        // Compter le total pour le nmbre de pages
        const count = await Product.countDocuments(query);
        res.status(200).json({
            success: true,
            count: produits.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: produits
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}


// POST /products - Créer un produit
const createProduct = async (req, res, next) => {
    try {
        const product = new Product(req.body);
        await product.save();

        // Populate avant de renvoyer la réponse
        await product.populate([
            { path: 'category', select: 'name slug' },
            { path: 'seller', select: 'name email' }
        ])

        res.status(201).json({
            success: true,
            message: 'Produit créé avec succès',
            data: product
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// GET /products/featured - Produits en vedette
const getFeaturedProducts = async (req, res, next) => {
    try {
        const featuredProducts = await Product
            .find({ isFeatured: true, isActive: true })
            .populate('category', 'name')
            .limit(6)
            .sort('-rating.average');

        res.status(200).json({
            success: true,
            count: featuredProducts.length,
            data: featuredProducts
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// GET /products/:id - Récupérer un produit
const getProductsById = async (req, res, next) => {
    try {
        const product = await Product
            .findById(req.params.id)
            .populate([
                { path: "category", select: "name slug description " },
                { path: "seller", select: "name email" },
                { path: "reviews.user", select: "name avatar" }
            ]);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produit non trouvé'
            });
        };

        res.json({
            success: true,
            message: "Produit trouvé",
            data: product
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// PUT /products/:id - Mettre à jour
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product
            .findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            })
            .populate('category', 'name slug');
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produit non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Produit mis à jour',
            data: product
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

// DELETE /products/:id - Supprimer (soft delete)
const softDeleteById = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produit non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Produit désactivé'
        });
    } catch (error) {
        next(error);
    }
};

// POST /products/:id/reviews - Ajouter un avis
const createReview = async (req, res, next) => {
    try {
        const { user, rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produit non trouvé'
            })
        };

        //Ajouter l'avis
        product.reviews.push({ user, rating, comment });

        // Mettre à jour le rating moyen
        product.updateRating();

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Avis ajouté',
            data: product
        });
    } catch (error) {
        next(error)
    }
}

// GET /products/category/:categoryId - Produits par catégorie
const getProductByCategory = async (req, res, next) => {
    try {
        const products = await Product
            .find({ category: req.params.categoryId })
            .populate('category', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    getFeaturedProducts,
    getProductsById,
    updateProduct,
    softDeleteById,
    createReview,
    getProductByCategory
}