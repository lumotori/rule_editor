import { createApp } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import messages from '../locales/localization.json';
//import { getCurrentKeyboardLayout, getCurrentKeyboardLanguage, getCurrentKeymap } from 'keyboard-layout'
import $ from 'jquery';

//import vueMentionable from 'vue-mentionable';
//import './assets/main.css';

import { createRouter, createWebHistory } from 'vue-router';
// setup routes
const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Home',
        component: () => import('./components/LP.vue')
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('./components/Auth.vue')
      },
      {
        path: '/scenarios',
        name: 'ScenariosList',
        component: () => import('./components/MainComp3.vue'),
        children: [{
            path: '/scenarios/:id',
            name: 'ScenarioSingle',
            component: () => import('./components/Scenario.vue')
          }]
      },
      {
        path: '/rule/:id',
        name: 'RuleSingle',
        component: () => import('./components/EditIF.vue')
      },
      {
        path: '/user-fact/:id',
        name: 'RuleUserFact',
        component: () => import('./components/UserFacts.vue')
      },
    ]
  })

	
const userLanguage = navigator.language;
//console.log(userLanguage.substring(0,2));

const i18n = createI18n({
    legacy:           false, // you must set `false`, to use Composition API
    locale:           (localStorage.getItem('locale')) ? localStorage.getItem('locale') : userLanguage.substring(0,2),  // set locale
    fallbackLocale:   'en',
    allowComposition: true, // you need to specify that!
    messages:         messages,
});

createApp(App).use(router).use(i18n).mount('#app');
