<script setup>
import { ref, inject } from 'vue';
import axios from "axios";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const auth       = inject('auth');
const main_comp  = inject('main_comp');
const DEV_PATH   = inject('DEV_PATH');
const rule_token = inject('rule_token');

const auth_state = inject('auth_state');

/**
 * Слева и справа удаляет пробелы у переданной строки.
 * Возвращает строку без пробелов слева и справа.
 * @param {String} str входящая строка
 * @returns {String}
 */
function trim(str){
	return str.toString().replace(/^[ ]+/, '').replace(/[ ]+$/, '');
}

/**
 * Уходим с экрана авторизации
 */
 function clickMain(){
	auth.value = 0;
}

async function goAuth(e){
	e.preventDefault();

	var log  = document.getElementById('login').value;
	var pass = document.getElementById('password').value;

	var warn_str = '';

	if(trim(log) === ''){
		warn_str = ''+warn_str + t('login_placeholder')+' <br />';
	}
	if( trim(pass) === ''){
		warn_str = ''+warn_str + t('pass_placeholder')+' <br />';
	}
	if(warn_str !== ''){
		$('#okno-header').html(t('system_message'));
		$("#okno-content").html(warn_str);
		$('#BoxMess').modal('show');
		return;
	}

	var auth_str   = ''+log+':'+pass;
	var token = window.btoa(unescape(encodeURIComponent(auth_str)));
	//console.log({token: token});
	//return;

	// запрашиваем список сценариев, для аутентификации пользователя
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+token,
		},
	};
	await axios.get(DEV_PATH + "scenarios", request_options).then((response) => {
		localStorage.setItem('rule_token', token);                         
		rule_token.value = localStorage.getItem('rule_token');
		main_comp.value  = 1;
		auth.value       = 0;
		auth_state.value = 1;
	}).catch((resp) => {
		/*
		$('#okno-header').html('Auth fail');
		$("#okno-content").html(resp.toString());
		$('#BoxMess').modal('show');
		*/
		document.getElementById('result-auth-block').innerHTML = t('user_not_found');
	});

} // goAuth

</script>

<template>
	<section style="padding-top:90px;">
		
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-lg-12 col-md-12" style="background-color: #fff;border-radius: 5px;padding:35px;text-align: center;">
					
					<h1>
						<router-link :to="{ name: 'Home' }">
							<i class="icon-line-arrow-left" style="cursor:pointer;"></i>
						</router-link>

						{{ t('about') }}
					</h1>

				</div>
			</div>
		</div>

	</section>
</template>

<style>
#result-auth-block{
	color:#f00;
	text-align:center;
	font-size:150%;
}
</style>