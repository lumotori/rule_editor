<script>
import Scenario from './Scenario.vue';
const clicked_id = 0;
export default {
	name: "content",
	methods:{
		clickScen: function(param){
			console.log({"param": param});
			clicked_id.value = param;
		}
	},
	components: {
		Scenario
	},
	data(){
		return{
			obj: [
			{"id": 1, "name": "Первый 111 сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 2, "name": "Второй сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 3, "name": "Третий сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 4, "name": "Четвёртый сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 5, "name": "Пятый сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			]
		}
	}

};

</script>

<template>
	<section id="content">
		<div class="content-wrap">
			<div class="container clearfix">
			
				<div style="text-align:center;">Редактор правил</div>
			
				<div class="col_one_third">
				
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0">Сценарии</h5>
							
						</div>
						
						<div class="collapse show">
							<div class="card-body widget widget_links">
								<ul>
									<li v-for="(item, index) in obj" v-on:click="clickScen(item.id)">
										{{ item.id }} {{ item.name }}
									</li>
								</ul>
								
							</div>
						</div>
					</div>
				</div>
				
				<div class="col_two_third col_last">
					
					<Scenario msg="Содержание сценариев" v-model="clicked_id" />
					
				</div>
				
			</div>
		</div>
	</section>
</template>



<style>

</style>