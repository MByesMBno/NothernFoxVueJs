<template>
  <header>
    <nav>
      <div v-if="isAuthenticated && user">
        Welcome, {{ user.name }}
        <button @click="logout">Logout</button>
      </div>

      <div v-else>
        <form @submit.prevent="login">
          <div>
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" required />
          </div>

          <div>
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" required />
          </div>

          <button type="submit">Login</button>
          <p v-if="authError" class="error">{{ authError }}</p>
        </form>
      </div>
    </nav>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  data() {
    return {
      email: '',
      password: '',
      authStore: useAuthStore()
    };
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
    user() {
      return this.authStore.user;
    },
    authError() {
      return this.authStore.errorMessage;
    }
  },
  methods: {
    logout() {
      this.authStore.logout();
    },
    async login() {
      await this.authStore.login({
        email: this.email,
        password: this.password
      });
    }
  },
  mounted() {
    this.authStore.initializeAuth();
  }
};
</script>

<style scoped>
.error {
  color: rgb(255, 89, 0);
}
</style>
