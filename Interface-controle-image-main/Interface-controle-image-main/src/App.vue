<template>
  <div class="app">

    <!-- HEADER -->
    <header class="header">
      <div class="header-row header-row--brand">
        <div class="brand">
          <h1 class="brand-name">Images Produits</h1>
          <p class="brand-tagline">Maison Chazal · Gestion des photos articles</p>
        </div>
        <div class="header-tools">
          <div class="bg-picker-wrap">
            <button type="button" class="chip" :class="backgroundSrc ? 'bg-preview-chip' : 'chip--ghost'" @click="showBgPicker = !showBgPicker">
              <span v-if="backgroundSrc" class="bg-preview-dot" :style="{ backgroundImage: `url(${backgroundSrc})` }"></span>
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Fond IA
            </button>
            <div v-if="showBgPicker" class="bg-picker-overlay" @click="showBgPicker = false"></div>
            <transition name="dropdown-fade">
              <div v-if="showBgPicker" class="bg-picker-dropdown">
                <p class="bg-picker-title">Fonds prédéfinis</p>
                <div class="bg-picker-grid">
                  <button
                    v-for="preset in PRESET_BACKGROUNDS"
                    :key="preset.id"
                    type="button"
                    class="bg-preset-tile"
                    :class="{ 'bg-preset-tile--active': selectedPresetId === preset.id }"
                    :title="preset.label"
                    @click="loadPresetBackground(preset)"
                  >
                    <img :src="`/backgrounds/${encodeURIComponent(preset.file)}`" :alt="preset.label" />
                    <span class="bg-preset-label">{{ preset.label }}</span>
                  </button>
                </div>
                <div class="bg-picker-divider"></div>
                <label class="bg-picker-custom">
                  <input type="file" accept="image/*" style="display:none" @change="onBackgroundSelected" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Importer un fond personnalisé
                </label>
                <button v-if="backgroundSrc" type="button" class="bg-picker-clear" @click="backgroundSrc = null; selectedPresetId = null; showBgPicker = false">
                  Retirer le fond
                </button>
              </div>
            </transition>
          </div>

          <button type="button" class="chip chip--ghost" @click="showDropZone = true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import masse
          </button>
          <button type="button" class="chip chip--ghost" :class="{ 'chip--active': showHistory }" @click="showHistory = !showHistory">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Historique
            <span v-if="todayHistoryCount > 0" class="chip-badge">{{ todayHistoryCount }}</span>
          </button>
          <button type="button" class="chip chip--ghost" @click="showStatsModal = true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Audit
          </button>
        </div>
      </div>

      <div class="header-row header-row--search"> 
        <div class="search-mode-toggle">
          <button type="button" class="mode-btn" :class="{ active: searchMode === 'product' }" @click="searchMode = 'product'">Produit</button>
          <button type="button" class="mode-btn" :class="{ active: searchMode === 'supplier' }" @click="searchMode = 'supplier'">Fournisseur</button>
        </div>
        <div class="search-field-wrap" :class="{ 'multi-mode': isMultiSearch }">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-if="searchMode !== 'supplier'"
            v-model="query"
            @keyup.enter="search"
            :placeholder="isMultiSearch ? `${query.split(',').filter(c=>c.trim()).length} codes saisis — appuyez sur Entrée` : 'Code produit, libellé... ou plusieurs codes séparés par des virgules'"
            class="search-input"
          />
          <template v-else>
            <input
              v-model="supplierQuery"backend for 
              @input="onSupplierInput"
              @focus="supplierDropdownOpen = true"
              @blur="onSupplierBlur"
              @keydown.escape="supplierDropdownOpen = false"
              @keydown.enter.prevent="filteredSuppliersDropdown.length === 1 && selectSupplier(filteredSuppliersDropdown[0])"
              placeholder="Rechercher un fournisseur..."
              class="search-input"
              autocomplete="off"
            />
            <transition name="dropdown-fade">
              <div v-if="supplierDropdownOpen && filteredSuppliersDropdown.length" class="supplier-dropdown">
                <button
                  v-for="s in filteredSuppliersDropdown"
                  :key="s.id"
                  type="button"
                  class="supplier-dropdown-item"
                  :class="{ 'supplier-dropdown-item--active': selectedSupplierId === s.id }"
                  @mousedown.prevent="selectSupplier(s)"
                >{{ s.label }}</button>
              </div>
              <div v-else-if="supplierDropdownOpen && supplierQuery && !filteredSuppliersDropdown.length" class="supplier-dropdown supplier-dropdown--empty">
                Aucun fournisseur trouvé
              </div>
            </transition>
          </template>
          <span v-if="isMultiSearch" class="multi-badge">{{ query.split(',').filter(c=>c.trim()).length }} codes</span>
        </div>
        <button type="button" class="btn-search" @click="search" :disabled="loading">
          {{ loading ? 'Recherche...' : 'Rechercher' }}
        </button>
        <button
          v-if="products.length || query || selectedSupplierId"
          type="button"
          class="btn-reset"
          title="Réinitialiser la recherche"
          @click="resetSearch"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="header-row header-row--filters">
        <div class="filters-left">
          <label class="filter-item">
            <span class="filter-label-text">Catégorie</span>
            <select v-model="selectedCategory" class="filter-select">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in visibleCategories" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
            </select>
          </label>
          <label class="filter-item">
            <span class="filter-label-text">Sous-catégorie</span>
            <select v-model="selectedParentCategory" class="filter-select" :disabled="!selectedCategory || selectedCategory === 'all'">
              <option value="">Toutes</option>
              <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
            </select>
          </label>
          <label class="filter-item">
            <span class="filter-label-text">Filtre</span>
            <select v-model="selectedSubcategory" class="filter-select" :disabled="!selectedCategory || selectedCategory === 'all'">
              <option value="">Tous</option>
              <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">{{ sub.label }}</option>
            </select>
          </label>
        </div>
        <div class="filters-right">
          <label class="image-toggle" :class="{ active: showOnlyDefaultImageProducts }">
            <input v-model="showOnlyDefaultImageProducts" type="checkbox" />
            <span class="toggle-switch"><span class="toggle-knob"></span></span>
            <span class="toggle-text">{{ showOnlyDefaultImageProducts ? 'Sans image uniquement' : 'Tous les produits' }}</span>
          </label>
          <label
            class="image-toggle"
            :class="{ active: hideNoArticlesite && resultsHaveArticlesiteData, unavailable: !resultsHaveArticlesiteData }"
            :title="!resultsHaveArticlesiteData ? 'Disponible uniquement sur les recherches fournisseur' : ''"
          >
            <input v-model="hideNoArticlesite" type="checkbox" :disabled="!resultsHaveArticlesiteData" />
            <span class="toggle-switch"><span class="toggle-knob"></span></span>
            <span class="toggle-text">{{ hideNoArticlesite ? 'Référencé agence' : 'Tous les sites' }}</span>
          </label>
        </div>
      </div>
    </header>

    <!-- BARRE RÉSUMÉ -->
    <div v-if="products.length || loading" class="summary-bar">
      <div class="summary-stats">
        <div class="summary-stat">
          <span class="summary-num">{{ filteredProducts.length }}</span>
          <span class="summary-label">produit{{ filteredProducts.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-stat summary-stat--danger" v-if="defaultImageProducts.length > 0">
          <span class="summary-num">{{ defaultImageProducts.length }}</span>
          <span class="summary-label">sans image</span>
        </div>
        <div class="summary-stat summary-stat--success">
          <span class="summary-num">{{ filteredProducts.length - defaultImageProducts.length }}</span>
          <span class="summary-label">avec image</span>
        </div>
        <span v-if="loadingProgress" class="summary-progress">{{ loadingProgress }}</span>
      </div>
      <div class="summary-actions">
        <button
          type="button"
          class="btn-action btn-action--outline-danger"
          :disabled="loading || !defaultImageProducts.length"
          @click="addDefaultImageProductsToCart"
        >
          Sélectionner les {{ defaultImageProducts.length }} sans image
        </button>
        <button type="button" class="btn-action btn-action--dark" @click="openCart">
          Ma liste
          <span v-if="cartItems.length" class="badge-count">{{ cartItems.length }}</span>
        </button>
      </div>
    </div>

    <!-- CONTENU PRINCIPAL -->
    <main class="content">

      <div v-if="loading" class="empty-state">
        <div class="spinner"></div>
        <p class="empty-title">{{ loadingProgress || 'Recherche en cours...' }}</p>
      </div>

      <div v-if="error && !loading" class="empty-state empty-state--error">
        <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <p class="empty-title">Une erreur est survenue</p>
        <p class="empty-desc">{{ error }}</p>
      </div>

      <div v-if="!loading && filteredProducts.length" class="grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="card"
          :class="{
            'card--no-image': usesDefaultImage(product),
            'card--selected': selectedProduct?.id === product.id
          }"
          @click="openProductPanel(product)"
        >
          <div class="card-img-wrap" :class="{ 'card-img-wrap--missing': usesDefaultImage(product) }">
            <div v-if="product.photoUrls.length" class="photo-stage">
              <img :src="currentImageUrl(product)" :alt="product.label" loading="lazy" @error="handleImageError(product)" />
              <span v-if="currentImageType(product)" class="img-badge" :class="currentImageType(product) === 'HD' ? 'img-badge--hd' : 'img-badge--web'">{{ currentImageType(product) === 'HD' ? 'HD' : 'web' }}</span>
              <button class="btn-dl" title="Télécharger l'image" @click.stop="downloadImage(currentImageUrl(product), product.code)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button v-if="product.photoUrls.length > 1" class="photo-nav photo-nav--prev" @click.stop="previousImage(product)">‹</button>
              <button v-if="product.photoUrls.length > 1" class="photo-nav photo-nav--next" @click.stop="nextImage(product)">›</button>
              <div v-if="product.photoUrls.length > 1" class="photo-dots">
                <button
                  v-for="(url, index) in product.photoUrls"
                  :key="`${product.id}-${url}-${index}`"
                  class="dot"
                  :class="{ active: currentImageIndex(product) === index }"
                  @click.stop="goToImage(product, index)"
                ></button>
              </div>
            </div>
            <div v-else class="no-image-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div v-if="applyingBgProductId === String(product.id) || upscalingProductId === String(product.id)" class="card-processing">
              <div class="card-processing-spinner"></div>
            </div>
            <div v-if="usesDefaultImage(product)" class="badge-no-image">Sans image</div>
          </div>
          <div class="card-body">
            <span class="product-ref">{{ product.code }}</span>
            <h3 class="product-name">{{ product.label }}</h3>
          </div>
        </article>
      </div>

      <!-- Panel produit (drawer) -->
      <transition name="panel-slide">
        <div v-if="selectedProduct" class="panel-backdrop" @click.self="closeProductPanel">
          <div class="product-panel">
            <div class="product-panel-header">
              <div>
                <p class="product-panel-ref">{{ selectedProduct.code }}</p>
                <h2 class="product-panel-name">{{ selectedProduct.label }}</h2>
              </div>
              <button type="button" class="panel-close-btn" @click="closeProductPanel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <!-- Onglets -->
            <div class="panel-tabs">
              <button type="button" class="panel-tab" :class="{ 'panel-tab--active': panelTab === 'photos' }" @click="panelTab = 'photos'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Photos
              </button>
              <button type="button" class="panel-tab" :class="{ 'panel-tab--active': panelTab === 'description' }" @click="panelTab = 'description'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Description
              </button>
            </div>

            <div class="product-panel-body">

              <!-- ── ONGLET PHOTOS ── -->
              <template v-if="panelTab === 'photos'">
                <div class="panel-preview">
                  <div v-if="!usesDefaultImage(selectedProduct)" class="panel-photo-stage">
                    <img :src="currentImageUrl(selectedProduct)" :alt="selectedProduct.label" @click="lightboxSrc = currentImageUrl(selectedProduct)" />
                    <span v-if="currentImageType(selectedProduct)" class="img-badge" :class="currentImageType(selectedProduct) === 'HD' ? 'img-badge--hd' : 'img-badge--web'">{{ currentImageType(selectedProduct) === 'HD' ? 'HD' : 'web' }}</span>
                    <template v-if="selectedProduct.photoUrls.length > 1">
                      <button class="photo-nav photo-nav--prev" @click="previousImage(selectedProduct)">‹</button>
                      <button class="photo-nav photo-nav--next" @click="nextImage(selectedProduct)">›</button>
                      <div class="photo-dots">
                        <button
                          v-for="(url, index) in selectedProduct.photoUrls"
                          :key="`panel-${selectedProduct.id}-${index}`"
                          class="dot"
                          :class="{ active: currentImageIndex(selectedProduct) === index }"
                          @click="goToImage(selectedProduct, index)"
                        ></button>
                      </div>
                      <span class="panel-photo-counter">{{ currentImageIndex(selectedProduct) + 1 }} / {{ selectedProduct.photoUrls.length }}</span>
                    </template>
                  </div>
                  <div v-else class="panel-no-image">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Aucune image</span>
                  </div>
                </div>

                <div class="panel-section">
                  <h4 class="panel-section-title">Image</h4>
                  <button type="button" class="panel-action" @click="openUploadFromPanel(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">Ajouter une image</span>
                      <span class="panel-action-desc">Importer depuis votre ordinateur</span>
                    </span>
                  </button>
                  <button v-if="currentImageObject(selectedProduct)?.id" type="button" class="panel-action panel-action--danger" :disabled="deletingImageId === String(currentImageObject(selectedProduct)?.id)" @click="deleteProductImage(selectedProduct, currentImageObject(selectedProduct).id)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ deletingImageId === String(currentImageObject(selectedProduct)?.id) ? 'Suppression...' : 'Supprimer l\'image actuelle' }}</span>
                      <span class="panel-action-desc">Retirer la photo du catalogue</span>
                    </span>
                  </button>
                </div>

                <div class="panel-section">
                  <h4 class="panel-section-title">Intelligence Artificielle</h4>
                  <button type="button" class="panel-action" @click="openAiFromPanel(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">Générer une image IA</span>
                      <span class="panel-action-desc">Création automatique d'un packshot</span>
                    </span>
                  </button>
                  <button v-if="backgroundSrc" type="button" class="panel-action" :disabled="applyingBgProductId === String(selectedProduct.id)" @click="openBgFromPanel(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ applyingBgProductId === String(selectedProduct.id) ? 'Traitement en cours...' : 'Appliquer le fond' }}</span>
                      <span class="panel-action-desc">Remplacer l'arrière-plan de la photo</span>
                    </span>
                  </button>
                  <button v-if="!usesDefaultImage(selectedProduct)" type="button" class="panel-action" :disabled="upscalingProductId === String(selectedProduct.id)" @click="upscaleProductImage(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/><polyline points="17 17 12 22 7 17" opacity="0.3"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ upscalingProductId === String(selectedProduct.id) ? 'Amélioration en cours...' : 'Améliorer la qualité' }}</span>
                      <span class="panel-action-desc">Upscale IA — téléchargement local</span>
                    </span>
                  </button>

                  <button v-if="!usesDefaultImage(selectedProduct)" type="button" class="panel-action" :class="{ 'panel-action--active': editAiPromptOpen }" :disabled="editingAiProductId === String(selectedProduct.id)" @click="editAiPromptOpen = !editAiPromptOpen">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ editingAiProductId === String(selectedProduct.id) ? 'Modification en cours...' : 'Modifier avec l\'IA' }}</span>
                      <span class="panel-action-desc">Retoucher l'image via un prompt</span>
                    </span>
                  </button>
                  
                  <button v-if="!usesDefaultImage(selectedProduct)" type="button" class="panel-action" :disabled="whiteBgProductId === String(selectedProduct.id)" @click="runWhiteBackground(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ whiteBgProductId === String(selectedProduct.id) ? 'Traitement en cours...' : 'Fond blanc (paysage)' }}</span>
                      <span class="panel-action-desc">Détourer le produit sur fond blanc IA</span>
                    </span>
                  </button>

                  <transition name="expand">
                    <div v-if="editAiPromptOpen && !usesDefaultImage(selectedProduct)" class="edit-ai-form">
                      <textarea
                        v-model="editAiPrompt"
                        class="edit-ai-textarea"
                        placeholder="Décrivez la modification souhaitée…&#10;Ex : Supprime le fond, ajoute une ombre douce, rends l'image plus lumineuse..."
                        rows="3"
                        :disabled="editingAiProductId === String(selectedProduct.id)"
                      ></textarea>
                      <div class="edit-ai-actions">
                        <button type="button" class="btn-sm btn-sm--ghost" @click="editAiPromptOpen = false; editAiPrompt = ''">Annuler</button>
                        <button type="button" class="btn-sm btn-sm--primary" :disabled="!editAiPrompt.trim() || editingAiProductId === String(selectedProduct.id)" @click="runEditAi(selectedProduct)">
                          {{ editingAiProductId === String(selectedProduct.id) ? 'En cours...' : 'Appliquer' }}
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>

                <div class="panel-section">
                  <h4 class="panel-section-title">Ma liste</h4>
                  <button type="button" class="panel-action" :class="{ 'panel-action--done': isProductInCart(selectedProduct) }" :disabled="isProductInCart(selectedProduct)" @click="addProductToCart(selectedProduct)">
                    <span class="panel-action-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline v-if="isProductInCart(selectedProduct)" points="20 6 9 17 4 12"/><template v-else><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></template></svg></span>
                    <span class="panel-action-content">
                      <span class="panel-action-title">{{ isProductInCart(selectedProduct) ? 'Déjà dans la liste' : 'Ajouter à la liste' }}</span>
                      <span class="panel-action-desc">{{ isProductInCart(selectedProduct) ? 'Ce produit est dans votre liste' : 'Pour suivre ou exporter ce produit' }}</span>
                    </span>
                  </button>
                </div>
              </template>

              <!-- ── ONGLET DESCRIPTION ── -->
              <template v-else-if="panelTab === 'description'">
                <div v-if="selectedProduct.fournisseur_id || selectedProduct.supplierName" class="panel-supplier-row">
                  <span class="panel-supplier-name">{{ suppliersById[String(selectedProduct.fournisseur_id)] || selectedProduct.supplierName || '' }}</span>
                  <button type="button" class="panel-copy-btn" :class="{ copied: panelCopied }" @click="copySupplierName(suppliersById[String(selectedProduct.fournisseur_id)] || selectedProduct.supplierName)">
                    <svg v-if="!panelCopied" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ panelCopied ? 'Copié' : 'Copier' }}
                  </button>
                </div>

                <div v-if="selectedProductIngredients || selectedProductParticularite || selectedProductDescription" class="panel-description-block">
                  <p class="panel-description-label">Description</p>
                  <p class="panel-description-text">{{ [selectedProductIngredients, selectedProductParticularite, selectedProductDescription].filter(Boolean).join(' — ') }}</p>
                </div>

                <div v-if="!selectedProductIngredients && !selectedProductParticularite && !selectedProductDescription" class="panel-empty-desc">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  <span>Aucune description disponible</span>
                </div>

                <div class="panel-fiche-link">
                  <a
                    :href="`http://10.1.2.206:8080/ventes/app/app.html#!/refartmat#${selectedProduct.code}`"
                    target="_blank"
                    rel="noopener"
                    class="btn-fiche"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Voir la fiche technique
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </a>
                </div>

                <div class="panel-meta-grid">
                  <div v-if="selectedProduct.topcategory?.label || selectedProduct.__subcategoryLabel" class="panel-meta-item">
                    <span class="panel-meta-key">Catégorie</span>
                    <span class="panel-meta-val">{{ selectedProduct.topcategory?.label || selectedProduct.__subcategoryLabel }}</span>
                  </div>
                  <div v-if="selectedProduct.subcategory?.label" class="panel-meta-item">
                    <span class="panel-meta-key">Sous-catégorie</span>
                    <span class="panel-meta-val">{{ selectedProduct.subcategory.label }}</span>
                  </div>
                  <div v-if="selectedProduct.marque || selectedProduct.brand" class="panel-meta-item">
                    <span class="panel-meta-key">Marque</span>
                    <span class="panel-meta-val">{{ selectedProduct.marque || selectedProduct.brand }}</span>
                  </div>
                  <div v-if="selectedProduct.conditionnement || selectedProduct.packaging" class="panel-meta-item">
                    <span class="panel-meta-key">Conditionnement</span>
                    <span class="panel-meta-val">{{ selectedProduct.conditionnement || selectedProduct.packaging }}</span>
                  </div>
                  <div v-if="selectedProduct.ean || selectedProduct.gencod || selectedProduct.ean13" class="panel-meta-item">
                    <span class="panel-meta-key">EAN</span>
                    <span class="panel-meta-val panel-meta-val--mono">{{ selectedProduct.ean || selectedProduct.gencod || selectedProduct.ean13 }}</span>
                  </div>
                  <div v-for="field in allProductMetaFields" :key="field.key" class="panel-meta-item">
                    <span class="panel-meta-key">{{ field.label }}</span>
                    <span class="panel-meta-val">{{ field.value }}</span>
                  </div>
                  <div v-if="selectedProduct.images?.length" class="panel-meta-item panel-meta-item--images">
                    <span class="panel-meta-key">Images ({{ selectedProduct.images.length }})</span>
                    <span class="panel-meta-val panel-meta-val--tags">
                      <span v-for="img in selectedProduct.images" :key="img.id || img.url" class="img-type-tag" :class="img.type === 'HD' ? 'img-type-tag--hd' : 'img-type-tag--default'">{{ img.type || '?' }}</span>
                    </span>
                  </div>
                  <div v-if="selectedProductAgencies.length" class="panel-meta-item panel-meta-item--images">
                    <span class="panel-meta-key">Agences ({{ selectedProductAgencies.length }})</span>
                    <span class="panel-meta-val panel-meta-val--tags">
                      <span v-for="label in selectedProductAgencies" :key="label" class="agency-tag">{{ label }}</span>
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </transition>

      <div v-if="productsSource === 'search' && !loading && filteredProducts.length" ref="loadMoreSentinel" class="load-more-sentinel"></div>
      <div v-if="loadingMore" class="empty-state empty-state--compact">Chargement de la suite...</div>

      <div v-if="!loading && products.length === 0 && (query || selectedCategory || selectedSupplierId)" class="empty-state">
        <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <p class="empty-title">Aucun produit trouvé</p>
        <p class="empty-desc">{{ searchMode === 'supplier' && selectedSupplierId ? 'Ce fournisseur n\'a aucun produit.' : 'Vérifiez votre terme de recherche et réessayez.' }}</p>
      </div>

      <div v-if="!loading && products.length > 0 && filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div>
        <p class="empty-title">Aucun résultat pour ce filtre</p>
        <p class="empty-desc">{{ showOnlyDefaultImageProducts ? 'Aucun produit sans image dans cette sélection.' : 'Essayez d\'élargir les filtres.' }}</p>
      </div>

      <div v-if="!loading && products.length === 0 && !query && !selectedCategory && !selectedSupplierId" class="empty-state empty-state--welcome">
        <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <p class="empty-title">Commencez par une recherche</p>
        <p class="empty-desc">Saisissez un code produit, un libellé, ou plusieurs codes séparés par des virgules, puis cliquez sur Rechercher.</p>
      </div>

    </main>

    <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="handleFileSelected" />

    <!-- MODAL LISTE -->
    <div v-if="isCartOpen" class="modal-overlay" @click.self="closeCart">
      <section class="modal modal--cart">
        <div class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Ma liste</h2>
            <p class="modal-subtitle">{{ cartItems.length }} produit{{ cartItems.length > 1 ? 's' : '' }} sélectionné{{ cartItems.length > 1 ? 's' : '' }}</p>
          </div>
          <div class="modal-header-actions">
            <button type="button" class="btn-sm btn-sm--ghost" :disabled="!cartItems.length" @click="copyCartToClipboard">{{ cartCopied ? '✓ Copié' : 'Copier' }}</button>
            <button type="button" class="btn-sm btn-sm--primary" :disabled="!cartItems.length" @click="exportCartToExcel">Exporter Excel</button>
            <button type="button" class="btn-sm btn-sm--ghost" @click="clearCart">Vider</button>
            <button type="button" class="btn-sm btn-sm--close" @click="closeCart">Fermer</button>
          </div>
        </div>
        <div v-if="cartItems.length" class="cart-list">
          <div v-for="item in cartItems" :key="getCartProductKey(item)" class="cart-item">
            <div class="cart-item-main">
              <strong class="cart-item-name">{{ item.label || item.code }}</strong>
              <span class="cart-item-code">{{ item.code }}</span>
              <span v-if="item.supplierName" class="cart-item-supplier">{{ item.supplierName }}</span>
            </div>
            <div class="cart-item-side">
              <span class="status-pill" :class="item.usesDefaultImage ? 'status-pill--no-image' : 'status-pill--has-image'">
                {{ item.usesDefaultImage ? 'Sans image' : 'Avec image' }}
              </span>
              <button type="button" class="btn-remove" @click="removeProductFromCart(item)">Retirer</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
          <p class="empty-title">Votre liste est vide</p>
          <p class="empty-desc">Cliquez sur un produit puis "Ajouter à la liste".</p>
        </div>
      </section>
    </div>

    <!-- MODAL STATS -->
    <div v-if="showStatsModal" class="modal-overlay" @click.self="showStatsModal = false">
      <div class="modal modal--stats">
        <div class="modal-header">
          <div class="modal-header-info">
            <h2 class="modal-title">Audit sans image</h2>
            <p class="modal-subtitle">Analyse par fournisseur</p>
          </div>
          <div class="modal-header-actions">
            <button v-if="!statsLoading" type="button" class="btn-sm btn-sm--primary" @click="runStatsAudit">{{ statsRows.length ? 'Relancer' : 'Lancer l\'audit' }}</button>
            <button v-else type="button" class="btn-sm btn-sm--danger" @click="statsAborted = true">Annuler</button>
            <button type="button" class="btn-sm btn-sm--close" @click="showStatsModal = false">Fermer</button>
          </div>
        </div>
        <div v-if="statsLoading" class="stats-progress">
          <div class="stats-progress-track"><div class="stats-progress-fill" :style="{ width: statsTotal ? (statsProgress / statsTotal * 100) + '%' : '0%' }"></div></div>
          <span class="stats-progress-text">{{ statsProgress }} / {{ statsTotal }} fournisseurs analysés</span>
        </div>
        <div v-if="statsRows.length" class="stats-body">
          <div class="stats-summary-row">
            <span>{{ statsRows.filter(r => !r.failed && r.total > 0).length }} fournisseurs</span>
            <span class="sep">·</span>
            <span class="text-danger">{{ statsRows.filter(r => r.noImage > 0).reduce((s, r) => s + r.noImage, 0) }} produits sans image</span>
            <span v-if="statsRows.some(r => r.failed)" class="sep">·</span>
            <span v-if="statsRows.some(r => r.failed)" class="text-danger">{{ statsRows.filter(r => r.failed).length }} erreurs</span>
          </div>
          <div class="stats-table-wrap">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Fournisseur</th>
                  <th class="col-num">Total</th>
                  <th class="col-num">Sans image</th>
                  <th class="col-num">%</th>
                  <th class="col-bar"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in statsRows" :key="row.id">
                  <td>{{ row.name }}</td>
                  <td class="col-num">{{ row.failed ? '—' : row.total }}</td>
                  <td class="col-num" :class="row.failed ? 'text-muted' : row.noImage === row.total && row.total > 0 ? 'text-danger-bold' : row.noImage > 0 ? 'text-warning' : 'text-success'">{{ row.failed ? 'erreur' : row.noImage }}</td>
                  <td class="col-num text-muted">{{ row.failed || row.total === 0 ? '—' : Math.round(row.noImage / row.total * 100) + '%' }}</td>
                  <td class="col-bar">
                    <div v-if="!row.failed && row.total > 0" class="bar-track">
                      <div class="bar-fill" :style="{ width: (row.noImage / row.total * 100) + '%', background: row.noImage === row.total ? '#dc2626' : row.noImage > 0 ? '#d97706' : '#16a34a' }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else-if="!statsLoading" class="empty-state" style="padding:2rem;">
          <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <p class="empty-title">Audit non lancé</p>
          <p class="empty-desc">Cliquez sur "Lancer l'audit" pour analyser tous les fournisseurs.</p>
        </div>
      </div>
    </div>

    <!-- MODAL UPLOAD IMAGE -->
    <!-- ── Drop zone modale ── -->
    <div v-if="showDropZone" class="modal-overlay" @click.self="showDropZone = false">
      <div class="dropzone-modal">
        <div class="dropzone-header">
          <span class="dropzone-header-title">Import en masse</span>
          <button type="button" class="dropzone-close" @click="showDropZone = false">✕</button>
        </div>
        <div
          class="dropzone-area"
          :class="{ 'dropzone-area--over': dropZoneOver }"
          @dragenter.stop.prevent="dropZoneOver = true"
          @dragover.stop.prevent="dropZoneOver = true"
          @dragleave.stop="dropZoneOver = false"
          @drop.stop.prevent="onDropZoneDrop"
          @click="$refs.dropZoneInput.click()"
        >
          <input ref="dropZoneInput" type="file" accept="image/*" multiple style="display:none" @change="onDropZoneFileInput" />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p class="dropzone-title">Glisser les images ici</p>
          <p class="dropzone-sub">ou <span class="dropzone-browse">cliquer pour parcourir</span></p>
          <p class="dropzone-hint">JPG, PNG, WEBP — plusieurs fichiers acceptés</p>
        </div>
      </div>
    </div>

    <!-- ── Modale Import en masse ── -->
    <div v-if="batchModal" class="modal-overlay">
      <div class="modal modal--batch">
        <div class="modal-header">
          <span class="modal-title">Import en masse</span>
          <button type="button" class="btn-sm btn-sm--close" @click="closeBatchModal">✕</button>
        </div>

        <div v-if="batchProcessing" class="batch-searching">
          <div class="card-processing-spinner"></div>
          <span>Recherche des produits en cours...</span>
        </div>

        <template v-else>
          <div class="batch-summary">
            <span class="batch-stat batch-stat--found">{{ batchEntries.filter(e => e.product).length }} trouvé(s)</span>
            <span class="batch-stat batch-stat--miss">{{ batchEntries.filter(e => !e.product).length }} non trouvé(s)</span>
            <span class="batch-stat">{{ batchEntries.filter(e => e.selected).length }} sélectionné(s)</span>
            <button
              type="button"
              class="chip chip--ghost batch-filter-toggle"
              :class="{ 'chip--active': batchShowOnlyNoImage }"
              @click="batchShowOnlyNoImage = !batchShowOnlyNoImage"
            >
              {{ batchShowOnlyNoImage ? 'Sans photo uniquement ✓' : 'Sans photo uniquement' }}
            </button>
          </div>

          <div class="batch-table-wrap">
            <table class="batch-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      :checked="allVisibleSelected"
                      :disabled="!visibleBatchEntries.some(e => e.product && e.status !== 'done')"
                      @change="toggleSelectAllVisible"
                      title="Tout sélectionner / désélectionner (lignes visibles uniquement)"
                    />
                  </th>
                  <th>Aperçu</th>
                  <th>Fichier</th>
                  <th>Code détecté</th>
                  <th>Produit</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!visibleBatchEntries.length" class="batch-row--empty">
                  <td colspan="6">Aucune ligne à afficher — {{ batchShowOnlyNoImage ? 'tous les produits trouvés ont déjà une photo.' : 'liste vide.' }}</td>
                </tr>
                <tr v-for="entry in visibleBatchEntries" :key="entry.id" :class="{ 'batch-row--found': entry.product, 'batch-row--miss': !entry.product, 'batch-row--done': entry.status === 'done', 'batch-row--error': entry.status === 'error' }">
                  <td><input type="checkbox" v-model="entry.selected" :disabled="!entry.product || entry.status === 'done'" /></td>
                  <td><img v-if="entry.firstOfFile" :src="entry.preview" class="batch-thumb" /></td>
                  <td class="batch-filename">{{ entry.firstOfFile ? entry.filename : '' }}</td>
                  <td class="batch-code">{{ entry.detectedCode }}</td>
                  <td class="batch-product">
                    <span v-if="entry.product">{{ entry.product.label }}</span>
                    <span v-else class="batch-not-found">Aucun produit trouvé</span>
                  </td>
                  <td>
                    <span class="batch-status" :class="`batch-status--${entry.status}`">
                      {{ entry.status === 'found' ? 'Prêt' : entry.status === 'not-found' ? 'Introuvable' : entry.status === 'uploading' ? 'Upload...' : entry.status === 'done' ? 'OK' : entry.status === 'error' ? 'Erreur' : '...' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-sm btn-sm--ghost" @click="closeBatchModal">Annuler</button>
            <button type="button" class="btn-sm btn-sm--primary" :disabled="batchUploading || !batchEntries.some(e => e.selected && e.product)" @click="runBatchUpload">
              {{ batchUploading ? 'Upload en cours...' : `Importer les sélectionnés (${batchEntries.filter(e => e.selected && e.product).length})` }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="uploadModal.open" class="modal-overlay">
      <div class="modal modal--upload">
        <div class="modal-header">
          <h2 class="modal-title">
            {{ uploadModal.state === 'select' ? 'Ajouter une image'
             : uploadModal.state === 'ai' ? 'Générer avec l\'IA'
             : uploadModal.state === 'ai-result' ? (uploadModal.historyAction === 'upscale' ? 'Image HD' : 'Image générée')
             : 'Recadrer l\'image' }}
          </h2>
          <button type="button" class="btn-sm btn-sm--close" @click="closeUploadModal">Fermer</button>
        </div>
        <div v-if="uploadModal.state === 'select'" class="upload-body">
          <div class="dropzone" :class="{ 'dropzone--over': isDragOver }" @dragenter.stop.prevent @dragover.stop.prevent="isDragOver = true" @dragleave.stop.prevent="isDragOver = false" @drop.stop.prevent="onDropFile">
            <div class="dropzone-content">
              <div class="dropzone-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg></div>
              <p class="dropzone-title">Glissez une image ici</p>
              <p class="dropzone-sub">PNG, JPG, WEBP — max 20 Mo</p>
              <label class="btn-upload-file">Choisir un fichier<input type="file" accept="image/*" style="display:none" @change="onUploadFileSelected" /></label>
            </div>
          </div>
          <div class="upload-divider"><span>ou</span></div>
          <button type="button" class="btn-ai-trigger" @click="openAiScreen">
            <span class="ai-trigger-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
            <span><span class="ai-title">Générer avec l'IA</span><span class="ai-desc">Création automatique à partir du libellé</span></span>
          </button>
        </div>
        <div v-else-if="uploadModal.state === 'ai'" class="upload-body">
          <div class="ai-field-group">
            <label class="field-label">Modèle IA</label>
            <div class="ai-models-grid">
              <button v-for="m in aiModels" :key="m.id" type="button" class="ai-model-card" :class="{ active: aiModel === m.id }" @click="aiModel = m.id">
                <span class="ai-model-name">{{ m.name }}</span>
                <span class="ai-model-desc">{{ m.desc }}</span>
              </button>
            </div>
          </div>
          <div class="ai-field-group">
            <label class="field-label">Libellé produit</label>
            <input v-model="aiProductLabel" class="field-input" spellcheck="false" placeholder="Libellé du produit..." />
            <p class="field-hint">Ce texte sera utilisé pour la génération.</p>
          </div>
          <div class="ai-options-row">
            <label class="ai-opt" :class="{ active: aiWithPlate }">
              <input type="checkbox" v-model="aiWithPlate" />
              <span class="ai-opt-check"><svg v-if="aiWithPlate" width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              Assiette
            </label>
            <label class="ai-opt" :class="{ active: aiWithLabel }">
              <input type="checkbox" v-model="aiWithLabel" />
              <span class="ai-opt-check"><svg v-if="aiWithLabel" width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              Étiquette
            </label>
          </div>
        </div>
        <div v-else-if="uploadModal.state === 'ai-result'" class="upload-body ai-result-body">
          <img v-if="aiGeneratedImageSrc" :src="aiGeneratedImageSrc" class="ai-result-img" />
          <div v-else class="empty-state"><div class="spinner"></div><p class="empty-title">Génération en cours...</p></div>
        </div>
        <div v-else class="crop-wrapper">
          <div class="crop-container" ref="cropContainerRef" @mousemove.prevent="onCropMouseMove" @mouseup="onCropMouseUp" @mouseleave="onCropMouseUp">
            <img :src="uploadModal.imageSrc" ref="cropImageRef" class="crop-img" draggable="false" @load="initCropBox" />
            <div class="crop-shade" :style="cropShade.top" />
            <div class="crop-shade" :style="cropShade.bottom" />
            <div class="crop-shade" :style="cropShade.left" />
            <div class="crop-shade" :style="cropShade.right" />
            <div class="crop-box" :style="cropBoxStyle" @mousedown.prevent="startCropMove">
              <div class="crop-grid-h" style="top:33.3%"></div>
              <div class="crop-grid-h" style="top:66.6%"></div>
              <div class="crop-grid-v" style="left:33.3%"></div>
              <div class="crop-grid-v" style="left:66.6%"></div>
              <div class="crop-handle nw" @mousedown.stop.prevent="startCropResize('nw', $event)"></div>
              <div class="crop-handle ne" @mousedown.stop.prevent="startCropResize('ne', $event)"></div>
              <div class="crop-handle sw" @mousedown.stop.prevent="startCropResize('sw', $event)"></div>
              <div class="crop-handle se" @mousedown.stop.prevent="startCropResize('se', $event)"></div>
              <div class="crop-handle n"  @mousedown.stop.prevent="startCropResize('n', $event)"></div>
              <div class="crop-handle s"  @mousedown.stop.prevent="startCropResize('s', $event)"></div>
              <div class="crop-handle w"  @mousedown.stop.prevent="startCropResize('w', $event)"></div>
              <div class="crop-handle e"  @mousedown.stop.prevent="startCropResize('e', $event)"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="uploadModal.state === 'crop'" type="button" class="btn-sm btn-sm--ghost" @click="uploadModal.state = 'select'">← Changer l'image</button>
          <button v-if="uploadModal.state === 'ai'" type="button" class="btn-sm btn-sm--ghost" @click="uploadModal.state = 'select'">← Retour</button>
          <button v-if="uploadModal.state === 'ai-result'" type="button" class="btn-sm btn-sm--ghost" @click="uploadModal.state = 'ai'">← Régénérer</button>
          <button type="button" class="btn-sm btn-sm--ghost" @click="closeUploadModal">Annuler</button>
          <label v-if="uploadModal.state === 'crop'" class="ged-checkbox">
            <input type="checkbox" v-model="sendToGed" />
            <span>Envoyer sur Infologic</span>
          </label>
          <button v-if="uploadModal.state === 'ai'" type="button" class="btn-sm btn-sm--primary" :disabled="aiGenerating" @click="generateAiImage">{{ aiGenerating ? 'Génération...' : 'Générer' }}</button>
          <button v-if="uploadModal.state === 'ai-result' && aiGeneratedImageSrc" type="button" class="btn-sm btn-sm--primary" @click="useAiResult">Recadrer →</button>
          <button v-if="uploadModal.state === 'crop'" type="button" class="btn-sm btn-sm--primary" @click="confirmCrop">Valider le recadrage</button>
        </div>
      </div>
    </div>

    <!-- PANNEAU HISTORIQUE -->
    <transition name="history-slide">
      <div v-if="showHistory" class="history-panel">
        <div class="history-panel-header">
          <span class="history-panel-title">Historique des modifications</span>
          <div class="history-panel-tools">
            <button v-if="historyItems.length" type="button" class="btn-sm btn-sm--ghost" @click="clearHistory">Vider</button>
            <button type="button" class="btn-sm btn-sm--close" @click="showHistory = false">Fermer</button>
          </div>
        </div>
        <div v-if="!historyItems.length" class="empty-state">
          <div class="empty-icon-svg"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
          <p class="empty-title">Aucune modification</p>
          <p class="empty-desc">L'historique des images apparaîtra ici.</p>
        </div>
        <div v-else class="history-list">
          <div v-for="group in historyByDay" :key="group.day" class="history-day">
            <div class="history-day-header">{{ group.label }}</div>
            <div v-for="entry in group.entries" :key="entry.id" class="history-entry" role="button" tabindex="0" title="Ouvrir le produit" @click="goToProductFromHistory(entry)" @keydown.enter="goToProductFromHistory(entry)">
              <span class="history-entry-icon" :style="{ color: ACTION_META[entry.action]?.color }">{{ ACTION_META[entry.action]?.icon ?? '•' }}</span>
              <div class="history-entry-body">
                <span class="history-entry-name">{{ entry.productLabel || entry.productCode }}</span>
                <span class="history-entry-code">{{ entry.productCode }}</span>
                <span class="history-entry-action">{{ ACTION_META[entry.action]?.label }}</span>
              </div>
              <div class="history-entry-meta">
                <span class="history-time">{{ formatHistoryTime(entry.ts) }}</span>
                <span class="env-pill-mini" :class="entry.env">{{ entry.env }}</span>
              </div>
              <svg class="history-entry-goto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- LIGHTBOX -->
    <div v-if="lightboxSrc" class="lightbox-overlay" @click="lightboxSrc = null">
      <button type="button" class="lightbox-close" @click="lightboxSrc = null">✕</button>
      <img :src="lightboxSrc" class="lightbox-img" @click.stop />
    </div>

    <!-- POPUP EMBALLAGE -->
    <div v-if="bgPackagingModal.open" class="modal-overlay">
      <div class="modal modal--packaging">
        <div class="packaging-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
        <h2 class="modal-title" style="margin-bottom:.4rem">Appliquer le fond</h2>
        <p class="packaging-subtitle">Le produit a-t-il un emballage à conserver ?</p>
        <div class="packaging-choices">
          <button type="button" class="packaging-choice packaging-choice--keep" @click="confirmApplyBg(true)">
            <span class="packaging-choice-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
            <span class="packaging-choice-title">Conserver l'emballage</span>
            <span class="packaging-choice-desc">Garde la boîte, le sachet ou le contenant</span>
          </button>
          <button type="button" class="packaging-choice packaging-choice--none" @click="confirmApplyBg(false)">
            <span class="packaging-choice-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
            <span class="packaging-choice-title">Sans emballage</span>
            <span class="packaging-choice-desc">Détourage simple du produit</span>
          </button>
        </div>
        <button type="button" class="btn-sm btn-sm--ghost" style="margin-top:1rem" @click="bgPackagingModal.open = false">Annuler</button>
      </div>
    </div>

    <!-- ── Toasts ── -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <svg v-if="t.type === 'success'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else-if="t.type === 'error'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {{ t.message }}
      </div>
    </transition-group>

    <!-- Overlay drag & drop import masse -->
    <transition name="drop-fade">
      <div v-if="isDragging" class="drop-overlay">
        <div class="drop-overlay-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".9"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p class="drop-overlay-title">Déposer les images ici</p>
          <p class="drop-overlay-sub">Import en masse — tous les fichiers seront analysés</p>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { API_CONFIG, S3_UPLOAD_CONFIG } from "./config/config.js"

const query = ref("")
const searchMode = ref("product")
const products = ref([])
const loading = ref(false)
const loadingProgress = ref("")
const error = ref(null)
const debugInfo = ref("")
const apiEnvironment = ref('prod')
const selectedCategory = ref("")
const selectedParentCategory = ref("")
const selectedSubcategory = ref("")
const suppliersById = ref({})
const suppliersCodes = ref({})
const showOnlyDefaultImageProducts = ref(false)
const hideNoArticlesite = ref(true)
const imageIndexes = ref({})
const categoryTree = ref([])
const productsSource = ref("none")
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = 60
const loadingMore = ref(false)
const loadMoreSentinel = ref(null)
const searchEncodedPayload = ref("")
const cartItems = ref([])
const isCartOpen = ref(false)
const cartCopied = ref(false)
const uploadingProductId = ref(null)
const deletingImageId = ref(null)
const upscalingProductId = ref(null)
const applyingBgProductId = ref(null)
const backgroundSrc = ref(null)
const showBgPicker = ref(false)
const selectedPresetId = ref(null)

const PRESET_BACKGROUNDS = [
  { id: 'marbre-noir',     label: 'Marbre noir',          file: 'Chazal fond marbre 03-20198956.jpg' },
  { id: 'carrelage',       label: 'Carrelage & marbre',   file: 'Ambiance-Tartinables-fond.jpg' },
  { id: 'lin-blanc',       label: 'Lin blanc',            file: '50960-Ambiance-Fond-nappe2.jpg' },
  { id: 'bois-naturel',    label: 'Bois naturel',         file: 'Ambiance-DoublePage-sommaire-AutomneHiver2022-Fond.jpg' },
  { id: 'bois-blanchi',    label: 'Bois blanchi',         file: '70982-78036-Ambiance-Fond.jpg' },
  { id: 'planches-blanc',  label: 'Planches blanches',    file: '5230003-5230004-5230001-5230027-5230025-5230026-6Araignees-Ambiance-Topview-Fond.jpg' },
  { id: 'marbre-blanc',    label: 'Marbre blanc',         file: '21034-Ambiance-Topview-Fond.jpg' },
  { id: 'metal-rouille',   label: 'Métal rouillé',        file: 'Hot-Dog-Ambiance-Topview-Fond.jpg' },
  { id: 'stuc-gris',       label: 'Stuc gris',            file: 'Poulet-Packshot-Topview-Fond.jpg' },
  { id: 'stuc-rose',       label: 'Stuc rosé',            file: 'image_1781101066481896 (1).png' },
]
const bgPackagingModal = ref({ open: false, product: null })
const fileInputRef = ref(null)
const pendingUploadProduct = ref(null)

const selectedSupplierId = ref("")
const uploadModal = ref({ open: false, product: null, state: 'select', imageSrc: null, historyAction: 'upload', imageType: 'packshot' })
const isDragOver = ref(false)
const lightboxSrc = ref(null)
const cropBox = ref({ x: 0, y: 0, w: 200, h: 200 })
const cropContainerRef = ref(null)
const cropImageRef = ref(null)
const cropInteraction = ref(null)
const aiProductLabel = ref('')
const aiWithPlate = ref(false)
const aiWithLabel = ref(false)
const aiModel = ref('google/gemini-3.1-flash-image-preview')
const aiGenerating = ref(false)
const aiGeneratedImageSrc = ref(null)

const aiModels = [
  { id: 'google/gemini-3-pro-image-preview',     name: 'Nano Banana Pro', desc: 'Gemini 3 Pro Image — Qualité maximale 4K',      modalities: ['image', 'text'] },
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Nano Banana 2',   desc: 'Gemini 3.1 Flash Image — Rapide & qualité Pro', modalities: ['image', 'text'] },
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Nano Banana',     desc: 'Gemini 2.5 Flash Image — Génération & édition', modalities: ['image', 'text'] },
  { id: 'bytedance-seed/seedream-4.5',           name: 'Seedream 4.5',    desc: 'ByteDance — Composition & rendu artistique',    modalities: ['image'] },
]

const CART_STORAGE_KEY    = "chazal-product-cart"
const HISTORY_STORAGE_KEY = "chazal-image-history"

const historyItems = ref([])
const showHistory  = ref(false)
const selectedProduct = ref(null)
const panelCopied = ref(false)
const panelTab = ref('photos')
const editAiPromptOpen = ref(false)
const editAiPrompt = ref('')
const editingAiProductId = ref(null)
const whiteBgProductId = ref(null)
const batchModal = ref(false)
const batchEntries = ref([])
const batchProcessing = ref(false)
const batchUploading = ref(false)
const batchShowOnlyNoImage = ref(false)
const showDropZone = ref(false)
const dropZoneOver = ref(false)
const isDragging = ref(false)
const toasts = ref([])
const sendToGed = ref(true)
const imageTypeMap = ref({})
const showStatsModal = ref(false)
const statsRows = ref([])
const statsLoading = ref(false)
const statsProgress = ref(0)
const statsTotal = ref(0)
const statsAborted = ref(false)

let token = null
let loginPromise = null
let loadMoreObserver = null

function buildApiUrl(path) {
  return `${API_CONFIG.baseURL}${path}`
}


const categories = computed(() => {
  return [...categoryTree.value].sort((a, b) => a.label.localeCompare(b.label))
})

const visibleCategories = computed(() => {
  if (productsSource.value !== "search" && productsSource.value !== "supplier") {
    return categories.value
  }

  const usedCategoryIds = new Set()
  for (const product of products.value) {
    const productCategoryId =
      Number(product.topcategory?.id) || Number(product.topcategory_id) || null

    if (productCategoryId) {
      usedCategoryIds.add(productCategoryId)
    }
  }

  return categories.value.filter(category => usedCategoryIds.has(Number(category.id)))
})

function resolveProductCategoryId(product) {
  return (
    Number(product.__categoryId) ||
    Number(product.subcategory?.category_id) ||
    Number(product.category_id) ||
    null
  )
}

function resolveProductFilterId(product) {
  return (
    Number(product.__subcategoryId) ||
    Number(product.subcategory?.id) ||
    Number(product.subcategory_id) ||
    null
  )
}

function usesDefaultImage(product) {
  const dedicatedImageCount = Array.isArray(product.images)
    ? product.images.map(image => image?.url).filter(Boolean).length
    : 0

  return dedicatedImageCount === 0 || !product.photoUrls?.length
}

// Import masse : quand actif, ne montre que les lignes dont le produit trouvé
// n'a pas encore de photo — pour se concentrer sur ce qui a vraiment besoin d'un import.
const visibleBatchEntries = computed(() => {
  if (!batchShowOnlyNoImage.value) return batchEntries.value
  return batchEntries.value.filter(entry => entry.product && usesDefaultImage(entry.product))
})

// Une ligne est sélectionnable si elle a un produit trouvé et n'est pas déjà importée
// (même condition que la case à cocher de chaque ligne, cf. template).
function isBatchEntrySelectable(entry) {
  return Boolean(entry.product) && entry.status !== 'done'
}

// Coché seulement si TOUTES les lignes visibles et sélectionnables le sont déjà —
// bascule le filtre "sans photo" ne change jamais la sélection des lignes masquées,
// seul un clic sur cette case agit, et uniquement sur ce qui est visible à cet instant.
const allVisibleSelected = computed(() => {
  const selectable = visibleBatchEntries.value.filter(isBatchEntrySelectable)
  return selectable.length > 0 && selectable.every(entry => entry.selected)
})

function toggleSelectAllVisible() {
  const shouldSelect = !allVisibleSelected.value
  visibleBatchEntries.value.filter(isBatchEntrySelectable).forEach(entry => {
    entry.selected = shouldSelect
  })
}

const resultsHaveArticlesiteData = computed(() =>
  products.value.some(p => p.all_articlesites !== undefined)
)

const selectedProductIngredients = computed(() => {
  const p = selectedProduct.value
  if (!p) return ''
  return fixEncoding(p.ingredients || p.ingredient || p.composition || p.composants || '')
})

const selectedProductParticularite = computed(() => {
  const p = selectedProduct.value
  if (!p) return ''
  return fixEncoding(p.particularite || p.particularité || p.particularites || p.particularités
    || p.specificity || p.specificite || p.specificité || p.caracteristiques || '')
})

const selectedProductDescription = computed(() => {
  const p = selectedProduct.value
  if (!p) return ''
  return fixEncoding(p.description || p.designation || p.long_label || p.libelle_long
    || p.longue_description || p.long_description || p.desc || p.texte || '')
})

const selectedProductAgencies = computed(() => {
  const sites = selectedProduct.value?.all_articlesites
  if (!Array.isArray(sites)) return []
  const labels = sites.map(s => fixEncoding(s.agency?.label || s.agency_label || '')).filter(Boolean)
  return [...new Set(labels)]
})

const KNOWN_FIELDS = new Set([
  'id','code','label','imageUrl','photoUrls','images','supplierName','supplierId',
  'fournisseur_id','fournisseur','topcategory','subcategory','__subcategoryLabel',
  'marque','brand','conditionnement','packaging','ean','gencod','ean13',
  'ingredients','ingredient','composition','composants',
  'particularite','particularité','particularites','particularités',
  'specificity','specificite','specificité','caracteristiques',
  'description','designation','long_label','libelle_long',
  'longue_description','long_description','desc','texte',
  'all_articlesites','photoUrl','image','imageHD','hd_url'
])

function formatFieldKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

const allProductMetaFields = computed(() => {
  const p = selectedProduct.value
  if (!p) return []
  const result = []
  for (const [key, val] of Object.entries(p)) {
    if (KNOWN_FIELDS.has(key)) continue
    if (key.startsWith('__')) continue
    if (val === null || val === undefined || val === '') continue
    if (Array.isArray(val)) {
      if (val.length === 0) continue
      if (val.some(v => v !== null && typeof v === 'object')) continue
      result.push({ key, label: formatFieldKey(key), value: val.map(v => fixEncoding(String(v))).join(', ') })
      continue
    }
    if (typeof val === 'object') continue
    const display = typeof val === 'boolean'
      ? (val ? 'Oui' : 'Non')
      : fixEncoding(String(val))
    result.push({ key, label: formatFieldKey(key), value: display })
  }
  return result
})

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const productTopCategoryId =
      Number(product.topcategory?.id) || Number(product.topcategory_id) || null
    const productCategoryId = resolveProductCategoryId(product)
    const productSubcategoryId = resolveProductFilterId(product)

    const topCategoryMatch = selectedCategory.value && selectedCategory.value !== 'all'
      ? productTopCategoryId === Number(selectedCategory.value)
      : true

    const parentCategoryMatch = selectedParentCategory.value
      ? productCategoryId === Number(selectedParentCategory.value)
      : true

    const subcategoryMatch = selectedSubcategory.value
      ? productSubcategoryId === Number(selectedSubcategory.value)
      : true

    const imageMatch = showOnlyDefaultImageProducts.value
      ? usesDefaultImage(product)
      : true

    const articlesiteMatch = hideNoArticlesite.value && resultsHaveArticlesiteData.value
      ? product.all_articlesites?.some(a => a.agency_id != null) === true
      : true

    return topCategoryMatch && parentCategoryMatch && subcategoryMatch && imageMatch && articlesiteMatch
  })
})

