<template>
  <div class="password-generator-page">
    <div class="background-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="container">
      <header class="app-header">
        <div class="logo">
          <div class="logo-icon">🔐</div>
          <h1>AuthPass</h1>
        </div>
        <div class="header-actions">
          <button @click="goToPasswordManager" class="manager-button">
            <span class="button-icon">🗂️</span>
            Gerenciador
          </button>
          <button @click="handleLogout" class="logout-button">
            <span class="logout-icon">🚪</span>
            Sair
          </button>
        </div>
      </header>

      <div class="main-content">
        <!-- Card do Gerador de Senhas -->
        <div class="card generator-card">
          <div class="card-header">
            <h2>🎲 Gerador de Senhas</h2>
            <p>Crie senhas seguras personalizadas</p>
          </div>

          <div class="generator-form">
            <div class="form-row">
              <div class="input-group">
                <label for="password-length">Tamanho da senha</label>
                <input 
                  type="number" 
                  id="password-length" 
                  v-model.number="passwordLength" 
                  min="5" 
                  max="30" 
                  class="number-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label for="num-chars">Números</label>
                <input 
                  type="number" 
                  id="num-chars" 
                  v-model.number="numNumbers" 
                  min="0" 
                  class="number-input"
                />
              </div>
              <div class="input-group">
                <label for="spl-chars">Especiais</label>
                <input 
                  type="number" 
                  id="spl-chars" 
                  v-model.number="numSpecial" 
                  min="0" 
                  class="number-input"
                />
              </div>
            </div>

            <button @click="generatePassword" class="generate-button">
              <span class="button-icon">⚡</span>
              Gerar Senha
            </button>

            <div v-if="generatedPassword" class="password-output">
              <div class="password-display">
                <input 
                  type="text" 
                  readonly 
                  :value="generatedPassword" 
                  class="generated-password-input"
                  ref="passwordInput"
                />
                <button @click="copyPassword" class="copy-button" title="Copiar senha">
                  📋
                </button>
              </div>

              <div class="save-section">
                <input 
                  type="text" 
                  v-model="passwordDescription" 
                  placeholder="Descrição da senha (ex: Gmail, Facebook)" 
                  class="description-input"
                />
                <button @click="saveGeneratedPassword" class="save-button">
                  <span class="button-icon">💾</span>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Card das Senhas Salvas -->
        <div class="card passwords-card">
          <div class="card-header">
            <h2>🔑 Senhas Recentes</h2>
            <p>{{ userPasswords.length }} senha{{ userPasswords.length !== 1 ? 's' : '' }} armazenada{{ userPasswords.length !== 1 ? 's' : '' }}</p>
          </div>

          <div v-if="userPasswords.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>Nenhuma senha salva ainda</p>
            <span>Gere e salve sua primeira senha acima!</span>
          </div>

          <div v-else class="passwords-list">
            <div 
              v-for="pwd in userPasswords.slice(0, 5)" 
              :key="pwd.id" 
              class="password-item"
            >
              <div class="password-info">
                <div class="password-value">
                  <span class="password-text">{{ showPasswords[pwd.id] ? pwd.passwordValue : '••••••••••••' }}</span>
                  <button 
                    @click="togglePasswordVisibility(pwd.id)" 
                    class="toggle-visibility"
                    :title="showPasswords[pwd.id] ? 'Ocultar senha' : 'Mostrar senha'"
                  >
                    {{ showPasswords[pwd.id] ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
                <div class="password-description">
                  {{ pwd.description || 'Sem descrição' }}
                </div>
                <div class="password-date">
                  Criada em: {{ formatDate(pwd.createdAt) }}
                </div>
              </div>
              <div class="password-actions">
                <button 
                  @click="copyPasswordToClipboard(pwd.passwordValue)" 
                  class="action-button copy"
                  title="Copiar senha"
                >
                  📋
                </button>
                <button 
                  @click="deletePassword(pwd.id)" 
                  class="action-button delete"
                  title="Deletar senha"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div v-if="userPasswords.length > 5" class="view-all-section">
              <button @click="goToPasswordManager" class="view-all-button">
                Ver todas as {{ userPasswords.length }} senhas →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagens -->
      <div v-if="message" :class="['message', messageType]">
        <div class="message-icon">
          {{ messageType === 'success' ? '✅' : '⚠️' }}
        </div>
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase/firebase';
import { db } from './firebase/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const passwordLength = ref(15);
const numNumbers = ref(2);
const numSpecial = ref(2);
const generatedPassword = ref('');
const passwordDescription = ref('');
const message = ref('');
const messageType = ref('');
const user = ref(null);
const userPasswords = ref([]);
const showPasswords = reactive({});
const passwordInput = ref(null);

const router = useRouter();

onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    user.value = currentUser;
    fetchUserPasswords();
  } else {
    user.value = null;
    userPasswords.value = [];
    router.push({ name: 'Login' });
  }
});

