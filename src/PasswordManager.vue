<template>
  <div class="password-manager-page">
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
          <button @click="showAddModal = true" class="add-button">
            <span class="button-icon">➕</span>
            Nova Senha
          </button>
          <button @click="handleLogout" class="logout-button">
            <span class="logout-icon">🚪</span>
            Sair
          </button>
        </div>
      </header>

      <div class="main-content">
        <!-- Barra de busca e filtros -->
        <div class="search-section">
          <div class="search-bar">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Buscar por site, usuário ou descrição..."
                class="search-input"
              />
            </div>
          </div>
          
          <div class="filter-section">
            <select v-model="selectedCategory" class="category-filter">
              <option value="">Todas as categorias</option>
              <option value="social">Redes Sociais</option>
              <option value="email">Email</option>
              <option value="banking">Bancos</option>
              <option value="work">Trabalho</option>
              <option value="entertainment">Entretenimento</option>
              <option value="shopping">Compras</option>
              <option value="other">Outros</option>
            </select>
          </div>
        </div>

        <!-- Lista de senhas -->
        <div class="passwords-grid">
          <div v-if="filteredPasswords.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">🔑</div>
            <h3>{{ searchQuery || selectedCategory ? 'Nenhuma senha encontrada' : 'Nenhuma senha salva ainda' }}</h3>
            <p>{{ searchQuery || selectedCategory ? 'Tente ajustar os filtros de busca' : 'Clique em "Nova Senha" para adicionar sua primeira senha' }}</p>
          </div>

          <div 
            v-for="password in filteredPasswords" 
            :key="password.id" 
            class="password-card"
          >
            <div class="card-header">
              <div class="site-info">
                <div class="site-icon">{{ getCategoryIcon(password.category) }}</div>
                <div class="site-details">
                  <h3 class="site-name">{{ password.siteName }}</h3>
                  <a 
                    v-if="password.siteUrl" 
                    :href="password.siteUrl" 
                    target="_blank" 
                    class="site-url"
                  >
                    {{ formatUrl(password.siteUrl) }}
                  </a>
                </div>
              </div>
              <div class="card-actions">
                <button 
                  @click="editPassword(password)" 
                  class="action-btn edit-btn"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  @click="deletePassword(password.id)" 
                  class="action-btn delete-btn"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div class="card-content">
              <div class="credential-row">
                <label>Usuário/Email:</label>
                <div class="credential-value">
                  <span>{{ password.username || 'Não informado' }}</span>
                  <button 
                    v-if="password.username"
                    @click="copyToClipboard(password.username, 'Usuário copiado!')" 
                    class="copy-btn"
                    title="Copiar usuário"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div class="credential-row">
                <label>Senha:</label>
                <div class="credential-value">
                  <span class="password-display">
                    {{ showPasswords[password.id] ? password.passwordValue : '••••••••••••' }}
                  </span>
                  <div class="password-actions">
                    <button 
                      @click="togglePasswordVisibility(password.id)" 
                      class="toggle-btn"
                      :title="showPasswords[password.id] ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      {{ showPasswords[password.id] ? '👁️' : '👁️‍🗨️' }}
                    </button>
                    <button 
                      @click="copyToClipboard(password.passwordValue, 'Senha copiada!')" 
                      class="copy-btn"
                      title="Copiar senha"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="password.notes" class="credential-row">
                <label>Notas:</label>
                <div class="notes-content">{{ password.notes }}</div>
              </div>

              <div class="card-footer">
                <span class="category-tag">{{ getCategoryName(password.category) }}</span>
                <span class="date-info">{{ formatDate(password.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para adicionar/editar senha -->
      <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingPassword ? 'Editar Senha' : 'Nova Senha' }}</h2>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>

          <form @submit.prevent="savePassword" class="password-form">
            <div class="form-group">
              <label for="siteName">Nome do Site/App *</label>
              <input 
                type="text" 
                id="siteName" 
                v-model="formData.siteName" 
                placeholder="Ex: Gmail, Facebook, Netflix"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="siteUrl">URL do Site</label>
              <input 
                type="url" 
                id="siteUrl" 
                v-model="formData.siteUrl" 
                placeholder="https://exemplo.com"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="username">Usuário/Email</label>
              <input 
                type="text" 
                id="username" 
                v-model="formData.username" 
                placeholder="seu@email.com ou nome de usuário"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="password">Senha *</label>
              <div class="password-input-group">
                <input 
                  :type="showFormPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="formData.passwordValue" 
                  placeholder="Digite ou gere uma senha"
                  required
                  class="form-input"
                />
                <button 
                  type="button"
                  @click="showFormPassword = !showFormPassword" 
                  class="toggle-form-password"
                >
                  {{ showFormPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button 
                  type="button"
                  @click="generatePasswordForForm" 
                  class="generate-password-btn"
                  title="Gerar senha aleatória"
                >
                  🎲
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="category">Categoria</label>
              <select id="category" v-model="formData.category" class="form-select">
                <option value="other">Outros</option>
                <option value="social">Redes Sociais</option>
                <option value="email">Email</option>
                <option value="banking">Bancos</option>
                <option value="work">Trabalho</option>
                <option value="entertainment">Entretenimento</option>
                <option value="shopping">Compras</option>
              </select>
            </div>

            <div class="form-group">
              <label for="notes">Notas</label>
              <textarea 
                id="notes" 
                v-model="formData.notes" 
                placeholder="Informações adicionais (opcional)"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                Cancelar
              </button>
              <button type="submit" class="save-btn" :disabled="!formData.siteName || !formData.passwordValue">
                {{ editingPassword ? 'Atualizar' : 'Salvar' }}
              </button>
            </div>
          </form>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from './firebase/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query, 
  getDocs, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const user = ref(null);
const passwords = ref([]);
const showPasswords = reactive({});
const searchQuery = ref('');
const selectedCategory = ref('');
const showAddModal = ref(false);
const editingPassword = ref(null);
const showFormPassword = ref(false);
const message = ref('');
const messageType = ref('');
const isLoading = ref(false);

const formData = reactive({
  siteName: '',
  siteUrl: '',
  username: '',
  passwordValue: '',
  category: 'other',
  notes: ''
});

const categories = {
  social: { name: 'Redes Sociais', icon: '📱' },
  email: { name: 'Email', icon: '📧' },
  banking: { name: 'Bancos', icon: '🏦' },
  work: { name: 'Trabalho', icon: '💼' },
  entertainment: { name: 'Entretenimento', icon: '🎬' },
  shopping: { name: 'Compras', icon: '🛒' },
  other: { name: 'Outros', icon: '🔗' }
};

const filteredPasswords = computed(() => {
  let filtered = passwords.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(pwd => 
      pwd.siteName.toLowerCase().includes(query) ||
      (pwd.username && pwd.username.toLowerCase().includes(query)) ||
      (pwd.notes && pwd.notes.toLowerCase().includes(query))
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(pwd => pwd.category === selectedCategory.value);
  }

  return filtered;
});

onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    user.value = currentUser;
    fetchPasswords();
  } else {
    user.value = null;
    passwords.value = [];
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

const fetchPasswords = async () => {
  if (!user.value) return;
  
  isLoading.value = true;
  try {
    const q = query(
      collection(db, `users/${user.value.uid}/passwords`),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    passwords.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar senhas:', error);
    showMessage('Erro ao carregar senhas', 'error');
  } finally {
    isLoading.value = false;
  }
};

const savePassword = async () => {
  if (!user.value) return;

  try {
    const passwordData = {
      siteName: formData.siteName,
      siteUrl: formData.siteUrl || '',
      username: formData.username || '',
      passwordValue: formData.passwordValue,
      category: formData.category,
      notes: formData.notes || '',
      userId: user.value.uid,
      updatedAt: serverTimestamp()
    };

    if (editingPassword.value) {
      // Atualizar senha existente
      await updateDoc(
        doc(db, `users/${user.value.uid}/passwords`, editingPassword.value.id),
        passwordData
      );
      showMessage('Senha atualizada com sucesso!');
    } else {
      // Criar nova senha
      passwordData.createdAt = serverTimestamp();
      await addDoc(
        collection(db, `users/${user.value.uid}/passwords`),
        passwordData
      );
      showMessage('Senha salva com sucesso!');
    }

    closeModal();
    fetchPasswords();
  } catch (error) {
    console.error('Erro ao salvar senha:', error);
    showMessage('Erro ao salvar senha', 'error');
  }
};

const editPassword = (password) => {
  editingPassword.value = password;
  formData.siteName = password.siteName;
  formData.siteUrl = password.siteUrl || '';
  formData.username = password.username || '';
  formData.passwordValue = password.passwordValue;
  formData.category = password.category || 'other';
  formData.notes = password.notes || '';
  showAddModal.value = true;
};

const deletePassword = async (passwordId) => {
  if (!user.value) return;
  
  if (!confirm('Tem certeza que deseja deletar esta senha?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, `users/${user.value.uid}/passwords`, passwordId));
    showMessage('Senha deletada com sucesso!');
    fetchPasswords();
  } catch (error) {
    console.error('Erro ao deletar senha:', error);
    showMessage('Erro ao deletar senha', 'error');
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingPassword.value = null;
  showFormPassword.value = false;
  Object.keys(formData).forEach(key => {
    if (key === 'category') {
      formData[key] = 'other';
    } else {
      formData[key] = '';
    }
  });
};

const togglePasswordVisibility = (passwordId) => {
  showPasswords[passwordId] = !showPasswords[passwordId];
};

const copyToClipboard = (text, successMessage = 'Copiado!') => {
  navigator.clipboard.writeText(text)
    .then(() => {
      showMessage(successMessage);
    })
    .catch(err => {
      console.error('Erro ao copiar:', err);
      showMessage('Erro ao copiar', 'error');
    });
};

const generatePasswordForForm = () => {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  formData.passwordValue = password;
  showMessage('Senha gerada automaticamente!');
};

const getCategoryIcon = (category) => {
  return categories[category]?.icon || categories.other.icon;
};

const getCategoryName = (category) => {
  return categories[category]?.name || categories.other.name;
};

const formatUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Data não disponível';
  try {
    return timestamp.toDate().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Data inválida';
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    showMessage('Erro ao fazer logout', 'error');
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.password-manager-page {
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

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  color: #FFFFFF;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
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

.search-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  border-color: #00D4AA;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.category-filter {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  min-width: 180px;
}

.category-filter option {
  background: #1A1A2E;
  color: #FFFFFF;
}

.passwords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.password-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out;
}

.password-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.site-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.site-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  flex-shrink: 0;
}

.site-details {
  flex: 1;
  min-width: 0;
}

.site-name {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 4px 0;
  word-break: break-word;
}

.site-url {
  color: #00D4AA;
  text-decoration: none;
  font-size: 14px;
  word-break: break-all;
}

.site-url:hover {
  text-decoration: underline;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: rgba(0, 212, 170, 0.2);
  border-color: #00D4AA;
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #FF6B6B;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.credential-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.credential-row label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.credential-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.credential-value span {
  color: #FFFFFF;
  font-size: 14px;
  word-break: break-all;
  flex: 1;
}

.password-display {
  font-family: 'Courier New', monospace;
  color: #00D4AA !important;
  font-weight: 600;
}

.password-actions {
  display: flex;
  gap: 4px;
}

.copy-btn,
.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.copy-btn:hover,
.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #00D4AA;
}

.notes-content {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.category-tag {
  background: rgba(0, 212, 170, 0.2);
  color: #00D4AA;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.date-info {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  color: #FFFFFF;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #FF6B6B;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #00D4AA;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.form-select option {
  background: #1A1A2E;
  color: #FFFFFF;
}

.password-input-group {
  position: relative;
  display: flex;
  gap: 8px;
}

.password-input-group .form-input {
  flex: 1;
}

.toggle-form-password,
.generate-password-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-form-password:hover,
.generate-password-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #00D4AA;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: linear-gradient(45deg, #00D4AA, #00A8CC);
  color: #FFFFFF;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  z-index: 1001;
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

/* Responsividade */
@media (max-width: 768px) {
  .passwords-grid {
    grid-template-columns: 1fr;
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
  
  .search-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .category-filter {
    width: 100%;
  }
  
  .modal-content {
    padding: 24px;
    margin: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
  
  .message {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .password-manager-page {
    padding: 12px;
  }
  
  .password-card {
    padding: 16px;
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .site-name {
    font-size: 16px;
  }
  
  .passwords-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>

