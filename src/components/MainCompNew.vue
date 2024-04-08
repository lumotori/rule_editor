<script>
//import { ref, provide } from 'vue';
import Scenario from './Scenario.vue';
export default {
  name: "App",
  components: {
    Scenario,
  },
  provide() {
    return { listItems: this.items, current_id: this.item_id }
  },

  data() {
    return {
      items: [
			{"id": 1, "name": "Первый 111 сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 2, "name": "Второй сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 3, "name": "Третий сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 4, "name": "Четвёртый сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
			{"id": 5, "name": "Пятый сценарий", "descr": "Описание сценария", "link": "ссылка на сценарий"},
      ],
	  item_id: 0,
    };
  },
  methods: {
    addItem() {
      this.items = [
        ...this.items,
        {
          id: this.items.length+1,
          name: `Сценарий ${this.items.length+1}`,
        },
      ];
    },
	clickScen(scen_id){
		alert(scen_id);
		this.item_id = scen_id;
	},
  },
};
</script>

<template>
	<section id="content">
	
		<div style="text-align:center;">
			<h1>Редактор правил</h1>
		</div>
	
		<div class="content-wrap">
			<div class="container clearfix">
			
				<div class="col_one_third">
				
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0">Сценарии</h5>
							<div style="margin:7px 0px;cursor:pointer;" @click="addItem">[+] Добавить</div>
						</div>
						
						<div class="collapse show">
							<div class="card-body widget widget_links">
								<ul>
									<li v-for="(item, index) in items" v-on:click="clickScen(item.id)" style="cursor:pointer;">
										{{ item.id }} {{ item.name }}
									</li>
								</ul>
								<!--pre>{{ items }}</pre-->
								
							</div>
						</div>
					</div>
				</div>
				
				<div class="col_two_third col_last">
					
					<Scenario msg="Содержание сценариев" :item_id="this.item_id" />
					
				</div>
				
			</div>
		</div>
	</section>
</template>



<style>

</style>