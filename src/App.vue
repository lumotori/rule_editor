<script setup>
import MainComp3        from './components/MainComp3.vue';
import EditIF           from './components/EditIF.vue';
import UserFacts        from './components/UserFacts.vue';
import Auth            from './components/Auth.vue';
import Headline         from './components/Headline.vue';
import LP               from './components/LP.vue';
import { ref, provide } from 'vue';

// текущий сценарий (весь объект)
const current_item_obj = ref({
	name:  "",
	id:    "",
	rules: [],
	parameters: {
		lifetime_of_lost_track_ms: 5000,
		lifetime_of_event_ms:      900000,
		keys: "",
	},
});

// новый сценарий
const new_object = ref({
	name:  "",
	id:    "",
	rules: [],
	parameters: {
		lifetime_of_lost_track_ms: 5000,
		lifetime_of_event_ms:      900000,
		keys: "",
	},
});
provide('new_object', new_object);

// текущее правило (весь объект)
const current_rule_obj = ref({
	condition:     "",
	body:          "",
	description:   "",
	id:            "",
	ignore_id:     false,
	name:          "",
	no_log:         true,
	repeat:        false,
	rule_type:      "",
	scenario_id:    "",
	spatial_filter: false
});
const current_item_id           = ref(0);  // id текущего сценария (играет роль при выборе компонента для загрузки MainComp или EditIF)
const edit_if_then              = ref(0);  // флаг редактирования правила
const drop_down_list_premises   = ref([]); // список инструкций для выпадающего списка в IF
const drop_down_list_conclusion = ref([]); // список инструкций для выпадающего списка в THEN
const focus_drop                = ref(0);  // состояние фокуса на выпадающем окне (не используется)
const select_drop_item          = ref(''); // выбранный кликом пункт выпадающего списка
const saving_mode_rule          = ref(0);  // режим сохранения правила (1 - создание нового, 2 - редактирование, 0 - не редактируем правило)
const user_facts                = ref(0);  // флаг перехода в раздел user_facts
const auth                      = ref(0);  // страница авторизации
//const landing_page              = ref(0);  // главная страница (лендинг, без авторизации)
const main_comp                 = ref(0);  // основная компонента
const user_facts_data           = ref({"external": [], "custom": []});  // user_facts - данные
const user_facts_count          = ref(0);  // количество пользовательских фактов в текущем сценарии
const rule_list_for_ufact       = ref([]); // массив для хранения списка правил текущего сценария для использ. на стр User fact

// перенесено из MainComp после введения авторизации
const scen_name_list   = ref([]);   // массив для контроля уникальных имён сценариев (при создании новых)
const scen_object_list = ref({});   // объект для контроля уникальных имён сценариев (при редактировании)
const flag_availible   = ref(1);    // для отслеживания уникальности наименования (не используется, реализовано без состояния)
const items            = ref([]);   // список сценариев
const saving_mode      = ref(0);    // 1 - создаём сценарий, 2 - редактируем, 0 - нет режима редактирования сценария
const is_disabled      = ref(true); // для управления состоянием disabled кнопки сохранения

//console.log({"App items": items});
const auth_state = ref(user_facts.value + edit_if_then.value + main_comp.value);

//const DEV_PATH = "http://aimtest.isa.ru/api/v1/";
const DEV_PATH = "http://aimvm.isa.ru:39014/api/v1/";
//const KB_PATH  = "http://aimtest.isa.ru/api/v1/knowledge_base/";
const KB_PATH  = "http://aimvm.isa.ru:39014/api/v1/scenarios/";
//const DEV_PATH  = 'http://'+${window.location.host}/api/v1.replace(/\/+$/, "") + "/";

const rule_token = ref(localStorage.getItem('rule_token'));
//alert(rule_token);
if(rule_token.value === '' || rule_token.value === null || rule_token.value === undefined){
	//landing_page.value = 1;
	edit_if_then.value = 0;
	user_facts.value   = 0;
	auth.value         = 0;
	main_comp.value    = 0;
}else{
	main_comp.value  = 1;
	auth_state.value = 1; 
}
provide('rule_token', rule_token);

provide('saving_mode_rule', saving_mode_rule); // create or edit rule
provide("current_rule_obj", current_rule_obj); // текущее правило (весь объект)
provide('current_item_obj', current_item_obj); // текущий сценарий (весь объект)
provide('current_item_id',  current_item_id);  // id текущего сценария
provide('edit_if',          edit_if_then);     // флаг редактирования правила на отд layout
provide('drop_down_list_premises',     drop_down_list_premises);
provide('drop_down_list_conclusion',   drop_down_list_conclusion);
provide('select_drop_item',            select_drop_item);
provide('focus_drop',                  focus_drop);
provide('user_facts',                  user_facts); // флаг страницы с таблицей user facts
provide('auth',                        auth);       // страница авторизации
//provide('landing_page',                landing_page);
provide('main_comp',                   main_comp);
provide('user_facts_data',             user_facts_data);
provide('user_facts_count',            user_facts_count);
provide('rule_list_for_ufact',         rule_list_for_ufact);
provide('DEV_PATH',                    DEV_PATH);
provide('KB_PATH',                     KB_PATH);

provide('scen_name_list',   scen_name_list);
provide('scen_object_list', scen_object_list);
provide('flag_availible',   flag_availible);
provide('items',            items);
provide('saving_mode',      saving_mode);
provide('is_disabled',      is_disabled);
provide('auth_state',       auth_state);

</script>

<template>
	<Headline />
	
	<!--router-view /-->

	<EditIF    v-if      = "edit_if_then" />
	<UserFacts v-else-if = "user_facts"   />
	<Auth      v-else-if = "auth"         />
	<MainComp3 v-else-if = "main_comp"    />
	<LP        v-else                     />
</template>

<style>

</style>
