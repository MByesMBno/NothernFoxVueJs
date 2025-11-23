<template>
  <div class="categories-container">
    <!-- Хлебные крошки -->
    <div v-if="selectedCategory" class="breadcrumbs">
      <button @click="clearSelectedCategory" class="breadcrumb-btn">
        ← Все категории
      </button>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ selectedCategory.name }}</span>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ selectedCategory ? 'Загрузка товаров...' : 'Загрузка категорий...' }}</p>
    </div>

    <div v-else-if="errorMessage" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ errorMessage }}</p>
      <button @click="retryLoading" class="retry-btn">Попробовать снова</button>
    </div>

    <!-- Если выбрана категория, показываем товары -->
    <div v-else-if="selectedCategory" class="items-section">
      <div class="category-header">
        <h1 class="category-title">{{ selectedCategory.name }}</h1>
        <p v-if="selectedCategory.description" class="category-description-full">
          {{ selectedCategory.description }}
        </p>
      </div>

      <ItemsComponent :category-id="selectedCategory.id" />
    </div>

    <!-- Иначе показываем список категорий -->
    <div v-else>
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
          @click="selectCategory(category)"
        >
          <div class="category-image-container">
            <img
              v-if="hasImages(category)"
              :src="getImageUrl(category.id)"
              :alt="category.name"
              class="category-image"
              @error="handleImageError(category.id)"
              @load="handleImageLoad(category.id)"
            />
            <div
              v-else
              class="category-image-placeholder"
              :style="{ background: getGradientPlaceholder(category.id) }"
            >
              <span class="placeholder-text">Нет изображения</span>
            </div>
            
            <div class="category-overlay">
              <span class="view-products-text">Смотреть товары</span>
            </div>
          </div>

          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-description" v-if="category.description">
              {{ truncateDescription(category.description) }}
            </p>
            <p v-else class="no-description">Описание отсутствует</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !errorMessage && categories.length > 0" class="pagination-container">
      <div class="pagination-info">
        Показано {{ getDisplayedItems }} из {{ pagination.total }} категорий
      </div>

      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="!hasPrevPage"
          class="pagination-btn pagination-nav"
          title="Предыдущая страница"
        >
          <span class="pagination-icon">←</span>
          Назад
        </button>

        <div class="page-numbers">
          <button
            v-if="showFirstPage"
            @click="goToPage(1)"
            class="page-btn"
            :class="{ active: pagination.current_page === 1 }"
          >
            1
          </button>

          <span v-if="showLeftEllipsis" class="page-ellipsis">...</span>

          <button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            @click="goToPage(pageNum)"
            class="page-btn"
            :class="{ 
              active: pagination.current_page === pageNum,
              'current-page': pagination.current_page === pageNum
            }"
          >
            {{ pageNum }}
          </button>
          <span v-if="showRightEllipsis" class="page-ellipsis">...</span>
          <button
            v-if="showLastPage"
            @click="goToPage(pagination.last_page)"
            class="page-btn"
            :class="{ active: pagination.current_page === pagination.last_page }"
          >
            {{ pagination.last_page }}
          </button>
        </div>
        <button 
          @click="nextPage" 
          :disabled="!hasNextPage"
          class="pagination-btn pagination-nav"
          title="Следующая страница"
        >
          Вперед
          <span class="pagination-icon">→</span>
        </button>
      </div>

    <div class="per-page-selector">
        <label for="perPageSelect" class="per-page-label">На странице:</label>
        <select 
          id="perPageSelect"
          v-model="perPage" 
          @change="changePerPage"
          class="per-page-select"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>

    <div v-if="!loading && !errorMessage && !selectedCategory && categories.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <p>Категории не найдены</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useCategoryStore, type CategoryWithImage } from '@/stores/categoryStore';

const categoryStore = useCategoryStore();

const loading = computed(() => categoryStore.loading);
const errorMessage = computed(() => categoryStore.errorMessage);
const categories = computed(() => categoryStore.getCategories);
const pagination = computed(() => categoryStore.getPagination);
const hasNextPage = computed(() => categoryStore.hasNextPage);
const hasPrevPage = computed(() => categoryStore.hasPrevPage);

const selectedCategory = ref<CategoryWithImage | null>(null);
const imageErrors = ref<Set<number>>(new Set());

const perPage = ref(pagination.value.per_page || 5);

const getDisplayedItems = computed(() => {
  const start = (pagination.value.current_page - 1) * pagination.value.per_page + 1;
  const end = Math.min(pagination.value.current_page * pagination.value.per_page, pagination.value.total);
  return `${start}-${end}`;
});

