<template>
  <div class="login-page">
    <div class="background-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">🔐</div>
          <h1>AuthPass</h1>
        </div>
        <p class="subtitle">Gerencie suas senhas com segurança</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <div class="input-wrapper">
            <div class="input-icon">📧</div>
            <input 
              type="email" 
              id="email" 
              placeholder="Seu email" 
              v-model="email"
              :class="{ 'error': emailError }"
            />
          </div>
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>

        <div class="input-group">
          <div class="input-wrapper">
            <div class="input-icon">🔒</div>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              placeholder="Sua senha" 
              v-model="password"
              :class="{ 'error': passwordError }"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <button 
          @click="handleLogin" 
          class="login-button"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="!isLoading">Entrar</span>
          <span v-else class="loading-spinner">⏳</span>
        </button>

        <div class="divider">
          <span>ou</span>
        </div>

        <button 
          @click="handleRegister" 
          class="register-button"
          :disabled="isLoading"
        >
          Criar nova conta
        </button>

        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">Esqueceu sua senha?</a>
        </div>
      </div>

      <div v-if="errorMessage" class="message error-message">
        <div class="message-icon">⚠️</div>
        <span>{{ errorMessage }}</span>
      </div>
      
      <div v-if="successMessage" class="message success-message">
        <div class="message-icon">✅</div>
        <span>{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const router = useRouter();

// Validação de campos
const emailError = computed(() => {
  if (!email.value) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(email.value) ? 'Email inválido' : '';
});

const passwordError = computed(() => {
  if (!password.value) return '';
  return password.value.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : '';
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    router.push({ name: 'GeradorSenhas' });
  }
});

const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
};

const handleLogin = async () => {
  clearMessages();
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha todos os campos.';
    return;
  }

  if (emailError.value || passwordError.value) {
    errorMessage.value = 'Por favor, corrija os erros nos campos.';
    return;
  }

  isLoading.value = true;

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    successMessage.value = 'Login realizado com sucesso! Redirecionando...';
  } catch (error) {
    console.error("Erro no login:", error.code, error.message);
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage.value = 'Formato de email inválido.';
        break;
      case 'auth/user-disabled':
        errorMessage.value = 'Usuário desativado.';
        break;
      case 'auth/user-not-found':
        errorMessage.value = 'Usuário não encontrado. Crie uma conta.';
        break;
      case 'auth/wrong-password':
        errorMessage.value = 'Senha incorreta.';
        break;
      case 'auth/invalid-credential':
        errorMessage.value = 'Credenciais inválidas. Verifique email e senha.';
        break;
      default:
        errorMessage.value = 'Erro ao fazer login. Tente novamente.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  clearMessages();

  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor, preencha todos os campos para registrar.';
    return;
  }

  if (emailError.value || passwordError.value) {
    errorMessage.value = 'Por favor, corrija os erros nos campos.';
    return;
  }

  isLoading.value = true;

  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    successMessage.value = 'Conta criada com sucesso! Redirecionando...';
  } catch (error) {
    console.error("Erro no registro:", error.code, error.message);
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage.value = 'Este email já está em uso.';
        break;
      case 'auth/invalid-email':
        errorMessage.value = 'Formato de email inválido.';
        break;
      case 'auth/weak-password':
        errorMessage.value = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
        break;
      default:
        errorMessage.value = 'Erro ao registrar. Tente novamente.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Digite seu email para recuperar a senha.';
    return;
  }

  if (emailError.value) {
    errorMessage.value = 'Digite um email válido.';
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.value);
    successMessage.value = 'Email de recuperação enviado! Verifique sua caixa de entrada.';
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    errorMessage.value = 'Erro ao enviar email de recuperação. Tente novamente.';
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
  background: linear-gradient(45deg, #FFFFFF, #00D4AA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  z-index: 1;
  opacity: 0.7;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-wrapper input:focus {
  border-color: #00D4AA;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.input-wrapper input.error {
  border-color: #FF6B6B;
  background: rgba(255, 107, 107, 0.1);
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #00D4AA;
}

.field-error {
  color: #FF6B6B;
  font-size: 12px;
  margin-left: 4px;
}

.login-button {
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider span {
  padding: 0 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.register-button {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: #00D4AA;
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 8px;
}

.forgot-password a {
  color: #00D4AA;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #00A8CC;
  text-decoration: underline;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-message {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #FF6B6B;
}

.success-message {
  background: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00D4AA;
}

.message-icon {
  font-size: 16px;
}

/* Responsividade */
@media (max-width: 480px) {
  .login-container {
    padding: 24px;
    margin: 16px;
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .input-wrapper input {
    padding: 14px 14px 14px 44px;
    font-size: 16px; /* Evita zoom no iOS */
  }
  
  .login-button,
  .register-button {
    padding: 14px;
  }
}
</style>