const defaultImageProducts = computed(() => {
  return filteredProducts.value.filter(product => usesDefaultImage(product))
})

const isMultiSearch = computed(() => {
  return searchMode.value === 'product' && query.value.includes(',')
})

const cropBoxStyle = computed(() => ({
  left:   `${cropBox.value.x}px`,
  top:    `${cropBox.value.y}px`,
  width:  `${cropBox.value.w}px`,
  height: `${cropBox.value.h}px`,
}))

const cropShade = computed(() => {
  const { x, y, w, h } = cropBox.value
  const el = cropContainerRef.value
  const cw = el ? el.clientWidth  : 0
  const ch = el ? el.clientHeight : 0
  return {
    top:    { top: '0',         left: '0',        width: '100%',              height: `${y}px`         },
    bottom: { top: `${y+h}px`,  left: '0',        width: '100%',              height: `${ch-y-h}px`    },
    left:   { top: `${y}px`,    left: '0',        width: `${x}px`,            height: `${h}px`         },
    right:  { top: `${y}px`,    left: `${x+w}px`, width: `${cw-x-w}px`,      height: `${h}px`         },
  }
})

const suppliersListArray = computed(() => {
  return Object.entries(suppliersById.value)
    .map(([id, label]) => ({ id, label }))
    .filter(s => s.label)
    .sort((a, b) => a.label.localeCompare(b.label))
})

