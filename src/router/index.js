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
  if (to.name === 'activation') {
    next();
    return;
  }
  if (store.getters['activation/activateState'] == 'no') {
    next('/security-and-access/activation');
    return;
  }
  if (store.getters['activation/activateState'] == 'unpass') {
    let activateState;
    store.dispatch('activation/getActivateState').then(() => {
      activateState = store.getters['activation/activateState'];
      if (activateState == 'no') {
        next('/security-and-access/activation');
        return;
      }
    });
  }
  next();
});

export default router;
