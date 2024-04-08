<script setup>
import { provide, inject } from 'vue';
import { onMounted } from "vue";
import axios from "axios";
import Scenario from './Scenario.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const rule_token = inject('rule_token').value;

const scen_name_list   = inject('scen_name_list');
const scen_object_list = inject('scen_object_list');
const flag_availible   = inject('flag_availible');
const items            = inject('items');
const saving_mode      = inject('saving_mode');
const is_disabled      = inject('is_disabled');

const DEV_PATH = inject('DEV_PATH');

const current_item_id  = inject('current_item_id');
const current_item_obj = inject('current_item_obj');
const rule_list_for_ufact = inject('rule_list_for_ufact');
const new_object = inject('new_object');

const user_facts_count = inject('user_facts_count');

/**
 * Загружает список сценариев (id, name). Кроме этого, если задан текущий сценарий - current_name - запрпашивает его полностью
 * и назначает переменные состояния для отображения текущего сценария в правой части (все параметры и правила).
 * Вызывается при загрузке Приложения - onMounted(), а также при добавлении, редактировании и удалении сценариев для обновления списка сценариев слева.
 * @param {String} current_name имя текущего сценария, если он определен, иначе пустая строка
 */
async function onDownloadApp(current_name = ''){
	scen_name_list.value   = []; // очищаем
	scen_object_list.value = {}; // очищаем
	console.log({"после авторизации": rule_token, scen_object_list: scen_object_list});

	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	await axios.get(DEV_PATH + "scenarios", request_options).then((response) => {
		console.log({"scen_list": response});

		items.value = response.data.data;
		//var r = {"data":[{"id":"1","name":"tfrhdhg132123132"},{"id":"2","name":"qweeq331"},{"id":"3","name":"qwesdas"},{"id":"4","name":"new1"}],"status":"success"};
		//items.value = r.data;

		scen_name_list.value   = []; // очищаем
		scen_object_list.value = {}; // очищаем

		console.log({'scen_object_list - до': scen_object_list});

		for(var itm in response.data.data){

			scen_name_list.value.push(response.data.data[itm]['name']);
			scen_object_list.value[response.data.data[itm]['id']] = response.data.data[itm]['name'];

			if(current_name !== ''){
				// делаем текущим сценарий с данным именем
				if(current_name == response.data.data[itm]['name']){
					//console.log({"new_current": response.data.data[itm]});

					const request_options = {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Basic "+rule_token,
						},
					};
					axios
						.get(DEV_PATH + "scenarios/" + response.data.data[itm]['id'], request_options)
						.then((resp) => {
							current_item_obj.value = resp.data.data;                // resp     - ответ второго запроса (текущего сценария)
							current_item_id.value  = response.data.data[itm]['id']; // response - ответ первого запроса (списка сценариев)
					});
				}
			}
		}
		console.log({'scen_object_list - после': scen_object_list});
	});
} // onDownloadApp

onMounted(
	console.log('!!!'),
	onDownloadApp('')
);

/**
 * Открывает форму редактирования сценария. В зависимости от контекста - создание или редактирование - заголовко формы заполняется по-разному.
 * Также, при редактировании запрашивается сценарий для заполнения полей формы. Его данные присваиваются current_item_obj.
 * Одновременно назначается константа состояния saving_mode, значение которой будет использовано при сохранении сценария - saveScen().
 * @param {Boolean} flag_create_edit флаг контекста - создание нового или редактирование
 * @param {Object}  edit_obj         редактируемый сценарий, как объект. При создании нового - new_object - пустой объект, только структура.
 */
