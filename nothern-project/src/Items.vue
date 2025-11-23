<template>
  <div class="items-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка товаров...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ errorMessage }}</p>
      <button @click="retryLoading" class="retry-btn">Попробовать снова</button>
    </div>

    <div v-else class="items-grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="item-card"
      >
        <div class="item-image-container">
          <img
            v-if="hasImages(item)"
            :src="getImageUrl(item.id)"
            :alt="item.name"
            class="item-image"
            @error="handleImageError(item.id)"
            @load="handleImageLoad(item.id)"
          />
          <div
            v-else
            class="item-image-placeholder"
            :style="{ background: getGradientPlaceholder(item.id) }"
          >
            <span class="placeholder-text">Нет изображения</span>
          </div>

          <div v-if="item.images && item.images.length > 1" class="image-badge">
            +{{ item.images.length - 1 }}
          </div>
        </div>

        <div class="item-info">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-description" v-if="item.description">
            {{ truncateDescription(item.description) }}
          </p>
          <p v-else class="no-description">Описание отсутствует</p>

          <div class="item-meta">
            <span class="item-price">{{ formatPrice(item.price) }} ₽</span>
            <span v-if="item.category" class="item-category">
              {{ item.category.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !errorMessage && items.length > 0" class="pagination-container">
      <div class="pagination-info">
        Показано {{ getDisplayedItems }} из {{ pagination.total }} товаров
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

    <div v-if="!loading && !errorMessage && items.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>Товары не найдены</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useItemStore, type ItemWithImage } from '@/stores/itemsStore';

// Пропсы компонента
interface Props {
  categoryId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  categoryId: undefined
});

const itemStore = useItemStore();

// Реактивные данные
const loading = computed(() => itemStore.loading);
const errorMessage = computed(() => itemStore.errorMessage);
const items = computed(() => itemStore.getItems);
const pagination = computed(() => itemStore.getPagination);
const hasNextPage = computed(() => itemStore.hasNextPage);
const hasPrevPage = computed(() => itemStore.hasPrevPage);

// Кэш для обработки ошибок изображений
const imageErrors = ref<Set<number>>(new Set());

// Количество элементов на странице
const perPage = ref(pagination.value.per_page || 5);

// Загрузка товаров при монтировании или изменении categoryId
onMounted(() => {
  loadItems();
});

// Следим за изменением categoryId
watch(
  () => props.categoryId,
  (newCategoryId) => {
    loadItems();
  }
);

// Следим за изменением per_page из store
watch(
  () => pagination.value.per_page,
  (newPerPage) => {
    if (newPerPage && newPerPage !== perPage.value) {
      perPage.value = newPerPage;
    }
  }
);

// Загрузка товаров
const loadItems = () => {
  if (props.categoryId) {
    itemStore.fetchItemsByCategory(props.categoryId, 1, perPage.value);
  } else {
    itemStore.fetchItems(1, perPage.value);
  }
  imageErrors.value.clear();
};


// Вычисляемые свойства для пагинации
const getDisplayedItems = computed(() => {
  const start = (pagination.value.current_page - 1) * pagination.value.per_page + 1;
  const end = Math.min(pagination.value.current_page * pagination.value.per_page, pagination.value.total);
  return `${start}-${end}`;
});

// Видимые страницы для пагинации (только числа)
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

// Логика отображения элементов пагинации
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

// Загрузка товаров при монтировании
onMounted(() => {
  itemStore.fetchItems(1, perPage.value);
});

// Следим за изменением per_page из store
watch(
  () => pagination.value.per_page,
  (newPerPage) => {
    if (newPerPage && newPerPage !== perPage.value) {
      perPage.value = newPerPage;
    }
  }
);

// Проверка наличия изображений у товара
const hasImages = (item: ItemWithImage): boolean => {
  return !!(item.images && item.images.length > 0 && !imageErrors.value.has(item.id));
};

// Получение URL изображения
const getImageUrl = (itemId: number): string => {
  if (imageErrors.value.has(itemId)) {
    return '';
  }
  return itemStore.getItemImageUrlSync(itemId);
};

// Обработка ошибки загрузки изображения
const handleImageError = (itemId: number) => {
  imageErrors.value.add(itemId);
  console.warn(`Ошибка загрузки изображения для товара ${itemId}`);
};

// Обработка успешной загрузки изображения
const handleImageLoad = (itemId: number) => {
  imageErrors.value.delete(itemId);
};

// Получение градиентного плейсхолдера
const getGradientPlaceholder = (itemId: number): string => {
  return itemStore.getGradientPlaceholder(itemId);
};

// Обрезка длинного описания
const truncateDescription = (description: string, maxLength: number = 100): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

// Форматирование цены
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

// Навигация по страницам
const nextPage = () => {
  if (props.categoryId) {
    itemStore.fetchItemsByCategory(props.categoryId, pagination.value.current_page + 1, pagination.value.per_page);
  } else {
    itemStore.nextPage();
  }
};

const prevPage = () => {
  if (props.categoryId) {
    itemStore.fetchItemsByCategory(props.categoryId, pagination.value.current_page - 1, pagination.value.per_page);
  } else {
    itemStore.prevPage();
  }
};

// Переход на конкретную страницу
const goToPage = (page: number) => {
  if (props.categoryId) {
    itemStore.fetchItemsByCategory(props.categoryId, page, pagination.value.per_page);
  } else {
    itemStore.goToPage(page);
  }
};

// Изменение количества элементов на странице
const changePerPage = () => {
  if (props.categoryId) {
    itemStore.fetchItemsByCategory(props.categoryId, 1, Number(perPage.value));
  } else {
    itemStore.changePerPage(Number(perPage.value));
  }
};

// Повторная попытка загрузки
const retryLoading = () => {
  itemStore.clearError();
  itemStore.clearImageCache();
  imageErrors.value.clear();
  loadItems();
};
</script>

<style scoped>
.items-container {
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.item-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-card:hover .item-image {
  transform: scale(1.05);
}

.item-image-placeholder {
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

.item-info {
  padding: 16px;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.item-description {
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.no-description {
  color: #999;
  font-style: italic;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.item-price {
  font-size: 20px;
  font-weight: 700;
  color: #27ae60;
}

.item-category {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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

  .item-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
