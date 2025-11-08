<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">

    <Menubar :model="items" class="custom-menubar">
      <template #start>
        <span class="text-xl font-bold text-white ml-4">Северный лис</span>
      </template>
      <template #end>
        <div class="flex items-center gap-4">
          <div v-if="authStore.isLoggedIn && authStore.user" class="flex items-center gap-3">
            <i class="pi pi-user text-white"></i>
            <span class="text-white font-medium">{{ authStore.user.name }}</span>
            <Button
              @click="authStore.logout"
              class="logout-btn"
              label="Выйти"
            />
          </div>
          <Button
            v-else
            @click="navigateToLogin"
            class="login-btn"
            label="Войти"
          />
        </div>
      </template>
    </Menubar>


    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

const items = ref([
  {
    label: 'Главная страница',
    icon: 'pi pi-home',
    command: () => navigateTo('/')
  },
  {
    label: 'Категории',
    icon: 'pi pi-folder',
    command: () => navigateTo('/categories')
  },
  {
    label: 'Товары',
    icon: 'pi pi-box',
    command: () => navigateTo('/items')
  },
  {
    label: 'Создание категорий',
    icon: 'pi pi-box',
    command: () => navigateTo('/createCat')
  }
]);

onMounted(() => {
  authStore.initializeAuth();
});

const navigateToLogin = () => {
  router.push('/login');
};

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
.custom-menubar {
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%) !important;
  border: none;
  border-radius: 0;
  padding: 0.75rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.p-menubar-root-list) {
  background: transparent !important;
}

:deep(.p-menuitem-link) {
  color: #e0e7ff !important;
  border-radius: 0.375rem;
  margin: 0 0.25rem;
  cursor: pointer;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.login-btn {
  background: #f59e0b !important;
  border-color: #f59e0b !important;
  color: #1e3a8a !important;
  font-weight: 600;
}

.login-btn:hover {
  background: #eab308 !important;
  border-color: #eab308 !important;
}

.logout-btn {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
  font-weight: 600;
}

.logout-btn:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}
</style>