onMounted(() => {
  categoryStore.fetchCategories(1, perPage.value);
});

// Выбор категории
const selectCategory = async (category: CategoryWithImage) => {
  selectedCategory.value = category;
  // Прокрутка к верху страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Очистка выбранной категории
const clearSelectedCategory = () => {
  selectedCategory.value = null;
  // Прокрутка к верху страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const visiblePages = computed((): number[] => {
  const current = pagination.value.current_page;
  const last = pagination.value.last_page;
  const delta = 2;
  
  if (last <= 1) return [];
  
  const pages: number[] = [];
  const start = Math.max(2, current - delta);
  const end = Math.min(last - 1, current + delta);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});


const showFirstPage = computed(() => {
  return pagination.value.current_page > 3 && pagination.value.last_page > 5;
});

const showLastPage = computed(() => {
  return pagination.value.current_page < pagination.value.last_page - 2 && pagination.value.last_page > 5;
});

const showLeftEllipsis = computed(() => {
  return pagination.value.current_page > 3 && pagination.value.last_page > 5;
});

const showRightEllipsis = computed(() => {
  return pagination.value.current_page < pagination.value.last_page - 2 && pagination.value.last_page > 5;
});


onMounted(() => {
  categoryStore.fetchCategories(1, perPage.value);
});


watch(
  () => pagination.value.per_page,
  (newPerPage) => {
    if (newPerPage && newPerPage !== perPage.value) {
      perPage.value = newPerPage;
    }
  }
);


const hasImages = (category: CategoryWithImage): boolean => {
  return !!(category.images && category.images.length > 0 && !imageErrors.value.has(category.id));
};


const getImageUrl = (categoryId: number): string => {
  if (imageErrors.value.has(categoryId)) {
    return '';
  }
  return categoryStore.getCategoryImageUrlSync(categoryId);
};


const handleImageError = (categoryId: number) => {
  imageErrors.value.add(categoryId);
  console.warn(`Ошибка загрузки изображения для категории ${categoryId}`);
};

const handleImageLoad = (categoryId: number) => {
  imageErrors.value.delete(categoryId);
};

const getGradientPlaceholder = (categoryId: number): string => {
  return categoryStore.getGradientPlaceholder(categoryId);
};


const truncateDescription = (description: string, maxLength: number = 100): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};


const nextPage = () => {
  categoryStore.nextPage();
};

const prevPage = () => {
  categoryStore.prevPage();
};

const goToPage = (page: number) => {
  categoryStore.goToPage(page);
};

const changePerPage = () => {
  categoryStore.changePerPage(Number(perPage.value));
};

const retryLoading = () => {
  categoryStore.clearError();
  categoryStore.clearImageCache();
  imageErrors.value.clear();
  categoryStore.fetchCategories(1, perPage.value);
};
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.breadcrumb-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.breadcrumb-btn:hover {
  background: #e3f2fd;
}

.breadcrumb-separator {
  color: #6c757d;
}

.breadcrumb-current {
  color: #2c3e50;
  font-weight: 600;
}

/* Стили для заголовка категории */
.category-header {
  margin-bottom: 32px;
  text-align: center;
}

.category-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.category-description-full {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}


.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  background: #fee;
  border-radius: 8px;
  border: 1px solid #fcc;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #c0392b;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.category-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.category-card:hover .category-image {
  transform: scale(1.05);
}

.category-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
}

.placeholder-text {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.image-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category-info {
  padding: 16px;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.category-description {
  color: #666;
  line-height: 1.4;
  margin: 0;
  font-size: 14px;
}

.no-description {
  color: #999;
  font-style: italic;
  margin: 0;
  font-size: 14px;
}

/* Стили для пагинации */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  color: #3498db;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-btn.current-page {
  background: #2980b9;
  color: white;
  border-color: #2980b9;
  font-weight: 600;
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-icon {
  font-size: 16px;
  font-weight: 600;
}

/* Стили для выбора количества элементов */
.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.per-page-label {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.per-page-select {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: border-color 0.2s;
}

.per-page-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .pagination-container {
    padding: 16px;
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  
  .page-numbers {
    order: 3;
    margin-top: 12px;
    justify-content: center;
    width: 100%;
  }
  
  .per-page-selector {
    order: 2;
  }
}

@media (max-width: 480px) {
  .page-numbers {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .pagination-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.view-products-text {
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 8px 16px;
  background: rgba(52, 152, 219, 0.9);
  border-radius: 20px;
}
</style>