const supplierQuery = ref('')
const supplierDropdownOpen = ref(false)

const filteredSuppliersDropdown = computed(() => {
  const q = supplierQuery.value.trim().toLowerCase()
  if (!q) return suppliersListArray.value
  return suppliersListArray.value.filter(s => s.label.toLowerCase().startsWith(q))
})

function onSupplierInput() {
  supplierDropdownOpen.value = true
  if (selectedSupplierId.value) {
    const current = suppliersListArray.value.find(s => s.id === selectedSupplierId.value)
    if (!current || current.label !== supplierQuery.value) selectedSupplierId.value = ''
  }
}

function selectSupplier(s) {
  selectedSupplierId.value = s.id
  supplierQuery.value = s.label
  supplierDropdownOpen.value = false
}

function onSupplierBlur() {
  setTimeout(() => { supplierDropdownOpen.value = false }, 160)
}


const parentCategories = computed(() => {
  if (!selectedCategory.value) return []

  const category = categories.value.find(
    item => Number(item.id) === Number(selectedCategory.value)
  )
  if (!category) return []

  const metadataCategories = Array.isArray(category.categories)
    ? category.categories
    : []

  return metadataCategories
    .filter(item => Number(item?.id))
    .map(item => ({
      id: Number(item.id),
      label: item.label || `Categorie ${item.id}`
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const subcategories = computed(() => {
  if (!selectedCategory.value) return []

  const category = categories.value.find(
    item => Number(item.id) === Number(selectedCategory.value)
  )
  if (!category) return []

  const metadataCategories = Array.isArray(category.categories)
    ? category.categories
    : []

  const scopedCategories = selectedParentCategory.value
    ? metadataCategories.filter(
        item => Number(item?.id) === Number(selectedParentCategory.value)
      )
    : metadataCategories

  const byId = new Map()
  for (const parentCategory of scopedCategories) {
    const filters = Array.isArray(parentCategory.subcategory)
      ? parentCategory.subcategory
      : []
    for (const filter of filters) {
      const filterId = Number(filter?.id)
      if (!filterId || byId.has(filterId)) continue
      byId.set(filterId, {
        id: filterId,
        label: filter.label || `Filtre ${filterId}`
      })
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label))
})

watch(selectedCategory, () => {
  selectedParentCategory.value = ""
  selectedSubcategory.value = ""
})

watch(visibleCategories, nextCategories => {
  if (!selectedCategory.value || selectedCategory.value === "all") return

  const isSelectedVisible = nextCategories.some(
    category => Number(category.id) === Number(selectedCategory.value)
  )

  if (!isSelectedVisible) {
    selectedCategory.value = ""
    selectedParentCategory.value = ""
    selectedSubcategory.value = ""
  }
})

watch(selectedParentCategory, () => {
  selectedSubcategory.value = ""
})

function getXsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function isLoginRedirect(res) {
  if (!res.url) return false
  const finalUrl = res.url
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const contentType = res.headers.get('content-type') || ''
  return (
    res.status === 401 ||
    finalUrl === origin + '/' ||
    finalUrl === origin ||
    finalUrl.includes('/login') ||
    (res.ok && contentType.includes('text/html'))
  )
}

async function authorizedFetch(url, options = {}) {
  if (!token) await login()

  const makeHeaders = () => {
    const h = { ...(options.headers || {}), Authorization: `Bearer ${token}` }
    const xsrf = getXsrfToken()
    if (xsrf) h['X-XSRF-TOKEN'] = xsrf
    return h
  }

  let res = await fetch(url, { ...options, headers: makeHeaders(), credentials: 'include' })

  if (isLoginRedirect(res)) {
    token = null
    await login()
    res = await fetch(url, { ...options, headers: makeHeaders(), credentials: 'include' })
  }

  return res
}

function buildOpenRouterError(status, message) {
  if (status === 403 && message?.toLowerCase().includes('limit')) {
    return 'Limite mensuelle OpenRouter atteinte — le plafond de la clé API est dépassé. Aucune charge supplémentaire ne sera débitée. Contactez l\'administrateur pour augmenter la limite.'
  }
  if (status === 429) return 'Trop de requêtes simultanées — réessayez dans quelques secondes.'
  if (status === 401) return 'Clé API OpenRouter invalide ou expirée.'
  if (status >= 500) return `Erreur serveur OpenRouter (${status}) — réessayez plus tard.`
  return `Erreur OpenRouter ${status}: ${message || 'erreur inconnue'}`
}

async function buildApiErrorDetails(response, fallbackMessage) {
  let responseText = ""

  try {
    responseText = await response.text()
  } catch {
    responseText = ""
  }

  const excerpt = responseText ? responseText.slice(0, 800) : "Aucune reponse"

  return [
    fallbackMessage,
    `env: ${apiEnvironment.value}`,
    `mode: ${searchMode.value}`,
    `url: ${response?.url || "inconnue"}`,
    `status: ${response.status} ${response.statusText}`,
    `response: ${excerpt}`
  ].join("\n")
}

async function fetchAllSuppliers() {
  try {
    const allSuppliers = []
    let page = 1
    let lastPage = 1

    do {
      const res = await authorizedFetch(
        buildApiUrl(`${API_CONFIG.endpoints.suppliers}?page=${page}&per_page=100`)
      )
      if (!res.ok) break

      const data = await res.json()

      // L'API peut renvoyer data.data.data (paginé) ou data.data (tableau direct)
      const pagination = data.data || {}
      const list = Array.isArray(pagination.data) ? pagination.data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data) ? data
        : []

      allSuppliers.push(...list)

      lastPage = Number(pagination.last_page) || 1
      page++
    } while (page <= lastPage)

    const validSuppliers = allSuppliers.filter(s => s?.id)

    suppliersById.value = Object.fromEntries(
      validSuppliers.map(s => [String(s.id), fixEncoding(s.label || s.name || s.raison_sociale || s.company_name || '')])
    )

    // Stocker le code API exact pour éviter les faux-positifs lors de la recherche
    suppliersCodes.value = Object.fromEntries(
      validSuppliers.map(s => [
        String(s.id),
        s.code || s.fournisseur_code || s.supplier_code || String(s.id)
      ])
    )
  } catch (err) {
    console.error('Erreur chargement fournisseurs:', err)
  }
}

async function fetchCategories() {
  const res = await authorizedFetch(buildApiUrl("/client/topcategory"))

  if (!res.ok) throw new Error("Erreur topcategories API")

  const data = await res.json()
  const rawTopcategories = Array.isArray(data.data) ? data.data : []

  categoryTree.value = rawTopcategories
    .filter(topcategory => Number(topcategory?.id))
    .map(topcategory => ({
      id: Number(topcategory.id),
      label: fixEncoding(topcategory.label || `Top category ${topcategory.id}`),
      categories: Array.isArray(topcategory.categories)
        ? topcategory.categories.map(category => ({
            ...category,
            label: fixEncoding(category.label || ''),
            subcategory: Array.isArray(category.subcategory)
              ? category.subcategory.map(sub => ({ ...sub, label: fixEncoding(sub.label || '') }))
              : []
          }))
        : []
    }))
}

function resolveImages(product) {
  if (!product) return []

  const imageUrls = Array.isArray(product.images)
    ? product.images.map(image => image?.url).filter(Boolean)
    : []

  if (imageUrls.length > 0) {
    return [...new Set(imageUrls)]
  }

  const defaultUrls = Array.isArray(product.defaultImage)
    ? product.defaultImage.map(image => image?.url).filter(Boolean)
    : []

  return [...new Set(defaultUrls)]
}

function resolveSupplierName(product) {
  const candidates = [
    product?.supplier?.label,
    product?.supplier?.name,
    product?.supplier?.raison_sociale,
    product?.supplier?.company_name,
    product?.fournisseur?.label,
    product?.fournisseur?.name,
    product?.fournisseur?.raison_sociale,
    product?.fournisseur?.company_name,
    product?.supplier_name,
    product?.supplier_label,
    product?.fournisseur_name,
    product?.fournisseur_label,
    product?.fournisseur_nom,
    product?.nom_fournisseur,
    product?.libelle_fournisseur,
    product?.fournisseur_libelle,
    product?.vendor_name,
    product?.provider_name,
    product?.brand,
    product?.marque,
  ]

  const match = candidates.find(value => String(value ?? "").trim())
  return match ? String(match).trim() : ""
}

function resolveSupplierId(product) {
  const candidates = [
    product?.supplier?.id,
    product?.supplier?.supplier_id,
    product?.supplier?.fournisseur_id,
    product?.fournisseur?.id,
    product?.fournisseur?.supplier_id,
    product?.fournisseur?.fournisseur_id,
    product?.supplier_id,
    product?.fournisseur_id,
    product?.vendor_id,
    product?.provider_id
  ]

  const match = candidates.find(value => String(value ?? "").trim())
  return match ? String(match).trim() : ""
}

// Réinterprète une fois la chaîne comme si ses caractères étaient en réalité des
// octets Latin-1 représentant du vrai UTF-8 (cas classique de mojibake). Renvoie
// null si la réinterprétation est invalide (donc : la chaîne n'était pas corrompue
// de cette façon, mieux vaut ne pas y toucher).
function fixEncodingOnce(str) {
  try {
    const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0) & 0xFF))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

// Certaines données de l'API ont été corrompues deux fois de suite (double
// mojibake, ex: "François" → "Franà§ois" au lieu de "Franà§ois" corrigé en un
// seul passage) — on réapplique donc la correction tant qu'elle reste valide
// ET qu'elle "resserre" le texte (un mojibake corrompu prend toujours plus de
// caractères que le caractère accentué d'origine), avec un plafond de sécurité.
function fixEncoding(str) {
  if (!str || typeof str !== 'string') return str
  let current = str
  for (let i = 0; i < 3; i++) {
    if (!/[\x80-\xFF]/.test(current)) break
    const next = fixEncodingOnce(current)
    if (next === null || next === current || next.length >= current.length) break
    current = next
  }
  return current
}

function mapProducts(rawProducts) {
  const mappedProducts = rawProducts.map(product => {
    const photoUrls = resolveImages(product)

    return {
      ...product,
      label: fixEncoding(product.label || ''),
      imageUrl: photoUrls[0] || null,
      photoUrls,
      supplierName: fixEncoding(resolveSupplierName(product)),
      supplierId: product?.fournisseur_id ? String(product.fournisseur_id) : resolveSupplierId(product),
      topcategory: product.topcategory ? { ...product.topcategory, label: fixEncoding(product.topcategory.label || '') } : product.topcategory,
      subcategory: product.subcategory ? { ...product.subcategory, label: fixEncoding(product.subcategory.label || '') } : product.subcategory,
      __subcategoryLabel: fixEncoding(product.__subcategoryLabel || '')
    }
  })

  return mappedProducts
}

function getCartProductKey(product) {
  return String(product?.id || product?.code || "").trim()
}

function loadCart() {
  if (typeof window === "undefined") return

  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart = rawCart ? JSON.parse(rawCart) : []
    cartItems.value = Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    cartItems.value = []
  }
}

function persistCart() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
}

// ── Historique ─────────────────────────────────────────────────

function loadHistory() {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    historyItems.value = raw ? JSON.parse(raw) : []
  } catch {
    historyItems.value = []
  }
}

