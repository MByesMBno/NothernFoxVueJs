<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-blue-900 mb-4">Категории</h1>
        <p class="text-xl text-gray-700">Управление категориями handmade изделий</p>
      </div>

      <div class="controls mb-8 flex flex-wrap gap-4 justify-center items-center">
        <Button
          @click="handleRefresh"
          :disabled="loading"
          class="control-btn refresh-btn"
          :label="loading ? 'Загрузка...' : 'Обновить'"
        />

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Элементов на странице:</label>
          <select
            v-model="perPage"
            @change="handlePerPageChange"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="18">18</option>
            <option value="24">24</option>
          </select>
        </div>

        <Button
          @click="clearError"
          v-if="errorMessage"
          class="control-btn clear-btn"
          label="Очистить ошибку"
        />
      </div>

      <div v-if="loading" class="status-card loading-card">
        <i class="pi pi-spin pi-spinner text-2xl mb-4"></i>
        <p>Загрузка категорий...</p>
      </div>

      <div v-else-if="errorMessage" class="status-card error-card">
        <i class="pi pi-exclamation-triangle text-2xl mb-4"></i>
        <p class="mb-4">{{ errorMessage }}</p>
        <Button
          @click="handleRefresh"
          class="retry-btn"
          label="Повторить"
        />
      </div>

      <div v-else class="categories-container">
        <div class="categories-header">
          <h2 class="text-2xl font-bold text-blue-900">Список категорий</h2>
          <div class="flex items-center gap-4">
            <div class="count-badge">
              <i class="pi pi-folder mr-2"></i>
              Всего: {{ categoriesCount }}
            </div>
            <div class="text-sm text-gray-600">
              Страница: {{ pagination.current_page }} из {{ pagination.last_page }}
            </div>
          </div>
        </div>

        <div v-if="categoriesCount > 0" class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
          >
            <div class="category-image-container">
              <div class="category-image-wrapper">
                <img
                  :src="getCategoryImageUrl(category.id)"
                  :alt="category.name"
                  class="category-image"
                  @load="handleImageLoad(category.id)"
                  @error="handleImageError(category.id)"
                />
                <div v-if="!loadedImages[category.id]" class="image-skeleton">
                  <i class="pi pi-image text-3xl text-gray-400"></i>
                  <p class="mt-2 text-sm text-gray-500">Загрузка изображения...</p>
                </div>

                <div class="category-name-overlay">
                  <h3 class="category-title">{{ category.name }}</h3>
                </div>

                <div class="category-overlay">
                  <div class="overlay-content">
                    <i class="pi pi-eye text-3xl mb-3"></i>
                    <p class="overlay-description">{{ category.description }}</p>
                    <Button
                      class="products-btn"
                      label="Товары"
                      icon="pi pi-shopping-bag"
                      @click.stop="goToCategoryProducts(category.id)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-id">ID: {{ category.id }}</div>
            </div>
          </div>
        </div>

        <div v-if="categoriesCount > 0" class="pagination-container">
          <div class="flex justify-between items-center p-4 border-t bg-gradient-to-br from-amber-50 to-yellow-50">
            <Button
              @click="handlePrevPage"
              :disabled="!hasPrevPage || loading"
              icon="pi pi-chevron-left"
              class="pagination-btn"
              label="Назад"
            />

            <div class="flex gap-2">
              <button
                v-for="pageNum in visiblePages"
                :key="pageNum"
                @click="handlePageClick(pageNum)"
                :disabled="loading || pageNum === '...'"
                :class="[
                  'page-btn',
                  pageNum === pagination.current_page ? 'page-btn-active' : 'page-btn-inactive'
                ]"
              >
                {{ pageNum }}
              </button>
            </div>

            <Button
              @click="handleNextPage"
              :disabled="!hasNextPage || loading"
              icon="pi pi-chevron-right"
              iconPos="right"
              class="pagination-btn"
              label="Вперед"
            />
          </div>
        </div>

        <div v-if="categoriesCount === 0" class="empty-state">
          <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Категорий пока нет</h3>
          <p class="text-gray-500">Создайте первую категорию для ваших товаров</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '@/stores/categoryStore';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed, reactive } from 'vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();
