
<!----><template>
    <codemirror
      v-model="code" 
      placeholder="Code goes here..."
      :style="{ height: '400px' }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
  </template>
  
  <script>
    import { ref, shallowRef} from 'vue'

    import { defineComponent } from 'vue'
    import { Codemirror } from 'vue-codemirror'
    import { javascript } from '@codemirror/lang-javascript'
  
    export default defineComponent({
      components: {
        Codemirror
      },
      setup() {
        const code = ref(`console.log('Hello, world!')`)
        const extensions = [javascript()]
  
        // Codemirror EditorView instance ref
        const view = shallowRef()
        const handleReady = (payload) => {
          view.value = payload.view
        }
  
        // Status is available at all times via Codemirror EditorView
        const getCodemirrorStates = () => {
          const state = view.value.state
          const ranges = state.selection.ranges
          const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
          const cursor = ranges[0].anchor
          const length = state.doc.length
          const lines = state.doc.lines
          // more state info ...
          // return ...
        }
  
        return {
          code,
          extensions,
          handleReady,
          log: console.log
        }
      }
    })
  </script>