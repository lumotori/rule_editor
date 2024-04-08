<script setup>

import Edit2 from "./Edit2.vue";
import { ref, inject } from "vue";
import { onMounted } from "vue";
import SelectDrop from "./SelectDrop.vue";
import axios from "axios";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const rule_token = inject("rule_token").value;

const current_rule_obj = inject("current_rule_obj");
const current_item_obj = inject("current_item_obj");
const current_item_id = inject("current_item_id");
const drop_down_list_premises = inject("drop_down_list_premises");
const drop_down_list_conclusion = inject("drop_down_list_conclusion");
const select_drop_item = inject("select_drop_item");
//const is_disabled     = ref(false);
const edit_if_then = inject("edit_if");
const saving_mode_rule = inject("saving_mode_rule");
//const focus_drop      = inject('focus_drop');

//const auth  = inject('auth');

const DEV_PATH = inject("DEV_PATH");
const KB_PATH = inject("KB_PATH");

//const KB_PATH =  'http://'+${window.location.host}/api/v1.replace(/\/+$/, "") +'/knowledge_base/';
// const DEV_PATH  = 'http://'+${window.location.host}/api/v1.replace(/\/+$/, "") + "/";

const rule_data_to_save = ref(null);

onMounted(function () {
  const request_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + rule_token,
    },
  };
  axios
    .get(
      KB_PATH + current_item_obj.value.id + "/knowledge_base/premises",
      request_options
    )
    .then((response) => {
      // Обработка данных ответа
      console.log(response.data);
    })
    .catch((error) => {
      // Обработка ошибки
      console.error("Error:", error);
    });
  changeVerticalSize("premises");
  changeVerticalSize("conclusion");

  
});

var current_word = ""; // текущее набираемое слово (строка) в одном из textarea
var start = 0; // начальная позиция курсора внутри textarea
var end = 0; // конечная позиция (если есть highlight, иначе равна start)
var border_chars = [" ", "\n", "\r", "\t"]; // символы, выделяющие слова в тексте (слова отбиваются пробелами, табуляцией или переводами строк)

/**
 * Слева и справа удаляет пробелы у переданной строки.
 * Возвращает строку без пробелов слева и справа.
 * @param {String} str входящая строка
 * @returns {String}
 */
function trim(str) {
  return str.toString().replace(/^[ ]+/, "").replace(/[ ]+$/, "");
}

/**
 * Закрывает выпадающее окно с инструкциями и по умолчанию оставляет фокус в textarea.
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 */
function closeDropDown(textarea_id, flag_focus = true) {
  //$('#'+textarea_id+'_drop').html("");
  $("#" + textarea_id + "_drop").css({ display: "none" });
  if (flag_focus) {
    $("#" + textarea_id).focus();
  }
}

/**
 * Возвращает текущее набираемое слово в textarea с id = textarea_id.
 * Вызывается из функции update().
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 * @returns {String}
 */
function getTypeWord(textarea_id) {
  var text = $("#" + textarea_id).val();
  start = $("#" + textarea_id)[0].selectionStart;
  end = $("#" + textarea_id)[0].selectionEnd;
  //console.log({"start": start, "end": end, "text[start]": text[start], "text[end]": text[end]});

  while (start > 0) {
    if (start - 1 < 0) {
      start = start + 1;
    }

    if (border_chars.indexOf(text[start - 1]) == -1) {
      --start;
    } else {
      break;
    }
  }
  //++start;
  while (end < text.length) {
    if (border_chars.indexOf(text[end]) == -1) {
      ++end;
    } else {
      break;
    }
  }

  //console.log({"- start": start, "- end": end, "text[start]": text[start], "text[end]": text[end]});

  current_word = trim(text.substr(start, end - start));
  current_word = current_word.toString().replace(/[\n\r]+/g, ""); // убираем переводы строк, если они есть
  return current_word;
} // getTypeWord

/**
 * Получает от API список list инструкций по переданному ключевому слову current_word.
 * После получения списка присваивает его константе drop_down_list_premises или drop_down_list_conclusion, в зависимости от textarea_id.
 * Вызывается из функции update().
 * @param {String} textarea_id  идентификатор textarea в DOM-модели
 * @param {String} current_word поисковое слово
 */
