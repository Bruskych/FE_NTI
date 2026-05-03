<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore);
</script>

<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">NTI Portal</router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link">Domov</router-link>
        <router-link to="/programs" class="nav-link">Programy</router-link>

        <div v-if="isAuthenticated" class="user-menu">
          <span class="user-name">{{ user?.name }}</span>
          <button @click="authStore.logout()" class="btn-logout">Odhlásiť</button>
        </div>
        <router-link v-else to="/login" class="btn-login">Prihlásiť sa</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
  text-decoration: none;
}
.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.nav-link {
  text-decoration: none;
  color: #475569;
  font-weight: 500;
}
.nav-link:hover { color: #2563eb; }
.btn-login {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
}
.btn-logout {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  cursor: pointer;
}
</style>