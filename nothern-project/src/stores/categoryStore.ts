import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
interface Category {
    id: number;
    name: string;
    description: string;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    errorMessage: string;
    pagination: PaginationInfo;
}

export const useCategoryStore = defineStore('category', {
    state: (): CategoryState => ({
        categories: [],
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
        getCategories: (state): Category[] => state.categories,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getCategoriesCount: (state): number => state.pagination.total,
        getCategoryById: (state) => (id: number): Category | undefined => {
            return state.categories.find(category => category.id === id);
        },
        getPagination: (state): PaginationInfo => state.pagination,
        hasNextPage: (state): boolean => state.pagination.current_page < state.pagination.last_page,
        hasPrevPage: (state): boolean => state.pagination.current_page > 1
    },

    actions: {
        async fetchCategories(page: number = 1, perPage: number = 5): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse = await axios.get(
                    backendUrl + '/categories',
                    {
                        params: {
                            page: page,
                            perpage: perPage
                        }
                    }
                );

                if (response.data.data) {
                    this.categories = response.data.data;
                    this.pagination = {
                        current_page: response.data.current_page,
                        last_page: response.data.last_page,
                        per_page: response.data.per_page,
                        total: response.data.total
                    };
                }

            } catch (error: any) {
                if (error.response) {
                    this.errorMessage = error.response.data.message || 'Ошибка загрузки категорий';
                    console.error('Categories fetch error:', error.response.data);
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
                await this.fetchCategories(this.pagination.current_page + 1, this.pagination.per_page);
            }
        },

        async prevPage(): Promise<void> {
            if (this.hasPrevPage) {
                await this.fetchCategories(this.pagination.current_page - 1, this.pagination.per_page);
            }
        },

        async goToPage(page: number): Promise<void> {
            if (page >= 1 && page <= this.pagination.last_page) {
                await this.fetchCategories(page, this.pagination.per_page);
            }
        },

        async changePerPage(perPage: number): Promise<void> {
            await this.fetchCategories(1, perPage);
        },

        clearError(): void {
            this.errorMessage = "";
        }
    }
});
