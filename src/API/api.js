import { Qs } from "./Qs";

/**
 * Определенная ошибка. Определена через прототипы
 * @param {string} message Сообщение об ошибке
 */
const DefinedError = function (message, inner) {
    this.name         = "DefinedError";
    this.message      = message;
    this.stack        = new Error().stack;
    this.innerMessage = inner || "";
};
DefinedError.prototype = new Error();

export const API = (function () {
    var ns = {
        config: { url: "https://kb.ai-hippocrates.ru/api" },
		//config: { url: "https://62.109.0.2/api" },
        configLoaded: false,
        getApiHost: () => {
            return ns.config.url;
        },
        call: async options => {
            var data = {
                credentials: "include",
                method: options.method,
                headers: {
                    "Content-Type":  "application/json",
					"accept":        "*/*",
					"Authorization": "Bearer "+options.access_token
                }
            };
            if (["GET", "HEAD"].indexOf(options.method) === -1)
                data.body = options.data;
            
            //alert("call: "+options.url);

            try {
                const x = await fetch(options.url, data);
                if (!x.ok)
                    throw new DefinedError("Ошибка соединения с сервером");

                const json = await x.json();

                if ((json.status || "200").toString().indexOf("2") !== 0)
                    throw new DefinedError(
                        json.message || json.result || "Неизвестная ошибка"
                    );

                return json;
            } catch (err) {
                if (DefinedError.prototype.isPrototypeOf(err)) {
                    throw err;
                }
                throw new DefinedError(
                    "Произошла ошибка соединения или распознавания ответа от сервера.",
                    err.message
                );
            }
        },
        point: function (point, data, method, access_token) {
            let apiHost = ns.getApiHost();
            let qs = "";
            //Если метод GET, формируем строку параметров
            if (method === "GET") {
                qs = Qs.form(data);
				console.log({"qs": qs});
            }
            //alert(`http://${apiHost}/${point}${qs}` + apiHost);
            return ns.call({
                url: `${apiHost}/${point}/${qs}`,
                method: method || "POST",
                data: FormData.prototype.isPrototypeOf(data)
                    ? data
                    : JSON.stringify(data),
				access_token: access_token || ''
            });
        },
        login: function (data) {
            return ns.point(".../Login", data, "POST", '');
        },
        getListScenarios: function (access_token) {
			let data = {};
			//return ns.point("KbApi/GetAndUpsertAllKnowledgeBaseAsSingleObject", data, "GET", access_token);
			return ([
                {"id": 4, "name": "Такой сценарий"},
                {"id": 2, "name": "Второй сценарий"},
                {"id": 1, "name": "Ещё один сценарий"},
                {"id": 5, "name": "Продолжаем сценарий"},
                {"id": 3, "name": "Давай давай"},
            ]);
        },

		
    }; // ns
    return ns;
})();
