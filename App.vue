<template>
  <div class="container">
    <h2>Gerador de senhas</h2>
    <input type="number" placeholder="número de letras" v-model.number="nLetras" />
    <input type="number" placeholder="número de especiais" v-model.number="nSpecials" />
    <input type="number" placeholder="número de numéricos" v-model.number="nNumeros" />

    <button @click="gerarSenha">Gerar senha</button>

    <p v-if="resposta">
    
      <span>{{ resposta }}</span>
    </p>
  </div>

  <div id="app">
    <Login v-if="!isLoggedIn" @login-success="isLoggedIn = true" />
     <Menu v-else />
  </div>
</template>



<script setup>

import Login from './componentes/Login.vue'
import { ref } from 'vue'
import { SenhaAleatoria } from './class/SenhaAleatoria' 
import Menu from './componentes/Menu.vue'

const isLoggedIn = ref(false)
const nLetras = ref(null) 
const nSpecials = ref(null)
const nNumeros = ref(null)
const resposta = ref('')

const gerarSenha = () => {
  resposta.value = '' 
  
  
  const numLetras = Number(nLetras.value) || 0
  const numSpecials = Number(nSpecials.value) || 0
  const numNumeros = Number(nNumeros.value) || 0

  if (numLetras <= 0 && numSpecials <= 0 && numNumeros <= 0) {
    resposta.value = 'Por favor, preencha um dos campos com um valor maior que zero!'
    return
  }

  try {
    
    let gerador = new SenhaAleatoria(numLetras, numSpecials, numNumeros)
    const senha = gerador.gerarSenha()
    resposta.value = `Senha gerada: ${senha}`
  } catch (error) {
    console.error("Erro ao gerar senha:", error)
    resposta.value = 'Ocorreu um erro ao gerar a senha. Verifique a classe SenhaAleatoria.'
  }
}
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
}

input {
  margin: 0.5rem 0;
  padding: 0.5rem;
  width: 200px;
}

button {
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
}

p {
  margin-top: 1rem;
  font-weight: bold;
}
</style>
