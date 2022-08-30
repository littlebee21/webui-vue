import Vue from 'vue';
import VueRouter from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';
import routes from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
  linkExactActiveClass: 'nav-link--current',
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!to.matched.some((record) => record.meta.requiresAuth)) {
      next();
      return;
    }
    if (!store.getters['authentication/isLoggedIn']) {
      next('/login');
      return;
    }
    if (to.name === 'overview') {
      next();
      return;
    }
    if (
      store.getters['activation/activateState'] !== 'pass' &&
      to.name !== 'activation'
    ) {
      next('/access-control/activation');
      return;
    }
    next();
  } else {
    next();
  }
});

export default router;
