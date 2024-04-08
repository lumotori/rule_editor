<script setup>
import { ref, inject, provide } from 'vue';
import axios from "axios";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const rule_token = inject('rule_token').value;

const DEV_PATH = inject('DEV_PATH');

const edit_if   = inject('edit_if');
const current_item_obj = inject('current_item_obj'); // текущий сценарий
const current_rule_obj = inject('current_rule_obj'); // текущее правило
const current_item_id  = inject('current_item_id'); 
const saving_mode_rule = inject('saving_mode_rule');
const user_facts       = inject('user_facts');
const user_facts_data  = inject('user_facts_data');
const user_facts_count = inject('user_facts_count');

const auth  = inject('auth');

const openFormScenario = inject('openFormScenario');
const test_value       = inject('test_value');

// новое правило как пустой объект лишь со структурой
const new_rule = ref({
	condition:      "",
	body:           "",
	description:    "",
	id:             "",
	ignore_id:      false,
	name:           "",
	no_log:         true,
	repeat:         false,
	rule_type:      "",
	scenario_id:    current_item_obj.id,
	spatial_filter: false
});
const is_disabled = ref(true); // не используется

// не используется
defineProps({
  msg: {
    type: String,
    required: true
  },
})


/**
 * Инициирует режим создания нового правила. После этого автоматически загрузится новый layout для редактирования правила.
 */
async function openFormRule(){
	//console.log({"--- current_item_obj ---": current_item_obj});

	var lifetime_of_event_ms      = current_item_obj.value.parameters.lifetime_of_event_ms;
	var lifetime_of_lost_track_ms = current_item_obj.value.parameters.lifetime_of_lost_track_ms;

	if(!test_value('lifetime_of_event_ms', lifetime_of_event_ms)){
		openFormScenario(2, current_item_obj.value);
		return;
	}
	if(!test_value('lifetime_of_lost_track_ms', lifetime_of_lost_track_ms)){
		openFormScenario(2, current_item_obj.value);
		return;
	}

	edit_if.value          = 1;              // новый layout для создания правила
	current_rule_obj.value = new_rule.value;
	saving_mode_rule.value = 1;
}; // openFormRule

/**
 * Запрашивает сценарий и назначает новые значения константам состояния.
 * @param {String} scen_id 
 */
function updScenario(scen_id) {
	// обновляем правое поле со сценарием
	// чтобы правило появилось в списке правил у сценария
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	axios
		.get(DEV_PATH + "scenarios/" + scen_id, request_options)
		.then((response) => {
			current_item_obj.value = response.data.data;
			current_item_id.value  = scen_id;
	});
}

/**
 * Удаляет правило и обновляет сценарий для отображения справа новой информации - параметров сценария и списка правил.
 * @param {Object} rule_obj 
 */
function _clickDeleteRule(rule_obj){

	if(!confirm("Удалить правило: "+rule_obj.name+"?")){
		return;
	}

	let scen_id = current_item_id.value;

	//alert(scen_id+' :: '+rule_obj.id);
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	axios.delete(DEV_PATH + "scenarios/" + scen_id + "/rules/" + rule_obj.id, request_options).then((response) => {
		if(response.status === 200){
			updScenario(scen_id);
		}
	});

}; // _clickDeleteRule

/**
 * Инициация режима редактирования правила edit_if.value = 1. Включаем загрузку компонента EditIF для редактирования правила.
 * @param {Object} item_rule текущее правило
 * @param {Object} item_scen текущий сценарий
 */
function editIF_THEN(item_rule, item_scen){
	edit_if.value = 1;                  // загружаем компонент редактирвания правила, новый layout для создания правила
	current_rule_obj.value = item_rule; // текущее правило - весь объект
	console.log({"item-rule": item_rule});
	//current_item_obj.value = item_scen; // текущий сценарий - весь объект
	saving_mode_rule.value   = 2;        // флаг редактирования (не создания нового, тогда - 1)
	//console.log({"____current_item_obj": current_item_obj, "it_sc": item_scen});
}

async function goToUserFacts(){
	//console.log({"user_facts": user_facts.value});
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	axios
		.get(DEV_PATH + "scenarios/" + current_item_id.value + "/custom_facts/", request_options)
		.then((response) => {
			console.log({"user fact query": response.data.data});
			user_facts_data.value = response.data.data;
			user_facts.value = 1;
		})
		.catch((err) => {
			console.log({"err user fact": err});
		});

} // goToUserFacts

provide('current_item_obj', current_item_obj); // текущий сценарий

</script>

