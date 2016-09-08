cloud = {

	set_textarea : function(){
		$('#cloud textarea').val( layers.cloud[layers.active] );
	},

	get_textarea : function(obj){

		var text_tmp = $(obj).val();

		layers.cloud[layers.active] = text_tmp;

		for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
			text_tmp = text_tmp.replace('$'+excel.data[0][i],'"+excel.data[tmp_row]['+i+']"+');
		}

		layers.cloud_parser[layers.active] = '"'+text_tmp+'"';
	},

	//ustawiamy poprawną pozycję dymka
	set_position : function(){
		var left = mouse.left - canvas_offset_left;
		var top = mouse.top - canvas_offset_top;
	$("#canvas_cloud").fadeIn(200);
		$("#canvas_cloud").css({top:parseInt(top - $("#canvas_cloud").height()-30)+'px',left:left+'px'});
	},

	//funkcja odpowiedzialna za wyświetlenie dymka z odpowiednią zawartością
	update_text : function(name){

		if(name != "null"){

			var tmp_row = null;
			for( var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(name == excel.data[i_row][layers.category[layers.active]]){
					
					this.set_position();
					var text_tmp = layers.cloud[layers.active];

					for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
						text_tmp = text_tmp.replace('$'+excel.data[0][i],excel.data[i_row][i]);
					}

					$("#canvas_cloud").html(text_tmp);

				}
			}
		}
	}

}


$('#cloud textarea').keyup(function(){

cloud.get_textarea(this);

}) ;