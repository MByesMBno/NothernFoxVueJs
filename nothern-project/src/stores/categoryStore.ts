import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface Category {
    id: number;
    name: string;
    description: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    errorMessage: string;
}

export const useCategoryStore = defineStore('category', {
    state: (): CategoryState => ({
        categories: [],
        loading: false,
        errorMessage: "",
    }),

    getters: {
        getCategories: (state): Category[] => state.categories,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getCategoriesCount: (state): number => state.categories.length,
        getCategoryById: (state) => (id: number): Category | undefined => {
            return state.categories.find(category => category.id === id);
        }
    },

    actions: {
        async fetchCategories(): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse<Category[]> = await axios.get(
                    'http://127.0.0.1:8000/api/categories'
                );

                this.categories = response.data;

            } catch (error: any) {
                if (error.response) {
                    // Сервер ответил с кодом статуса вне диапазона 2xx
                    this.errorMessage = error.response.data.message || 'Ошибка загрузки категорий';
                    console.error('Categories fetch error:', error.response.data);
                } else if (error.request) {
                    // Запрос был сделан, но ответ не получен
                    this.errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
                    console.error('Network error:', error.message);
                } else {
                    // Произошла ошибка при настройке запроса
                    this.errorMessage = 'Произошла непредвиденная ошибка';
                    console.error('Request setup error:', error.message);
                }
            } finally {
                this.loading = false;
            }
        },

        clearError(): void {
            this.errorMessage = "";
        }
    }
});
