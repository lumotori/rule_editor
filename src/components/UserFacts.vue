<script setup>
import { ref, inject } from 'vue';
//import { onMounted } from "vue";
//import SelectDrop from './SelectDrop.vue';
import axios from "axios";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const rule_token = inject('rule_token').value;

const current_rule_obj = inject('current_rule_obj');
const current_item_obj = inject('current_item_obj');
const user_facts       = inject('user_facts');
const user_facts_data  = inject('user_facts_data');
const edit_if          = inject('edit_if');
const saving_mode_rule = inject('saving_mode_rule');
const rule_list_for_ufact = inject('rule_list_for_ufact');

const auth  = inject('auth');

const DEV_PATH = inject('DEV_PATH');


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
 * Меняет состояние, инициируя загрузку основного компонента со сценариями (MainComp), а не компонента UserFacts
 */
 async function goBack(){
	user_facts.value = 0;
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	await axios
		.get(DEV_PATH + "scenarios/" + current_item_obj.value.id, request_options)
		.then((response) => {
			current_item_obj.value = response.data.data;
			//current_item_id.value  = scen_obj.id;
			//console.log({"___current_item_obj___": current_item_obj});
	});
}

/**
 * Инициация режима редактирования правила edit_if.value = 1. Включаем загрузку компонента EditIF для редактирования правила.
 * @param {Object} item_rule текущее правило
 * @param {Object} item_scen текущий сценарий
 */
 function editIF_THEN(item_rule){
	if(item_rule == null){
		$('#okno-header').html('System message');
		$("#okno-content").html('Правило не найдено!');
		$('#BoxMess').modal('show');
		return;
 	}

	edit_if.value = 1;                  // загружаем компонент редактирвания правила, новый layout для создания правила
	current_rule_obj.value = item_rule; // текущее правило - весь объект
	//current_item_obj.value = item_scen; // текущий сценарий - весь объект
	saving_mode_rule.value   = 2;        // флаг редактирования (не создания нового, тогда - 1)
}

async function saveFact(){
	var control_str = '';
	var obj = [];

	var td_input = document.getElementsByClassName("td-input");
	for(var i = 0; i < td_input.length; i++){
		var str_inputs = td_input[i].getElementsByTagName('input');
		var param_name  = str_inputs[0].value;
		var param_val   = str_inputs[1].value;
		//console.log({'event': param_name, 'description': param_val});
		if(trim(param_val) === ''){
			continue;
		}
		obj.push({"event":param_name, "description": trim(param_val)});
		control_str += trim(param_val);
	}

	var js = {"custom": obj};
	if(control_str === ''){
		//$('#okno-header').html('System message');
		//$("#okno-content").html('No data to save!');
		//$('#BoxMess').modal('show');
		console.log('No data to save!');
		return;
	}
	console.log(js);

	// отправка данных
	const request_options = {
		method: "put",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	await axios
		.put(DEV_PATH+ "scenarios/" +current_item_obj.value.id +"/custom_facts/", js, request_options)
		.then((response) => {
			console.log({"event text comment save res": response});
			$('#okno-header').html('Success');
			$("#okno-content").html('status: '+response.status+'<br />status text: '+response.statusText);
			$('#BoxMess').modal('show');
		})
		.catch((error) => {
			$('#okno-header').html('Error');
			$("#okno-content").html(error);
			$('#BoxMess').modal('show');
		});
} // saveFact


</script>

<template>
  <section id="userFacts">
	<div class="content-wrap">
		<div class="container clearfix">
			<div class="row">
				<div class="col-12 form-group">
					<div>
						<div style="float:left;">
							<h3 class="green" style="margin-left:-30px;color:#00467a;">
								<i class="icon-line-arrow-left" v-on:click="goBack()" style="cursor:pointer;"></i> {{t('user_fact_list')}}
							</h3>
						</div>
						<div style="float:right;">
							<div class="btn-rule-form" v-on:click="goBack()">
								{{t('cancel_btn')}}
							</div>
							<div class="btn-rule-form" v-on:click="saveFact()">
								<i class="icon-save"></i> {{t('save_btn')}}
							</div>
						</div>
						<div style="clear:both;"></div>
					</div>

					<!--pre style="color:#ccc;font-size:75%;">#{{ current_item_obj }}</pre-->
					
					<div><b>{{t('scenario')}}: <i style="color:#000;text-transform: uppercase;">{{ current_item_obj.name }}</i> <span style="color:#dedede;">#{{ current_item_obj.id }}</span></b></div>
				</div>
			</div>
		</div>


		<div class="container clearfix">
			<div class="row">
				<div class="col-12 form-group">

					<div style="padding:25px;background-color:#fff;border-radius:5px;">

						<div class="div-table">
							<h3>{{t('external_sensor_events')}}</h3>

							
							<table class="table-user-fact">
								<tr>
									<th style="width:50%;">{{t('event_text')}}</th>
									<th>{{t('rules_including_the_event')}}</th>
								</tr>

								<tr v-for="(item, index) in user_facts_data.external" :key="item.id">
									<td>{{item.event}}</td>
									<td>
										<div v-for="(rule_id, index) in item.rules">
											<span style="text-decoration:underline;cursor:pointer;" @click="editIF_THEN(rule_list_for_ufact[rule_id] ? rule_list_for_ufact[rule_id] : null)">{{ rule_list_for_ufact[rule_id] ? rule_list_for_ufact[rule_id].name : 'не найдено' }};</span>
										</div>
									</td>
								</tr>

							</table>
							
						</div>

						<div class="div-table">
							<h3>{{t('custom_events')}}</h3>

							
							<table class="table-user-fact">
								<tr>
									<th style="width:50%;">{{t('event_text')}}</th>
									<th>{{t('comment_displayed_in_event_viewer')}}</th>
								</tr>

								<tr v-for="(item, index) in user_facts_data.custom" class="td-input">
									
									<td>
										{{item.event}}
										<input type="hidden" :value="item.event" />
									</td>
									<td>
										<input class="form-control" style="color:#0F3860;" :placeholder="item.event" :value="item.description" />
									</td>
									
								</tr>

							</table>
							
						</div>

					</div>

				</div>
			</div>
		</div>
	</div>

  </section>
</template>

<style>
.div-table{
	margin-top:25px;
	color:#00467a;
}

.div-table h3,th,td{
	color:#00467a;
}

.div-table th{
	text-align: center;
}

.non-spec{
	color:#f00;
}

.table-user-fact{
	width:100%;
	border:0px solid #00467a;
	border-top-width: 1px;
	border-right-width: 1px;
}
.table-user-fact th, td{
	padding:7px;
	border:0px solid #00467a;
	border-bottom-width: 1px;
	border-left-width: 1px;
}


</style>
