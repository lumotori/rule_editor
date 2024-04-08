<script setup>
import { inject }  from 'vue';
import axios       from "axios";
import { useI18n } from 'vue-i18n';
//import Headline from './Headline.vue';

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

function clickMain(){
	auth.value = 0;
}
 */

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
		document.getElementById('login').style.borderColor = '#f00';
		document.getElementById('password').style.borderColor = '#f00';
		document.getElementById('result-auth-block').innerHTML = t('user_not_found');
	});

} // goAuth

function disableButton(f1_len, f2_len){
	if(f1_len * f2_len === 0){
		document.getElementById('btn-submit').disabled = true;
	}else{
		document.getElementById('btn-submit').disabled = false;
	}
} // disableButton

function handlerLogin(e){
	console.log({e_log: e.target.value});
	var login_len = parseInt(e.target.value.toString().length);
	var pass_len  = parseInt(document.getElementById('password').value.toString().length);

	disableButton(login_len, pass_len);
}
function handlerPass(e){
	console.log({e_pass: e.target.value});

	var login_len = parseInt(document.getElementById('login').value.toString().length);
	var pass_len  = parseInt(e.target.value.toString().length);

	disableButton(login_len, pass_len);
}
</script>

<template>

	<!--Headline /-->

	<section id="content">
		<div class="content-wrap">
			<div class="container">
				<div class="row justify-content-center">
					<div class="col-md-12" style="background-color: #fff;border-radius: 5px;padding:0px;">
						<div class="select-scen">
							<img src="/images/graf.png" width="135" alt="ISS Rule editor" />
							<h2 style="color:#0F3860;font-size:56px;font-weight:500;margin:20px 0px;">
								{{ t('title') }} <br />
							</h2>

							<!--div class="right-button" @click="clickAuthForm()" title="Authorization">
								{{ t('start_btn') }}
							</div-->

							<div class="col-lg-6 col-md-6 offset-md-3 text-left">
								<div class="card shadow-sm" style="background-color: transparent !important;margin-bottom: 20px !important;">
									<!--div class="card-header" style="background-color: #00467a !important;">
										<h4 style="color: #fff !important;">
											{{t('auth_title')}}
										</h4>
									</div-->
									<div class="card-body" style="background-color: #fff !important;padding-top:0px !important;padding-bottom:0px !important;">
										<form class="" id="login-form" style="margin-bottom:0px !important;" name="login-form" method="post" encType="multipart/form-data" @submit="goAuth">
											<div class="row">

												<div class="col-12 form-group">
													<label>{{t('login_header')}}:<small class="text-danger" style="font-size:150%">*</small></label>
													<input type="text" id="login" name="login" value="" class="form-control required" :placeholder="t('login_placeholder')" @change="handlerLogin" @keyup="handlerLogin" />
												</div>

												<div class="col-12 form-group">
													<label>{{t('pass_header')}}:<small class="text-danger" style="font-size:150%">*</small></label>
													<input type="password" id="password" name="password" value="" class="form-control" :placeholder="t('pass_placeholder')" @change="handlerPass" @keyup="handlerPass" />
												</div>

												<div class="col-12 form-group" style="margin-top:10px">
													<button style="padding: 5px 10px; width:auto; background-color: #0F3860; border:0px;" type="submit" name="btn-submit" id="btn-submit" class="btn btn-secondary" disabled="true">{{ t('sign_in') }}</button>
													<span id="result-auth-block"></span>
												</div>

											</div>
										</form>
									</div>
								</div>

								<div style="height:25px;"></div>
								
							</div>



						</div><!--// select-scen -->
					</div>
				</div>

			</div>
		</div>
	</section>

</template>

<style>
#result-auth-block{
	padding-left: 7px;
}
</style>