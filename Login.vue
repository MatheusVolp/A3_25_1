<template>
  <div class="login-container">
    <h1>Login</h1>
    <input type="text" placeholder="Usuário" v-model="username" />
    <input type="password" placeholder="Senha" v-model="password" />
    <button @click="login">Entrar</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')

const emit = defineEmits(['login-success'])

const login = () => {
  if (username.value && password.value) {
    emit('login-success')
  } else {
    alert('Por favor, preencha usuário e senha.')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 100px;
}
input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  background-color: #2A3942;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #1E2B32;
}
</style>
