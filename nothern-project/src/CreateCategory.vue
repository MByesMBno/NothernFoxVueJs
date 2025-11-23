<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-blue-900 mb-4">Создание категории</h1>
        <p class="text-xl text-gray-700">Добавьте новую категорию для handmade изделий</p>
      </div>


      <div class="form-container">
        <div class="form-card">
          <form @submit.prevent="handleSubmit" class="space-y-6">

            <div class="form-group">
              <label for="name" class="form-label">
                <i class="pi pi-tag mr-2"></i>
                Название категории *
              </label>
              <InputText
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                :class="{ 'p-invalid': errors.name }"
                placeholder="Введите название категории"
                :disabled="loading"
              />
              <small v-if="errors.name" class="form-error">{{ errors.name }}</small>
            </div>


            <div class="form-group">
              <label for="description" class="form-label">
                <i class="pi pi-file-edit mr-2"></i>
                Описание категории
              </label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="4"
                class="form-textarea"
                :class="{ 'p-invalid': errors.description }"
                placeholder="Добавьте описание категории (необязательно)"
                :disabled="loading"
              />
              <small v-if="errors.description" class="form-error">{{ errors.description }}</small>
            </div>


            <div class="form-group">
              <label class="form-label">
                <i class="pi pi-image mr-2"></i>
                Изображение категории *
              </label>

              <div class="file-upload-container">

                <div v-if="previewUrl" class="image-preview">
                  <img :src="previewUrl" alt="Предпросмотр" class="preview-image" />
                  <Button
                    type="button"
                    @click="clearImage"
                    icon="pi pi-times"
                    class="preview-remove-btn"
                    severity="secondary"
                    text
                    rounded
                  >X</Button>
                </div>


                <div v-else class="upload-area" @click="triggerFileInput">
                  <input
                    ref="fileInput"
                    type="file"
                    @change="handleFileSelect"
                    accept="image/*"
                    class="file-input"
                    :disabled="loading"
                  />
                  <div class="upload-content">
                    <i class="pi pi-cloud-upload text-4xl text-blue-500 mb-2"></i>
                    <p class="upload-text">Нажмите для загрузки изображения</p>
                  </div>
                </div>

                <small v-if="errors.image" class="form-error">{{ errors.image }}</small>
              </div>
            </div>


            <div class="form-actions">
              <Button
                type="button"
                @click="$router.back()"
                class="action-btn cancel-btn"
                label="Отмена"
                :disabled="loading"
                severity="secondary"
              />

              <Button
                type="submit"
                class="action-btn submit-btn"
                :label="loading ? 'Создание...' : 'Создать категорию'"
                :disabled="loading || !isFormValid"
                :loading="loading"
              />
            </div>
          </form>
        </div>
      </div>


      <div v-if="loading" class="status-card loading-card">
        <i class="pi pi-spin pi-spinner text-2xl mb-4"></i>
        <p>Создание категории...</p>
      </div>
    </div>


    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDataStore, type CategoryCreateData } from '@/stores/dataStore';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const fileInput = ref<HTMLInputElement>();


const loading = computed(() => dataStore.loading);
const previewUrl = ref<string>('');

const formData = reactive({
  name: '',
  description: '',
  image: null as File | null
});

const errors = reactive({
  name: '',
  description: '',
  image: ''
});


const isFormValid = computed(() => {
  return formData.name.trim() && formData.image;
});


const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!file.type.startsWith('image/')) {
      errors.image = 'Пожалуйста, выберите файл изображения';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.image = 'Размер файла не должен превышать 10MB';
      return;
    }

    formData.image = file;
    errors.image = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};


const clearImage = () => {
  formData.image = null;
  previewUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Триггер клика по input file
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Отправка формы
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Валидация
  let hasErrors = false;

  if (!formData.name.trim()) {
    errors.name = 'Название категории обязательно';
    hasErrors = true;
  } else {
    errors.name = '';
  }

  if (!formData.image) {
    errors.image = 'Изображение обязательно';
    hasErrors = true;
  } else {
    errors.image = '';
  }

  if (hasErrors) return;

  try {
    const categoryData: CategoryCreateData = {
      name: formData.name,
      description: formData.description || undefined,
      image: formData.image!
    };

    const response = await dataStore.createCategory(categoryData);

    // Успешное уведомление
    toast.add({
      severity: 'success',
      summary: 'Успех!',
      detail: response.message || 'Категория успешно создана',
      life: 3000
    });

    // Сброс формы
    resetForm();

    // Перенаправление на список категорий через 2 секунды
    setTimeout(() => {
      router.push('/categories');
    }, 2000);

  } catch (error: any) {
    // Используем errorCode и errorMessage из хранилища для показа специфичных сообщений
    let toastDetail = dataStore.errorMessage;

    // Специфичная обработка ошибок по кодам
    switch (dataStore.errorCode) {
      case 'UNAUTHORIZED':
        toastDetail = 'Необходима авторизация для создания категории';
        break;
      case 'FORBIDDEN':
        toastDetail = 'У вас нет прав для создания категорий';
        break;
      case 'VALIDATION_ERROR':
        toastDetail = 'Проверьте правильность заполнения формы';
        break;
      case 'FILE_TOO_LARGE':
        toastDetail = 'Размер изображения слишком большой. Максимум 10MB.';
        break;
      case 'NETWORK_ERROR':
        toastDetail = 'Проблемы с соединением. Проверьте интернет.';
        break;
    }

    toast.add({
      severity: 'error',
      summary: 'Ошибка!',
      detail: toastDetail,
      life: 5000
    });
  }
};

// Сброс формы
const resetForm = () => {
  formData.name = '';
  formData.description = '';
  formData.image = null;
  previewUrl.value = '';
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
};
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
}

.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.p-invalid,
.form-textarea.p-invalid {
  border-color: #ef4444;
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.file-upload-container {

  margin-top: 0.5rem;
}

.file-input {
  display: none;
}

.upload-area {
  display: block;
  margin: auto;
  width: 35%;
  border: 2px solid #4e91f5;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
}

.upload-text {
  font-size: 0.9rem;
  font-weight: 750;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.preview-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.preview-remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9) !important;
  color: white !important;
  font-size: 2rem;
  width: 2.5rem;
  height: 1rem;
}

.preview-remove-btn:hover {
  background: rgba(239, 68, 68, 1) !important;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  border: none !important;
  font-weight: 600 !important;
  padding: 0.75rem 1.5rem !important;
  min-width: 140px;
}

.cancel-btn {
  background: #6b7280 !important;
  color: white !important;
}

.cancel-btn:hover:not(:disabled) {
  background: #4b5563 !important;
}

.submit-btn {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%) !important;
  color: white !important;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%) !important;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  margin-top: 2rem;
}

.loading-card {
  color: #1e3a8a;
}
</style>
