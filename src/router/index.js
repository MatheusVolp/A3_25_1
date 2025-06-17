import { createRouter, createWebHistory } from 'vue-router';
import Login from '../Login.vue';
import PasswordGenerator from '../PasswordGenerator.vue';
import PasswordManager from '../PasswordManager.vue';
import { auth } from '../firebase/firebase'; 

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/gerador-senhas',
    name: 'GeradorSenhas',
    component: PasswordGenerator,
    meta: { requiresAuth: true } 
  },
  {
    path: '/gerenciador-senhas',
    name: 'GerenciadorSenhas',
    component: PasswordManager,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/:catchAll(.*)',
    redirect: '/' 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = auth.currentUser; 

  if (requiresAuth && !currentUser) {
    next({ name: 'Login' });
  } else if (!requiresAuth && currentUser) {
    next({ name: 'GeradorSenhas' });
  } else {
    next();
  }
});

export default router;