async function openFormScenario(flag_create_edit, edit_obj){
	//console.log({"create-edit": current_item_obj});

	// у только что открытого окна не может сразу быть включенной метка имени: доступно/недоступно
	document.getElementById('not_availible').style.display = 'none';
	document.getElementById('availible').style.display     = 'none';
	document.getElementById('flag_availible').value        = 1;
	document.getElementById('buttonScen').disabled         = true;

	// flag_create_edit, 1-создаём, 2-редактируем
	if(flag_create_edit === 1){
		// окно создания
		$('#newScen-header').html(t('create_scenario'));
		$('#buttonScen').html(t('create_scenario'));
		
		/*
		document.getElementById('name-scen').value = '';
		document.getElementById('lifetime_of_lost_track_ms').value = 5000;
		document.getElementById('lifetime_of_event_ms').value = 900000;
		document.getElementById('keys').value = '';
		*/

		document.getElementById('req_lifetime_of_event_ms').innerHTML      = '';
		document.getElementById('req_lifetime_of_lost_track_ms').innerHTML = '';

		current_item_obj.value = new_object.value;
		saving_mode.value = 1;
		$('#scenElemForm').modal('show');
	}else{
		// окно редактирования
		const request_options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Basic "+rule_token,
			},
		};
		await axios
		.get(DEV_PATH + "scenarios/" + edit_obj.id, request_options)
		.then((response) => {
			current_item_obj.value = response.data.data;
			$('#newScen-header').html(t('scenario_edit')+'<br /><i style="color:#ccc;font-size:75%;">#'+current_item_obj.value.id+'</i>');
			$('#buttonScen').html(t('save_scenario'));
			saving_mode.value = 2;

			// добавляем красный стиль неверно заполненным полям полям
			var field_name  = 'lifetime_of_event_ms';
			var field_value = response.data.data.parameters.lifetime_of_event_ms;
			if(!test_value(field_name, field_value)){
				document.getElementById(field_name).classList.add('red-input');
				document.getElementById('req_lifetime_of_event_ms').innerHTML = 'Required field';
			}else{
				document.getElementById(field_name).classList.remove('red-input');
				document.getElementById('req_lifetime_of_event_ms').innerHTML = '';
			}

			var field_name  = 'lifetime_of_lost_track_ms';
			var field_value = response.data.data.parameters.lifetime_of_lost_track_ms;
			if(!test_value(field_name, field_value)){
				document.getElementById(field_name).classList.add('red-input');
				document.getElementById('req_lifetime_of_lost_track_ms').innerHTML = 'Required field';
			}else{
				document.getElementById(field_name).classList.remove('red-input');
				document.getElementById('req_lifetime_of_lost_track_ms').innerHTML = '';
			}


			$('#scenElemForm').modal('show');
		});
	}
} // openFormScenario

/**
 * Обрабатывает клик на сценарии в списке слева. Загружает через API сценарий и меняет состояние current_item_id, чтобы справа загрузился
 * компонент сценария Scenario.vue
 * @param {Object} scen_obj 
 */
async function clickScen(scen_obj) {
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	await axios
		.get(DEV_PATH + "scenarios/" + scen_obj.id, request_options)
		.then((response) => {
			current_item_obj.value = response.data.data;
			current_item_id.value  = scen_obj.id;
			//console.log({"clickScen current_item_obj.rules.length": current_item_obj.value.rules.length});

			var lifetime_of_event_ms      = response.data.data.parameters.lifetime_of_event_ms;
			var lifetime_of_lost_track_ms = response.data.data.parameters.lifetime_of_lost_track_ms;

			var bool_event = test_value('lifetime_of_event_ms', lifetime_of_event_ms);
			var bool_lost  = test_value('lifetime_of_lost_track_ms', lifetime_of_lost_track_ms);

			var arr = [];
			for(var i=0; i<current_item_obj.value.rules.length; i++){
				//console.log({"rule item": current_item_obj.value.rules[i]});
				arr[current_item_obj.value.rules[i]['id']] = current_item_obj.value.rules[i];
			}
			rule_list_for_ufact.value = arr;
			console.log({"rule_list_for_ufact = ": rule_list_for_ufact.value});

			//console.log({"bool_event": bool_event, "bool_lost": bool_lost, lifetime_of_event_ms: lifetime_of_event_ms, lifetime_of_lost_track_ms: lifetime_of_lost_track_ms});

			if(!bool_event && !bool_lost){
				$('#okno-header').html('System message');
				$("#okno-content").html('No one values of <b>lifetime_of_event_ms | lifetime_of_lost_track_ms</b> parameters must not be out of the rang!');
				$('#BoxMess').modal('show');
			}else{
				if(!bool_event){
					$('#okno-header').html('System message');
					$("#okno-content").html('Value of <b>lifetime_of_event_ms</b> parameter must not be out of the rang!');
					$('#BoxMess').modal('show');
				}

				if(!bool_lost){
					$('#okno-header').html('System message');
					$("#okno-content").html('Value of <b>lifetime_of_lost_track_ms</b> parameter must not be out of the rang!');
					$('#BoxMess').modal('show');
				}
			}

			// запрос количества пользовательских фактов
			axios
				.get(DEV_PATH + "scenarios/" + scen_obj.id + "/custom_facts/", request_options)
				.then((response) => {
					console.log({"user facts in scen list": response.data.data.custom.length});
					user_facts_count.value = response.data.data.custom.length + response.data.data.external.length;
				})
				.catch((err) => {
					console.log({"err user facts in scen list": err});
				});

	});
} // clickScen

