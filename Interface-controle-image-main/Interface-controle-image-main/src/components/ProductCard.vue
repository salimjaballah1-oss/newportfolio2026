<template>
  <div class="product-card">
    <!-- Image -->
    <div class="image-wrapper">
      <img
        :src="imageUrl"
        :alt="product.label"
        @load="handleImageLoad"
        @error="handleImageError"
        class="product-image"
      />
      
      <!-- Badge si pas d'image -->
      <div v-if="!product.hasImage" class="no-image-badge">
        Pas d'image
      </div>
    </div>

    <!-- Contenu -->
    <div class="card-body">
      <!-- Code produit -->
      <span class="product-code">{{ product.code }}</span>
      
      <!-- Nom produit -->
      <h3 class="product-label">{{ product.label }}</h3>
      
      <!-- Prix (si disponible) -->
      <div v-if="product.priceFormatted" class="product-price">
        {{ product.priceFormatted }}
      </div>
      
      <!-- Stock (si disponible) -->
      <div v-if="product.inStock !== null" class="product-stock" :class="{ 'out-of-stock': !product.inStock }">
        {{ product.inStock ? 'En stock' : 'Rupture de stock' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UI_CONFIG } from '../config/config.js'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// État local pour l'image
const imageLoadError = ref(false)

// URL de l'image avec fallback
const imageUrl = computed(() => {
  if (imageLoadError.value) {
    return UI_CONFIG.placeholderImage
  }
  return props.product.imageUrl || UI_CONFIG.placeholderImage
})

// Gestion du chargement de l'image
function handleImageLoad() {
  console.log(`✅ Image chargée: ${props.product.label}`)
}

// Gestion des erreurs de chargement
function handleImageError(event) {
  console.warn(`⚠️ Erreur de chargement d'image pour: ${props.product.label}`)
  console.warn('URL:', props.product.imageUrl)
  
  // Marquer l'erreur pour utiliser le placeholder
  imageLoadError.value = true
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

/* Image */
.image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f4f6fa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.no-image-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Contenu */
.card-body {
  padding: 1rem;
}

.product-code {
  font-size: 0.75rem;
  color: #6b7280;
  display: block;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-label {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.product-stock {
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-stock.out-of-stock {
  color: #ef4444;
}
</style>
