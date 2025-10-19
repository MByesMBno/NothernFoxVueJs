<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок страницы -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-blue-900 mb-4">Товары</h1>
        <p class="text-xl text-gray-700">Управление ассортиментом handmade изделий</p>
      </div>

      <!-- Управление и статусы -->
      <div class="controls mb-8">
        <Button
          @click="fetchItems"
          :disabled="loading"
          class="control-btn refresh-btn"
          :label="loading ? 'Загрузка...' : 'Обновить'"
        />
        <Button
          @click="clearError"
          v-if="errorMessage"
          class="control-btn clear-btn"
          label="Очистить ошибку"
        />
      </div>

      <!-- Статусы -->
      <div v-if="loading" class="status-card loading-card">
        <i class="pi pi-spin pi-spinner text-2xl mb-4"></i>
        <p>Загрузка товаров...</p>
      </div>

      <div v-else-if="errorMessage" class="status-card error-card">
        <i class="pi pi-exclamation-triangle text-2xl mb-4"></i>
        <p class="mb-4">{{ errorMessage }}</p>
        <Button
          @click="fetchItems"
          class="retry-btn"
          label="Повторить"
        />
      </div>

      <!-- Таблица товаров -->
      <div v-else class="table-container">
        <div class="table-header">
          <h2 class="text-2xl font-bold text-blue-900">Список товаров</h2>
          <div class="count-badge">
            <i class="pi pi-box mr-2"></i>
            Всего: {{ itemsCount }}
          </div>
        </div>

        <div class="table-wrapper">
          <table class="items-table">
            <thead>
              <tr>
                <th class="id-column">ID</th>
                <th class="name-column">Название</th>
                <th class="category-column">Категория</th>
                <th class="tastes-column">Ароматы</th>
                <th class="description-column">Описание</th>
                <th class="price-column">Цена</th>
                <th class="quantity-column">Количество</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="table-row">
                <td class="id-column">
                  <span class="id-badge">{{ item.id }}</span>
                </td>
                <td class="name-column">
                  <div class="name-content">
                    <i class="pi pi-tag mr-2 text-amber-600"></i>
                    {{ item.name }}
                  </div>
                </td>
                <td class="category-column">
                  <span class="category-badge">{{ item.category_id }}</span>
                </td>
                <td class="tastes-column">
                  <div class="tastes-content">
                    <i class="pi pi-leaf mr-2 text-green-600"></i>
                    {{ item.tastes }}
                  </div>
                </td>
                <td class="description-column">
                  <p class="description-text">{{ item.description }}</p>
                </td>
                <td class="price-column">
                  <span class="price-tag">{{ item.price }} ₽</span>
                </td>
                <td class="quantity-column">
                  <span class="quantity-badge" :class="{ 'low-stock': item.quantity < 10 }">
                    {{ item.quantity }} шт.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пустое состояние -->
        <div v-if="itemsCount === 0" class="empty-state">
          <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Товаров пока нет</h3>
          <p class="text-gray-500">Добавьте первый товар в ваш магазин</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useItemsStore } from '@/stores/itemsStore';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import Button from 'primevue/button';

const itemsStore = useItemsStore();

const {
    items,
    loading,
    errorMessage,
    getItemsCount
} = storeToRefs(itemsStore);

const itemsCount = getItemsCount;

const {
    fetchItems,
    clearError
} = itemsStore;

onMounted((): void => {
    fetchItems();
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
  padding: 1rem 1.5rem;
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
  width: 80px;
}

.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.75rem;
}

.name-column {
  width: 200px;
  min-width: 180px;
}

.name-content {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1e3a8a;
}

.category-column {
  width: 120px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 0.75rem;
}

.tastes-column {
  width: 200px;
  min-width: 180px;
}

.tastes-content {
  display: flex;
  align-items: center;
  color: #065f46;
}

.description-column {
  width: 400px;
  min-width: 300px;
}

.description-text {
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-column {
  width: 120px;
  text-align: right;
}

.price-tag {
  font-weight: 700;
  color: #059669;
  font-size: 1.125rem;
}

.quantity-column {
  width: 120px;
  text-align: center;
}

.quantity-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #d1fae5;
  color: #065f46;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.quantity-badge.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .items-table th,
  .items-table td {
    padding: 0.75rem 1rem;
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