function addHistoryEntry(product, action) {
  const entry = {
    id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
    productCode:  product.code  || '',
    productLabel: product.label || product.name || product.code || '',
    env:          apiEnvironment.value,
    action,
    ts: new Date().toISOString()
  }
  historyItems.value = [entry, ...historyItems.value].slice(0, 500)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItems.value))
  }
}

function clearHistory() {
  historyItems.value = []
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
  }
}

async function goToProductFromHistory(entry) {
  const found = await searchProductByCode(entry.productCode)
  if (!found) { showToast(`Produit ${entry.productCode} introuvable`, 'error'); return }
  const product = mapProducts([found])[0]
  showHistory.value = false
  openProductPanel(product)
}

const ACTION_META = {
  upload:     { label: 'Image ajoutée',     icon: '+', color: '#6366f1' },
  ai:         { label: 'Image IA générée',  icon: '★', color: '#8b5cf6' },
  background: { label: 'Fond appliqué',     icon: '◈', color: '#14b8a6' },
  upscale:    { label: 'Image améliorée',   icon: '↑', color: '#f59e0b' },
}

const historyByDay = computed(() => {
  const groups = []
  const seen = {}
  for (const item of historyItems.value) {
    const day = item.ts.slice(0, 10)
    if (!seen[day]) {
      seen[day] = { day, label: formatHistoryDay(day), entries: [] }
      groups.push(seen[day])
    }
    seen[day].entries.push(item)
  }
  return groups
})

const todayHistoryCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return historyItems.value.filter(e => e.ts.startsWith(today)).length
})

function formatHistoryDay(isoDay) {
  const [y, m, d] = isoDay.split('-')
  const today    = new Date()
  const date     = new Date(Number(y), Number(m) - 1, Number(d))
  const todayStr = today.toISOString().slice(0, 10)
  if (isoDay === todayStr) return "Aujourd'hui"
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (isoDay === yesterday.toISOString().slice(0, 10)) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatHistoryTime(isoTs) {
  return new Date(isoTs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function isProductInCart(product) {
  const productKey = getCartProductKey(product)
  if (!productKey) return false

  return cartItems.value.some(item => getCartProductKey(item) === productKey)
}

function buildCartItem(product) {
  return {
    id: product.id || null,
    code: product.code || "",
    label: product.label || "",
    supplierName: product.supplierName || "",
    supplierId: product.supplierId || resolveSupplierId(product),
    imageUrl: currentImageUrl(product) || product.imageUrl || null,
    usesDefaultImage: usesDefaultImage(product),
    addedAt: new Date().toISOString()
  }
}

function addProductToCart(product) {
  if (isProductInCart(product)) return

  cartItems.value = [...cartItems.value, buildCartItem(product)]
  persistCart()
}

function addDefaultImageProductsToCart() {
  const existingKeys = new Set(cartItems.value.map(item => getCartProductKey(item)))
  const nextItems = [...cartItems.value]

  for (const product of defaultImageProducts.value) {
    const productKey = getCartProductKey(product)
    if (!productKey || existingKeys.has(productKey)) continue
    nextItems.push(buildCartItem(product))
    existingKeys.add(productKey)
  }

  cartItems.value = nextItems
  persistCart()
}

function removeProductFromCart(product) {
  const productKey = getCartProductKey(product)
  cartItems.value = cartItems.value.filter(item => getCartProductKey(item) !== productKey)
  persistCart()
}

function clearCart() {
  cartItems.value = []
  persistCart()
}

function escapeSpreadsheetValue(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildWorksheetXml(name, rows) {
  const tableRows = rows
    .map(
      row =>
        `<Row>${row
          .map(
            cell =>
              `<Cell><Data ss:Type="String">${escapeSpreadsheetValue(cell)}</Data></Cell>`
          )
          .join("")}</Row>`
    )
    .join("")

  return `<Worksheet ss:Name="${escapeSpreadsheetValue(name)}"><Table>${tableRows}</Table></Worksheet>`
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function copyCartToClipboard() {
  const cols = ['Libellé produit', 'Code produit', 'Fournisseur', 'Image']

  const tsv = [
    cols.join('\t'),
    ...cartItems.value.map(item =>
      [item.label || '', item.code || '', item.supplierName || '', item.usesDefaultImage ? 'Sans image' : 'Avec image'].join('\t')
    )
  ].join('\n')

  const thStyle = 'padding:8px 14px;text-align:left;font-size:12px;font-weight:700;color:#fff;background:#1e293b;border:1px solid #334155;white-space:nowrap;'
  const tdStyle = 'padding:7px 14px;font-size:12px;color:#1e293b;border:1px solid #e2e8f0;white-space:nowrap;'
  const tdAltStyle = 'padding:7px 14px;font-size:12px;color:#1e293b;border:1px solid #e2e8f0;white-space:nowrap;background:#f8fafc;'
  const badgeWithStyle = 'display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:#dcfce7;color:#166534;'
  const badgeWithoutStyle = 'display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:#fee2e2;color:#991b1b;'

  const headerRow = `<tr>${cols.map(c => `<th style="${thStyle}">${c}</th>`).join('')}</tr>`

  const dataRows = cartItems.value.map((item, i) => {
    const td = i % 2 === 0 ? tdStyle : tdAltStyle
    const imageBadge = item.usesDefaultImage
      ? `<span style="${badgeWithoutStyle}">Sans image</span>`
      : `<span style="${badgeWithStyle}">Avec image</span>`
    return `<tr>
      <td style="${td}">${item.label || ''}</td>
      <td style="${td};font-weight:600;font-family:monospace;">${item.code || ''}</td>
      <td style="${td}">${item.supplierName || ''}</td>
      <td style="${td}">${imageBadge}</td>
    </tr>`
  }).join('')

  const html = `
    <table style="border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-width:500px;">
      <thead>${headerRow}</thead>
      <tbody>${dataRows}</tbody>
    </table>
    <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Catalogue Produits Chazal — ${cartItems.value.length} produit(s)</p>`

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html':  new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([tsv],  { type: 'text/plain' })
      })
    ])
    cartCopied.value = true
    setTimeout(() => { cartCopied.value = false }, 2000)
  } catch {
    error.value = 'Impossible de copier — autorisez l\'accès au presse-papier'
  }
}

function exportCartToExcel() {
  const rows = [["Libelle produit", "Code produit", "Fournisseur ID"]]

  for (const item of cartItems.value) {
    rows.push([item.label || "", item.code || "", item.supplierId || ""])
  }

  const workbook = `<?xml version="1.0"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  ${buildWorksheetXml("Liste", rows)}
</Workbook>`

  const now = new Date()
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join("")

  downloadFile(
    workbook,
    `liste-produits-${timestamp}.xls`,
    "application/vnd.ms-excel;charset=utf-8;"
  )
}

function openCart() {
  isCartOpen.value = true
}

function closeCart() {
  isCartOpen.value = false
}

async function login() {
  if (loginPromise) return loginPromise

  loginPromise = (async () => {
    await fetch(buildApiUrl('/sanctum/csrf-cookie'), { credentials: 'include' })

    const res = await fetch(buildApiUrl("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getXsrfToken() ? { 'X-XSRF-TOKEN': getXsrfToken() } : {})
      },
      credentials: 'include',
      body: JSON.stringify({
        email: "it.make@maisonchazal.com",
        password: "cv86WuAm"
      })
    })

    if (!res.ok) {
      const details = await buildApiErrorDetails(res, "Erreur connexion API")
      debugInfo.value = details
      throw new Error(details)
    }

    const data = await res.json()
    token = data.data.token
  })()

  try {
    await loginPromise
  } finally {
    loginPromise = null
  }
}

async function fetchJsonOrThrow(path, fallbackMessage) {
  const requestUrl = buildApiUrl(path)
  const res = await authorizedFetch(requestUrl)

  if (!res.ok) {
    const details = await buildApiErrorDetails(res, fallbackMessage)
    debugInfo.value = details
    throw new Error(details)
  }

  const data = await res.json()
  return {
    requestUrl,
    payload: data.data || data
  }
}

function resetSearch() {
  query.value = ''
  selectedCategory.value = ''
  selectedParentCategory.value = ''
  selectedSubcategory.value = ''
  selectedSupplierId.value = ''
  supplierQuery.value = ''
  supplierDropdownOpen.value = false
  products.value = []
  error.value = null
  loadingMore.value = false
  productsSource.value = 'none'
  closeProductPanel()
}

async function search() {
  if (searchMode.value === "supplier") {
    if (!selectedSupplierId.value) {
      error.value = "Veuillez sélectionner un fournisseur"
      return
    }
    loading.value = true
    error.value = null
    products.value = []
    loadingMore.value = false
    currentPage.value = 1
    lastPage.value = 1
    try {
      if (!categoryTree.value.length) await fetchCategories()
      // Utiliser le code exact stocké pour éviter tout faux-positif
      const code = suppliersCodes.value[selectedSupplierId.value] || selectedSupplierId.value
      const detailResult = await fetchSupplierDetails(code)
      const rawProducts = extractSupplierProducts(detailResult.payload)
      const mappedProducts = mapProducts(rawProducts)
      products.value = mappedProducts
      productsSource.value = "supplier"
      imageIndexes.value = Object.fromEntries(mappedProducts.map(p => [p.id, 0]))
    } catch (err) {
      error.value = err.message || "Erreur lors de la recherche"
      console.error(err)
    }
    loading.value = false
    return
  }

  if (!query.value) {
    if (searchMode.value === "product" && selectedCategory.value === "all") {
      await loadAllProducts()
    } else if (searchMode.value === "product" && selectedCategory.value) {
      await loadProductsByCategory(selectedCategory.value)
    } else {
      error.value = "Veuillez entrer un terme de recherche"
    }
    return
  }

  loading.value = true
  error.value = null
  products.value = []
  loadingMore.value = false
  currentPage.value = 1
  lastPage.value = 1

  try {
    if (!categoryTree.value.length) {
      await fetchCategories()
    }

    if (isMultiSearch.value) {
      const codes = query.value.split(',').map(c => c.trim()).filter(Boolean)
      await searchMultipleCodes(codes)
    } else {
      const q = query.value.trim()
      const payload = { code: q, label: q, ean13: q }
      console.log('[SEARCH] payload envoyé →', payload)

      searchEncodedPayload.value = encodeURIComponent(JSON.stringify(payload))
      await fetchSearchPage(1, false)
      productsSource.value = "search"
    }
  } catch (err) {
    error.value = err.message || "Erreur lors de la recherche"
    console.error(err)
  }

  loading.value = false
}

async function searchMultipleCodes(codes) {
  const allRaw = []
  const total = codes.length

  for (let i = 0; i < total; i++) {
    loadingProgress.value = `Recherche ${i + 1} / ${total}...`

    try {
      const code = codes[i]
      const encoded = encodeURIComponent(JSON.stringify({ code, label: code, ean13: code }))
      const res = await authorizedFetch(
        buildApiUrl(`${API_CONFIG.endpoints.productSearch}?s=${encoded}&page=1&per_page=5`),
        { method: 'POST' }
      )

      if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        i--
        continue
      }

      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data.data?.data) ? data.data.data : []
        allRaw.push(...items)
      }
    } catch {
      // continue
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }

  const byId = new Map()
  for (const product of allRaw) {
    if (product?.id) byId.set(product.id, product)
  }

  const mappedProducts = mapProducts(Array.from(byId.values()))
  products.value = mappedProducts
  productsSource.value = 'search'
  imageIndexes.value = Object.fromEntries(mappedProducts.map(p => [p.id, 0]))
  currentPage.value = 1
  lastPage.value = 1
  loadingProgress.value = ''
}

function extractSupplierProducts(payload) {
  if (Array.isArray(payload?.products)) return payload.products
  if (Array.isArray(payload?.data?.products)) return payload.data.products
  if (Array.isArray(payload?.fournisseur?.products)) return payload.fournisseur.products
  if (Array.isArray(payload?.supplier?.products)) return payload.supplier.products
  if (Array.isArray(payload?.articles)) return payload.articles
  if (Array.isArray(payload?.produits)) return payload.produits
  return []
}

function extractSuppliersList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.suppliers)) return payload.suppliers
  if (Array.isArray(payload?.fournisseurs)) return payload.fournisseurs
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function resolveSupplierIdentity(rawSupplier, searchedValue) {
  if (!rawSupplier || typeof rawSupplier !== "object") return null

  const normalizedSearch = String(searchedValue ?? "").trim()
  const candidates = [
    rawSupplier.id,
    rawSupplier.fournisseur_id,
    rawSupplier.supplier_id,
    rawSupplier.code,
    rawSupplier.fournisseur_code,
    rawSupplier.supplier_code
  ]

  const matches = candidates.some(value => String(value ?? "").trim() === normalizedSearch)
  if (!matches) return null

  return {
    id:
      rawSupplier.id ??
      rawSupplier.fournisseur_id ??
      rawSupplier.supplier_id ??
      null,
    code:
      rawSupplier.code ??
      rawSupplier.fournisseur_code ??
      rawSupplier.supplier_code ??
      rawSupplier.id ??
      rawSupplier.fournisseur_id ??
      rawSupplier.supplier_id ??
      null
  }
}

async function fetchSuppliersListByCandidates() {
  const result = await fetchJsonOrThrow(
    API_CONFIG.endpoints.suppliers,
    "Erreur liste fournisseurs API"
  )

  return {
    requestUrl: result.requestUrl,
    suppliers: extractSuppliersList(result.payload)
  }
}

async function fetchSupplierDetails(supplierCode) {
  return fetchJsonOrThrow(
    API_CONFIG.endpoints.supplier(supplierCode),
    "Erreur detail fournisseur API"
  )
}

async function loadProductsBySupplier(supplierCode) {
  const normalizedSearch = String(supplierCode || "").trim()
  if (!normalizedSearch) return

  const listResult = await fetchSuppliersListByCandidates()
  const matchedSupplier = listResult.suppliers
    .map(item => resolveSupplierIdentity(item, normalizedSearch))
    .find(Boolean)

  if (!matchedSupplier) {
    const details = [
      "Erreur fournisseur API: aucun fournisseur ne correspond a cet identifiant",
      `env: ${apiEnvironment.value}`,
      `mode: ${searchMode.value}`,
      `url: ${listResult.requestUrl}`
    ].join("\n")
    debugInfo.value = details
    throw new Error(details)
  }

  const detailResult = await fetchSupplierDetails(matchedSupplier.code)
  const rawProducts = extractSupplierProducts(detailResult.payload)
  const mappedProducts = mapProducts(rawProducts)

  products.value = mappedProducts
  productsSource.value = "supplier"
  imageIndexes.value = Object.fromEntries(mappedProducts.map(product => [product.id, 0]))
  currentPage.value = 1
  lastPage.value = 1
  debugInfo.value = [
    `Liste fournisseurs utilisee: ${listResult.requestUrl || "aucune"}`,
    `Fournisseur resolu: id=${matchedSupplier.id || "inconnu"} code=${matchedSupplier.code || "inconnu"}`,
    `Endpoint fournisseur utilise: ${detailResult.requestUrl || "aucun"}`
  ].join("\n")

  if (!mappedProducts.length) {
    const details = [
      debugInfo.value,
      "Le fournisseur a ete trouve mais aucun produit n'a ete retourne."
    ].join("\n")
    debugInfo.value = details
  }
}

