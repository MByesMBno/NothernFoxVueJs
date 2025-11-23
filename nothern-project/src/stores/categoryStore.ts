// categoryStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const yandexStorageUrl = import.meta.env.VITE_YANDEX_STORAGE_URL;

interface Category {
    id: number;
    name: string;
    description: string;
}

interface CategoryImage {
    id: number;
    category_id: number;
    url: string; // Короткий путь к файлу в Yandex Object Storage
}

export interface CategoryWithImage extends Category {
    images: CategoryImage[]; // Массив изображений
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface CategoryState {
    categories: CategoryWithImage[];
    loading: boolean;
    errorMessage: string;
    pagination: PaginationInfo;
    imageCache: Map<string, string>;
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
        },
        imageCache: new Map()
    }),

    getters: {
        getCategories: (state): CategoryWithImage[] => state.categories,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getCategoriesCount: (state): number => state.pagination.total,
        getCategoryById: (state) => (id: number): CategoryWithImage | undefined => {
            return state.categories.find(category => category.id === id);
        },
        getPagination: (state): PaginationInfo => state.pagination,
        hasNextPage: (state): boolean => state.pagination.current_page < state.pagination.last_page,
        hasPrevPage: (state): boolean => state.pagination.current_page > 1,

        // Получение первого изображения категории (основного)
        getCategoryImageUrl: (state) => (categoryId: number): string | null => {
            const category = state.categories.find(cat => cat.id === categoryId);

            // Берем первое изображение из массива images
            const image = category?.images?.[0];
            if (!image?.url) return null;

            // Если URL уже полный (начинается с http), возвращаем как есть
            if (image.url.startsWith('http')) {
                return image.url;
            }

            // Формируем полный URL из базового URL хранилища и пути к файлу
            return `${yandexStorageUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
        },

        // Получение всех изображений категории
        getCategoryImages: (state) => (categoryId: number): CategoryImage[] => {
            const category = state.categories.find(cat => cat.id === categoryId);
            return category?.images || [];
        }
    },

    actions: {
        async fetchCategories(page: number = 1, perPage: number = 5): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse = await axios.get(
                    `${backendUrl}/categories`,
                    {
                        params: {
                            page: page,
                            perpage: perPage
                        }
                    }
                );

                if (response.data.data) {
                    // Преобразуем данные, сохраняя структуру с images
                    this.categories = response.data.data.map((category: any) => ({
                        id: category.id,
                        name: category.name,
                        description: category.description,
                        images: category.images || [] // Сохраняем массив images
                    }));

                    this.pagination = {
                        current_page: response.data.current_page,
                        last_page: response.data.last_page,
                        per_page: response.data.per_page,
                        total: response.data.total
                    };

                    // Предварительная проверка доступности изображений
                    await this.preloadCategoryImages();
                }

            } catch (error: any) {
                this.handleError(error, 'Ошибка загрузки категорий');
            } finally {
                this.loading = false;
            }
        },


        async fetchCategoryById(categoryId: number): Promise<CategoryWithImage | null> {
            this.loading = true;
            this.errorMessage = "";

            try {
                const response: AxiosResponse = await axios.get(
                    backendUrl + '/categories/' + categoryId
                );

                if (response.data) {
                    const categoryData = response.data;
                    const category: CategoryWithImage = {
                        id: categoryData.id,
                        name: categoryData.name,
                        description: categoryData.description,
                        images: categoryData.images || []
                    };

                    // Предзагрузка изображения категории
                    if (category.images && category.images.length > 0) {
                        const fullUrl = this.getFullImageUrl(category.images[0].url);
                        if (fullUrl) {
                            await this.checkImageAvailability(fullUrl);
                        }
                    }

                    return category;
                }
                return null;

            } catch (error: any) {
                this.handleError(error, 'Ошибка загрузки категории');
                return null;
            } finally {
                this.loading = false;
            }
        },

        // Предзагрузка и проверка изображений категорий
        async preloadCategoryImages(): Promise<void> {
            const imageChecks = this.categories.map(async (category) => {
                if (category.images && category.images.length > 0) {
                    for (const image of category.images) {
                        const fullUrl = this.getFullImageUrl(image.url);
                        if (fullUrl) {
                            const isAvailable = await this.checkImageAvailability(fullUrl);
                            if (isAvailable) {
                                this.imageCache.set(image.url, fullUrl);
                            }
                        }
                    }
                }
            });

            await Promise.allSettled(imageChecks);
        },

        // Формирование полного URL для изображения
        getFullImageUrl(imagePath: string): string {
            if (!imagePath) return '';

            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            return yandexStorageUrl + imagePath;
        },

        // Проверка доступности изображения
        async checkImageAvailability(imageUrl: string): Promise<boolean> {
            if (this.imageCache.has(imageUrl)) {
                return true;
            }

            try {
                // Создаем Image для проверки загрузки
                return await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        this.imageCache.set(imageUrl, imageUrl);
                        resolve(true);
                    };
                    img.onerror = () => {
                        console.warn('Image not available:', imageUrl);
                        resolve(false);
                    };
                    img.src = imageUrl;

                    // Таймаут на случай долгой загрузки
                    setTimeout(() => {
                        if (!img.complete) {
                            console.warn('Image load timeout:', imageUrl);
                            resolve(false);
                        }
                    }, 5000);
                });
            } catch (error) {
                console.warn('Image check error:', imageUrl, error);
                return false;
            }
        },

        // Получение URL изображения с проверкой доступности
        async getCategoryImageUrlWithFallback(categoryId: number): Promise<string> {
            const imageUrl = this.getCategoryImageUrl(categoryId);

            if (!imageUrl) {
                return this.getGradientPlaceholder(categoryId);
            }

            const isAvailable = await this.checkImageAvailability(imageUrl);

            return isAvailable ? imageUrl : this.getGradientPlaceholder(categoryId);
        },

        // Синхронная версия для использования в шаблонах
        getCategoryImageUrlSync(categoryId: number): string {
            const imageUrl = this.getCategoryImageUrl(categoryId);
            return imageUrl || this.getGradientPlaceholder(categoryId);
        },

        // Генерация градиентного плейсхолдера на основе ID категории
        getGradientPlaceholder(categoryId: number): string {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            ];

            return colors[categoryId % colors.length];
        },

        // Очистка кэша изображений
        clearImageCache(): void {
            this.imageCache.clear();
        },

        // Обработка ошибок
        handleError(error: any, defaultMessage: string): void {
            if (error.response) {
                this.errorMessage = error.response.data.message || defaultMessage;
                console.error('API error:', error.response.data);
            } else if (error.request) {
                this.errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
                console.error('Network error:', error.message);
            } else {
                this.errorMessage = 'Произошла непредвиденная ошибка';
                console.error('Request setup error:', error.message);
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
