import { defineStore } from 'pinia';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface User {
    id: number;
    email: string;
    name: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    errorMessage: string;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: false,
        errorMessage: "",
    }),

    getters: {
        getUser: (state): User | null => state.user,
        getToken: (state): string | null => state.token,
        isLoggedIn: (state): boolean => state.isAuthenticated,
        getErrorMessage: (state): string => state.errorMessage,
    },

    actions: {
        async login(credentials: LoginCredentials): Promise<void> {
            this.errorMessage = "";
            try {
                const response: AxiosResponse<LoginResponse> = await axios.post(
                    'http://127.0.0.1:8000/api/login',
                    credentials
                );

                this.token = response.data.token;
                this.user = response.data.user;
                this.isAuthenticated = true;
                localStorage.setItem('token', response.data.token);

            } catch (error: any) {
                if (error.response) {
                    // Сервер ответил с кодом статуса вне диапазона 2xx
                    this.errorMessage = error.response.data.message || 'Ошибка авторизации';
                    console.error('Login error:', error.response.data);
                } else if (error.request) {
                    // Запрос был сделан, но ответ не получен
                    this.errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
                    console.error('Network error:', error.message);
                } else {
                    // Произошла ошибка при настройке запроса
                    this.errorMessage = 'Произошла непредвиденная ошибка';
                    console.error('Request setup error:', error.message);
                }
            }
        },

        logout(): void {
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            this.errorMessage = "";
            localStorage.removeItem('token');
        },

        initializeAuth(): void {
            if (this.token) {
                // Здесь можно добавить проверку валидности токена
                this.isAuthenticated = true;
                // Опционально: загрузить данные пользователя по токену
            }
        },

        clearError(): void {
            this.errorMessage = "";
        }
    }
});