const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 4000);
};

const generatePassword = () => {
  if (passwordLength.value < 5) {
    showMessage('O comprimento da senha deve ser no mínimo 5 caracteres.', 'error');
    return;
  }
  if (passwordLength.value > 30) {
    showMessage('O comprimento da senha não pode exceder 30 caracteres.', 'error');
    return;
  }

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let allAvailableChars = lowercaseChars + uppercaseChars;
  if (numNumbers.value > 0) allAvailableChars += numberChars;
  if (numSpecial.value > 0) allAvailableChars += symbolChars;

  let charsArray = [];

  const actualNumSpecial = Math.min(numSpecial.value, passwordLength.value - numNumbers.value);
  for (let i = 0; i < actualNumSpecial; i++) {
    charsArray.push(getRandomChar(symbolChars));
  }

  const actualNumNumbers = Math.min(numNumbers.value, passwordLength.value - charsArray.length);
  for (let i = 0; i < actualNumNumbers; i++) {
    charsArray.push(getRandomChar(numberChars));
  }

  while (charsArray.length < passwordLength.value) {
    charsArray.push(getRandomChar(uppercaseChars + lowercaseChars));
  }

  if (charsArray.length < passwordLength.value) {
    showMessage('A senha não conseguiu atingir o comprimento desejado com as opções selecionadas.', 'error');
    return;
  }

  for (let i = charsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [charsArray[i], charsArray[j]] = [charsArray[j], charsArray[i]];
  }

  generatedPassword.value = charsArray.join('');
  showMessage('Senha gerada com sucesso!');
};

const getRandomChar = (chars) => {
  if (!chars) return '';
  return chars[Math.floor(Math.random() * chars.length)];
};

const copyPassword = () => {
  if (generatedPassword.value) {
    navigator.clipboard.writeText(generatedPassword.value)
      .then(() => {
        showMessage('Senha copiada para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar senha:', err);
        showMessage('Erro ao copiar senha.', 'error');
      });
  }
};

const copyPasswordToClipboard = (password) => {
  navigator.clipboard.writeText(password)
    .then(() => {
      showMessage('Senha copiada para a área de transferência!');
    })
    .catch(err => {
      console.error('Erro ao copiar senha:', err);
      showMessage('Erro ao copiar senha.', 'error');
    });
};

const saveGeneratedPassword = async () => {
  if (!user.value) {
    showMessage('Você precisa estar logado para salvar senhas.', 'error');
    return;
  }
  if (!generatedPassword.value) {
    showMessage('Nenhuma senha gerada para salvar.', 'error');
    return;
  }
  try {
    const passwordsCollectionRef = collection(db, `users/${user.value.uid}/passwords`);
    await addDoc(passwordsCollectionRef, {
      passwordValue: generatedPassword.value,
      description: passwordDescription.value || 'Sem descrição',
      createdAt: serverTimestamp(),
      userId: user.value.uid
    });
    showMessage('Senha salva com sucesso!');
    passwordDescription.value = '';
    generatedPassword.value = '';
    fetchUserPasswords();
  } catch (error) {
    console.error('Erro ao salvar senha:', error);
    showMessage(`Erro ao salvar senha: ${error.message}`, 'error');
  }
};

