<template>
  <div class="items-container">
    <!-- Управление и статусы -->
    <div class="controls">
      <button @click="fetchItems" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Обновить' }}
      </button>
      <button @click="clearError" v-if="errorMessage">
        Очистить ошибку
      </button>
    </div>

    <!-- Статусы -->
    <div v-if="loading" class="loading">
      Загрузка товаров...
    </div>

    <div v-else-if="errorMessage" class="error">
      {{ errorMessage }}
      <button @click="fetchItems" class="retry-btn">Повторить</button>
    </div>

    <!-- Таблица товаров -->
    <div v-else class="table-container">
      <div class="table-header">
        <h2>Товары</h2>
        <span class="count">Всего: {{ itemsCount }}</span>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>ID категории</th>
            <th>Вкусы/Ароматы</th>
            <th>Описание</th>
            <th>Цена</th>
            <th>Количество</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="id-column">{{ item.id }}</td>
            <td class="name-column">{{ item.name }}</td>
            <td class="category-id-column">{{ item.category_id }}</td>
            <td class="tastes-column">{{ item.tastes }}</td>
            <td class="description-column">{{ item.description }}</td>
            <td class="price-column">{{ item.price }} ₽</td>
            <td class="quantity-column">{{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useItemsStore } from '@/stores/itemsStore';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const itemsStore = useItemsStore();

// Используем storeToRefs для сохранения реактивности
const {
    items,
    loading,
    errorMessage,
    getItemsCount
} = storeToRefs(itemsStore);

const itemsCount = getItemsCount;

// Actions
const {
    fetchItems,
    clearError
} = itemsStore;

onMounted((): void => {
    fetchItems();
});
</script>

<style scoped>
.items-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover:not(:disabled) {
  background: #f5f5f5;
}

.controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.retry-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #c0392b;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.count {
  color: #666;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
}

.items-table th {
  background: #4a5568;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #2d3748;
}

.items-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  vertical-align: top;
  font-size: 14px;
}

.items-table tr:hover {
  background: #f7fafc;
}

.items-table tr:last-child td {
  border-bottom: none;
}

.id-column {
  width: 60px;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
}

.name-column {
  width: 180px;
  font-weight: 600;
  color: #2d3748;
}

.category-id-column {
  width: 100px;
  text-align: center;
  color: #718096;
}

.tastes-column {
  width: 200px;
  color: #4a5568;
  line-height: 1.4;
}

.description-column {
  width: 400px;
  color: #4a5568;
  line-height: 1.5;
}

.price-column {
  width: 100px;
  font-weight: 600;
  color: #2d3748;
  text-align: right;
}

.quantity-column {
  width: 100px;
  text-align: center;
  font-weight: 600;
  color: #2d3748;
}

@media (max-width: 1200px) {
  .items-container {
    padding: 10px;
  }

  .items-table th,
  .items-table td {
    padding: 12px 8px;
    font-size: 13px;
  }

  .name-column {
    width: 150px;
  }

  .tastes-column {
    width: 150px;
  }

  .description-column {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }

  .items-table {
    min-width: 1000px;
  }
}
</style>
