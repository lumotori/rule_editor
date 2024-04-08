<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' })

const auth       = inject('auth');
const user_facts = inject('user_facts');
const edit_if    = inject('edit_if');
const main_comp    = inject('main_comp');

const auth_state = inject('auth_state');

console.log({auth_state:auth_state});

/**
 * Инициация режима авторизации
 */
function clickAuthForm(){
    user_facts.value = 0;
    edit_if.value    = 0;
    main_comp.value  = 0;
	auth.value       = 1;
}
/**
 * Выход из системы
 */
 function clickSignOut(){
    localStorage.removeItem('rule_token');
    user_facts.value = 0;
    edit_if.value    = 0;
	auth.value       = 0;
    main_comp.value  = 0;

    auth_state.value  = 0;
}
function _selectLocal(loc){
    localStorage.setItem('locale', loc);
    locale.value = loc;
}
function selectLocal(e){
    //console.log({"lang": e.target.value});
    localStorage.setItem('locale', e.target.value);
}
</script>

<template>

    <header id="header" class="main-header main-header-overlay sticky-header" data-sticky-header="true">

    <div id="header-wrap">

        <div class="container clearfix">

            <div id="primary-menu-trigger"><i class="icon-reorder"></i></div>

            <div id="logo">
                <a href="/" className="standard-logo" data-dark-logo="/images/logoISS.jpg"><img src="/images/logoISS2_tr.png" alt="ISS" /></a>
                <a href="/" class="retina-logo" data-dark-logo="/images/logoISS.jpg"><img src="/images/logoISS2@2x.png" alt="ISS" /></a>
            </div>

            <nav id="primary-menu">
                <ul class="top-links">
                    <!--li>
                        <span>
                            <router-link :to="{ name: 'About' }">
                                {{ t('about') }}
                            </router-link>
                        </span>
                    </li-->
                    <li style="cursor:pointer;">
                        <span v-if="locale=='en'" style="text-transform:uppercase;color:#00467a;font-size:12px !important;"><img src="/images/eng.png" alt="Lang">en</span>
                        <span v-else style="text-transform:uppercase;color:#00467a;font-size:12px !important;"><img src="/images/rus.png" alt="Lang">ru</span>
                        <ul>
                            <li style="cursor:pointer;" @click="_selectLocal('ru')"><span style="text-transform:uppercase;color:#00467a;"><img src="/images/rus.png" alt="Lang">Русский</span></li>
                            <li style="cursor:pointer;" @click="_selectLocal('en')"><span style="text-transform:uppercase;color:#00467a;"><img src="/images/eng.png" alt="Lang">English</span></li>
                        </ul>
                    </li>
                    <li style="display:none;">
                        <select v-model="locale" class="form-control" style="margin-top:15px;" @change="selectLocal">
                            <option value="en">en</option>
                            <option value="ru">ru</option>
                        </select>
                    </li>

                    <li v-if="auth_state"><div class="btn-top" v-on:click="clickSignOut()" id="sign-out">{{t('sign_out')}}</div></li>
                    <!--li v-else><div class="sign_in" v-on:click="clickAuthForm()">{{t('sign_in')}}</div></li-->
                </ul>

            </nav>

        </div>

    </div>

    </header>




</template>

<style>
#sign-out{
    background-color:#00467a ;
    color:#fff;
}
.btn-top{
    padding:4px;
}
</style>