const fetchUserPasswords = async () => {
  if (!user.value) return;
  try {
    const q = query(collection(db, `users/${user.value.uid}/passwords`));
    const querySnapshot = await getDocs(q);
    userPasswords.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate();
      }
      return 0;
    });
  } catch (error) {
    console.error('Erro ao buscar senhas:', error);
    showMessage(`Erro ao buscar senhas: ${error.message}`, 'error');
  }
};

const deletePassword = async (passwordId) => {
  if (!user.value) {
    showMessage('Você precisa estar logado para deletar senhas.', 'error');
    return;
  }
  
  if (!confirm('Tem certeza que deseja deletar esta senha?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, `users/${user.value.uid}/passwords`, passwordId));
    showMessage('Senha deletada com sucesso!');
    fetchUserPasswords();
  } catch (error) {
    console.error('Erro ao deletar senha:', error);
    showMessage(`Erro ao deletar senha: ${error.message}`, 'error');
  }
};

const togglePasswordVisibility = (passwordId) => {
  showPasswords[passwordId] = !showPasswords[passwordId];
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Data não disponível';
  try {
    return timestamp.toDate().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data inválida';
  }
};

const goToPasswordManager = () => {
  router.push({ name: 'GerenciadorSenhas' });
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado com sucesso!");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    showMessage('Erro ao fazer logout. Tente novamente.', 'error');
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.password-generator-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.background-elements {
  position: fixed;
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
  opacity: 0.05;
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 5%;
  right: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 5%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.manager-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00D4AA;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.manager-button:hover {
  background: rgba(0, 212, 170, 0.25);
  transform: translateY(-2px);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #FF6B6B;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(255, 107, 107, 0.25);
  transform: translateY(-2px);
}

.logout-icon {
  font-size: 16px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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

.card-header {
  margin-bottom: 24px;
  text-align: center;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
}

.card-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.generator-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.number-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
  outline: none;
}

.number-input:focus {
  border-color: #00D4AA;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.generate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
}

.button-icon {
  font-size: 18px;
}

.password-output {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.password-display {
  display: flex;
  gap: 8px;
}

.generated-password-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 8px;
  color: #00D4AA;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  cursor: text;
}

.copy-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-section {
  display: flex;
  gap: 8px;
}

.description-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.description-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.description-input:focus {
  border-color: #00D4AA;
  background: rgba(255, 255, 255, 0.12);
}

.save-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(108, 117, 125, 0.3);
  border: 1px solid rgba(108, 117, 125, 0.5);
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.save-button:hover {
  background: rgba(108, 117, 125, 0.5);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state span {
  font-size: 14px;
}

.passwords-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.passwords-list::-webkit-scrollbar {
  width: 6px;
}

.passwords-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.passwords-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.password-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.password-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.password-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-text {
  font-family: 'Courier New', monospace;
  color: #00D4AA;
  font-size: 14px;
  font-weight: 600;
}

.toggle-visibility {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  transition: color 0.3s ease;
}

.toggle-visibility:hover {
  color: #00D4AA;
}

.password-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.password-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.password-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-button.copy:hover {
  background: rgba(0, 212, 170, 0.2);
  border-color: #00D4AA;
}

.action-button.delete:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #FF6B6B;
}

.view-all-section {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.view-all-button {
  background: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00D4AA;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-all-button:hover {
  background: rgba(0, 212, 170, 0.25);
  transform: translateY(-2px);
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
  max-width: 400px;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message.success {
  background: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00D4AA;
}

.message.error {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #FF6B6B;
}

.message-icon {
  font-size: 16px;
}

/* Responsividade */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .card {
    padding: 24px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .password-display,
  .save-section {
    flex-direction: column;
  }
  
  .password-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .password-actions {
    justify-content: center;
  }
  
  .message {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .password-generator-page {
    padding: 12px;
  }
  
  .card {
    padding: 20px;
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
}
</style>

