<script setup>
import { inject } from 'vue';

defineProps({
  lst: {
    type: Array,
	/*
	default: function(){
		return [];
	},
    required: true
	*/
  },
  str_id: {type: String},
})

const select_drop_item = inject('select_drop_item'); // выбранное кликом слово в выпавшем списке инструкций
const focus_drop       = inject('focus_drop'); // не используется

/**
 * Передаёт глобальному контексту выбранное слово в выпавшем списке
 * @param {Object} drop_item 
 */
function clickDropItem(drop_item){
	//console.log({"click_e": event.target.value});
	select_drop_item.value = drop_item;
}

</script>

<template>
	<select class="selectDrop" multiple="true" :id="str_id">
		<option v-for="(item) in lst" :value="item" v-on:click="clickDropItem(item)">
			{{ item }}
		</option>
	</select>
</template>

<style>
.selectDrop{
	width:100%;
	height:100%;
	overflow-y:auto;
	border:0px;
}

.selectDrop option{
	padding:3px;
	font-size:85%;
}
</style>