<template>
	<section id="scen_content" style="height:100% !important;">
		<!--h3 class="green">{{ msg }}</h3-->

		<div style="padding:10px 15px 25px;background-color:#45A2DB;border-radius:5px;">
			<h3 style="color:#00467a;font-size:32px;">{{ current_item_obj.name }}</h3>

			<div class="col-12 form-group">
				<b class="scenario-field">{{ t('lifetime_of_lost_track_ims') }}: <span class="scenario-field-value">{{ current_item_obj.parameters.lifetime_of_lost_track_ms }}</span></b>
			</div>
			<div class="col-12 form-group">
				<b class="scenario-field">{{ t('lifetime_of_event_ims') }}: <span class="scenario-field-value">{{ current_item_obj.parameters.lifetime_of_event_ms }}</span></b>
			</div>
			<div class="col-12 form-group">
				<b class="scenario-field">{{ t('keys') }}: <span class="scenario-field-value">{{ (current_item_obj.parameters.keys == '') ? '--- no keywords ---' : current_item_obj.parameters.keys }}</span></b>
			</div>
		</div>

		<div class="div-rules container">
		<div class="row" style="margin-left:0px;">
			<div class="col-md-12">

				<div>
					<div style="float:left;">
						<h3 style="color:#00467a;font-size:32px;">{{t('scenario_rules_list')}} </h3>
					</div>
					<div style="float:right;">
						<div class="btn-create-rule" @click="openFormRule()" title="Create rule">+ {{t('create_btn')}}</div>
					</div>
					<div style="clear:both;"></div>
				</div>

				<div style="clear:both;"></div>

				<div style="margin:-5px 0px 0px 10px;">

					<div style="width:100%;">

						<div v-for="(item, index) in current_item_obj.rules" class="rule-line" :key="item.id" style="position:relative;">
							<div>
								<div style="cursor:pointer;color:#00467a;font-family:Courier New,monospace;font-weight: bold;" v-on:click="editIF_THEN(item, current_item_obj)" title="Edit rule">{{item.name}}</div>
							</div>

							<div style="font-size: 85%;position:absolute;top:7px;right:3px;">
								<div class="ctrl-rule">
								<i class="icon-pen1" style="cursor:pointer;color:#008ee0;font-weight:bold;" v-on:click="editIF_THEN(item, current_item_obj)" title="Edit rule"></i>&nbsp;&nbsp;&nbsp;<i class="icon-trash1" style="cursor:pointer;color:#008ee0;font-weight:bold;" v-on:click="_clickDeleteRule(item)" title="Delete rule"></i>
								</div>
							</div>
							
						</div>

					</div>

				</div>
			</div>
		</div>
		</div>

		<br /><br />

		<div class="container">
			<div class="row">
				<div class="col-md-12">
					<div>
					<div style="float:left;" class="uf-href">
						<span v-if="user_facts_count" class="user-fact-list" @click="goToUserFacts()" style="cursor:pointer;" :title="`${t('open_user_fact')}`">
							{{t('user_fact_list')}} <span style="font-size:60%;">({{ t('tooltip_facts') }}: {{user_facts_count}})</span>
						</span>
						<span v-else class="user-fact-list" :title="`${t('no_user_fact')}`">
							{{t('user_fact_list')}} <span style="font-size:60%;">({{ t('tooltip_facts') }}: {{user_facts_count}})</span>
						</span>
					</div>
					<div style="float:right;">
						<div v-if="user_facts_count" class="btn-create-rule" @click="goToUserFacts()" :title="`${t('open_user_fact')}`">{{t('open_btn')}}</div>
						<div v-else class="btn-no-found" :title="`${t('no_user_fact')}`">{{t('open_btn')}}</div>
					</div>
					<div style="clear:both;"></div>
				</div>
				</div>
			</div>
		</div>

		<br /><br />
	</section>


</template>

<style>
.uf-href{
	font-family: IBM Plex Sans;
}
.scenario-field{
	font-family:Courier New,monospace;
	color:#00467a;
}

.scenario-field-value{
	text-decoration: underline;
	font-family:Arial, Helvetica, sans-serif;
}

.div-rules{
	background-color: #fff;
	width:100%;
	margin-top:-15px;
	padding-top:15px;
	border-radius: 5px;
	/*height:100%;*/
	display:flexbox;
}

.btn-create-rule{
	cursor:pointer;
	background-color:#fff;
	font-family:Courier New,monospace;
	font-size: 90%;
	border-radius:8px;
	border:1px solid #ccc;
	padding:3px 4px 1px;
	color:#00467a;
}

.btn-no-found{
	background-color:#ccc;
	font-family:Courier New,monospace;
	font-size: 90%;
	border-radius:8px;
	border:1px solid #ccc;
	padding:3px 4px 1px;
	color:#fff;
}

.rule-line{
	padding:10px;
}

.rule-line:hover{
	background-color: #eeeff3;
}

.ctrl-rule{
	display: none;
}

.rule-line:hover .ctrl-rule{
	display: block;
}

.user-fact-list{
	color:#00467a;
	font-size:25px;
	font-family:'IBM Plex Sans';
	font-weight:500;
	letter-spacing: -0.5px;
}
</style>