async function getContentDrop(textarea_id, current_word) {
  //console.log({"search drop": current_item_obj});
  if (current_word == "") {
    // если пустое, выпалающий список очищаем и закрываем
    if (textarea_id === "premises") {
      drop_down_list_premises.value = [];
    } else {
      drop_down_list_conclusion.value = [];
    }
    closeDropDown(textarea_id);
  }

  const request_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + rule_token,
    },
  };
  await axios
    .get(
      KB_PATH +
        current_item_obj.value.id +
        "/knowledge_base/" +
        textarea_id +
        "?filter=" +
        current_word,
      request_options
    )
    .then((response) => {
      //console.log({"getContentDrop search_res": response.data.data});
      var list = response.data.data.ontology_term;
      //console.log({"getContentDrop list": list, "textarea_id": textarea_id});
      if (textarea_id === "premises") {
        //console.log({"flag 1": 1});
        drop_down_list_premises.value = list;
      } else {
        //console.log({"flag 2": 2});
        drop_down_list_conclusion.value = list;
      }

      if (list.length === 0) {
        //console.log({"flag 3": 3});
        closeDropDown(textarea_id);
      }
    });
} // getContentDrop

/**
 * См. substituteTerm
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 */
function clickOnDropItem(textarea_id) {
  //console.log({"current_word": current_word, "select_drop_item": select_drop_item.value,"start": start, "end": end});
  substituteTerm(textarea_id, select_drop_item.value, start);
}

/**
 * Осуществляет замену текущего слова в textarea выбранным в выпадающем списке кликом мыши.
 * После замены ставит фокус в textarea.
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 * @param {String} str_term    строка, которой будет заменено текущее слово
 * @param {Number} start       начальная позиция текущего слова (позиция его первого символа)
 */
function substituteTerm(textarea_id, str_term, start) {
  length = current_word.length;
  //alert(str_term);
  if (trim(str_term) === "") {
    closeDropDown(textarea_id);
    return;
  }

  $("#" + textarea_id + "_drop").css({
    display: "none",
    top: -100,
    left: -100,
  });
  //alert('Заменяем с '+start+' '+length+' позиций на '+str_term);
  var instr = $("#" + textarea_id).val();
  var begin_replace = 0;

  //console.log({"первый": instr.substring(start,start+1)});

  if (instr.substring(start, start + 1) != "\n") {
    begin_replace = start;
  } else {
    begin_replace = start + 1;
  }
  var outstr =
    instr.substring(0, begin_replace) +
    " " +
    str_term +
    " " +
    instr.substring(start + length);

  outstr = outstr.toString().replace(/(\n )+/g, "\n"); // перевод строки с пробелом заменяем просто преводом строки
  outstr = outstr.toString().replace(/(\r )+/g, "\r"); // то же
  outstr = outstr.toString().replace(/( )+/g, " "); // несколько пробелов подряд схлопываем в один пробел

  $("#" + textarea_id).val(trim(outstr) + " ");
  $("#" + textarea_id).focus();

  if (textarea_id == "premises") {
    current_rule_obj.value.condition = trim(outstr) + " ";
  }
  if (textarea_id == "conclusion") {
    current_rule_obj.value.body = trim(outstr) + " ";
  }

  select_drop_item.value = "";
} // substituteTerm

/**
 * Меняет высоту текущего textarea в соответствие с его содержанием, чтобы не было вериткальныой полосы прокрутки.
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 */
function changeVerticalSize(textarea_id) {
  let text = document.getElementById(textarea_id).value;
  let lines = text.split("\n");
  let count = lines.length;
  //console.log({"lines":count, "textarea_id": textarea_id});
  $("#" + textarea_id).prop("rows", count + 1);
}

/**
 * Обрабатывает нажатие клавиш в textarea - выделяет текущее слово, отправляет запросы к API на получение контекстных инструкций.
 * А также вычисляет координаты каретки для верного расположения выпадающего окна (функция getCaretCoordinates).
 * Функция getCaretCoordinates зашита в index.html ссылкой src="/js/textarea-caret-position.js"
 * @param {String} textarea_id идентификатор textarea в DOM-модели
 */
