<template>
  <div class="categories-container">
 
    <div class="controls">
      <button @click="fetchCategories" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Обновить' }}
      </button>
      <button @click="clearError" v-if="errorMessage">
        Очистить ошибку
      </button>
    </div>

   
    <div v-if="loading" class="loading">
      Загрузка категорий...
    </div>
    
    <div v-else-if="errorMessage" class="error">
      {{ errorMessage }}
      <button @click="fetchCategories" class="retry-btn">Повторить</button>
    </div>


    <div v-else class="table-container">
      <div class="table-header">
        <h2>Категории товаров</h2>
        <span class="count">Всего: {{ categoriesCount }}</span>
      </div>

      <table class="categories-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название категории</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td class="id-column">{{ category.id }}</td>
            <td class="name-column">{{ category.name }}</td>
            <td class="description-column">{{ category.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '@/stores/categoryStore';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const categoryStore = useCategoryStore();


const { 
    categories, 
    loading, 
    errorMessage,
    getCategoriesCount 
} = storeToRefs(categoryStore);

const categoriesCount = getCategoriesCount;

// Actions
const { 
    fetchCategories, 
    clearError 
} = categoryStore;

onMounted((): void => {
    fetchCategories();
});
</script>

<style scoped>
.categories-container {
  max-width: 1400px;
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

.categories-table {
  width: 100%;
  border-collapse: collapse;
}

.categories-table th {
  background: #4a5568;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.categories-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.categories-table tr:hover {
  background: #f7fafc;
}

.id-column {
  width: 80px;
  text-align: center;
  font-weight: 600;
}

.name-column {
  width: 200px;
  font-weight: 600;
}

.description-column {
  color: #4a5568;
  line-height: 1.5;
}
</style>