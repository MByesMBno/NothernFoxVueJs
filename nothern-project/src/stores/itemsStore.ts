import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    created_at: string;
    updated_at: string;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ItemState {
    items: Item[];
    loading: boolean;
    errorMessage: string;
    pagination: PaginationInfo;
}

export const useItemStore = defineStore('item', {
    state: (): ItemState => ({
        items: [],
        loading: false,
        errorMessage: "",
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 5,
            total: 0
        }
    }),

    getters: {
        getItems: (state): Item[] => state.items,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getItemsCount: (state): number => state.pagination.total,
        getPagination: (state): PaginationInfo => state.pagination,
        hasNextPage: (state): boolean => state.pagination.current_page < state.pagination.last_page,
        hasPrevPage: (state): boolean => state.pagination.current_page > 1,
        getItemById: (state) => (id: number): Item | undefined => {
            return state.items.find(item => item.id === id);
        }
    },

    actions: {
        async fetchItems(page: number = 1, perPage: number = 5): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse = await axios.get(
                    backendUrl + '/items',
                    {
                        params: {
                            page: page,
                            perpage: perPage
                        }
                    }
                );

                // Если используете встроенную пагинацию Laravel
                if (response.data.data) {
                    this.items = response.data.data;
                    this.pagination = {
                        current_page: response.data.current_page,
                        last_page: response.data.last_page,
                        per_page: response.data.per_page,
                        total: response.data.total
                    };
                } else {
                    // Если используете кастомную пагинацию
                    this.items = response.data.data || response.data;
                    this.pagination = response.data;
                }

            } catch (error: any) {
                if (error.response) {
                    this.errorMessage = error.response.data.message || 'Ошибка загрузки товаров';
                    console.error('Items fetch error:', error.response.data);
                } else if (error.request) {
                    this.errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
                    console.error('Network error:', error.message);
                } else {
                    this.errorMessage = 'Произошла непредвиденная ошибка';
                    console.error('Request setup error:', error.message);
                }
            } finally {
                this.loading = false;
            }
        },

        async nextPage(): Promise<void> {
            if (this.hasNextPage) {
                await this.fetchItems(this.pagination.current_page + 1, this.pagination.per_page);
            }
        },

        async prevPage(): Promise<void> {
            if (this.hasPrevPage) {
                await this.fetchItems(this.pagination.current_page - 1, this.pagination.per_page);
            }
        },

        async goToPage(page: number): Promise<void> {
            if (page >= 1 && page <= this.pagination.last_page) {
                await this.fetchItems(page, this.pagination.per_page);
            }
        },

        async changePerPage(perPage: number): Promise<void> {
            await this.fetchItems(1, perPage);
        },

        clearError(): void {
            this.errorMessage = "";
        }
    }
});