let _loadCategoryGen = 0

async function loadAllProducts() {
  const myGen = ++_loadCategoryGen

  if (!categoryTree.value.length) await fetchCategories()

  const allSubcategories = categories.value.flatMap(topCat =>
    (Array.isArray(topCat.categories) ? topCat.categories : [])
      .flatMap(parentCat =>
        (Array.isArray(parentCat.subcategory) ? parentCat.subcategory : [])
          .map(s => ({ ...s, __categoryId: Number(topCat.id), __topCategoryLabel: topCat.label }))
      )
  ).filter(s => s?.code)

  loading.value = true
  loadingProgress.value = ''
  error.value = null
  products.value = []
  loadingMore.value = false

  const total = allSubcategories.length
  const payloads = []

  try {
    for (let i = 0; i < allSubcategories.length; i++) {
      if (myGen !== _loadCategoryGen) return
      const sub = allSubcategories[i]
      loadingProgress.value = `${i + 1} / ${total} — ${sub.label || sub.code}`

      const url = buildApiUrl(`/client/subcategory/${encodeURIComponent(sub.code)}`)
      let res = null
      let retryDelay = 3000
      for (let attempt = 0; attempt < 4; attempt++) {
        if (myGen !== _loadCategoryGen) return
        res = await authorizedFetch(url)
        if (res.status !== 429) break
        await new Promise(r => setTimeout(r, retryDelay))
        retryDelay *= 2
      }

      if (res?.ok) {
        const data = await res.json()
        const rawProducts = Array.isArray(data.data?.products) ? data.data.products : []
        payloads.push(rawProducts.map(p => ({
          ...p,
          __categoryId: Number(sub.category_id) || null,
          __subcategoryId: Number(sub.id) || null,
          __subcategoryLabel: sub.label || null
        })))
      }
      await new Promise(r => setTimeout(r, 600))
    }

    if (myGen !== _loadCategoryGen) return

    const byId = new Map()
    for (const p of payloads.flat()) {
      if (!p?.id) continue
      if (!p.subcategory && p.__subcategoryId) {
        p.subcategory = { id: p.__subcategoryId, category_id: p.__categoryId, label: p.__subcategoryLabel }
      }
      byId.set(p.id, p)
    }

    const mappedProducts = mapProducts(Array.from(byId.values()))
    products.value = mappedProducts
    productsSource.value = 'category'
    imageIndexes.value = Object.fromEntries(mappedProducts.map(p => [p.id, 0]))
  } catch (err) {
    if (myGen !== _loadCategoryGen) return
    error.value = "Erreur lors du chargement de toutes les catégories"
    console.error(err)
  } finally {
    if (myGen === _loadCategoryGen) {
      loading.value = false
      loadingProgress.value = ''
    }
  }
}

async function loadProductsByCategory(categoryId) {
  const myGen = ++_loadCategoryGen

  const category = categories.value.find(item => Number(item.id) === Number(categoryId))
  if (!category) {
    products.value = []
    productsSource.value = "none"
    imageIndexes.value = {}
    return
  }

  loading.value = true
  loadingProgress.value = ""
  error.value = null
  debugInfo.value = ""
  products.value = []
  loadingMore.value = false
  currentPage.value = 1
  lastPage.value = 1

  try {
    const subcategoriesForCategory = (Array.isArray(category.categories) ? category.categories : [])
      .flatMap(parentCategory =>
        Array.isArray(parentCategory.subcategory) ? parentCategory.subcategory : []
      )

    // Charger uniquement ce qui est sélectionné, pas toute la catégorie
    let subcategoriesToFetch = subcategoriesForCategory
    if (selectedSubcategory.value) {
      subcategoriesToFetch = subcategoriesForCategory.filter(
        s => Number(s.id) === Number(selectedSubcategory.value)
      )
    } else if (selectedParentCategory.value) {
      subcategoriesToFetch = subcategoriesForCategory.filter(
        s => Number(s.category_id) === Number(selectedParentCategory.value)
      )
    }

    const subcategoriesWithCode = subcategoriesToFetch.filter(s => s?.code)
    const total = subcategoriesWithCode.length
    const payloads = []

    for (let i = 0; i < subcategoriesWithCode.length; i++) {
      if (myGen !== _loadCategoryGen) return  // annulé par un nouveau chargement

      const subcategory = subcategoriesWithCode[i]
      loadingProgress.value = `Chargement ${i + 1} / ${total}...`

      let res = await authorizedFetch(
        buildApiUrl(`/client/subcategory/${encodeURIComponent(subcategory.code)}`)
      )

      if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        if (myGen !== _loadCategoryGen) return
        res = await authorizedFetch(
          buildApiUrl(`/client/subcategory/${encodeURIComponent(subcategory.code)}`)
        )
      }

      if (res.ok) {
        const data = await res.json()
        const rawProducts = Array.isArray(data.data?.products) ? data.data.products : []
        payloads.push(rawProducts.map(product => ({
          ...product,
          __categoryId: Number(subcategory.category_id) || null,
          __subcategoryId: Number(subcategory.id) || null,
          __subcategoryLabel: subcategory.label || null
        })))
      } else {
        payloads.push([])
      }

      await new Promise(resolve => setTimeout(resolve, 150))
    }

    if (myGen !== _loadCategoryGen) return

    const byId = new Map()
    for (const product of payloads.flat()) {
      if (!product?.id) continue
      if (!product.subcategory && product.__subcategoryId) {
        product.subcategory = {
          id: product.__subcategoryId,
          category_id: product.__categoryId,
          label: product.__subcategoryLabel
        }
      }
      byId.set(product.id, product)
    }

    const mappedProducts = mapProducts(Array.from(byId.values()))
    products.value = mappedProducts
    productsSource.value = "category"
    imageIndexes.value = Object.fromEntries(mappedProducts.map(product => [product.id, 0]))
  } catch (err) {
    if (myGen !== _loadCategoryGen) return
    error.value = "Erreur lors du chargement de la categorie"
    console.error(err)
  }

  if (myGen === _loadCategoryGen) {
    loading.value = false
    loadingProgress.value = ""
  }
}

async function fetchSearchPage(page, append) {
  const requestUrl = buildApiUrl(
    `${API_CONFIG.endpoints.productSearch}?s=${searchEncodedPayload.value}&page=${page}&per_page=${perPage}`
  )
  const res = await authorizedFetch(requestUrl, { method: "POST" })

  if (!res.ok) {
    const details = await buildApiErrorDetails(res, "Erreur recherche API")
    debugInfo.value = details
    throw new Error(details)
  }

  const data = await res.json()
  console.log('[SEARCH] réponse API →', data)
  const pagination = data.data || {}
  const rawProducts = Array.isArray(pagination.data) ? pagination.data : []
  const mappedProducts = mapProducts(rawProducts)

  currentPage.value = Number(pagination.current_page) || page
  lastPage.value = Number(pagination.last_page) || currentPage.value

  if (!append) {
    products.value = mappedProducts
    imageIndexes.value = Object.fromEntries(mappedProducts.map(product => [product.id, 0]))
    return
  }

  const byId = new Map(products.value.map(product => [product.id, product]))
  for (const product of mappedProducts) {
    byId.set(product.id, product)
  }

  const mergedProducts = Array.from(byId.values())
  products.value = mergedProducts
  imageIndexes.value = Object.fromEntries(
    mergedProducts.map(product => [product.id, imageIndexes.value[product.id] || 0])
  )
}

function canLoadMoreSearch() {
  return (
    productsSource.value === "search" &&
    searchMode.value === "product" &&
    Boolean(query.value) &&
    !loading.value &&
    !loadingMore.value &&
    currentPage.value < lastPage.value
  )
}

async function loadNextSearchPage() {
  if (!canLoadMoreSearch()) return

  loadingMore.value = true
  error.value = null

  try {
    await fetchSearchPage(currentPage.value + 1, true)
  } catch (err) {
    error.value = "Erreur lors du chargement de la page suivante"
    console.error(err)
  }

  loadingMore.value = false
}

// Le drag & drop "import masse" sur toute la page n'est actif que lorsque l'écran
// d'import masse est ouvert (bouton "Import masse" cliqué) — sinon il rentrait en
// conflit avec le drop classique du panneau produit.
function onWindowDragEnter(e) {
  if (!showDropZone.value) return
  if (!e.dataTransfer?.types?.length) return
  if (![...e.dataTransfer.types].includes('Files')) return
  isDragging.value = true
}

function onWindowDragLeave(e) {
  if (!showDropZone.value) return
  if (!e.relatedTarget) isDragging.value = false
}

function onWindowDragOver(e) {
  if (!showDropZone.value) return
  e.preventDefault()
}

function onWindowDrop(e) {
  if (!showDropZone.value) return
  e.preventDefault()
  isDragging.value = false
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
  if (files.length) openBatchModal(files)
}

onMounted(async () => {
  loadCart()
  loadHistory()

  document.addEventListener('dragenter', onWindowDragEnter)
  document.addEventListener('dragleave', onWindowDragLeave)
  document.addEventListener('dragover', onWindowDragOver)
  document.addEventListener('drop', onWindowDrop)

  loadMoreObserver = new IntersectionObserver(
    entries => {
      const firstEntry = entries[0]
      if (!firstEntry?.isIntersecting) return
      loadNextSearchPage()
    },
    { rootMargin: "500px 0px 500px 0px" }
  )

  try {
    await Promise.all([fetchCategories(), fetchAllSuppliers()])
  } catch (err) {
    console.error(err)
  }
})

onUnmounted(() => {
  document.removeEventListener('dragenter', onWindowDragEnter)
  document.removeEventListener('dragleave', onWindowDragLeave)
  document.removeEventListener('dragover', onWindowDragOver)
  document.removeEventListener('drop', onWindowDrop)
  if (!loadMoreObserver) return
  loadMoreObserver.disconnect()
  loadMoreObserver = null
})

watch(loadMoreSentinel, (nextElement, previousElement) => {
  if (!loadMoreObserver) return
  if (previousElement) loadMoreObserver.unobserve(previousElement)
  if (nextElement) loadMoreObserver.observe(nextElement)
})

watch(selectedCategory, newCategoryId => {
  if ((productsSource.value === "search" || productsSource.value === "supplier") && query.value) return

  if (!newCategoryId) {
    products.value = []
    productsSource.value = "none"
    selectedParentCategory.value = ""
    imageIndexes.value = {}
  }
})

// ── IA Image ───────────────────────────────────────────────────

function cleanLabelForPrompt(label) {
  return (label || '')
    .replace(/\b\d+[,.]?\d*\s*(KG|G|GR|ML|CL|L)\b/gi, '')   // poids : 3KG, 500G, 1.5KG
    .replace(/\b\d+\s*[Xx×]\s*\d+[,.]?\d*\s*(KG|G|GR|ML|CL|L)?\b/gi, '')  // multi : 2X125G
    .replace(/\b(FR|IRL|ESP|ITA|BEL|NLD|DEU|POL|ARG|BRA|AUS|NZL|USA)\b/g, '')  // pays ISO
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildAiPrompt(label, { withPlate = false, withLabel = false } = {}) {
  const plateClause = withPlate
    ? 'product presented on a clean white ceramic plate,'
    : 'no plate, no dish, no bowl,'
  const textClause = withLabel
    ? ''
    : 'IMPORTANT: absolutely no text, no letters, no words, no label, no writing, no logo, no brand name, no packaging inscription of any kind anywhere on the image.'
  return `Professional packshot product photography of "${label}". Pure white seamless background, soft even studio lighting from multiple softboxes, sharp focus on the product shape and texture, ${plateClause} photorealistic commercial e-commerce style, high resolution, no shadows, no props, no hands, no reflections, product centered and filling the frame, DSLR quality, ready for product catalog. ${textClause}`.trim()
}

function openAiScreen() {
  aiProductLabel.value = cleanLabelForPrompt(uploadModal.value.product?.label)
  aiGeneratedImageSrc.value = null
  uploadModal.value.state = 'ai'
  uploadModal.value.historyAction = 'ai'
}

function openProductPanel(product) {
  selectedProduct.value = product
  panelCopied.value = false
  panelTab.value = 'photos'
  editAiPromptOpen.value = false
  editAiPrompt.value = ''
}

async function runStatsAudit() {
  if (!Object.keys(suppliersById.value).length) await fetchAllSuppliers()

  const allSuppliers = Object.entries(suppliersById.value)
  statsRows.value = []
  statsLoading.value = true
  statsAborted.value = false
  statsProgress.value = 0
  statsTotal.value = allSuppliers.length

  const BATCH = 5
  for (let i = 0; i < allSuppliers.length; i += BATCH) {
    if (statsAborted.value) break
    const batch = allSuppliers.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(async ([id, name]) => {
      const code = suppliersCodes.value[id] || id
      try {
        const result = await fetchSupplierDetails(code)
        const raw = extractSupplierProducts(result.payload)
        const mapped = mapProducts(raw)
        const noImage = mapped.filter(p => usesDefaultImage(p)).length
        return { id, name, total: mapped.length, noImage, failed: false }
      } catch {
        return { id, name, total: 0, noImage: 0, failed: true }
      }
    }))

    statsRows.value = [...statsRows.value, ...results]
      .sort((a, b) => {
        if (a.failed !== b.failed) return a.failed ? 1 : -1
        return b.noImage - a.noImage || b.total - a.total
      })
    statsProgress.value = Math.min(i + BATCH, allSuppliers.length)
  }

  statsLoading.value = false
}

async function copySupplierName(name) {
  if (!name) return
  try {
    await navigator.clipboard.writeText(name)
    panelCopied.value = true
    setTimeout(() => { panelCopied.value = false }, 1800)
  } catch { /* silencieux */ }
}

function closeProductPanel() {
  selectedProduct.value = null 
}

function openUploadFromPanel(product) {
  openUploadModal(product)
}

function openAiFromPanel(product) {
  openUploadModal(product)
  openAiScreen()
}

function openBgFromPanel(product) {
  openBgPackagingModal(product)
}

async function generateAiImage() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    error.value = 'Clé API OpenRouter manquante — ajouter VITE_OPENROUTER_API_KEY dans les variables d\'environnement'
    return
  }

  aiGenerating.value = true
  aiGeneratedImageSrc.value = null
  uploadModal.value.state = 'ai-result'

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Catalogue Produits Chazal'
      },
      body: JSON.stringify({
        model: aiModel.value,
        messages: [{ role: 'user', content: buildAiPrompt(aiProductLabel.value, { withPlate: aiWithPlate.value, withLabel: aiWithLabel.value }) }],
        modalities: aiModels.find(m => m.id === aiModel.value)?.modalities ?? ['image', 'text']
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(buildOpenRouterError(res.status, errData?.error?.message))
    }

    const data = await res.json()
    const images = data.choices?.[0]?.message?.images
    if (!images?.length) throw new Error('Aucune image retournée par OpenRouter')
    aiGeneratedImageSrc.value = images[0].image_url.url

  } catch (err) {
    console.error('Erreur génération OpenRouter:', err)
    error.value = err.message || 'Erreur lors de la génération'
    uploadModal.value.state = 'ai'
  } finally {
    aiGenerating.value = false
  }
}

function useAiResult() {
  if (!aiGeneratedImageSrc.value) return
  uploadModal.value.imageSrc = aiGeneratedImageSrc.value
  uploadModal.value.state = 'crop'
}

// ── Upload / Crop ──────────────────────────────────────────────

function openUploadModal(product) {
  uploadModal.value = { open: true, product, state: 'select', imageSrc: null, historyAction: 'upload' }
  isDragOver.value = false
  cropInteraction.value = null
}

function closeUploadModal() {
  uploadModal.value = { open: false, product: null, state: 'select', imageSrc: null, historyAction: 'upload', imageType: 'packshot' }
  cropInteraction.value = null
  aiProductLabel.value = ''
  aiWithPlate.value = false
  aiWithLabel.value = false
  aiGeneratedImageSrc.value = null
  aiGenerating.value = false
}

function loadImageForCrop(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = e => {
    uploadModal.value.imageSrc = e.target.result
    uploadModal.value.state = 'crop'
  }
  reader.readAsDataURL(file)
}

function onUploadFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) loadImageForCrop(file)
  e.target.value = ''
}

function onDropFile(e) {
  isDragOver.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) loadImageForCrop(file)
}

function initCropBox() {
  const img = cropImageRef.value
  if (!img) return
  const m = 24
  cropBox.value = { x: m, y: m, w: img.clientWidth - m * 2, h: img.clientHeight - m * 2 }
}

function startCropMove(e) {
  const { x, y } = cropBox.value
  cropInteraction.value = { type: 'move', sx: e.clientX, sy: e.clientY, ox: x, oy: y }
}

function startCropResize(handle, e) {
  cropInteraction.value = { type: 'resize', handle, sx: e.clientX, sy: e.clientY, ob: { ...cropBox.value } }
}

function onCropMouseMove(e) {
  const it = cropInteraction.value
  if (!it) return
  const dx = e.clientX - it.sx
  const dy = e.clientY - it.sy
  const el = cropContainerRef.value
  if (!el) return
  const cw = el.clientWidth
  const ch = el.clientHeight
  const min = 40

  if (it.type === 'move') {
    cropBox.value = {
      ...cropBox.value,
      x: Math.max(0, Math.min(cw - cropBox.value.w, it.ox + dx)),
      y: Math.max(0, Math.min(ch - cropBox.value.h, it.oy + dy)),
    }
  } else {
    let { x, y, w, h } = it.ob
    const h_ = it.handle
    if (h_.includes('e')) w = Math.max(min, Math.min(cw - x, w + dx))
    if (h_.includes('s')) h = Math.max(min, Math.min(ch - y, h + dy))
    if (h_.includes('w')) { const nx = Math.max(0, Math.min(x + w - min, x + dx)); w = x + w - nx; x = nx }
    if (h_.includes('n')) { const ny = Math.max(0, Math.min(y + h - min, y + dy)); h = y + h - ny; y = ny }
    cropBox.value = { x, y, w, h }
  }
}

function onCropMouseUp() {
  cropInteraction.value = null
}

function confirmCrop() {
  const img = cropImageRef.value
  if (!img) return
  const sx = img.naturalWidth  / img.clientWidth
  const sy = img.naturalHeight / img.clientHeight
  const { x, y, w, h } = cropBox.value
  const canvas = document.createElement('canvas')
  canvas.width  = Math.round(w * sx)
  canvas.height = Math.round(h * sy)
  canvas.getContext('2d').drawImage(img, Math.round(x * sx), Math.round(y * sy), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
  const srcMime = (uploadModal.value.imageSrc || '').match(/^data:(image\/[a-z+]+);/)?.[1] || ''
  const keepPng = srcMime === 'image/png'
  const outMime = keepPng ? 'image/png' : 'image/jpeg'
  const outExt  = keepPng ? 'image.png' : 'image.jpg'
  const originalDataUrl = uploadModal.value.imageSrc
  canvas.toBlob(async blob => {
    if (!blob) return
    const product = uploadModal.value.product
    const action  = uploadModal.value.historyAction || 'upload'
    const webFile = new File([blob], outExt, { type: outMime })
    let originalFile = null
    try {
      const res = await fetch(originalDataUrl)
      const origBlob = await res.blob()
      const origExt = origBlob.type === 'image/png' ? 'original.png' : 'original.jpg'
      originalFile = new File([origBlob], origExt, { type: origBlob.type || 'image/jpeg' })
    } catch { /* ignore, fallback to webFile for HD */ }
    const toGed = sendToGed.value
    closeUploadModal()
    await uploadProductImage(product, webFile, action, originalFile, toGed)
  }, outMime, keepPng ? undefined : 0.9)
}

// ───────────────────────────────────────────────────────────────

watch(searchMode, () => {
  products.value = []
  productsSource.value = "none"
  error.value = null
  debugInfo.value = ""
  imageIndexes.value = {}
  loadingMore.value = false
  currentPage.value = 1
  lastPage.value = 1
  selectedCategory.value = ""
  selectedParentCategory.value = ""
  selectedSubcategory.value = ""
  selectedSupplierId.value = ""
})

async function downloadImage(url, code) {
  if (!url) return
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${code || 'image'}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(url, '_blank')
  }
}

