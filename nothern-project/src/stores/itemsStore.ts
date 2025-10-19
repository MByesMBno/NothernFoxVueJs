import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface Item {
    id: number;
    name: string;
    category_id: number;
    tastes: string;
    description: string;
    price: string;
    quantity: number;
}

interface ItemsState {
    items: Item[];
    loading: boolean;
    errorMessage: string;
}

export const useItemsStore = defineStore('items', {
    state: (): ItemsState => ({
        items: [],
        loading: false,
        errorMessage: "",
    }),

    getters: {
        getItems: (state): Item[] => state.items,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getItemsCount: (state): number => state.items.length,
        getItemById: (state) => (id: number): Item | undefined => {
            return state.items.find(item => item.id === id);
        },
        getItemsByCategoryId: (state) => (categoryId: number): Item[] => {
            return state.items.filter(item => item.category_id === categoryId);
        }
    },

    actions: {
        async fetchItems(): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse<Item[]> = await axios.get(
                    'http://127.0.0.1:8000/api/items'
                );

                this.items = response.data;

            } catch (error: any) {
                if (error.response) {
                    // Сервер ответил с кодом статуса вне диапазона 2xx
                    this.errorMessage = error.response.data.message || 'Ошибка загрузки товаров';
                    console.error('Items fetch error:', error.response.data);
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
