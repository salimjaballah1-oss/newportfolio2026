/**
 * Normalisation des données produit de l'API vers le format UI
 * 
 * Responsabilités :
 * - Transformer le schéma API vers le schéma UI
 * - Extraction robuste des images avec fallbacks
 * - Validation et nettoyage des données
 * - Gestion des cas edge
 */

import { UI_CONFIG } from '../config/config.js'

/**
 * Extrait l'URL de l'image d'un produit avec stratégie de fallback
 * 
 * Stratégie de priorité :
 * 1. defaultImage[0]?.url
 * 2. defaultImage?.url (si c'est un objet et non un tableau)
 * 3. images[0]?.url
 * 4. productImages[0]?.url
 * 5. image?.url
 * 6. image (si c'est directement une string)
 * 7. placeholder
 * 
 * @param {Object} product - Produit brut de l'API
 * @returns {string} URL de l'image ou placeholder
 */
export function extractImageUrl(product) {
    // Cas 1 : defaultImage est un tableau
    if (Array.isArray(product.defaultImage) && product.defaultImage.length > 0) {
        const url = product.defaultImage[0]?.url
        if (url && typeof url === 'string') {
            return url
        }
    }

    // Cas 2 : defaultImage est un objet direct
    if (product.defaultImage && typeof product.defaultImage === 'object' && !Array.isArray(product.defaultImage)) {
        const url = product.defaultImage.url
        if (url && typeof url === 'string') {
            return url
        }
    }

    // Cas 3 : images est un tableau
    if (Array.isArray(product.images) && product.images.length > 0) {
        const url = product.images[0]?.url
        if (url && typeof url === 'string') {
            return url
        }
    }

    // Cas 4 : productImages est un tableau
    if (Array.isArray(product.productImages) && product.productImages.length > 0) {
        const url = product.productImages[0]?.url
        if (url && typeof url === 'string') {
            return url
        }
    }

    // Cas 5 : image est un objet
    if (product.image && typeof product.image === 'object') {
        const url = product.image.url
        if (url && typeof url === 'string') {
            return url
        }
    }

    // Cas 6 : image est directement une string
    if (typeof product.image === 'string') {
        return product.image
    }

    // Fallback : placeholder
    return UI_CONFIG.placeholderImage
}

/**
 * Vérifie si un produit a une image valide
 * @param {Object} product - Produit brut de l'API
 * @returns {boolean}
 */
export function hasValidImage(product) {
    const imageUrl = extractImageUrl(product)
    return imageUrl !== UI_CONFIG.placeholderImage
}

/**
 * Normalise un produit de l'API vers le format UI
 * @param {Object} rawProduct - Produit brut de l'API
 * @returns {Object} Produit normalisé
 */
export function normalizeProduct(rawProduct) {
    return {
        // Identifiants
        id: rawProduct.id,
        code: rawProduct.code || '',
        ean13: rawProduct.ean13 || '',

        // Informations
        label: rawProduct.label || 'Produit sans nom',
        description: rawProduct.description || '',

        // Image (avec extraction robuste)
        imageUrl: extractImageUrl(rawProduct),
        hasImage: hasValidImage(rawProduct),

        // Prix (si disponible)
        price: rawProduct.price || null,
        priceFormatted: rawProduct.price ? `${rawProduct.price}€` : null,

        // Stock (si disponible)
        stock: rawProduct.stock || null,
        inStock: rawProduct.stock ? rawProduct.stock > 0 : null,

        // Métadonnées
        category: rawProduct.category || null,
        brand: rawProduct.brand || null,

        // Données brutes (pour debug)
        _raw: rawProduct
    }
}

/**
 * Normalise une liste de produits
 * @param {Array} rawProducts - Liste de produits bruts de l'API
 * @returns {Array} Liste de produits normalisés
 */
export function normalizeProducts(rawProducts) {
    if (!Array.isArray(rawProducts)) {
        console.warn('⚠️ normalizeProducts: rawProducts n\'est pas un tableau', rawProducts)
        return []
    }

    return rawProducts.map(normalizeProduct)
}

/**
 * Log de diagnostic pour l'extraction d'image
 * (À utiliser pendant le développement)
 * @param {Object} product - Produit brut
 */
export function debugImageExtraction(product) {
    console.group(`🔍 Debug Image: ${product.label || product.code}`)
    console.log('defaultImage:', product.defaultImage)
    console.log('images:', product.images)
    console.log('productImages:', product.productImages)
    console.log('image:', product.image)
    console.log('→ URL extraite:', extractImageUrl(product))
    console.log('→ A une image valide:', hasValidImage(product))
    console.groupEnd()
}

export default {
    extractImageUrl,
    hasValidImage,
    normalizeProduct,
    normalizeProducts,
    debugImageExtraction
}