function currentImageIndex(product) {
  return imageIndexes.value[product.id] || 0
}

function currentImageUrl(product) {
  const urls = product.photoUrls || []
  return urls[currentImageIndex(product)] || null
}

function currentImageType(product) {
  const url = currentImageUrl(product)
  if (!url) return null
  if (imageTypeMap.value[url]) return imageTypeMap.value[url]
  if (Array.isArray(product.images)) {
    const t = product.images.find(i => i.url === url)?.type
    if (t) return t
  }
  return 'web'
}

function previousImage(product) {
  const urls = product.photoUrls || []
  if (urls.length <= 1) return

  const current = currentImageIndex(product)
  imageIndexes.value[product.id] = (current - 1 + urls.length) % urls.length
}

function nextImage(product) {
  const urls = product.photoUrls || []
  if (urls.length <= 1) return

  const current = currentImageIndex(product)
  imageIndexes.value[product.id] = (current + 1) % urls.length
}

function goToImage(product, index) {
  const urls = product.photoUrls || []
  if (index < 0 || index >= urls.length) return
  imageIndexes.value[product.id] = index
}

function handleImageError(product) {
  const urls = Array.isArray(product.photoUrls) ? product.photoUrls : []
  const current = currentImageIndex(product)

  if (!urls.length) return

  urls.splice(current, 1)
  product.imageUrl = urls[0] || null

  if (!urls.length) {
    imageIndexes.value[product.id] = 0
    return
  }

  if (current >= urls.length) {
    imageIndexes.value[product.id] = 0
  }
}


function compressImage(file, maxSize = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width >= height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Compression échouée')); return }
          const safeName = file.name.replace(/\.[^.]+$/, '.jpg')
          resolve(new File([blob], safeName, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    } 

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Impossible de lire l'image")) }
    img.src = objectUrl
  })
}

function openImagePicker(product) {
  pendingUploadProduct.value = product
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file || !pendingUploadProduct.value) return
  const product = pendingUploadProduct.value
  pendingUploadProduct.value = null
  await uploadProductImage(product, file)
}

async function uploadProductImage(product, file, historyAction = 'upload', originalFile = null, toGed = false) {
  if (!product?.id) {
    error.value = "Upload impossible : ID produit manquant"
    console.error('[upload] product.id manquant', product)
    return
  }

  uploadingProductId.value = product.id
  error.value = null

  try {
    const uploadUrl = buildApiUrl(API_CONFIG.endpoints.imageUpload(product.code))
    console.log('[upload] URL:', uploadUrl)

    const _r4 = () => String(Math.floor(1000 + Math.random() * 9000))

    // ── Envoi 1 : original → HD, directement sur S3 ────────────────────────
    // Contourne la limite de taille (413) de l'API Admin : le fichier HD ne
    // passe pas par elle, il part vers le micro-service s3-upload-service.
    let hdEntry = null
    try {
      const hdFile = originalFile || file
      const hdExt  = (hdFile.type === 'image/png') ? 'png' : 'jpg'
      const hdName = `${product.code}-hd-${_r4()}.${hdExt}`

      const hdForm = new FormData()
      hdForm.append('image', hdFile, hdName)
      hdForm.append('productCode', product.code)

      const hdRes = await fetch(`${S3_UPLOAD_CONFIG.baseURL}${S3_UPLOAD_CONFIG.endpoint}`, {
        method: 'POST',
        body: hdForm
      })

      console.log('[upload] HD (S3) statut:', hdRes.status)
      if (hdRes.ok) {
        const hdData = await hdRes.json()
        if (hdData.url) {
          // id préfixé "s3:" pour que deleteProductImage sache router la suppression
          // vers S3 plutôt que vers l'API Admin (qui ne connaît pas cette image).
          hdEntry = { url: hdData.url, type: 'HD', id: `s3:${hdData.key}` }
          console.log('[upload] HD (S3) ok, url:', hdData.url)
        }
      } else {
        const t = await hdRes.text()
        console.warn('[upload] HD (S3) rejeté', hdRes.status, t.slice(0, 200))
        showToast('Échec de l\'envoi HD vers S3', 'warning')
      }
    } catch (hdErr) {
      console.warn('[upload] HD (S3) exception:', hdErr)
      showToast('Service S3 injoignable — envoi HD annulé', 'warning')
    }

    // ── Envoi 2 : compressé → web ─────────────────────────────────────────
    const compressed = await compressImage(file)
    console.log('[upload] Web compressé:', compressed?.size, 'bytes')
    const webForm = new FormData()
    webForm.append('image', compressed, `${product.code}-web-${_r4()}.jpg`)
    webForm.append('type', 'packshot')
    webForm.append('size', 'web')

    const res = await authorizedFetch(uploadUrl, { method: 'POST', body: webForm })

    if (!res.ok) {
      const details = await buildApiErrorDetails(res, "Erreur upload image")
      throw new Error(details)
    }
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      throw new Error("L'endpoint d'upload a retourné une page HTML — l'authentification Bearer n'est peut-être pas acceptée pour cette route (vérifiez la config Sanctum côté serveur)")
    }

    const rawText = await res.text()
    let data = {}
    try { data = JSON.parse(rawText) } catch {
      console.warn('[upload] réponse non-JSON :', rawText.slice(0, 200))
    }

    const newUrl = data.data?.url || data.url || data.data?.image?.url || null
    const newId  = data.data?.id  || data.id  || data.data?.image?.id  || null
    const newType = data.data?.type || data.type || data.data?.image?.type || 'packshot'

    if (newUrl) {
      const webImage = { url: newUrl, type: newType, ...(newId ? { id: newId } : {}) }
      const existingImages = Array.isArray(product.images) ? product.images : []
      product.images = [...existingImages, webImage, ...(hdEntry ? [hdEntry] : [])]
      const existingUrls = product.photoUrls || []
      product.photoUrls = [...new Set([...existingUrls, newUrl, ...(hdEntry ? [hdEntry.url] : [])])]
      product.imageUrl = product.photoUrls[0]
      imageIndexes.value[product.id] = product.photoUrls.length - 1
      imageTypeMap.value = { ...imageTypeMap.value, [newUrl]: 'packshot' }
      if (hdEntry) imageTypeMap.value = { ...imageTypeMap.value, [hdEntry.url]: 'HD' }
      if (toGed) uploadToLocalShare(file, product.code, 'web')
      // Web → BDD Photos (S3, en plus d'Infologic ci-dessus) : toujours, pas
      // conditionné à la case Infologic — la BDD veut les deux variantes.
      uploadWebToS3(compressed, product.code)
      addHistoryEntry(product, historyAction)
    } else {
      console.warn('[upload] pas de newUrl dans la réponse :', rawText.slice(0, 400))
    }
  } catch (err) {
    error.value = err.message || "Erreur lors de l'upload de l'image"
    console.error(err)
  } finally {
    uploadingProductId.value = null
  }
}

function currentImageObject(product) {
  const url = currentImageUrl(product)
  return Array.isArray(product.images) ? (product.images.find(img => img.url === url) ?? null) : null
}

async function deleteProductImage(product, imageId) {
  deletingImageId.value = String(imageId)
  error.value = null
  try {
    // Les images HD envoyées sur S3 ont un id "s3:<clé>" — l'API Admin ne les connaît
    // pas (elles ne passent jamais par elle), donc la suppression va sur S3 directement.
    const s3Key = String(imageId).startsWith('s3:') ? String(imageId).slice(3) : null

    const res = s3Key
      ? await fetch(`${S3_UPLOAD_CONFIG.baseURL}${S3_UPLOAD_CONFIG.endpoint}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: s3Key })
        })
      : await authorizedFetch(
          buildApiUrl(API_CONFIG.endpoints.imageDelete(product.code, imageId)),
          { method: 'DELETE' }
        )

    if (!res.ok) throw new Error(await buildApiErrorDetails(res, "Erreur suppression image"))
    product.images = (product.images || []).filter(img => String(img.id) !== String(imageId))
    product.photoUrls = product.images.map(img => img.url).filter(Boolean)
    product.imageUrl = product.photoUrls[0] || null
    const idx = imageIndexes.value[product.id] || 0
    imageIndexes.value[product.id] = Math.min(idx, Math.max(0, product.photoUrls.length - 1))
  } catch (err) {
    error.value = err.message || "Erreur lors de la suppression de l'image"
    console.error(err)
  } finally {
    deletingImageId.value = null
  }
}

async function loadPresetBackground(preset) {
  try {
    const res = await fetch(`/backgrounds/${encodeURIComponent(preset.file)}`)
    const blob = await res.blob()
    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    const resized = await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1920
        let w = img.naturalWidth, h = img.naturalHeight
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h)
          w = Math.round(w * ratio); h = Math.round(h * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = dataUrl
    })
    backgroundSrc.value = resized
    selectedPresetId.value = preset.id
    showBgPicker.value = false
  } catch {
    error.value = `Impossible de charger le fond : ${preset.label}`
  }
}

function onBackgroundSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { backgroundSrc.value = reader.result; selectedPresetId.value = null; showBgPicker.value = false }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function openBgPackagingModal(product) {
  bgPackagingModal.value = { open: true, product }
}

function confirmApplyBg(keepPackaging) {
  const product = bgPackagingModal.value.product
  bgPackagingModal.value = { open: false, product: null }
  applyBackgroundToProduct(product, keepPackaging)
}

async function applyBackgroundToProduct(product, keepPackaging = false) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) { error.value = 'Clé API OpenRouter manquante'; return }
  if (!backgroundSrc.value) { error.value = 'Aucun fond sélectionné'; return }

  const imageUrl = currentImageUrl(product)
  if (!imageUrl || usesDefaultImage(product)) return

  applyingBgProductId.value = String(product.id)
  error.value = null

  uploadModal.value = { open: true, product, state: 'ai-result', imageSrc: null, historyAction: 'background' }
  aiGeneratedImageSrc.value = null
  aiGenerating.value = true

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Catalogue Produits Chazal'
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'image_url', image_url: { url: backgroundSrc.value } },
            { type: 'text', text: keepPackaging
              ? `Background removal and compositing task — treat this exactly like remove.bg. Remove ONLY the background from the first image (product photo). Preserve every pixel of the product exactly as-is: all text, labels, barcodes, logos, brand names, colors, reflections, packaging details — nothing on the product may be altered or removed. Do not regenerate or enhance the product in any way. Then place the pixel-perfect product cutout onto the second image (background texture). Add a subtle natural soft shadow beneath the product to anchor it realistically. The product must look identical to the original photo — only the background is replaced.`
              : `Remove the background from the first image (product photo) and composite the product onto the second image (background texture). Keep the product exactly the same — same shape, colors, proportions, no alterations. Add a subtle soft shadow beneath the product to anchor it naturally. Professional product photography composite. IMPORTANT: absolutely no text, no letters, no label, no writing, no logo, no brand name anywhere on the image.`
            }
          ]
        }],
        modalities: ['image', 'text']
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(buildOpenRouterError(res.status, errData?.error?.message))
    }

    const data = await res.json()
    const images = data.choices?.[0]?.message?.images
    if (!images?.length) throw new Error('Aucune image retournée par OpenRouter')
    aiGeneratedImageSrc.value = images[0].image_url.url
  } catch (err) {
    error.value = err.message || "Erreur lors de l'application du fond"
    closeUploadModal()
  } finally {
    aiGenerating.value = false
    applyingBgProductId.value = null
  }
}

async function runEditAi(product) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) { error.value = 'Clé API OpenRouter manquante'; return }

  const imageUrl = currentImageUrl(product)
  if (!imageUrl || usesDefaultImage(product)) return

  const prompt = editAiPrompt.value.trim()
  if (!prompt) return

  editingAiProductId.value = String(product.id)
  editAiPromptOpen.value = false
  error.value = null

  uploadModal.value = { open: true, product, state: 'ai-result', imageSrc: null, historyAction: 'ai' }
  aiGeneratedImageSrc.value = null
  aiGenerating.value = true

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Catalogue Produits Chazal'
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: `You are a professional product photo editor. Apply the following modification to this product image: ${prompt}. Keep the product recognizable and maintain professional product photography quality. Return only the modified image.` }
          ]
        }],
        modalities: ['image', 'text']
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(buildOpenRouterError(res.status, errData?.error?.message))
    }

    const data = await res.json()
    const images = data.choices?.[0]?.message?.images
    if (!images?.length) throw new Error('Aucune image retournée par l\'IA')
    aiGeneratedImageSrc.value = images[0].image_url.url
    editAiPrompt.value = ''
  } catch (err) {
    error.value = err.message || 'Erreur lors de la modification IA'
    closeUploadModal()
  } finally {
    aiGenerating.value = false
    editingAiProductId.value = null
  }
}

async function runWhiteBackground(product) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) { error.value = 'Clé API OpenRouter manquante'; return }

  const imageUrl = currentImageUrl(product)
  if (!imageUrl || usesDefaultImage(product)) return

  whiteBgProductId.value = String(product.id)
  error.value = null
  uploadModal.value = { open: true, product, state: 'ai-result', imageSrc: null, historyAction: 'ai' }
  aiGeneratedImageSrc.value = null
  aiGenerating.value = true

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Catalogue Produits Chazal'
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: 'You are a professional product photo retoucher. Precisely cut out the product from this image, remove the background completely, and place the product on a pure white (#ffffff) background. The output must be landscape orientation (wider than tall, 16:9 ratio). Center the product horizontally and vertically with generous white margins. DO NOT add any shadow whatsoever — no drop shadow, no cast shadow, no ground shadow, no reflection, no gradient beneath the product. The product must float on a perfectly flat, uniform white background with no depth effects. The result must look like a clean, minimalist high-end product catalog shot — no text, no watermarks, no logos.' }
          ]
        }],
        modalities: ['image', 'text']
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(buildOpenRouterError(res.status, errData?.error?.message))
    }

    const data = await res.json()
    const images = data.choices?.[0]?.message?.images
    if (!images?.length) throw new Error('Aucune image retournée par l\'IA')
    aiGeneratedImageSrc.value = images[0].image_url.url
  } catch (err) {
    error.value = err.message || 'Erreur fond blanc IA'
    closeUploadModal()
  } finally {
    aiGenerating.value = false
    whiteBgProductId.value = null
  }
}

function extractCodesFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '').trim()
  const matches = base.match(/\d{4,}/g)
  if (!matches || matches.length === 0) return [base]
  return [...new Set(matches)]
}

async function searchProductByCode(code) {
  try {
    const payload = { code, label: code, ean13: code }
    const url = buildApiUrl(`${API_CONFIG.endpoints.productSearch}?s=${encodeURIComponent(JSON.stringify(payload))}&page=1&per_page=5`)
    const res = await authorizedFetch(url, { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    const results = data.data?.data || []
    return results.length ? results[0] : null
  } catch { return null }
}

function onDropZoneDrop(e) {
  dropZoneOver.value = false
  showDropZone.value = false
  isDragging.value = false
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
  if (files.length) openBatchModal(files)
}

function onDropZoneFileInput(e) {
  showDropZone.value = false
  const files = e.target.files
  if (files?.length) openBatchModal(files)
  e.target.value = ''
}

async function openBatchModal(files) {
  batchModal.value = true
  batchEntries.value = []
  batchProcessing.value = true

  const fileList = Array.from(files)
  const entries = []
  let nextEntryId = 0
  for (const file of fileList) {
    const codes = extractCodesFromFilename(file.name)
    const preview = URL.createObjectURL(file)
    codes.forEach((code, idx) => {
      entries.push({
        id: nextEntryId++, // stable pour :key, indépendant du filtre "sans photo"
        file,
        filename: file.name,
        detectedCode: code,
        product: null,
        preview,
        firstOfFile: idx === 0,
        selected: true,
        status: 'searching'
      })
    })
  }
  batchEntries.value = entries

  for (const entry of batchEntries.value) {
    const found = await searchProductByCode(entry.detectedCode)
    entry.product = found ? mapProducts([found])[0] : null
    entry.status = found ? 'found' : 'not-found'
    if (!found) entry.selected = false
  }

  batchProcessing.value = false
}

async function runBatchUpload() {
  if (batchUploading.value) return
  const toUpload = batchEntries.value.filter(e => e.selected && e.product && e.status === 'found')
  if (!toUpload.length) return
  batchUploading.value = true

  for (const entry of toUpload) {
    entry.status = 'uploading'
    try {
      await uploadProductImage(entry.product, entry.file, 'upload')
      entry.status = 'done'
      entry.selected = false
    } catch {
      entry.status = 'error'
    }
  }

  batchUploading.value = false
  const done = batchEntries.value.filter(e => e.status === 'done').length
  const errors = batchEntries.value.filter(e => e.status === 'error').length
  if (done > 0 && errors === 0) showToast(`${done} image${done > 1 ? 's' : ''} importée${done > 1 ? 's' : ''} avec succès`, 'success')
  else if (done > 0) showToast(`${done} importée${done > 1 ? 's' : ''}, ${errors} erreur${errors > 1 ? 's' : ''}`, 'warning')
  else showToast(`Échec de l'import`, 'error')
}

let _toastId = 0
function showToast(message, type = 'success', duration = 3500) {
  const id = ++_toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
}

async function uploadToLocalShare(file, productCode, size) {
  try {
    const form = new FormData()
    form.append('image', file)
    form.append('productCode', String(productCode))
    form.append('size', size)
    await fetch('http://localhost:3001/upload-local', { method: 'POST', body: form })
  } catch { /* serveur local absent ou inaccessible — on ignore silencieusement */ }
}

// Copie fire-and-forget de la version web vers S3 (dossier séparé de la HD),
// pour que s3-to-bdd-photos-sync la récupère vers la BDD Photos. N'affecte
// jamais l'affichage : contrairement à la HD, cette copie n'est pas ajoutée à
// product.images — l'image affichée reste celle renvoyée par l'API Admin.
async function uploadWebToS3(file, productCode) {
  try {
    const form = new FormData()
    form.append('image', file)
    form.append('productCode', String(productCode))
    await fetch(`${S3_UPLOAD_CONFIG.baseURL}${S3_UPLOAD_CONFIG.endpointWeb}`, { method: 'POST', body: form })
  } catch { /* service S3 injoignable — on ignore silencieusement, non bloquant */ }
}

function closeBatchModal() {
  const seen = new Set()
  batchEntries.value.forEach(e => {
    if (e.preview && !seen.has(e.preview)) { seen.add(e.preview); URL.revokeObjectURL(e.preview) }
  })
  batchEntries.value = []
  batchModal.value = false
}

async function upscaleProductImage(product) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    error.value = 'Clé API OpenRouter manquante — ajouter VITE_OPENROUTER_API_KEY'
    return
  }

  const imageUrl = currentImageUrl(product)
  if (!imageUrl || usesDefaultImage(product)) return

  upscalingProductId.value = String(product.id)
  error.value = null

  try {
    // 1. Appel IA pour upscaler l'image
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Catalogue Produits Chazal'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: 'Upscale and enhance this product photography: improve sharpness, clarity, lighting and details. Keep the exact same product, same angle, pure white seamless background, high resolution commercial packshot style. IMPORTANT: absolutely no text, no letters, no words, no label, no writing, no logo anywhere on the image.' }
          ]
        }],
        modalities: ['image', 'text']
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(buildOpenRouterError(res.status, errData?.error?.message))
    }

    const data = await res.json()
    const images = data.choices?.[0]?.message?.images
    if (!images?.length) throw new Error('Aucune image retournée par OpenRouter')

    const upscaledUrl = images[0].image_url.url

    uploadModal.value = { open: true, product, state: 'ai-result', imageSrc: null, historyAction: 'upscale', imageType: 'HD' }
    aiGeneratedImageSrc.value = upscaledUrl

  } catch (err) {
    error.value = err.message || "Erreur lors de l'amélioration"
  } finally {
    upscalingProductId.value = null
  }
}

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Livvic:wght@400;500;600;700&display=swap');