/**
 * Слева и справа удаляет пробелы у переданной строки.
 * Возвращает строку без пробелов слева и справа.
 * @param {String} str входящая строка
 * @returns {String}
 */
function trim(str){
	// слева и справа удаляем пробелы
	return str.toString().replace(/^[ ]+/, '').replace(/[ ]+$/, '');
}

/**
 * Слева пробелы у переданной строки.
 * Возвращает строку без пробелов слева.
 * @param {String} str входящая строка
 * @returns {String}
 */
 function ltrim(str){
	// слева удаляем пробелы
	return str.toString().replace(/^[ ]+/, '');
}

/**
 * Сохраняет сценарий, отправляя данные на сервер API.
 * Закрывает окно с формой сценария и обновляет список сценариев - функция onDownloadApp - с заданным именем сценария.
 * Таким образом, отредактированный или вновь созданный сценарий отобразится в правом поле со всеми параметрами и правилами.
 */
function saveScen(){
	//alert(saving_mode.value);

	var lifetime_of_lost_track_ms = parseInt($('#lifetime_of_lost_track_ms').val());
	var lifetime_of_event_ms      = parseInt($('#lifetime_of_event_ms').val());

	if(lifetime_of_lost_track_ms < 1000 || lifetime_of_lost_track_ms > 60000){
		$('#okno-header').html('Message');
		$("#okno-content").html('Value of <b>lifetime_of_lost_track_ms</b> parametr must be in the range: [1000-60000]');
		$('#BoxMess').modal('show');
		return;
	}

	if(lifetime_of_event_ms < 1000 || lifetime_of_event_ms > 900000){
		$('#okno-header').html('Message');
		$("#okno-content").html('Value of <b>lifetime_of_event_ms</b> parametr must be in the range: [1000-900000]');
		$('#BoxMess').modal('show');
		return;
	}

	/*
	if(!(/^([\s]+)$/.test(document.getElementById('keys').value))){
		$('#okno-header').html('Message');
		$("#okno-content").html(document.getElementById('keys').value);
		$('#BoxMess').modal('show');
		return;
	}
	*/

	

	var data = {
		id:   $('#scen_id').val(),
		name: $('#name-scen').val(),
		parameters: {
			lifetime_of_lost_track_ms: lifetime_of_lost_track_ms,
			lifetime_of_event_ms:      lifetime_of_event_ms,
			keys:                      $('#keys').val(),
		}
	};

	if(trim( document.getElementById('name-scen').value ) === ''){
		$('#okno-header').html('Message');
		$("#okno-content").html('Empty scenario name!<br />Please, enter the unique scenario name and save the rule again.');
		$('#BoxMess').modal('show');
		return;
	}

	if(parseInt(document.getElementById('flag_availible').value) !== 1){
		$('#okno-header').html('Message');
		$("#okno-content").html('Scenario name is not availible (0)!<br />Please, enter the unique scenario name and save the rule again.');
		$('#BoxMess').modal('show');
		return;
	}

	if(saving_mode.value === 1){
		// создаём сценарий
		//console.log({"create_": data});

		const request_options = {
			method: "POST",
			headers: {
				"Content-Type":  "application/json",
				"Authorization": "Basic "+rule_token,
			},
		};
		const response = axios.post(DEV_PATH + "scenarios/", data, request_options).then((resp) => {
			//current_item_obj.value = response.data.data;
			//console.log({"create_result": resp});
			if(resp.status === 201){
				closeFormScenElement();
				onDownloadApp($('#name-scen').val());
			}
		});

	}
	if(saving_mode.value === 2){
		// редактируем сценарий
		//console.log({"edit_": data});

		const request_options = {
			method: "PUT",
			headers: {
				"Content-Type":  "application/json",
				"Authorization": "Basic "+rule_token,
			},
		};
		const response = axios.put(DEV_PATH + "scenarios/"+$('#scen_id').val(), data, request_options).then((resp) => {
			//console.log({"edit_result": resp});
			if(resp.status === 200){
				items.value.filter(d => d.id === $('#scen_id').val())[0]['name'] = $('#name-scen').val();
				closeFormScenElement();

				const request_options = {
					method: "GET",
					headers: {
						"Content-Type":  "application/json",
						"Authorization": "Basic "+rule_token,
					},
				};
				axios.get(DEV_PATH + "scenarios/" + $('#scen_id').val(), request_options).then((response) => {
					current_item_obj.value = response.data.data;
					onDownloadApp(response.data.data['name']); // чтобы обновить не только список, но и объекты для контроля уникальности
				});

			} // resp 200
		});
		
	}
} // saveScen

