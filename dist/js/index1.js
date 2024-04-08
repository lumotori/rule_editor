//----------------------------------------------------------------
function trim(str){
  return str.toString().replace(/^[ ]+/, '').replace(/[ ]+$/, '');
}
//--------------------------------------------------------------
function getRadioValue(RadioObject){
	var value = null;
	if(!RadioObject.length){
		if(RadioObject.checked){
			return RadioObject.value;
		}else{
			return null;
		}
	}
	for(i = 0; i < RadioObject.length; i++){
		if(RadioObject[i].checked){
			value = RadioObject[i].value;
		}
	} // for
	return value;
}
//----------------------------------------------------------------
function setCookie(name, value, expires, path, domain, secure){
	document.cookie = name + "=" + escape(value) +
	((expires) ? "; expires=" + expires : "") +
	((path) ? "; path=" + path : "") +
	((domain) ? "; domain=" + domain : "") +
	((secure) ? "; secure" : "");
}
//----------------------------------------------------------------
function getCookie(name) {
	//alert('c = '+document.cookie);
	var cookie = " " + document.cookie;
	var search = " " + name + "=";
	var setStr = null;
	var offset = 0;
	var end = 0;
	if (cookie.length > 0) {
		offset = cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = cookie.indexOf(";", offset)
			if (end == -1) {
				end = cookie.length;
			}
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	return(setStr);
}



//----------------------------------------------------------------
function search(){
	
	arr = $('#fsearch').serializeArray();
	/*
	js = {}
	for(var item in arr){
		var js_item = arr[item];
		js[js_item["name"]] = js_item["value"]
	}
	*/
	//console.log(arr);
	js = {"lang": String(arr[0]["value"]), "q": String(arr[1]["value"]), "search_engine": String(arr[2]["value"])}
	search_engine = String(arr[2]["value"])

	//console.log(js);

	$(".form-result").html('<div style="text-align:center;padding:15px;"><img src="/static/src/loader.gif" /></div>');
	//return;
	//JSON.stringify(js),
	
	$.ajax({
		type:     'POST',
		url:      '/search-process',
		contentType: 'application/json',
		headers: {'contentType': 'application/json'},
		data:     JSON.stringify(js),
		cache:    false,
		dataType: "json",
		success: function (res) {
			console.log(res);
			
			
			txt = '';
			counter = 0;
			
			if(res['res']['analyze_result']['arr_res']){
				$.each(res['res']['analyze_result']['arr_res'], function(key, value){
					//alert(value['item']);
					if(search_engine == 'xmldocs_ya'){
						href_text = value['item']['domain'];
					}else if(search_engine == 'xmldocs_go'){
						href_text = value['item']['breadcrumbs'];
					}else{
						href_text = value['item']['displayLink'];
					}
						
					
					txt += '<div style="margin-bottom:25px;"><a href="'+value['item']['url']+'" style="color:#000;text-decoration:none;" target="_blank"><h5 style="margin-bottom:5px;">'+value['item']['title']+'</h5></a><div>'+value['item']['snippet']+'</div><div style="padding:5px 5px 5px 0px;"><a href="'+value['item']['url']+'" style="color:#ccc;" target="_blank">'+href_text+'</a></div></div>';
					
					counter =+ 1;
				});
			}
			
			if(counter != 0){
				$(".form-result").html(txt);
			}else{
				$(".form-result").html('<div style="text-align:center;margin-top:100px;"><b>Негативных результатов не найдено!</b></div>');
			}
			
			//$('#okno-header').html('<span style="color:#005491;">Результат</span>');
			//$("#okno-content").html(txt);
			//$('#BoxMess').modal('show');
		},
		error: function() {
			$(".form-result").html('<div style="text-align:center;margin-top:100px;"><b style="color:#f00;">Ошибка передачи данных!</b><div style="margin-top:25px;">Попробуйте повторить запрос позднее!</div></div>');
		}
	});
} // search_rep








//--------------------------------------------
$(function(){

});





