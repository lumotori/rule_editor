<template>
  <div ref="editorContainer"></div>
</template>

<script>
import { ref, onMounted, reactive } from "vue";
import { setupEditor } from "./parser.js";

export default {
  name: "EditorWithParser",
  setup() {
    const editorContainer = ref(null);
    const host = window.location.host.replace(/\/+$/, "");
    const KB_PATH = `http://${host}/api/v1/knowledge_base/`; // Исправлено формирование KB_PATH
    const current_item_obj = reactive({ value: { id: 1 } });
    const request_options = reactive({});

    onMounted(() => {
      setupEditor(editorContainer.value, KB_PATH, current_item_obj, request_options); // Убрано .value
    });

    return {
      editorContainer,
    };
  },
};
</script>

<style scoped>
.CodeMirror {
    background: #fff; /* Белый фон */
    color: #000; /* Цвет текста */
}
</style>