/**
 * Закрывает форму редактирования сценария и сбрасывает режим редактирования в ноль.
 */
function closeFormScenElement(){
	saving_mode.value = 0;
	is_disabled.value = true;
	$('#scenElemForm').modal('hide');
};

/**
 * Удаляет сценарий запросом к API после контрольного вопроса пользователю. При успешном ответе сервера перезапрашивает список сценариев
 * не только для обновления списка сценариев, но и для перезаполнения массивов контроля уникальности имен сценариев.
 * @param {Number} scen_obj удаляемый сценарий, как объект
 */
async function delScen(scen_obj){
	//alert('delete '+scen_obj.id);
	if(!confirm("Удалить сценарий: "+scen_obj.name+"?")){
		return;
	}

	// удаляем из списка сценариев
	var newArr = items.value.filter(d => d.id !== scen_obj.id);
	//console.log({"newArr_after_del": newArr});
	items.value = newArr;

	if(current_item_id.value === scen_obj.id){
		// удалённый сценарий не может быть текущим
		current_item_id.value = 0;
	}
	const request_options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic "+rule_token,
		},
	};
	await axios.delete(DEV_PATH + "scenarios/" + scen_obj.id, request_options).then((response) => {
		if(response.status === 200){
			// перзапрашиваем список сценариев
			// несмотря на то, что удалили из списка удаляемый сценарий.
			// Чтобы обновились объекты для контроля уникальности имен сценариев
			onDownloadApp('');
		}
	});
}; // delScen

/**
 * Проверяет ограничения значений полей lifetime_of_lost_track_ms и lifetime_of_event_ms
 * @param {String} field_name 
 * @param {any} field_val
 * @returns {Boolean}
 */
function test_value(field_name, field_val){
	//console.log({"e_flag": 22, "field_name": field_name, "field_val": field_val});
	if(field_name.toString() !== 'lifetime_of_event_ms' && field_name.toString() !== 'lifetime_of_lost_track_ms'){
		//console.log({"e_flag": 23});
		return true;
	}

	var max_val = 60000;
	if(field_name == 'lifetime_of_event_ms'){
		//console.log({"e_flag": 25});
		max_val = 900000;
	}

	//var target_val = document.getElementById(field_name).value;
	var target_val = field_val;
	if(target_val === null || target_val === undefined || trim(target_val) === ''){
		target_val = 0;
	}else{
		target_val = parseInt(trim(target_val));
	}

	if(field_name === 'lifetime_of_event_ms'){
		//console.log({"e_flag": 11});
		if(!(/^([0-9]{4,6})$/.test(target_val.toString()))){
			//console.log({"e_flag": 12});
			return false;
		}
	}else{
		//console.log({"e_flag": 13, "target_val": target_val, "field_val": field_val});
		if(!(/^([0-9]{4,5})$/.test(target_val.toString()))){
			//console.log({"e_flag": 14});
			return false;
		}
	}

	if(parseInt(target_val) < 1000){
		//console.log({"e_flag": 15});
		document.getElementById(field_name).value = 1000;
	}
	if(parseInt(target_val) > max_val){
		//console.log({"e_flag": 16});
		document.getElementById(field_name).value = max_val;
	}
	return true;
}


