<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-blue-900 mb-4">Товары</h1>
        <p class="text-xl text-gray-700">Управление товарами handmade изделий</p>
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
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
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
        <p>Загрузка товаров...</p>
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


      <div v-else class="table-container">
        <div class="table-header">
          <h2 class="text-2xl font-bold text-blue-900">Список товаров</h2>
          <div class="flex items-center gap-4">
            <div class="count-badge">
              <i class="pi pi-shopping-bag mr-2"></i>
              Всего: {{ itemsCount }}
            </div>
            <div class="text-sm text-gray-600">
              Страница: {{ pagination.current_page }} из {{ pagination.last_page }}
            </div>
          </div>
        </div>

        <div class="table-wrapper text-gray-700">
          <table class="items-table">
            <thead>
              <tr>
                <th class="id-column">ID</th>
                <th class="name-column">Название товара</th>
                <th class="description-column">Описание</th>
                <th class="price-column">Цена</th>
                <th class="category-column">Категория ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="table-row">
                <td class="id-column">
                  <span class="id-badge">{{ item.id }}</span>
                </td>
                <td class="name-column">
                  <div class="name-content">
                    <i class="pi pi-shopping-bag mr-3 text-amber-600"></i>
                    <div>
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-slug">арт: {{ item.id.toString().padStart(6, '0') }}</div>
                    </div>
                  </div>
                </td>
                <td class="description-column">
                  <p class="description-text">{{ item.description }}</p>
                </td>
                <td class="price-column">
                  <span class="price-badge">{{ formatPrice(item.price) }}</span>
                </td>
                <td class="category-column">
                  <span class="category-badge">{{ item.category_id }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>


      <div v-if="itemsCount > 0" class="pagination-container">
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


        <div v-if="itemsCount === 0" class="empty-state">
          <i class="pi pi-shopping-cart text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Товаров пока нет</h3>
          <p class="text-gray-500">Добавьте первый товар для вашего магазина</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useItemStore } from '@/stores/itemsStore';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';
import Button from 'primevue/button';

const itemStore = useItemStore();
const perPage = ref(5);

const {
    items,
    loading,
    errorMessage,
    getItemsCount,
    getPagination,
    hasNextPage,
    hasPrevPage
} = storeToRefs(itemStore);

const itemsCount = getItemsCount;
const pagination = getPagination;

const {
    fetchItems,
    clearError,
    nextPage,
    prevPage,
    goToPage,
    changePerPage: changePerPageAction
} = itemStore;


const handleRefresh = (): void => {
  fetchItems(pagination.value.current_page, perPage.value);
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

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price);
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
  fetchItems(1, perPage.value);
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

.table-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.table-header {
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

.table-wrapper {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;
}

.items-table th {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  color: white;
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  vertical-align: top;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child td {
  border-bottom: none;
}

.id-column {
  width: 100px;
}

.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 3rem;
}

.name-column {
  width: 250px;
  min-width: 200px;
}

.name-content {
  display: flex;
  align-items: flex-start;
}

.item-name {
  font-weight: 700;
  color: #1e3a8a;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.item-slug {
  color: #6b7280;
  font-size: 0.75rem;
  font-family: monospace;
}

.description-column {
  min-width: 400px;
}

.description-text {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.95rem;
}

.price-column {
  width: 150px;
}

.price-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 5rem;
}

.category-column {
  width: 120px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 3rem;
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

@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .items-table th,
  .items-table td {
    padding: 1rem;
  }

  .name-column {
    min-width: 200px;
  }

  .description-column {
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }

  .control-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