function update(textarea_id) {
  getTypeWord(textarea_id);
  var element = document.getElementById(textarea_id);
  var txtVal = element.value.toString();

  //console.log({"e.keyCode": event.keyCode, "start": $("#"+textarea_id)[0].selectionStart, "length": txtVal.length});
  if (
    $("#" + textarea_id)[0].selectionStart === txtVal.length &&
    event.keyCode === 46
  ) {
    // если стоим в конце всего textarea и жмём на delete, то запрос не формируем
    return;
  }
  if (
    $("#" + textarea_id)[0].selectionStart === 0 &&
    [8, 37, 38].indexOf(event.keyCode) !== -1
  ) {
    // если стоим в самом начале textarea и жмём на [backspace, стрелка вверх или влево], то запрос не формируем
    return;
  }

  changeVerticalSize(textarea_id);
  // Set `debug` to true in order to see the mirror div. Default false.
  var coordinates = getCaretCoordinates(element, element.selectionEnd, {
    debug: false,
  });
  //console.log('(top, left, height) = (%s, %s, %s)', coordinates.top, coordinates.left, coordinates.height);
  //console.log({"current_word": current_word});
  if (current_word !== "") {
    getContentDrop(textarea_id, current_word);

    var drop_down_list = [];
    if (drop_down_list_premises.value.length != 0) {
      drop_down_list = drop_down_list_premises.value;
    }
    if (drop_down_list_conclusion.value.length != 0) {
      drop_down_list = drop_down_list_conclusion.value;
    }
    //console.log({"drop_down_list_____": drop_down_list});
    if (drop_down_list.length !== 0) {
      $("#" + textarea_id + "_drop").css({
        display: "block",
        top: element.offsetTop - element.scrollTop + coordinates.top + 16,
        left: element.offsetLeft - element.scrollLeft + coordinates.left,
      });
      //document.getElementById("drop_"+textarea_id).focus();
      //focus_drop.value = 1;
    } else {
      closeDropDown(textarea_id);
      //focus_drop.value = 0;
    }
  } else {
    closeDropDown(textarea_id);
  }
}

/**
 * Меняет состояние, инициируя загрузку основного компонента со сценариями (MainComp), а не компонента для редактирования правила (EditIF)
 */
async function goBack() {
  edit_if_then.value = 0;
  const request_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + rule_token,
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
 * Обновляет данные сценария запросом к API. Полученные данные присваиваются константам состояния,
 * благодаря чему при уходе из режима редактирования правила, в правом поле отобразится обновлённая информация сценария,
 * включая список правил.
 * @param {String} scen_id
 */
function updScenario(scen_id) {
  const request_options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + rule_token,
    },
  };
  axios
    .get(DEV_PATH + "scenarios/" + scen_id, request_options)
    .then((response) => {
      current_item_obj.value = response.data.data;
      current_item_id.value = scen_id;
    });
}

async function saveUserFact(strUserFact) {
  if (trim(strUserFact) === "") {
    return false;
  }

  var js = { custom: [{ event: trim(strUserFact), discription: "" }] };
  // отправка данных
  const request_options = {
    method: "put",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + rule_token,
    },
  };
  await axios
    .put(
      DEV_PATH + "scenarios/" + current_item_obj.value.id + "/custom_facts/",
      js,
      request_options
    )
    .then((response) => {
      console.log({ "user fact save res": response });
    })
    .catch((error) => {
      $("#okno-header").html("Error");
      $("#okno-content").html(error);
      $("#BoxMess").modal("show");
    });
} // saveUserFact

/**
 * Сохраняет информацию о правиле. В случае успеха - response 200 от сервера API - вызывает обновление данных сценария updScenario()
 * и сбрасывает режим редактирования правила edit_if_then.value = 0 для ухода на основной компонент MainComp со сценариями.
 */