/**
 * Снимает признак disable у кнопки сохранения
 * @param {event} e объект-событие
 */

 function _onChange(e){
	//is_disabled.value = false;
	//console.log({"числ поля": e});
	if(e === undefined){
		return;
	}

	var field_name = e.target.id;
	
	var arr_digit = ["0","1","2","3","4","5","6","7","8","9","Backspace","ArrowLeft","ArrowRight"];
	if(arr_digit.indexOf((e.key).toString()) === -1){
		//alert(777);
		//e.preventDefault();
		return;
	}

	// если нажаты стрелочки, просто возвращаем фукнция без анализа
	var arr_arrow = ["ArrowLeft","ArrowRight"];
	if(arr_arrow.indexOf((e.key).toString()) !== -1){
		return;
	}
	
	var test_res = test_value(field_name, e.target.value);
	if(test_res === true){
		document.getElementById(field_name).classList.remove("red-input");
		document.getElementById('req_'+field_name).innerHTML = '';
	}else{
		document.getElementById(field_name).classList.add("red-input");
		document.getElementById('req_'+field_name).innerHTML = t('required_field');
	}

	var bool_event = test_value('lifetime_of_event_ms',      document.getElementById('lifetime_of_event_ms').value);
	var bool_lost  = test_value('lifetime_of_lost_track_ms', document.getElementById('lifetime_of_lost_track_ms').value);

	if(bool_event && bool_lost){
		document.getElementById('buttonScen').disabled = false;
	}else{
		document.getElementById('buttonScen').disabled = true;
	}
	


}

/**
 * Возвращает существующую пару id-name (сценария) в виде объекта. Поиск осуществляется по имени сценария.
 * Необходим при интерактивном контроле уникальности имени сценария.
 * Вызывается из функции handleTitle(), контролирующей ввод имени сценраия.
 * @param {String} search_name имя сценария
 */
function search_uniq_name(search_name){
	var validate = scen_object_list.value;
	var return_obj = {};
	for(var item in validate){
		var key = item;
		var val = validate[item];

		if(val === search_name){
			return_obj = {"id": key, "name": val};
			break;
		}
	}

	return return_obj;
}

/**
 * Обработчик ввода имени сценария.
 * Следит за допустимостью имени сценария в интерактивном режиме и отображет текущее состояние допустимости строкой available/not available.
 * @param {event} e объект-событие
 */
function handleTitle(e){
	//var curr_title = document.getElementById('name-scen').value;
	var curr_title = ltrim(e.target.value);
	//console.log({"curr_title": curr_title, "e": e.target.value, "mode": saving_mode.value});

	if(trim(curr_title) === ''){
		document.getElementById('name-scen').value = '';
		return;
	}

	if(/\s+$/.test(curr_title)){
		curr_title = trim(curr_title)+' ';
	}
	document.getElementById('name-scen').value = curr_title;

	if(saving_mode.value === 1){
		// при создании нового сценария
		if(trim(curr_title) !== ''){
			var arr_scen_names = Object.values(scen_object_list.value);

			//console.log({"arr_scen_names": arr_scen_names});

			if(arr_scen_names.indexOf( trim(curr_title) ) != -1){
				//flag_availible.value = 0;
				document.getElementById('not_availible').style.display = 'inline';
				document.getElementById('availible').style.display = 'none';
				document.getElementById('flag_availible').value = 0;
				document.getElementById('buttonScen').disabled = true;
				//is_disabled.value = true;
			}else{
				//flag_availible.value = 1;
				document.getElementById('not_availible').style.display = 'none';
				document.getElementById('availible').style.display = 'inline';
				document.getElementById('flag_availible').value = 1;
				document.getElementById('buttonScen').disabled = false;
				//is_disabled.value = false;
			}
		}else{
			document.getElementById('not_availible').style.display = 'none';
			document.getElementById('availible').style.display = 'none';
			document.getElementById('flag_availible').value = 1;
			document.getElementById('buttonScen').disabled = true;
			//is_disabled.value = true;
		}
	}
	if(saving_mode.value === 2){
		//alert('мы здесь');
		// если редактирование сценария
		var curr_id = document.getElementById('scen_id').value; // текущий ID сценария
		var find_obj = search_uniq_name(trim(curr_title));      // найденная пара: id - name в виде объекта

		//console.log({'find_obj': find_obj, 'curr_id': curr_id, "curr_title": trim(curr_title), "save_mode": saving_mode.value});

		//if(find_obj !== {}){
		if(Object.entries(find_obj).length !== 0){
			//console.log(150);
			//if(find_obj['name'] === trim(curr_title)){
				// если нашлась пара, то проверяем ID
				if(find_obj['id'] === curr_id){
					//console.log(151);
					// редактируется текущий сценарий, имя доступно
					document.getElementById('not_availible').style.display = 'none';
					document.getElementById('availible').style.display = 'inline';
					document.getElementById('flag_availible').value = 1;
					document.getElementById('buttonScen').disabled = false;
				}else{
					//console.log({'flag':152, 'obj': find_obj});
					// имя редактируемого сценария совпало с существующим другим сценарием - это недоступное имя
					document.getElementById('not_availible').style.display = 'inline';
					document.getElementById('availible').style.display = 'none';
					document.getElementById('flag_availible').value = 0;
					document.getElementById('buttonScen').disabled = true;
				}
			//}
		}else{
			//console.log(153);
			// find_obj = {} 
			// если не нашлось вообще такого наименования, то вводимое имя допустимо
			document.getElementById('not_availible').style.display = 'none';
			document.getElementById('availible').style.display = 'inline';
			document.getElementById('flag_availible').value = 1;
			document.getElementById('buttonScen').disabled = false;
		}

	}
}