const categoryStore = useCategoryStore();
const perPage = ref(12);

// Reactive state для отслеживания загрузки изображений
const loadedImages = reactive<{ [key: number]: boolean }>({});
const imageErrors = reactive<{ [key: number]: boolean }>({});

const {
    categories,
    loading,
    errorMessage,
    getCategoriesCount,
    getPagination,
    hasNextPage,
    hasPrevPage
} = storeToRefs(categoryStore);

const categoriesCount = getCategoriesCount;
const pagination = getPagination;

const {
    fetchCategories,
    clearError,
    nextPage,
    prevPage,
    goToPage,
    changePerPage: changePerPageAction
} = categoryStore;

const handleRefresh = (): void => {
  fetchCategories(pagination.value.current_page, perPage.value);
};

const handlePerPageChange = (): void => {
  changePerPageAction(perPage.value);
};

const handleNextPage = (): void => {
  nextPage();
};

const handlePrevPage = (): void => {
  prevPage();
};

const handlePageClick = (page: string | number): void => {
  if (typeof page === 'number') {
    goToPage(page);
  }
};

const goToCategoryProducts = (categoryId: number): void => {
  router.push(`/categories/${categoryId}/products`);
};

// Функция для получения URL изображения категории
const getCategoryImageUrl = (categoryId: number): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return `${backendUrl}/categories/${categoryId}/image`;
};

// Обработчик успешной загрузки изображения
const handleImageLoad = (categoryId: number): void => {
  loadedImages[categoryId] = true;
};

// Обработчик ошибки загрузки изображения
const handleImageError = (categoryId: number): void => {
  imageErrors[categoryId] = true;
  loadedImages[categoryId] = true; // Помечаем как загруженное, чтобы скрыть скелетон
};

// Fallback градиент для случаев, когда изображение не загружается
const getCategoryGradient = (id: number): string => {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-red-500 to-orange-600',
    'from-green-500 to-teal-600',
    'from-yellow-500 to-amber-600',
    'from-indigo-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-purple-500 to-indigo-600',
    'from-cyan-500 to-blue-500'
  ];
  return colors[id % colors.length];
};

const visiblePages = computed<(string | number)[]>(() => {
  const current = pagination.value.current_page;
  const last = pagination.value.last_page;

  if (last <= 1) return [1];

  const delta = 2;
  const range = [];
  const rangeWithDots: (string | number)[] = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < last - 1) {
    rangeWithDots.push('...', last);
  } else if (last > 1) {
    rangeWithDots.push(last);
  }

  return rangeWithDots;
});

onMounted((): void => {
  fetchCategories(1, perPage.value);
});
</script>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.control-btn {
  border: none !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
}

.refresh-btn {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%) !important;
  color: white !important;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%) !important;
}

.clear-btn {
  background: #f59e0b !important;
  color: #1e3a8a !important;
}

.clear-btn:hover {
  background: #eab308 !important;
}

.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.loading-card {
  color: #1e3a8a;
}

.error-card {
  color: #dc2626;
}

.retry-btn {
  background: #dc2626 !important;
  border: none !important;
  color: white !important;
}

.retry-btn:hover {
  background: #b91c1c !important;
}

.categories-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.count-badge {
  display: flex;
  align-items: center;
  background: #1e3a8a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.category-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.category-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.category-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.category-card:hover .category-image {
  transform: scale(1.05);
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
}

.category-name-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.category-card:hover .category-name-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.category-title {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 0 1rem;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 1rem;
}

.overlay-content .pi {
  color: white;
}

.overlay-description {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.products-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
}

.products-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
}

.category-info {
  padding: 1.5rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.category-description {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-id {
  color: #9ca3af;
  font-size: 0.8rem;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.pagination-container {
  background: #f8fafc;
}

.pagination-btn {
  border: 1px solid #d1d5db !important;
  background: white !important;
  color: #374151 !important;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6 !important;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 2.5rem;
  cursor: pointer;
}

.page-btn-active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
}

.page-btn-inactive {
  background: white;
  color: #374151;
}

.page-btn-inactive:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding: 1rem;
    gap: 1rem;
  }

  .categories-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
