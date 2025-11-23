// itemsStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const yandexStorageUrl = import.meta.env.VITE_YANDEX_STORAGE_URL;

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
}

interface ItemImage {
    id: number;
    item_id: number;
    url: string; // Короткий путь к файлу в Yandex Object Storage
}

export interface ItemWithImage extends Item {
    images: ItemImage[]; // Массив изображений
    category?: {
        id: number;
        name: string;
    };
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ItemState {
    items: ItemWithImage[];
    loading: boolean;
    errorMessage: string;
    pagination: PaginationInfo;
    imageCache: Map<string, string>;
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
        },
        imageCache: new Map()
    }),

    getters: {
        getItems: (state): ItemWithImage[] => state.items,
        getLoading: (state): boolean => state.loading,
        getErrorMessage: (state): string => state.errorMessage,
        getItemsCount: (state): number => state.pagination.total,
        getItemById: (state) => (id: number): ItemWithImage | undefined => {
            return state.items.find(item => item.id === id);
        },
        getPagination: (state): PaginationInfo => state.pagination,
        hasNextPage: (state): boolean => state.pagination.current_page < state.pagination.last_page,
        hasPrevPage: (state): boolean => state.pagination.current_page > 1,

        // Получение первого изображения товара (основного)
        getItemImageUrl: (state) => (itemId: number): string | null => {
            const item = state.items.find(item => item.id === itemId);

            // Берем первое изображение из массива images
            const image = item?.images?.[0];
            if (!image?.url) return null;

            // Если URL уже полный (начинается с http), возвращаем как есть
            if (image.url.startsWith('http')) {
                return image.url;
            }

            // Формируем полный URL из базового URL хранилища и пути к файлу
            return `${yandexStorageUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
        },

        // Получение всех изображений товара
        getItemImages: (state) => (itemId: number): ItemImage[] => {
            const item = state.items.find(item => item.id === itemId);
            return item?.images || [];
        },

        // Получение товаров по категории
        getItemsByCategory: (state) => (categoryId: number): ItemWithImage[] => {
            return state.items.filter(item => item.category_id === categoryId);
        }
    },

    actions: {
         async fetchItems(page: number = 1, perPage: number = 5, categoryId?: number): Promise<void> {
            this.loading = true;
            this.errorMessage = "";

            try {
                let url = `${backendUrl}/items`;
                const params: any = {
                    page: page,
                    perpage: perPage
                };

                // Если передан categoryId, используем маршрут для товаров категории
                if (categoryId) {
                    url = `${backendUrl}/categories/${categoryId}`;
                }

                const response: AxiosResponse = await axios.get(url, { params });

                if (response.data) {
                    // Обрабатываем разные структуры ответа
                    let itemsData: any[] = [];

                    if (categoryId && response.data.data) {
                        // Если это товары категории, данные могут быть в response.data.data
                        itemsData = response.data.data;
                    } else if (response.data.data) {
                        // Если это все товары
                        itemsData = response.data.data;
                    } else if (Array.isArray(response.data)) {
                        // Если ответ - просто массив
                        itemsData = response.data;
                    }

                    this.items = itemsData.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        category_id: item.category_id,
                        images: item.images || [],
                        category: item.category || null
                    }));

                    // Обновляем пагинацию, если она есть в ответе
                    if (response.data.current_page) {
                        this.pagination = {
                            current_page: response.data.current_page,
                            last_page: response.data.last_page,
                            per_page: response.data.per_page,
                            total: response.data.total
                        };
                    } else {
                        // Если пагинации нет, устанавливаем значения по умолчанию
                        this.pagination = {
                            current_page: 1,
                            last_page: 1,
                            per_page: itemsData.length,
                            total: itemsData.length
                        };
                    }

                    await this.preloadItemImages();
                }

            } catch (error: any) {
                this.handleError(error, 'Ошибка загрузки товаров');
            } finally {
                this.loading = false;
            }
        },
        async fetchItemsByCategory(categoryId: number, page: number = 1, perPage: number = 5): Promise<void> {
            await this.fetchItems(page, perPage, categoryId);
        },

        // Предзагрузка и проверка изображений товаров
        async preloadItemImages(): Promise<void> {
            const imageChecks = this.items.map(async (item) => {
                if (item.images && item.images.length > 0) {
                    for (const image of item.images) {
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
        async getItemImageUrlWithFallback(itemId: number): Promise<string> {
            const imageUrl = this.getItemImageUrl(itemId);

            if (!imageUrl) {
                return this.getGradientPlaceholder(itemId);
            }

            const isAvailable = await this.checkImageAvailability(imageUrl);

            return isAvailable ? imageUrl : this.getGradientPlaceholder(itemId);
        },

        // Синхронная версия для использования в шаблонах
        getItemImageUrlSync(itemId: number): string {
            const imageUrl = this.getItemImageUrl(itemId);
            return imageUrl || this.getGradientPlaceholder(itemId);
        },

        // Генерация градиентного плейсхолдера на основе ID товара
        getGradientPlaceholder(itemId: number): string {
            const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            ];

            return colors[itemId % colors.length];
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