function change_keys(e){
	var curr_keys = ltrim(e.target.value);
	console.log({"поле keys": curr_keys, "e": e.target.value});

	if(trim(curr_keys) === ''){
		//current_item_obj.parameters.keys
		document.getElementById('keys').value = '';
		//e.preventDefault();
		return;
	}else{
		document.getElementById('keys').value = ltrim(curr_keys);
		var reg = /\s+$/;
		if(reg.test(curr_keys)){
			document.getElementById('keys').value = trim(curr_keys)+' ';
		}
		document.getElementById('buttonScen').disabled = false;
	}
}

provide("openFormScenario", openFormScenario);
provide("test_value", test_value);
provide("rule_list_for_ufact", rule_list_for_ufact);

</script>

<template>
	<section id="content">
		<div class="content-wrap">
			<div class="container">
				<div class="row">
					<!--div class="col_one_third"-->
					<div class="col-md-4" style="/*background-color: #0F3860;*/">
						
					
						<div class="card" style="height:100% !important;">
							<div class="card-header">
								<div style="float:left;">
									<h3 class="mb-0" style="color:#fff;font-size:32px;">{{$t('scenarios_title')}}</h3>
								</div>
								<div style="float:right;padding-top:10px;">
									<div class="btn-create-scenario" @click="openFormScenario(1, new_object)" title="Create scenario">+ {{$t('create_btn')}}</div>
								</div>
								<div style="clear:both;"></div>
							</div>
							
							<div class="collapse show" style="/*height:65vh;overflow-y:scroll;*/">
								<div class="card-body widget widget_links" style="padding:0px !important;">

									<div v-for="(item, index) in items" class="div-scenario" style="position:relative;">
										<div style="cursor:pointer;" v-on:click="clickScen(item)">
											<div class="scen-name" title="View scenario in the right space">{{ item.name }}</div>
										</div>
										<div style="width:15px;position:absolute;top:7px;right:0px;">
											<div class="ctrl-elem">
												<i class="icon-trash1 ctrl-elem" v-on:click="delScen(item)" title="Delete scenario"></i>
											</div>
										</div>
										<div style="width:15px;position:absolute;top:7px;right:20px;">
											<div class="ctrl-elem">
												<i class="icon-pen1 ctrl-elem" v-on:click="openFormScenario(2, item)" title="Edit scenario"></i>
											</div>
										</div>
										
									</div>

								</div>
							</div>
						</div>
					</div>
					
					<!--div class="col_two_third col_last" style="background-color: #008ee0;border-radius: 5px;padding:10px 0px 0px;"-->
					<div class="col-md-8" style="background-color: #fff;border-radius: 5px;padding:0px;">
						
						<Scenario v-if="current_item_id" msg="Scenario content" />
						
						<div class="select-scen" v-else>
							<img src="/images/graf.png" width="135" alt="ISS Rule editor" />
							<h2 style="color:#0F3860;font-size:56px;font-weight:500;margin:20px 0px;">
								{{ t('choose_a_scenario_to_see_details') }}
							</h2>

							<div class="right-button" @click="openFormScenario(1, new_object)" title="Create scenario">
								+ {{ t('create_scenario') }}
							</div>

						</div>
						
					</div>
				</div>
				
			</div>


			<!--div class="container">
				<div class="row ">
					<div class="col-md-4" style="background-color: red;">
						some content
						<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
					</div>
					<div class="col-md-8" style="background-color: aqua;">
						catz
					</div>
				</div>
			</div-->


		</div>
	</section>


	<!-- дальше идут модальные формы -->

	<div class="modal fade" id="scenElemForm">
		<div class="modal-dialog modal-lg" style="margin:auto;">
			<div class="modal-content">
				<!-- Заголовок модального окна -->
				<div class="modal-header">
					<h4 class="modal-title" id="newScen-header" style="color:#0F3860;">{{ t('scenario_creation') }}</h4>
					<div class="text-right" style="paddingRight:7px">
						<button v-on:click="closeFormScenElement()" type="button" class="close btn closeModalButton" data-dismiss="modal" aria-hidden="true">×</button>
					</div>
				</div>
				<!-- Основное содержимое модального окна -->
				<div id="newScen-content" class="modal-body">
					<form id="f_nsc" name="f_nsc" onSubmit="" >
						<input type="hidden" :value="current_item_obj.id" name="scen_id" id="scen_id" />
						<div class="row">
							<div class="col-12 form-group">
								<label>
										{{ t('scenario_title') }}:
										<span id="availible">({{ t('is_availible') }})</span>
										<span id="not_availible">({{ t('not_availible') }})</span>
										<input type="hidden" value="1" name="flag_availible" id="flag_availible" />
								</label>
								<input type="text" :value="current_item_obj.name" name="name-scen" id="name-scen" class="form-control required" value="" placeholder="" @keyup="handleTitle" @change="handleTitle" @input="handleTitle">
							</div>
							<div class="col-6 form-group">
								<label style="margin-bottom:0px;">{{ t('lifetime_of_lost_track') }}:</label>
								<div style="font-size:70%;">1000 &#247; 60 000</div>
								<input type="text" min="1000" max="60000" minlength="4" maxlength="5" :value="current_item_obj.parameters.lifetime_of_lost_track_ms" name="lifetime_of_lost_track_ms" id="lifetime_of_lost_track_ms" class="form-control required" placeholder="" @mouseup="" @keyup="_onChange($event)" @input="_onChange($event)" @click="">
								<div style="font-size:80%;color:red;" id="req_lifetime_of_lost_track_ms">{{ t('required_field') }}</div>
							</div>
							<div class="col-6 form-group">
								<label style="margin-bottom:0px;">{{ t('lifetime_of_event') }}:</label>
								<div style="font-size:70%;">1000 &#247; 900 000</div>
								<input type="text" min="1000" max="900000" minlength="4" maxlength="6" :value="current_item_obj.parameters.lifetime_of_event_ms" name="lifetime_of_event_ms" id="lifetime_of_event_ms" class="form-control required" placeholder="" @mouseup="" @keyup="_onChange($event)" @input="_onChange($event)" @click="">
								<div style="font-size:80%;color:red;" id="req_lifetime_of_event_ms">{{ t('required_field') }}</div>
							</div>
							<div class="col-12 form-group">
								<label>{{ t('keys') }}:</label>
								<input type="text" :value="current_item_obj.parameters.keys" name="keys" id="keys" class="form-control required" placeholder="" @mouseup="" @keyup="change_keys($event)"  @input="change_keys($event)" @click="">
							</div>
							<div class="col-12">
								<button type="button" disabled="disabled" name="event-registration-submit" class="btn btn-primary" id="buttonScen" v-on:click="saveScen()">{{ t('save_scenario') }}</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>