function saveRule_2() {
  //alert(saving_mode_rule.value);
  //var data = new FormData(document.getElementById('rule-form'));

  //var data = $('#rule-form').serialize();

  //console.log({form_data: data});
  //return false;

  var data = {
    scenarioId: document.getElementById("scenID").value,
    name: $("#name").val(),
    condition: $("#premises").val(),
    body: $("#conclusion").val(),
    repeat: $("#repeat").prop("checked") ? true : false,
    ignore_id: $("#ignore_id").prop("checked") ? true : false,
    spatial_filter: $("#spatial_filter").prop("checked") ? true : false,
    no_log: $("#no_log").prop("checked") ? true : false,
    rule_type: $("#rule_type").val(),
    description: $("#description").val(),
  };

  rule_data_to_save.value = data;

  if (trim(document.getElementById("name").value) === "") {
    $("#okno-header").html("Message");
    $("#okno-content").html(
      "Empty rule name!<br />Please, enter the unique rule name and save the rule again."
    );
    $("#BoxMess").modal("show");
    return;
  }

  //console.log({"save-rule-data": data});

  if (saving_mode_rule.value === 1) {
    // создаём правило
    const request_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + rule_token,
      },
    };
    const response = axios
      .post(
        DEV_PATH + "scenarios/" + $("#scenID").val() + "/rules?force=false",
        data,
        request_options
      )
      .then((resp) => {
        //current_item_obj.value = response.data.data;
        console.log({ "create-rule-result": resp });
        if (resp.status === 201) {
          updScenario($("#scenID").val()); // должно обновиться правое поле с текущим сценарием (список правил в частности)
          edit_if_then.value = 0;
        } else {
          var mess = "";
          var br = "";
          $.each(resp.data.data.unknown_facts, function (k, v) {
            console.log({ k: k, v: v });
            mess = "" + mess + br + "&bull; " + v + ";";
            br = "<br />";
          });
          //$('#quest-header').html(t('header_rule_window'));
          $("#unknown_fact_list").html(mess);
          $("#BoxQuest").modal("show");
        }
      })
      .catch((err) => {
        console.log({ err: err });
      });
  }
  if (saving_mode_rule.value === 2) {
    // редактируем правило
    const request_options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + rule_token,
      },
    };
    const response = axios
      .put(
        DEV_PATH +
          "scenarios/" +
          $("#scenID").val() +
          "/rules/" +
          $("#ruleID").val() +
          "?force=false",
        data,
        request_options
      )
      .then((resp) => {
        //console.log({"edit_result": resp});
        if (resp.status === 200) {
          var mess = "";
          var br = "";
          $.each(resp.data.data.unknown_facts, function (k, v) {
            console.log({ k: k, v: v });
            mess = "" + mess + br + "&bull; " + v + ";";
            br = "<br />";
          });
          //$('#quest-header').html(t('header_rule_window'));
          $("#unknown_fact_list").html(mess);
          $("#BoxQuest").modal("show");

          /*
				//items.value.filter(d => d.id === $('#scen_id').val())[0]['name'] = $('#name-scen').val();
				const request_options = {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Basic "+rule_token,
					},
				};
				axios.get(DEV_PATH + "scenarios/" + $('#scenID').val() + "/rules/"+$('#ruleID').val(), request_options).then((response) => {
					updScenario($('#scenID').val()); // должно обновиться правое поле с текущим сценарием (список правил в частности)
					edit_if_then.value = 0;
				});
				*/
        } // resp 200
      });
  }
} // saveRule_2

/*
function _onChangeTextarea(){
	var textVal = event.target.value;
	console.log({"textVal": textVal});
}
*/

function clickYes(data_obj) {
  console.log({
    "double save rule": data_obj,
    "saving mode": saving_mode_rule,
  });

  if (saving_mode_rule.value === 1) {
    // создаём правило
    const request_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + rule_token,
      },
    };
    const response = axios
      .post(
        DEV_PATH + "scenarios/" + data_obj.scenarioId + "/rules?force=true",
        data_obj,
        request_options
      )
      .then((resp) => {
        //current_item_obj.value = response.data.data;
        console.log({ create_rule_result: resp });
        if (resp.status === 201) {
          updScenario(data_obj.scenarioId); // должно обновиться правое поле с текущим сценарием (список правил в частности)
          edit_if_then.value = 0;
          $("#BoxQuest").modal("hide");
        }
      })
      .catch((err) => {
        console.log({ err: err });
      });
  }
  if (saving_mode_rule.value === 2) {
    // редактируем правило
    const request_options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + rule_token,
      },
    };
    const response = axios
      .put(
        DEV_PATH +
          "scenarios/" +
          data_obj.scenarioId +
          "/rules/" +
          $("#ruleID").val() +
          "?force=true",
        data_obj,
        request_options
      )
      .then((resp) => {
        //console.log({"edit_result": resp});
        if (resp.status === 200) {
          //items.value.filter(d => d.id === data_obj.scenarioId)[0]['name'] = $('#name-scen').val();
          const request_options = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + rule_token,
            },
          };
          axios
            .get(
              DEV_PATH +
                "scenarios/" +
                data_obj.scenarioId +
                "/rules/" +
                $("#ruleID").val(),
              request_options
            )
            .then((response) => {
              updScenario(data_obj.scenarioId); // должно обновиться правое поле с текущим сценарием (список правил в частности)
              edit_if_then.value = 0;
              $("#BoxQuest").modal("hide");
            });
        } // resp 200
      });
  }
} // clickYes