/* ── RESET ─────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { font: inherit; cursor: pointer; }
select, input { font: inherit; }
img { display: block; max-width: 100%; }
html, body { width: 100%; min-height: 100%; }
#app { width: 100vw; max-width: none !important; margin: 0 !important; padding: 0 !important; }

/* ── TOKENS — charte Maison Chazal ─────── */
:root {
  --bg:            #f5f4f2;
  --surface:       #ffffff;
  --surface-alt:   #faf9f8;
  --border:        #e8e5e0;
  --border-strong: #d0ccc5;
  --brand:         #cc092f;
  --brand-dark:    #a80725;
  --brand-soft:    #fdf0f2;
  --brand-border:  #f5a3b0;
  --gold:          #8f6f4d;
  --text:          #1d1d1b;
  --text-2:        #5a5855;
  --text-3:        #a09d99;
  --danger:        #cc092f;
  --danger-soft:   #fdf0f2;
  --danger-border: #f5a3b0;
  --danger-dark:   #a80725;
  --success:       #1d1d1b;
  --success-soft:  #f2f2f0;
  --success-border:#c8c5c0;
  --warning:       #8f6f4d;
  --r:             6px;
  --r-sm:          4px;
  --r-pill:        9999px;
  --shadow-card:   0 1px 2px rgba(29,29,27,.05), 0 2px 8px rgba(29,29,27,.04);
  --shadow-modal:  0 20px 60px rgba(29,29,27,.2), 0 4px 16px rgba(29,29,27,.1);
  --shadow-panel:  -4px 0 24px rgba(29,29,27,.1);
}

/* ── APP SHELL ─────────────────────────── */
.app {
  min-height: 100vh;
  width: 100%;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  font-family: "Livvic", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}

/* ── HEADER ─────────────────────────────── */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
}

.header-row {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem 1rem;
}
.header-row + .header-row { border-top: 1px solid var(--border); }

.header-row--brand { justify-content: space-between; border-bottom: 2px solid var(--brand) !important; }
.header-row--brand > * { min-width: 0; }
.header-row--search { border-top: none !important; }

.brand { min-width: 0; overflow: hidden; }
.brand-name {
  font-size: .95rem;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: .1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.brand-tagline { font-size: .72rem; color: var(--text-3); margin-top: .1rem; }

.header-tools { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; flex-wrap: wrap; }

/* ENV pill */
.env-pill {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .3rem .7rem;
  border-radius: var(--r-pill);
  border: 1px solid transparent;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  transition: opacity 140ms;
}
.env-pill:hover { opacity: .8; }
.env-pill.prod { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.env-pill.dev  { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.env-indicator { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* Chip */
.chip {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .3rem .65rem;
  border-radius: var(--r-pill);
  font-size: .72rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 140ms;
}
.chip--ghost { background: var(--bg); color: var(--text-2); }
.chip--ghost:hover { background: var(--border); }
.chip--active { background: var(--text); color: #fff; }
.chip-badge { background: var(--danger); color: #fff; font-size: .62rem; font-weight: 700; padding: .1rem .4rem; border-radius: var(--r-pill); }

/* BG selector */
.bg-selector { cursor: pointer; }
.bg-preview-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .3rem .65rem; border-radius: var(--r-pill); background: var(--brand-soft); color: var(--brand); font-size: .72rem; font-weight: 600; border: none; cursor: pointer; }
.bg-picker-wrap { position: relative; }
.bg-picker-overlay { position: fixed; inset: 0; z-index: 99; }
.bg-picker-dropdown { position: absolute; top: calc(100% + 6px); right: 0; z-index: 100; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); box-shadow: 0 8px 32px rgba(0,0,0,.18); padding: .75rem; width: 280px; }
.bg-picker-title { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3); margin-bottom: .55rem; }
.bg-picker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4rem; }
.bg-preset-tile { border: 2px solid transparent; border-radius: 6px; overflow: hidden; cursor: pointer; padding: 0; background: none; display: flex; flex-direction: column; transition: border-color 120ms; }
.bg-preset-tile:hover { border-color: var(--brand); }
.bg-preset-tile--active { border-color: var(--brand); }
.bg-preset-tile img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }
.bg-preset-label { font-size: .58rem; font-weight: 600; color: var(--text-2); padding: 3px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: var(--bg); }
.bg-picker-divider { height: 1px; background: var(--border); margin: .6rem 0; }
.bg-picker-custom { display: flex; align-items: center; gap: .4rem; padding: .38rem .5rem; border-radius: var(--r-sm); font-size: .75rem; font-weight: 500; color: var(--text-2); cursor: pointer; transition: background 120ms; }
.bg-picker-custom:hover { background: var(--surface-alt); }
.bg-picker-clear { display: flex; width: 100%; align-items: center; justify-content: center; margin-top: .35rem; padding: .35rem; border-radius: var(--r-sm); font-size: .72rem; font-weight: 500; color: var(--danger); background: var(--danger-soft); border: none; cursor: pointer; transition: opacity 120ms; }
.bg-picker-clear:hover { opacity: .8; }
.bg-preview-dot { width: 16px; height: 16px; border-radius: 3px; background-size: cover; background-position: center; border: 1px solid var(--border); }

/* Search row */
.header-row--search { gap: .5rem; }

.search-mode-toggle { display: flex; background: var(--bg); border-radius: var(--r-sm); padding: 2px; gap: 2px; flex-shrink: 0; }
.mode-btn { padding: .32rem .65rem; border: none; background: transparent; border-radius: 4px; font-size: .76rem; font-weight: 500; color: var(--text-2); cursor: pointer; transition: all 140ms; white-space: nowrap; }
.mode-btn.active { background: var(--surface); color: var(--brand); font-weight: 600; box-shadow: 0 1px 3px rgba(15,23,42,.1); }

.search-field-wrap { flex: 1; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: .75rem; color: var(--text-3); pointer-events: none; }

.search-input {
  width: 100%;
  padding: .52rem .75rem .52rem 2.2rem;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  font-size: .85rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color 140ms, box-shadow 140ms;
}
.search-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(15,92,168,.1); }
.search-field-wrap.multi-mode .search-input { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }

.supplier-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); box-shadow: var(--shadow-modal); z-index: 50; max-height: 260px; overflow-y: auto; }
.supplier-dropdown--empty { padding: .65rem 1rem; font-size: .8rem; color: var(--text-3); text-align: center; }
.supplier-dropdown-item { display: block; width: 100%; padding: .52rem .9rem; border: none; background: transparent; text-align: left; font-size: .83rem; color: var(--text); cursor: pointer; transition: background 100ms; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.supplier-dropdown-item:hover { background: var(--bg); }
.supplier-dropdown-item--active { background: var(--brand-soft); color: var(--brand); font-weight: 600; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 120ms, transform 120ms; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-4px); }

.multi-badge { position: absolute; right: .5rem; background: #7c3aed; color: #fff; font-size: .65rem; font-weight: 700; padding: .15rem .45rem; border-radius: var(--r-pill); pointer-events: none; }

.btn-search { padding: .52rem 1.1rem; background: var(--brand); color: #fff; border: none; border-radius: var(--r-sm); font-size: .83rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 140ms, transform 140ms; }
.btn-search:hover:not(:disabled) { background: var(--brand-dark); transform: translateY(-1px); }
.btn-search:disabled { opacity: .6; cursor: not-allowed; }
.btn-reset { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1.5px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-3); cursor: pointer; flex-shrink: 0; transition: border-color 140ms, color 140ms; }
.btn-reset:hover { border-color: var(--danger); color: var(--danger); }

/* Filter row */
.header-row--filters { justify-content: space-between; flex-wrap: wrap; gap: .6rem; }
.filters-left { display: flex; gap: .5rem; align-items: flex-end; flex-wrap: wrap; }
.filters-right { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }

.filter-item { display: flex; flex-direction: column; gap: .15rem; }
.filter-label-text { font-size: .65rem; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: .06em; }

.filter-select { padding: .38rem .65rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-size: .78rem; color: var(--text); background: var(--surface); outline: none; cursor: pointer; min-width: 130px; transition: border-color 140ms; }
.filter-select:focus { border-color: var(--brand); }
.filter-select:disabled { opacity: .5; cursor: not-allowed; background: var(--bg); }

/* Image toggle */
.image-toggle { display: inline-flex; align-items: center; gap: .45rem; cursor: pointer; user-select: none; padding: .38rem .75rem; border-radius: var(--r-pill); border: 1.5px solid var(--border); background: var(--surface); transition: border-color 140ms, background 140ms; }
.image-toggle.active { border-color: var(--danger-border); background: var(--danger-soft); }
.image-toggle.unavailable { opacity: .45; cursor: not-allowed; }
.image-toggle input { position: absolute; opacity: 0; pointer-events: none; }

.toggle-switch { width: 32px; height: 18px; border-radius: var(--r-pill); background: #cbd5e1; padding: 2px; display: flex; align-items: center; transition: background 140ms; flex-shrink: 0; }
.image-toggle.active .toggle-switch { background: var(--danger); }
.toggle-knob { width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(15,23,42,.2); transition: transform 140ms; }
.image-toggle.active .toggle-knob { transform: translateX(14px); }
.toggle-text { font-size: .75rem; font-weight: 600; color: var(--text-2); white-space: nowrap; }
.image-toggle.active .toggle-text { color: var(--danger); }

/* ── SUMMARY BAR ────────────────────────── */
.summary-bar { display: flex; align-items: center; justify-content: space-between; padding: .55rem 1rem; background: var(--surface); border-bottom: 1px solid var(--border); gap: 1rem; flex-wrap: wrap; min-height: 48px; }

.summary-stats { display: flex; align-items: center; gap: .85rem; }
.summary-stat { display: flex; align-items: baseline; gap: .3rem; }
.summary-num { font-size: 1.1rem; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; line-height: 1; }
.summary-label { font-size: .7rem; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; }
.summary-stat--danger .summary-num { color: var(--danger); }
.summary-stat--success .summary-num { color: var(--success); }
.summary-divider { width: 1px; height: 24px; background: var(--border-strong); }
.summary-progress { font-size: .75rem; color: var(--text-2); font-style: italic; }

.summary-actions { display: flex; gap: .4rem; align-items: center; }

.btn-action { display: inline-flex; align-items: center; gap: .4rem; padding: .42rem .85rem; border-radius: var(--r-pill); font-size: .76rem; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; transition: background 140ms, transform 140ms; white-space: nowrap; }
.btn-action:disabled { opacity: .45; cursor: not-allowed; }
.btn-action--outline-danger { border-color: var(--danger-border); background: var(--danger-soft); color: var(--danger); }
.btn-action--outline-danger:hover:not(:disabled) { background: #fee2e2; }
.btn-action--dark { background: var(--text); color: #fff; }
.btn-action--dark:hover:not(:disabled) { background: #1e293b; }
.badge-count { background: #fff; color: var(--text); font-size: .65rem; font-weight: 700; padding: .1rem .4rem; border-radius: var(--r-pill); }

/* ── CONTENT & GRID ────────────────────── */
.content { flex: 1; padding: .75rem; width: 100%; max-width: none; margin: 0; }

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

/* ── CARD ───────────────────────────────── */
.card {
  background: var(--surface);
  border-radius: var(--r);
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms;
  animation: fadeUp 240ms ease both;
}

.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
.card--no-image { border-color: var(--brand-border); }
.card--no-image:hover { border-color: var(--brand); }
.card--selected { border-color: var(--brand); box-shadow: 0 0 0 2px var(--brand-soft); }

.card-img-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--bg);
  position: relative;
}

.card-img-wrap--missing { background: var(--brand-soft); }

.photo-stage { width: 100%; height: 100%; position: relative; }
.photo-stage img { width: 100%; height: 100%; object-fit: cover; }

.photo-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border: none; border-radius: 50%; background: rgba(0,0,0,.45); color: #fff; font-size: 1rem; cursor: pointer; display: grid; place-items: center; transition: background 140ms; }
.photo-nav:hover { background: rgba(0,0,0,.65); }
.photo-nav--prev { left: 5px; }
.photo-nav--next { right: 5px; }

.photo-dots { position: absolute; bottom: 5px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; }
.dot { width: 5px; height: 5px; border-radius: 50%; border: none; background: rgba(255,255,255,.5); cursor: pointer; }
.dot.active { background: #fff; }

.no-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--brand-soft); color: var(--brand); }

.badge-no-image { position: absolute; top: 5px; right: 5px; background: var(--brand); color: #fff; font-size: .56rem; font-weight: 700; padding: 2px 6px; border-radius: 3px; letter-spacing: .05em; text-transform: uppercase; pointer-events: none; }
.btn-dl { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; border: none; background: rgba(0,0,0,.45); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 140ms, background 140ms; z-index: 3; }
.photo-stage:hover .btn-dl { opacity: 1; }
.btn-dl:hover { background: rgba(0,0,0,.7); }

.card-processing { position: absolute; inset: 0; background: rgba(255,255,255,.7); display: flex; align-items: center; justify-content: center; }
.card-processing-spinner { width: 22px; height: 22px; border: 2px solid rgba(204,9,47,.2); border-top-color: var(--brand); border-radius: 50%; animation: spin .7s linear infinite; }

.card-body { padding: .45rem .5rem .55rem; display: flex; flex-direction: column; gap: .1rem; }
.product-ref { font-size: .58rem; font-weight: 700; letter-spacing: .06em; color: var(--text-3); text-transform: uppercase; font-variant-numeric: tabular-nums; }
.product-name { font-size: .72rem; font-weight: 600; line-height: 1.3; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* ── PRODUCT PANEL ──────────────────────── */
.panel-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.35); z-index: 30; display: flex; justify-content: flex-end; }
.product-panel { width: min(340px, 92vw); height: 100%; background: var(--surface); border-left: 1px solid var(--border); box-shadow: var(--shadow-panel); display: flex; flex-direction: column; overflow: hidden; }

.product-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; padding: 1rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.panel-tabs { display: flex; flex-shrink: 0; border-bottom: 1px solid var(--border); background: var(--bg); }
.panel-tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: .35rem; padding: .6rem .5rem; border: none; background: transparent; font-size: .75rem; font-weight: 600; color: var(--text-3); cursor: pointer; border-bottom: 2px solid transparent; transition: color 140ms, border-color 140ms; }
.panel-tab:hover { color: var(--text-2); }
.panel-tab--active { color: var(--brand); border-bottom-color: var(--brand); background: var(--surface); }
.panel-empty-desc { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: 2rem 1rem; color: var(--text-3); font-size: .78rem; }
.panel-action--active { background: var(--brand-soft); }
.panel-action--active .panel-action-title { color: var(--brand); }
.edit-ai-form { padding: .65rem 1rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: .5rem; background: var(--bg); }
.edit-ai-textarea { width: 100%; padding: .55rem .75rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-size: .8rem; color: var(--text); background: var(--surface); resize: vertical; min-height: 72px; line-height: 1.5; outline: none; font-family: inherit; transition: border-color 140ms; }
.edit-ai-textarea:focus { border-color: var(--brand); }
.edit-ai-textarea:disabled { opacity: .6; cursor: not-allowed; }
.edit-ai-actions { display: flex; gap: .4rem; justify-content: flex-end; }
.expand-enter-active, .expand-leave-active { transition: opacity 160ms, transform 160ms; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }
.panel-fiche-link { padding: .65rem 1rem; border-bottom: 1px solid var(--border); }
.btn-fiche { display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .9rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-size: .78rem; font-weight: 600; color: var(--text-2); text-decoration: none; background: var(--bg); transition: border-color 140ms, color 140ms, background 140ms; width: 100%; justify-content: center; }
.btn-fiche:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-soft); }
.product-panel-ref { font-size: .68rem; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: .07em; margin-bottom: .2rem; }
.product-panel-name { font-size: .9rem; font-weight: 600; color: var(--text); line-height: 1.3; }

.panel-close-btn { width: 30px; height: 30px; border: 1px solid var(--border); border-radius: var(--r-sm); background: transparent; color: var(--text-2); display: grid; place-items: center; flex-shrink: 0; transition: background 140ms; }
.panel-close-btn:hover { background: var(--bg); }

.product-panel-body { flex: 1; overflow-y: auto; }

.panel-preview { background: var(--bg); aspect-ratio: 4/3; overflow: hidden; }
.panel-preview img { width: 100%; height: 100%; object-fit: contain; cursor: zoom-in; }
.panel-photo-stage { width: 100%; height: 100%; position: relative; }
.panel-photo-stage img { width: 100%; height: 100%; object-fit: contain; }
.panel-photo-counter { position: absolute; top: 6px; right: 8px; font-size: .65rem; font-weight: 700; background: rgba(0,0,0,.45); color: #fff; border-radius: var(--r-pill); padding: 2px 7px; pointer-events: none; }
.panel-no-image { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; color: var(--text-3); cursor: default; }
.panel-no-image span { font-size: .75rem; font-weight: 500; }

.panel-supplier-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .65rem 1rem; border-bottom: 1px solid var(--border); }
.panel-supplier-name { font-size: .8rem; font-weight: 600; color: var(--text-2); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.panel-copy-btn { display: inline-flex; align-items: center; gap: .25rem; padding: .25rem .55rem; border: 1px solid var(--border); border-radius: var(--r-pill); background: var(--surface); color: var(--text-2); font-size: .68rem; font-weight: 500; cursor: pointer; transition: background 140ms; flex-shrink: 0; }
.panel-copy-btn:hover { background: var(--bg); }
.panel-copy-btn.copied { color: var(--success); border-color: var(--success-border); background: var(--success-soft); }

.panel-description-block { padding: .7rem 1rem; border-bottom: 1px solid var(--border); }
.panel-description-label { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text-3); margin-bottom: .3rem; }
.panel-description-text { font-size: .8rem; line-height: 1.55; color: var(--text-2); }

