import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login.vue'; // Adjust the path as needed
import Sites from '@/components/Sites.vue'; // Adjust the path as needed
import Cookies from 'js-cookie';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/sites',
    name: 'sites',
    component: Sites,
  },
  {
    path: '/',
    redirect: '/login', // Redirect to login by default
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add a global navigation guard
router.beforeEach((to, from, next) => {
  const sessionToken = Cookies.get('JSESSIONID');

  if (sessionToken) {
    // If token exists and user is trying to access login, redirect to /sites
    if (to.name === 'login') {
      next({ name: 'sites' });
    } else {
      next(); // Allow navigation if they are not going to login
    }
  } else {
    // If token doesn't exist and user is trying to access protected route, redirect to login
    if (to.name !== 'login') {
      next({ name: 'login' });
    } else {
      next(); // Allow access to login page if no token exists
    }
  }
});

export default router;