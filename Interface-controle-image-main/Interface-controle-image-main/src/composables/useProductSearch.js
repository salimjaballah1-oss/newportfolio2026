/**
 * Composable pour la recherche de produits
 * 
 * Encapsule toute la logique métier de recherche :
 * - État réactif
 * - Appel API
 * - Normalisation des données
 * - Gestion des erreurs
 */

import { ref } from 'vue'
import { apiService } from '../services/apiService.js'
import { normalizeProducts } from '../utils/productNormalizer.js'

export function useProductSearch() {
    // État réactif
    const products = ref([])
    const loading = ref(false)
    const error = ref(null)
    const query = ref('')
    
    /**
     * Effectue une recherche de produits
     * @param {string} searchQuery - Terme de recherche (optionnel, utilise query.value par défaut)
     */
    async function search(searchQuery = null) {
        // Utiliser le paramètre ou la valeur réactive
        const searchTerm = searchQuery || query.value

        // Validation
        if (!searchTerm || searchTerm.trim() === '') {
            error.value = 'Veuillez entrer un terme de recherche'
            return
        }

        // Reset de l'état
        loading.value = true
        error.value = null
        products.value = []

        try {
            // Appel API
            const rawProducts = await apiService.searchProducts(searchTerm)

            // Normalisation des données
            const normalizedProducts = normalizeProducts(rawProducts)
            
            // Mise à jour de l'état
            products.value = normalizedProducts

            // Log pour le développement
            console.log(`✅ ${normalizedProducts.length} produit(s) normalisé(s)`)

        } catch (err) {
            // Gestion des erreurs
            error.value = err.message || 'Une erreur est survenue lors de la recherche'
            console.error('❌ Erreur de recherche:', err)
        } finally {
            loading.value = false
        }                       
    }

    /**
     * Réinitialise l'état de recherche
     */
    function reset() {
        products.value = []
        loading.value = false
        error.value = null
        query.value = ''
    }

    /**
     * Réessayer la dernière recherche
     */
    function retry() {
        if (query.value) {
            search()
        }
    }
    
    // Retourner l'état et les méthodes
    return {
        // État
        products,
        loading,
        error,
        query,

        // Méthodes
        search,
        reset,
        retry
    }
}

export default useProductSearch