.panel-meta-grid { display: flex; flex-direction: column; gap: 0; border-bottom: 1px solid var(--border); }
.panel-meta-item { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; padding: .42rem 1rem; border-bottom: .5px solid var(--border); }
.panel-meta-item:last-child { border-bottom: none; }
.panel-meta-key { font-size: .68rem; color: var(--text-3); white-space: nowrap; flex-shrink: 0; }
.panel-meta-val { font-size: .78rem; font-weight: 500; color: var(--text); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%; }
.panel-meta-val--mono { font-family: "SF Mono", "Cascadia Code", Consolas, monospace; font-size: .72rem; letter-spacing: .04em; }
.panel-meta-item--images { align-items: flex-start; padding-top: .5rem; padding-bottom: .5rem; }
.panel-meta-val--tags { display: flex; flex-wrap: wrap; gap: .25rem; justify-content: flex-end; }
.img-type-tag { font-size: .58rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; }
.img-type-tag--hd { background: var(--gold); color: #fff; }
.img-type-tag--default { background: var(--border-strong); color: var(--text-2); }
.agency-tag { font-size: .65rem; font-weight: 500; padding: 2px 7px; border-radius: 3px; background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border); }
.img-badge { position: absolute; top: 6px; left: 6px; font-size: .58rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; pointer-events: none; z-index: 2; }
.img-badge--hd { background: #d97706; color: #fff; }
.img-badge--web { background: rgba(0,0,0,.45); color: #fff; }

.panel-section { padding: .75rem 1rem; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: .4rem; }
.panel-section-title { font-size: .65rem; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: .07em; margin-bottom: .1rem; }

.panel-action { display: flex; align-items: center; gap: .65rem; padding: .65rem .75rem; border: 1px solid var(--border); border-radius: var(--r); background: var(--surface); cursor: pointer; text-align: left; transition: background 140ms, border-color 140ms; width: 100%; }
.panel-action:hover:not(:disabled) { background: var(--bg); }
.panel-action:disabled { opacity: .5; cursor: not-allowed; }
.panel-action--danger { border-color: var(--danger-border); }
.panel-action--danger:hover:not(:disabled) { background: var(--danger-soft); }
.panel-action--done { border-color: var(--success-border); background: var(--success-soft); }

.panel-action-icon { font-size: 1rem; width: 28px; text-align: center; flex-shrink: 0; }
.panel-action-content { display: flex; flex-direction: column; gap: .08rem; }
.panel-action-title { font-size: .8rem; font-weight: 600; color: var(--text); display: block; }
.panel-action-desc { font-size: .68rem; color: var(--text-2); display: block; }

/* ── EMPTY STATES ───────────────────────── */
.empty-state { text-align: center; padding: 3.5rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: .4rem; }
.empty-state--compact { padding: 1rem; }
.empty-state--error .empty-title { color: var(--danger); }
.empty-state--welcome { padding-top: 5rem; }
.empty-icon { font-size: 2rem; margin-bottom: .25rem; }
.empty-icon-svg { color: var(--text-3); margin-bottom: .5rem; }
.empty-title { font-size: .95rem; font-weight: 600; color: var(--text); }
.empty-desc { font-size: .8rem; color: var(--text-2); max-width: 350px; line-height: 1.5; }

.spinner { width: 28px; height: 28px; border: 3px solid rgba(15,92,168,.15); border-top-color: var(--brand); border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: .5rem; }

.load-more-sentinel { height: 2px; width: 100%; }

/* ── BUTTONS (btn-sm) ───────────────────── */
.btn-sm { display: inline-flex; align-items: center; gap: .3rem; padding: .42rem .85rem; border-radius: var(--r-pill); font-size: .76rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: background 140ms, opacity 140ms; white-space: nowrap; }
.btn-sm:disabled { opacity: .45; cursor: not-allowed; }
.btn-sm--primary  { background: var(--brand); color: #fff; }
.btn-sm--primary:hover:not(:disabled)   { background: var(--brand-dark); }
.btn-sm--secondary { background: var(--brand-soft); color: var(--brand); border-color: var(--brand-border); }
.btn-sm--secondary:hover:not(:disabled) { background: #dbeafe; }
.btn-sm--ghost  { background: var(--bg); color: var(--text-2); border-color: var(--border); }
.btn-sm--ghost:hover:not(:disabled) { background: var(--border); }
.btn-sm--danger { background: var(--danger); color: #fff; }
.btn-sm--danger:hover:not(:disabled) { background: var(--danger-dark); }
.btn-sm--close  { background: var(--text); color: #fff; }
.btn-sm--close:hover:not(:disabled) { background: #1e293b; }

/* ── MODAL (shared) ─────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(3px); }

.modal { background: var(--surface); border-radius: 14px; box-shadow: var(--shadow-modal); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; width: min(920px, 100%); }

.modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.modal-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.modal--batch { width: min(900px, 96vw); max-height: 85vh; display: flex; flex-direction: column; }
.batch-searching { display: flex; align-items: center; gap: .75rem; padding: 2rem; color: var(--text-2); font-size: .85rem; }
.batch-summary { display: flex; gap: .75rem; padding: .6rem 1rem; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.batch-stat { font-size: .72rem; font-weight: 600; padding: .2rem .55rem; border-radius: var(--r-pill); background: var(--surface); color: var(--text-2); }
.batch-stat--found { background: var(--success-soft); color: var(--success); }
.batch-stat--miss { background: var(--danger-soft); color: var(--danger); }
.batch-table-wrap { overflow: auto; flex: 1; }
.batch-table { width: 100%; border-collapse: collapse; font-size: .78rem; }
.batch-table th { padding: .5rem .75rem; text-align: left; font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-3); border-bottom: 2px solid var(--border); white-space: nowrap; }
.batch-table td { padding: .45rem .75rem; border-bottom: .5px solid var(--border); vertical-align: middle; }
.batch-row--found { background: transparent; }
.batch-row--miss { opacity: .55; }
.batch-row--done td { background: var(--success-soft); }
.batch-row--error td { background: var(--danger-soft); }
.batch-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); display: block; }
.batch-filename { font-size: .7rem; color: var(--text-2); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.batch-code { font-family: monospace; font-size: .74rem; font-weight: 600; color: var(--brand); }
.batch-product { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.batch-not-found { color: var(--text-3); font-style: italic; font-size: .72rem; }
.batch-row--empty td { text-align: center; padding: 1.5rem; color: var(--text-3); font-size: .78rem; }
.batch-filter-toggle { margin-left: auto; }
.batch-status { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: var(--r-pill); text-transform: uppercase; letter-spacing: .04em; }
.batch-status--found { background: var(--success-soft); color: var(--success); }
.batch-status--not-found { background: var(--surface); color: var(--text-3); }
.batch-status--uploading { background: var(--brand-soft); color: var(--brand); }
.batch-status--done { background: var(--success-soft); color: var(--success); }
.batch-status--error { background: var(--danger-soft); color: var(--danger); }

.toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; flex-direction: column; gap: .5rem; pointer-events: none; }
.toast { display: flex; align-items: center; gap: .55rem; padding: .65rem 1rem; border-radius: var(--r-md); font-size: .82rem; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,.18); pointer-events: auto; min-width: 220px; }
.toast--success { background: #166534; color: #dcfce7; }
.toast--error   { background: #991b1b; color: #fee2e2; }
.toast--warning { background: #92400e; color: #fef3c7; }
.toast-enter-active { transition: all 280ms cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active { transition: all 220ms ease; }
.toast-enter-from  { opacity: 0; transform: translateX(60px); }
.toast-leave-to    { opacity: 0; transform: translateX(60px); }
.drop-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(var(--brand-rgb, 220,38,38), .08); backdrop-filter: blur(2px); border: 3px dashed var(--brand); display: flex; align-items: center; justify-content: center; pointer-events: all; }
.drop-overlay-inner { display: flex; flex-direction: column; align-items: center; gap: .75rem; color: var(--brand); text-align: center; pointer-events: none; }
.drop-overlay-title { font-size: 1.4rem; font-weight: 700; letter-spacing: -.01em; }
.drop-overlay-sub { font-size: .82rem; opacity: .7; }
.drop-fade-enter-active { transition: opacity 150ms ease; }
.drop-fade-leave-active { transition: opacity 120ms ease; }
.drop-fade-enter-from, .drop-fade-leave-to { opacity: 0; }
.dropzone-modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 20px 60px rgba(0,0,0,.35); padding: 1.2rem 1.5rem 1.5rem; width: 480px; max-width: 92vw; display: flex; flex-direction: column; gap: 1rem; }
.dropzone-header { display: flex; align-items: center; justify-content: space-between; }
.dropzone-header-title { font-size: .85rem; font-weight: 600; color: var(--text-2); letter-spacing: .02em; text-transform: uppercase; }
.dropzone-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-2); line-height: 1; padding: .25rem .4rem; border-radius: var(--r-sm); }
.dropzone-close:hover { background: var(--surface-2); color: var(--text); }
.dropzone-area { border: 2px dashed var(--border-strong); border-radius: var(--r-md); padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: .75rem; cursor: pointer; transition: border-color 150ms, background 150ms; color: var(--text-2); text-align: center; }
.dropzone-area:hover, .dropzone-area--over { border-color: var(--brand); background: rgba(var(--brand-rgb, 220,38,38), .04); color: var(--text); }
.dropzone-area--over { border-style: solid; }
.dropzone-title { font-size: 1.1rem; font-weight: 600; color: var(--text); }
.dropzone-sub { font-size: .82rem; }
.dropzone-browse { color: var(--brand); text-decoration: underline; }
.dropzone-hint { font-size: .72rem; opacity: .5; }
.modal-subtitle { font-size: .75rem; color: var(--text-2); margin-top: .1rem; }
.modal-header-info { flex: 1; min-width: 0; }
.modal-header-actions { display: flex; gap: .4rem; align-items: center; flex-shrink: 0; }
.modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: .4rem; padding: .85rem 1.2rem; border-top: 1px solid var(--border); flex-shrink: 0; }
.ged-checkbox { display: flex; align-items: center; gap: .4rem; font-size: .78rem; color: var(--text-2); cursor: pointer; margin-right: auto; user-select: none; }
.ged-checkbox input { accent-color: var(--brand); width: 14px; height: 14px; cursor: pointer; }

/* Cart */
.modal--cart .cart-list { flex: 1; overflow-y: auto; padding: .75rem 1.2rem; display: flex; flex-direction: column; gap: .45rem; }
.cart-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: .75rem .9rem; border: 1px solid var(--border); border-radius: var(--r); background: var(--surface-alt); }
.cart-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
.cart-item-name { font-size: .82rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cart-item-code { font-size: .7rem; color: var(--text-3); font-variant-numeric: tabular-nums; }
.cart-item-supplier { font-size: .7rem; color: var(--text-2); }
.cart-item-side { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }

.status-pill { font-size: .62rem; font-weight: 700; padding: .18rem .5rem; border-radius: var(--r-pill); text-transform: uppercase; letter-spacing: .04em; }
.status-pill--no-image  { background: var(--danger-soft);  color: var(--danger);  border: 1px solid var(--danger-border); }
.status-pill--has-image { background: var(--success-soft); color: var(--success); border: 1px solid var(--success-border); }

.btn-remove { padding: .28rem .6rem; border: none; border-radius: var(--r-pill); background: var(--danger-soft); color: var(--danger); font-size: .7rem; font-weight: 600; cursor: pointer; transition: background 140ms; }
.btn-remove:hover { background: #fee2e2; }

/* Stats modal */
.modal--stats { width: min(820px, 100%); }
.stats-progress { padding: .75rem 1.2rem; display: flex; flex-direction: column; gap: .4rem; flex-shrink: 0; }
.stats-progress-track { height: 6px; background: var(--border); border-radius: var(--r-pill); overflow: hidden; }
.stats-progress-fill { height: 100%; background: var(--brand); border-radius: var(--r-pill); transition: width 300ms ease; }
.stats-progress-text { font-size: .75rem; color: var(--text-2); text-align: right; }
.stats-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.stats-summary-row { display: flex; align-items: center; gap: .5rem; padding: .65rem 1.2rem; font-size: .78rem; color: var(--text-2); border-bottom: 1px solid var(--border); flex-shrink: 0; flex-wrap: wrap; }
.sep { color: var(--border-strong); }
.text-danger { color: var(--danger); font-weight: 600; }
.text-danger-bold { color: var(--danger); font-weight: 700; }
.text-warning { color: var(--warning); font-weight: 600; }
.text-success { color: var(--success); font-weight: 600; }
.text-muted { color: var(--text-3); }
.stats-table-wrap { flex: 1; overflow-y: auto; padding: .75rem 1.2rem 1.2rem; }
.stats-table { width: 100%; border-collapse: collapse; font-size: .8rem; }
.stats-table th { padding: .5rem .6rem; font-size: .65rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--text-3); border-bottom: 2px solid var(--border); text-align: left; }
.stats-table td { padding: .45rem .6rem; border-bottom: 1px solid var(--border); color: var(--text); }
.stats-table tr:last-child td { border-bottom: none; }
.stats-table tr:hover td { background: var(--surface-alt); }
.col-num { text-align: right; font-variant-numeric: tabular-nums; }
.col-bar { width: 120px; }
.bar-track { height: 6px; background: var(--border); border-radius: var(--r-pill); overflow: hidden; }
.bar-fill { height: 100%; border-radius: var(--r-pill); transition: width 300ms ease; }

/* Upload modal */
.modal--upload { width: min(560px, 100%); }
.upload-body { flex: 1; overflow-y: auto; padding: 1.2rem; display: flex; flex-direction: column; gap: .75rem; }

.dropzone { border: 2px dashed var(--border-strong); border-radius: var(--r); padding: 2rem 1rem; text-align: center; background: var(--surface-alt); transition: border-color 140ms, background 140ms; }
.dropzone--over { border-color: var(--brand); background: var(--brand-soft); }
.dropzone-content { display: flex; flex-direction: column; align-items: center; gap: .4rem; }
.dropzone-icon { font-size: 1.5rem; color: var(--text-3); margin-bottom: .25rem; }
.dropzone-title { font-size: .88rem; font-weight: 600; color: var(--text); }
.dropzone-sub { font-size: .75rem; color: var(--text-3); margin-bottom: .5rem; }
.btn-upload-file { display: inline-flex; align-items: center; padding: .45rem 1rem; background: var(--brand); color: #fff; border-radius: var(--r-pill); font-size: .78rem; font-weight: 600; cursor: pointer; transition: background 140ms; }
.btn-upload-file:hover { background: var(--brand-dark); }

.upload-divider { text-align: center; font-size: .72rem; color: var(--text-3); display: flex; align-items: center; gap: .75rem; }
.upload-divider::before, .upload-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.btn-ai-trigger { display: flex; align-items: center; gap: .75rem; padding: .85rem 1rem; border: 1px solid var(--border); border-radius: var(--r); background: var(--surface); cursor: pointer; text-align: left; transition: border-color 140ms, background 140ms; width: 100%; }
.btn-ai-trigger:hover { border-color: #7c3aed; background: #faf5ff; }
.ai-trigger-icon { font-size: 1.2rem; width: 32px; text-align: center; flex-shrink: 0; }
.ai-title { display: block; font-size: .82rem; font-weight: 600; color: var(--text); }
.ai-desc  { display: block; font-size: .72rem; color: var(--text-2); margin-top: .1rem; }

.ai-field-group { display: flex; flex-direction: column; gap: .45rem; }
.field-label { font-size: .72rem; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: .05em; }
.field-hint  { font-size: .7rem; color: var(--text-3); margin-top: .15rem; }
.field-input { width: 100%; padding: .55rem .75rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-size: .85rem; color: var(--text); background: var(--surface); outline: none; transition: border-color 140ms; }
.field-input:focus { border-color: var(--brand); }

.ai-models-grid { display: flex; gap: .5rem; flex-wrap: wrap; }
.ai-model-card { flex: 1; min-width: 120px; padding: .65rem .75rem; border: 1.5px solid var(--border); border-radius: var(--r); background: var(--surface); cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: .15rem; transition: border-color 140ms, background 140ms; }
.ai-model-card.active { border-color: #7c3aed; background: #faf5ff; }
.ai-model-name { display: block; font-size: .78rem; font-weight: 600; color: var(--text); }
.ai-model-desc { display: block; font-size: .68rem; color: var(--text-2); }

.ai-options-row { display: flex; gap: .5rem; flex-wrap: wrap; }
.ai-opt { display: inline-flex; align-items: center; gap: .4rem; padding: .38rem .7rem; border-radius: var(--r-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: .78rem; font-weight: 500; cursor: pointer; user-select: none; transition: border-color 140ms, background 140ms; }
.ai-opt.active { border-color: #7c3aed; background: #faf5ff; color: #7c3aed; }
.ai-opt input { position: absolute; opacity: 0; pointer-events: none; }
.ai-opt-check { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid #7c3aed; background: #7c3aed; display: flex; align-items: center; justify-content: center; }
.ai-opt:not(.active) .ai-opt-check { background: transparent; border-color: var(--border-strong); }

.ai-result-body { min-height: 320px; align-items: center; justify-content: center; }
.ai-result-img { width: 100%; max-height: 400px; object-fit: contain; border-radius: var(--r-sm); }

/* Crop */
.crop-wrapper { flex: 1; overflow: hidden; background: #1a1a1a; display: flex; align-items: center; justify-content: center; min-height: 380px; }
.crop-container { position: relative; display: inline-block; cursor: default; user-select: none; max-width: 100%; }
.crop-img { display: block; max-width: 100%; max-height: 480px; object-fit: contain; }
.crop-shade { position: absolute; background: rgba(0,0,0,.55); pointer-events: none; }
.crop-box { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0,0,0,.5); cursor: move; }
.crop-grid-h, .crop-grid-v { position: absolute; background: rgba(255,255,255,.25); pointer-events: none; }
.crop-grid-h { left: 0; right: 0; height: 1px; }
.crop-grid-v { top: 0; bottom: 0; width: 1px; }
.crop-handle { position: absolute; width: 12px; height: 12px; background: #fff; border-radius: 2px; border: 1.5px solid rgba(0,0,0,.3); }
.crop-handle.nw { top: -6px; left: -6px; cursor: nw-resize; }
.crop-handle.ne { top: -6px; right: -6px; cursor: ne-resize; }
.crop-handle.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
.crop-handle.se { bottom: -6px; right: -6px; cursor: se-resize; }
.crop-handle.n  { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.crop-handle.s  { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.crop-handle.w  { left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.crop-handle.e  { right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize; }

/* ── HISTORY PANEL ──────────────────────── */
.history-panel { position: fixed; top: 0; right: 0; width: min(320px, 92vw); height: 100vh; background: var(--surface); border-left: 1px solid var(--border); box-shadow: var(--shadow-panel); z-index: 40; display: flex; flex-direction: column; overflow: hidden; }
.history-panel-header { display: flex; align-items: center; justify-content: space-between; padding: .85rem 1rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.history-panel-title { font-size: .85rem; font-weight: 700; color: var(--text); }
.history-panel-tools { display: flex; gap: .4rem; }
.history-list { flex: 1; overflow-y: auto; }
.history-day { border-bottom: 1px solid var(--border); }
.history-day-header { padding: .5rem 1rem .3rem; font-size: .65rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); background: var(--surface-alt); border-bottom: 1px solid var(--border); }
.history-entry { display: flex; align-items: center; gap: .6rem; padding: .65rem 1rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .12s; }
.history-entry:last-child { border-bottom: none; }
.history-entry:hover { background: var(--surface-alt); }
.history-entry:hover .history-entry-goto { opacity: 1; }
.history-entry-goto { flex-shrink: 0; color: var(--text-3); opacity: 0; transition: opacity .15s; }
.history-entry-icon { font-size: .9rem; width: 20px; text-align: center; flex-shrink: 0; }
.history-entry-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .05rem; }
.history-entry-name { font-size: .78rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-entry-code { font-size: .65rem; color: var(--text-3); font-variant-numeric: tabular-nums; }
.history-entry-action { font-size: .68rem; color: var(--text-2); }
.history-entry-meta { display: flex; flex-direction: column; align-items: flex-end; gap: .2rem; flex-shrink: 0; }
.history-time { font-size: .65rem; color: var(--text-3); font-variant-numeric: tabular-nums; }
.env-pill-mini { font-size: .6rem; font-weight: 700; padding: 1px 5px; border-radius: var(--r-pill); letter-spacing: .04em; }
.env-pill-mini.prod { background: #dcfce7; color: #15803d; }
.env-pill-mini.dev  { background: #fef3c7; color: #b45309; }

/* ── LIGHTBOX ───────────────────────────── */
.lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.9); z-index: 100; display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
.lightbox-close { position: absolute; top: 1.25rem; right: 1.25rem; width: 36px; height: 36px; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; background: rgba(255,255,255,.1); color: #fff; font-size: .9rem; display: grid; place-items: center; cursor: pointer; transition: background 140ms; }
.lightbox-close:hover { background: rgba(255,255,255,.2); }
.lightbox-img { max-width: 92vw; max-height: 90vh; object-fit: contain; border-radius: var(--r-sm); cursor: default; }

/* ── PACKAGING MODAL ────────────────────── */
.modal--packaging { width: min(440px, 100%); padding: 2rem 1.5rem; text-align: center; align-items: center; }
.packaging-icon { font-size: 2rem; margin-bottom: .5rem; }
.packaging-subtitle { font-size: .82rem; color: var(--text-2); margin-bottom: 1.2rem; }
.packaging-choices { display: flex; gap: .75rem; width: 100%; flex-wrap: wrap; }
.packaging-choice { flex: 1; min-width: 140px; display: flex; flex-direction: column; align-items: center; gap: .35rem; padding: 1.1rem 1rem; border: 2px solid var(--border); border-radius: var(--r); background: var(--surface); cursor: pointer; transition: border-color 140ms, background 140ms; }
.packaging-choice--keep:hover { border-color: var(--brand); background: var(--brand-soft); }
.packaging-choice--none:hover { border-color: #7c3aed; background: #faf5ff; }
.packaging-choice-icon { font-size: 1.4rem; }
.packaging-choice-title { font-size: .82rem; font-weight: 700; color: var(--text); }
.packaging-choice-desc  { font-size: .7rem; color: var(--text-2); line-height: 1.4; }

/* ── TRANSITIONS ────────────────────────── */
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes fadeUp  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.panel-slide-enter-active, .panel-slide-leave-active { transition: opacity 220ms ease; }
.panel-slide-enter-active .product-panel, .panel-slide-leave-active .product-panel { transition: transform 220ms ease; }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; }
.panel-slide-enter-from .product-panel, .panel-slide-leave-to .product-panel { transform: translateX(100%); }

.history-slide-enter-active, .history-slide-leave-active { transition: transform 220ms ease, opacity 220ms ease; }
.history-slide-enter-from, .history-slide-leave-to { transform: translateX(100%); opacity: 0; }

/* ── RESPONSIVE ─────────────────────────── */
@media (max-width: 1200px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
  .header-row { padding: .55rem .75rem; }
  .summary-bar { padding: .5rem .75rem; }
  .content { padding: .5rem; }
}
@media (max-width: 680px) {
  .header-row--search { flex-wrap: wrap; }
  .search-mode-toggle { width: 100%; }
  .filters-left, .filters-right { flex-wrap: wrap; }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
</style>
