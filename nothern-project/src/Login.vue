<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50">
    <div class="w-full max-w-md">
      <Card class="shadow-2xl border-1 surface-border">
        <template #header>
          <div class="bg-blue-900 text-white p-6 text-center">
            <h2 class="text-2xl font-bold mb-2">Авторизация</h2>
            <p class="text-blue-200 opacity-90">Введите ваши учетные данные</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="space-y-5 p-4">
            <div class="field">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="Введите ваш email"
                class="w-full"
                :class="{ 'p-invalid': authStore.errorMessage }"
              />
            </div>

            <div class="field">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
              <Password
                id="password"
                v-model="password"
                required
                placeholder="Введите ваш пароль"
                :feedback="false"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': authStore.errorMessage }"
                inputClass="w-full"
              />
            </div>

            <div v-if="authStore.errorMessage" class="p-3 bg-red-50 border-1 border-red-200 rounded-lg">
              <p class="text-red-700 text-sm font-medium flex items-center gap-2">
                <i class="pi pi-exclamation-triangle"></i>
                {{ authStore.errorMessage }}
              </p>
            </div>

            <Button
              type="submit"
              class="w-full bg-blue-900 hover:bg-blue-800 border-none text-white font-semibold py-3"
              :loading="loading"
              :disabled="loading"
            >
              <span v-if="!loading" class="flex items-center justify-center gap-2">
                <i class="pi pi-sign-in"></i>
                Войти
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <i class="pi pi-spin pi-spinner"></i>
                Выполняется вход...
              </span>
            </Button>
          </form>
        </template>

        <template #footer>
          <div class="bg-gray-50 px-6 py-4 border-t-1 border-gray-200 rounded-b-2xl">
            <p class="text-center text-sm text-gray-600">
              Нет аккаунта?
              <a href="#" class="font-semibold text-blue-600 hover:text-blue-800 transition-colors">Зарегистрироваться</a>
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });

    if (authStore.isLoggedIn) {
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.p-card) {
  border-radius: 1rem;
  background: white;
}

:deep(.p-card-header) {
  padding: 0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  overflow: hidden;
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-inputtext) {
  width: 100%;
  background: white;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
  background: white;
}
</style>
