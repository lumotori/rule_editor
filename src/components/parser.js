import axios from "axios";

async function fetchDataFromServer(scenarioId, request_options) {
  try {
    const response = await axios.get(
      `api/v1/scenarios/${scenarioId}/knowledge_base/premises`,
      request_options
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

async function createAutocompletionObject(scenarioId, request_options) {
  try {
    const completionsData = await fetchDataFromServer(scenarioId, request_options);

    if (!Array.isArray(completionsData)) {
      throw new Error('Некорректные данные для создания автозаполнения.');
    }

    return completionsData.map(item => ({
      label: item.label,
      type: item.type,
      info: item.info || null,
    }));
  } catch (error) {
    console.error('Error creating autocompletion object:', error.message);
    throw error;
  }
}

export async function setupEditor(parentNode, scenarioId, request_options) {
  try {
    const completions = await createAutocompletionObject(scenarioId, request_options);

    function myCompletions(context) {
      let before = context.matchBefore(/\w+/);
      if (!context.explicit && !before) return null;
      return {
        from: before ? before.from : context.pos,
        options: completions,
        validFor: /^\w*$/, 
      };
    }

    return new EditorView({
      extensions: [
        basicSetup,
        autocompletion({ override: [myCompletions] }),
      ],
      parent: parentNode,
    });
  } catch (error) {
    console.error('Error setting up editor:', error.message);
    throw error;
  }
}