</template>



<style>
#availible{color:#090;display:none;}
#not_availible{color:#f00;display:none;}

.select-scen{
	text-align: center;
	margin-top:50px;
}

.scen-name{
	color:#fff;
	font-family:IBM Plex Mono;
}

.ctrl-elem{
	cursor:pointer;
	color:#fff;
	display:none;
	font-size:85%;
	white-space: nowrap;
}

.div-scenario{
	padding:7px;
}

.div-scenario:hover{
	background-color: #194067;
	/*opacity: .3;*/
}

.div-scenario:hover .ctrl-elem{
	display:block;
}

.btn-create-scenario{
	cursor:pointer;
	background-color:#fff;
	/*font-family:Courier New,monospace;*/
	font-family: IBM Plex Mono;
	font-size: 90%;
	border-radius:5px;
	padding:3px 4px 1px;
	color:#0F3860;
}

.right-button{
	margin: 10px 0px 45px;
	line-height: 24px;
	display:inline-block;
	cursor:pointer;
	background-color:#0F3860;
	font-family:IBM Plex Mono,monospace;
	font-size: 16px;
	font-weight: 400;
	border-radius:10px;
	padding:15px 20px 17px 16px;
	color:#fff;
	width:232px;
}

.red-input{
	border:1px #f00 solid !important;
	background-color: rgb(246, 221, 221) !important;
}

</style>