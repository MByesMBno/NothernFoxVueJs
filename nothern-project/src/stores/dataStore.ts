import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export interface CategoryCreateData {
  name: string;
  description?: string;
  image: File;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

interface DataState {
  errorCode: string;
  errorMessage: string;
  loading: boolean;
}

export const useDataStore = defineStore('data', {
  state: (): DataState => ({
    errorCode: "",
    errorMessage: "",
    loading: false
  }),

  getters: {
    getLoading: (state) => state.loading,
    getErrorCode: (state) => state.errorCode,
    getErrorMessage: (state) => state.errorMessage,
  },

  actions: {

    clearError() {
      this.errorCode = "";
      this.errorMessage = "";
    },


    setError(code: string, message: string) {
      this.errorCode = code;
      this.errorMessage = message;
    },


    getAuthHeaders(): Record<string, string> {
      const authStore = useAuthStore();
      const token = authStore.token;

      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return headers;
    },


    checkAuth(): boolean {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.token) {
        this.setError('UNAUTHORIZED', 'Необходима авторизация. Пожалуйста, войдите в систему.');
        return false;
      }
      return true;
    },


    async createCategory(categoryData: CategoryCreateData): Promise<ApiResponse<CategoryResponse>> {
      this.loading = true;
      this.clearError();


      if (!this.checkAuth()) {
        this.loading = false;
        throw new Error(this.errorMessage);
      }

      try {
        const formData = new FormData();
        formData.append('name', categoryData.name);

        if (categoryData.description) {
          formData.append('description', categoryData.description);
        }

        formData.append('image', categoryData.image);

        const response = await axios.post<ApiResponse<CategoryResponse>>(
          backendUrl+'/create-categories',
          formData,
          {
            headers: this.getAuthHeaders(),
            timeout: 30000
          }
        );

        if (response.data.code === 0) {
          this.clearError();
          return response.data;
        } else {
          this.setError(
            response.data.code?.toString() || 'UNKNOWN_ERROR',
            response.data.message || 'Неизвестная ошибка при создании категории'
          );
          throw new Error(this.errorMessage);
        }

      } catch (error: any) {
        let errorCode = 'NETWORK_ERROR';
        let errorMsg = 'Произошла ошибка при создании категории';

        if (axios.isAxiosError(error)) {
          if (error.response) {
            const serverError = error.response.data as ApiResponse;
            errorCode = serverError.code?.toString() || `HTTP_${error.response.status}`;
            errorMsg = serverError.message || `Ошибка сервера: ${error.response.status}`;

            if (error.response.status === 401) {
              errorCode = 'UNAUTHORIZED';
              errorMsg = 'Необходима авторизация. Пожалуйста, войдите в систему.';
              const authStore = useAuthStore();
              authStore.logout();
            } else if (error.response.status === 403) {
              errorCode = 'FORBIDDEN';
              errorMsg = 'Доступ запрещен. Недостаточно прав.';
            } else if (error.response.status === 422) {
              errorCode = 'VALIDATION_ERROR';
              errorMsg = 'Ошибка валидации данных. Проверьте введенные данные.';
            } else if (error.response.status === 413) {
              errorCode = 'FILE_TOO_LARGE';
              errorMsg = 'Размер файла слишком большой';
            }
          } else if (error.request) {
            errorCode = 'NO_RESPONSE';
            errorMsg = 'Не удалось подключиться к серверу. Проверьте соединение.';
          } else {
            errorCode = 'REQUEST_ERROR';
            errorMsg = `Ошибка запроса: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorCode = 'CLIENT_ERROR';
          errorMsg = error.message;
        }

        this.setError(errorCode, errorMsg);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
});
