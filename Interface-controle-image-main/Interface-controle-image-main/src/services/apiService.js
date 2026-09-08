/**
 * Service API pour la communication avec le backend Chazal
 * 
 * Responsabilités :
 * - Gestion de l'authentification
 * - Requêtes HTTP
 * - Gestion des erreurs
 * - Retry logic
 */

import { API_CONFIG, AUTH_CONFIG } from '../config/config.js'

class ApiService {
    constructor() {
        this.token = null
    }z

    get baseURL() {
        return API_CONFIG.baseURL
    }

    /**
     * Authentification auprès de l'API
     * @returns {Promise<string>} Token d'authentification
     */
    async login() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: AUTH_CONFIG.email,
                    password: AUTH_CONFIG.password
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur d'authentification: ${response.status}`)
            }

            const data = await response.json()

            // Le token est dans data.data.token selon la structure API
            this.token = data.data.token

            console.log('✅ Authentification réussie')

            return this.token
        } catch (error) {
            console.error('❌ Erreur lors de l\'authentification:', error)
            throw new Error('Impossible de se connecter à l\'API')
        }
    }

    /**
     * Recherche de produits
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} Liste des produits
     */
    async searchProducts(query) {
        try {
            // S'assurer qu'on a un token
            if (!this.token) {
                await this.login()
            }
            
            // Construire le payload de recherche
            const searchPayload = {
                code: query,
                label: query,
                ean13: query
            }

            // Encoder le payload pour l'URL
            const encodedSearch = encodeURIComponent(JSON.stringify(searchPayload))

            // Construire l'URL complète
            const url = `${this.baseURL}${API_CONFIG.endpoints.productSearch}?s=${encodedSearch}`

            // Effectuer la requête
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Gérer les erreurs HTTP
            if (!response.ok) {
                // Si 401, le token a peut-être expiré, réessayer avec un nouveau login
                if (response.status === 401) {
                    console.warn('⚠️ Token expiré, nouvelle authentification...')
                    this.token = null
                    return this.searchProducts(query) // Retry avec nouveau token
                }

                throw new Error(`Erreur API: ${response.status}`)
            }

            const data = await response.json()
            // Extraire les produits de la réponse
            // Structure: data.data.data
            const products = data.data?.data || []

            console.log(`✅ ${products.length} produit(s) trouvé(s)`)
