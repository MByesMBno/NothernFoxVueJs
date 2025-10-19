<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Заголовок страницы -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-blue-900 mb-4">Категории</h1>
        <p class="text-xl text-gray-700">Управление категориями handmade изделий</p>
      </div>

      <!-- Управление и статусы -->
      <div class="controls mb-8">
        <Button
          @click="fetchCategories"
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
        <p>Загрузка категорий...</p>
      </div>

      <div v-else-if="errorMessage" class="status-card error-card">
        <i class="pi pi-exclamation-triangle text-2xl mb-4"></i>
        <p class="mb-4">{{ errorMessage }}</p>
        <Button
          @click="fetchCategories"
          class="retry-btn"
          label="Повторить"
        />
      </div>

      <!-- Таблица категорий -->
      <div v-else class="table-container">
        <div class="table-header">
          <h2 class="text-2xl font-bold text-blue-900">Список категорий</h2>
          <div class="count-badge">
            <i class="pi pi-folder mr-2"></i>
            Всего: {{ categoriesCount }}
          </div>
        </div>

        <div class="table-wrapper">
          <table class="categories-table">
            <thead>
              <tr>
                <th class="id-column">ID</th>
                <th class="name-column">Название категории</th>
                <th class="description-column">Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category.id" class="table-row">
                <td class="id-column">
                  <span class="id-badge">{{ category.id }}</span>
                </td>
                <td class="name-column">
                  <div class="name-content">
                    <i class="pi pi-folder mr-3 text-amber-600"></i>
                    <div>
                      <div class="category-name">{{ category.name }}</div>
                      <div class="category-slug">slug: {{ category.name.toLowerCase().replace(/\s+/g, '-') }}</div>
                    </div>
                  </div>
                </td>
                <td class="description-column">
                  <p class="description-text">{{ category.description }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пустое состояние -->
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
import { onMounted } from 'vue';
import Button from 'primevue/button';

const categoryStore = useCategoryStore();

const {
    categories,
    loading,
    errorMessage,
    getCategoriesCount
} = storeToRefs(categoryStore);

const categoriesCount = getCategoriesCount;

const {
    fetchCategories,
    clearError
} = categoryStore;

onMounted((): void => {
    fetchCategories();
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

.categories-table {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;
}

.categories-table th {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  color: white;
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.categories-table td {
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
  width: 300px;
  min-width: 250px;
}

.name-content {
  display: flex;
  align-items: flex-start;
}

.category-name {
  font-weight: 700;
  color: #1e3a8a;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.category-slug {
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

  .categories-table th,
  .categories-table td {
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