function clickNo() {
  $("#BoxQuest").modal("hide");
}

/*
const size = ref([window.outerWidth, window.outerHeight]);
window.addEventListener("resize", function(e){
	e.preventDefault();
	//console.log({"size": size.value[0], "e": e});
	window.resizeTo(size.value[0], size.value[1]);
});
*/
</script>

<template>
  <section id="editIF">
    <div class="content-wrap">
      <div class="container clearfix">
        <div class="row">
          <div class="col-12 form-group">
            <div>
              <div style="float: left">
                <h3 class="green" style="margin-left: -30px; color: #00467a">
                  <i
                    class="icon-line-arrow-left"
                    v-on:click="goBack()"
                    style="cursor: pointer"
                  ></i>
                  {{ t("edit_rule_body") }}
                </h3>
              </div>
              <div style="float: right">
                <div class="btn-rule-form" v-on:click="goBack()">
                  {{ t("cancel_btn") }}
                </div>
                <div class="btn-rule-form" v-on:click="saveRule_2()">
                  <i class="icon-save"></i> {{ t("save_btn") }}
                </div>
              </div>
              <div style="clear: both"></div>
            </div>

            <!--i style="color:#ccc;font-size:75%;">#{{ currRuleObj.id }}</i-->
            <!--div>{{ edit_if }}</div-->
            <form name="rule-form" id="rule-form">
              <input
                type="hidden"
                v-model="current_item_obj.id"
                name="scenID"
                id="scenID"
              />
              <input
                type="hidden"
                v-model="current_rule_obj.id"
                name="ruleID"
                id="ruleID"
              />

              <div class="form-group">
                <label
                  >{{ t("scenario") }}:
                  <i
                    >{{ current_item_obj.name }}
                    <i style="color: #dedede">#{{ current_item_obj.id }}</i></i
                  ></label
                >
              </div>

              <div class="form-group">
                <label>{{ t("rule_title") }}:</label>
                <input
                  type="text"
                  v-model="current_rule_obj.name"
                  name="name"
                  id="name"
                  class="form-control required"
                  placeholder="Enter a rule title"
                />
              </div>
              <div class="form-group">
                <label>{{ t("description") }}:</label>
                <input
                  type="text"
                  v-model="current_rule_obj.description"
                  name="description"
                  id="description"
                  class="form-control required"
                  placeholder="Enter a rule description"
                />
              </div>

              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="ignore_id"
                  name="ignore_id"
                  v-model="current_rule_obj.ignore_id"
                />
                <label class="form-check-label" for="ignoreId">{{
                  t("ignore_id")
                }}</label>
                <span style="padding-left: 25px">&nbsp;</span>

                <input
                  type="checkbox"
                  class="form-check-input"
                  id="no_log"
                  name="no_log"
                  v-model="current_rule_obj.no_log"
                />
                <label class="form-check-label" for="noLog">{{
                  t("nolog")
                }}</label>
                <span style="padding-left: 25px">&nbsp;</span>

                <input
                  type="checkbox"
                  class="form-check-input"
                  id="repeat"
                  name="repeat"
                  v-model="current_rule_obj.repeat"
                />
                <label class="form-check-label" for="repeat">{{
                  t("repeat")
                }}</label>
                <span style="padding-left: 25px">&nbsp;</span>

                <input
                  type="checkbox"
                  class="form-check-input"
                  id="spatial_filter"
                  name="spatial_filter"
                  v-model="current_rule_obj.spatial_filter"
                />
                <label class="form-check-label" for="spatialFilter">{{
                  t("spatialFilter")
                }}</label>
              </div>

              <div class="form-group" style="margin-top: 15px">
                <select
                  v-model="current_rule_obj.rule_type"
                  id="rule_type"
                  class="form-control"
                  name="rule_type"
                >
                  <option value="" key="_">{{ t("select_rule_type") }}</option>
                  <option value="ALARM_START" key="ALARM_START">
                    ALARM START
                  </option>
                  <option value="ALARM_STOP" key="ALARM_STOP">
                    ALARM STOP
                  </option>
                  <option value="ALARM" key="ALARM">ALARM</option>
                  <option value="NO_ALARM" key="NO_ALARM">NO ALARM</option>
                  <option value="ALARM_END" key="ALARM_END">ALARM END</option>
                </select>
              </div>

              <div
                style="
                  background-color: #fff;
                  padding: 15px;
                  border-radius: 5px;
                "
              >
                <div class="form-group" style="margin-top: 15px">
                  <label>{{ t("if") }}</label>
                  <textarea
                    style="resize: none"
                    name="premises"
                    id="premises"
                    class="form-control required"
                    v-model="current_rule_obj.condition"
                    @mouseup="update('premises')"
                    @keyup="update('premises')"
                    @input="update('premises')"
                    @click="update('premises')"
                    @focus="closeDropDown('conclusion', false)"
                  ></textarea>
				  <Edit2></Edit2>
                  <div id="premises_drop">
                    <SelectDrop
                      v-if="drop_down_list_premises.length"
                      v-bind:lst="drop_down_list_premises"
                      @click="clickOnDropItem('premises')"
                      @keyup="clickOnDropItem('premises')"
                      str_id="drop_premises"
                    />
                  </div>
                </div>

                <div class="form-group" style="margin-top: 15px">
                  <label>{{ t("then") }}</label>
                  <textarea
                    style="resize: none"
                    name="conclusion"
                    id="conclusion"
                    rows="5"
                    class="form-control required"
                    v-model="current_rule_obj.body"
                    @mouseup="update('conclusion')"
                    @keyup="update('conclusion')"
                    @input="update('conclusion')"
                    @click="update('conclusion')"
                    @focus="closeDropDown('premises', false)"
                  ></textarea>
                  <div id="conclusion_drop">
                    <SelectDrop
                      v-if="drop_down_list_conclusion.length"
                      v-bind:lst="drop_down_list_conclusion"
                      @click="clickOnDropItem('conclusion')"
                      @keyup="clickOnDropItem('conclusion')"
                      str_id="drop_conclusion"
                    />
                  </div>
                </div>
              </div>
            </form>

            <!--pre>{{ current_rule_obj }}</pre-->
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- окно сообщений -->
  <div id="BoxQuest" class="modal fade">
    <div class="modal-dialog" style="margin: auto">
      <div class="modal-content">
        <!-- Заголовок модального окна -->
        <div class="modal-header justify-content-center">
          <!--div class="text-right">
						<button type="button" class="close btn" style="background-color:#f00;" data-dismiss="modal" aria-hidden="true">×</button>
					</div-->
          <h4
            class="modal-title"
            id="quest-header"
            style="color: #00467a; text-transform: uppercase"
          >
            {{ t("warning") }}
          </h4>
        </div>

        <!-- Основное содержимое модального окна -->
        <div id="quest-content" class="modal-body" style="color: #00467a">
          <p>{{ t("propose_rule_window") }}</p>

          <p id="unknown_fact_list"></p>

          <p>{{ t("question_rule_window") }}</p>
        </div>

        <!-- Футер модального окна -->
        <div class="modal-footer justify-content-center">
          <button
            type="button"
            class="btn btn-outline-info radius5"
            style="padding: 5px 13px"
            @click="clickYes(rule_data_to_save)"
          >
            {{ t("yes_btn") }}
          </button>
          &nbsp;&nbsp;&nbsp;
          <button
            type="button"
            class="btn btn-outline-info radius5"
            style="padding: 5px 10px"
            @click="clickNo()"
          >
            {{ t("no_btn") }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- // окно сообщений -->
</template>

<style>
.side-by-side {
  display: flex;
}

.col {
  margin-right: 2em;
}

#premises_drop {
  position: absolute;
  display: none;
  top: 0;
  left: 0;
  width: 200px;
  height: auto;
  background-color: #fff;
  border: 1px #ccc solid;
  z-index: 10000;
  padding: 3px;
}

#conclusion_drop {
  position: absolute;
  display: none;
  top: 0;
  left: 0;
  width: 190px;
  height: auto;
  background-color: #fff;
  border: 1px #ccc solid;
  z-index: 10000;
  padding: 3px;
}

.btn-rule-form {
  margin: 0px 0px 10px;
  line-height: 24px;
  margin-right: 5px;
  cursor: pointer;
  background-color: #fff;
  font-family: IBM Plex Mono, monospace;
  font-size: 16px;
  font-weight: 400;
  border-radius: 10px;
  border: 1px #ccc solid;
  padding: 10px 10px;
  color: #0f3860;
  display: inline-block;
}

textarea {
  border: 0px !important;
  overflow-y: hidden;
}
</style>
