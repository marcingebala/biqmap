//obiekt dotycząsy wyswietlania akutalizacji i edycji panelu legend
legends = {

	//wyświetlamy wszystkie legendy w panelu map
	show : function(){

		var html = "";

		for(var i = 0, i_max = layers.legends[layers.active].length; i < i_max; i++){
			
			html += "<span style='background-color:"+layers.legends[layers.active][i][1]+"' class='color'></span><span contenteditable='true'>"+layers.legends[layers.active][i][0]+"</span>";

		}

		$('#legends').html(html);

	},

	update : function(){
		var color_count = layers.colors_active[layers.active].length //ilosc kolorów
		var diffrent = Math.abs( layers.min_value[layers.active] - layers.max_value[layers.active] ); // color_count;
		
		layers.legends[layers.active] = [];

		for(var i = 0, i_max = layers.colors_active[layers.active].length; i < i_max; i++){
			layers.legends[layers.active].push([  Math.round( (layers.min_value[layers.active]+diffrent*i)*100) / 100, layers.colors_active[layers.active][i] ]);
		}
		
		this.show();

	}
}

legends.show();