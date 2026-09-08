/**
 * Configuration centralisée de l'application
 * 
 * IMPORTANT : En production, déplacer les credentials dans des variables d'environnement
 * Utiliser import.meta.env.VITE_API_URL, etc.
 */

const API_ENV_STORAGE_KEY = 'chazal-api-environment'

export const API_ENVIRONMENTS = {
    dev: '/api-dev',
    prod: '/api'
}

function normalizeApiEnvironment(value) {
    return value === 'dev' ? 'dev' : 'prod'
}

export function getApiEnvironment() {
    if (typeof window === 'undefined') {
        return 'prod'
    }

    return normalizeApiEnvironment(window.localStorage.getItem(API_ENV_STORAGE_KEY))
}

export function setApiEnvironment(environment) {
    const normalizedEnvironment = normalizeApiEnvironment(environment)

    if (typeof window !== 'undefined') {
        window.localStorage.setItem(API_ENV_STORAGE_KEY, normalizedEnvironment)
    }

    return normalizedEnvironment
}

export function getApiBaseUrl() {
    return API_ENVIRONMENTS[getApiEnvironment()]
}

export function getProductSearchPath() {
    return getApiEnvironment() === 'dev'
        ? '/admin/products/searchAll'
        : '/admin/products/searchAll'
}

export function getSupplierPath(code = '') {
    const normalizedCode = encodeURIComponent(String(code ?? '').trim())
    return normalizedCode ? `/admin/fournisseurs/${normalizedCode}` : '/admin/fournisseurs'
}

// Configuration API
export const API_CONFIG = {
    // Base URL dynamique
    get baseURL() {
        return getApiBaseUrl()
    },

    // Endpoints
    endpoints: {
        login: '/login',
        suppliers: '/admin/fournisseurs',
        get productSearch() {
            return getProductSearchPath()
        },
        supplier(code) {
            return getSupplierPath(code)
        },
        imageUpload(productCode) {
            return `/admin/products/${productCode}/image`
        },
        imageDelete(productCode, imageId) {
            return `/admin/products/${productCode}/image/${imageId}`
        }
    },

    // Timeouts
    timeout: 30000, // 30 secondes

    // Retry
    maxRetries: 3
}

// Credentials (À DÉPLACER VERS .env EN PRODUCTION)
export const AUTH_CONFIG = {
    email: 'it.make@maisonchazal.com',
    password: 'cv86WuAm'
}

// Configuration UI
export const UI_CONFIG = {
    // Image placeholder
    placeholderImage: 'https://via.placeholder.com/400x250?text=Produit',

    // Grille
    gridMinWidth: '280px',
    gridGap: '1.5rem',

    // Images
    imageHeight: '200px',
    imageFallbackDelay: 2000 // ms avant de passer au fallback
}

// Configuration upload S3 (HD : contourne la limite de l'API Admin ; web : copie
// vers la BDD Photos en plus de l'envoi normal à l'API Admin).
// Le service tourne dans le même conteneur que le front, proxié en interne par nginx
// sur /s3-upload/ (voir nginx.conf) — donc chemin relatif, pas de cross-origin.
// VITE_S3_UPLOAD_URL reste utilisable pour pointer ailleurs si besoin un jour.
export const S3_UPLOAD_CONFIG = {
    get baseURL() {
        return import.meta.env.VITE_S3_UPLOAD_URL || ''
    },
    endpoint: '/s3-upload/upload-hd',
    endpointWeb: '/s3-upload/upload-web'
}

// Configuration environnement
export const ENV = {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE
}

// Export par défaut pour import simplifié
export default {
    API_CONFIG,
    AUTH_CONFIG,
    UI_CONFIG,
    S3_UPLOAD_CONFIG,
    ENV
}
