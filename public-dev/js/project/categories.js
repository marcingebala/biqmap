//obiekt kategorii dodanie / aktualizacja / usunięcie / pokazanie kategorii
var categories = {
	category : new Array(['pusty','#808080']),

	add : function(){
		var name = Array($('#category_box input[name="add_category"]').val(),'#ff0000');
		$('#category_box input[name="add_category"]').val('');

		this.category.push(name);
		menu_top.category = (this.category.length-1);
		this.show_list();
	},

	update : function(index,name){
		this.category[index][0] = name;
		this.show_list();
	},

	//po wybraniu odpowiedniej kolumny katerogii i wartości aktualizujemy kolor kategorii na podstawie excela
	color_from_excel : function(){

		//możliwa aktualizacja jedynie w przypadku wybrania konkretnej kolumny wartości i kategorii w excelu
		if((crud.map_json.length > 0) && (excel.data.length > 0) && (layers.category[layers.active] != -1) && (layers.value[layers.active] != -1)){

			//ustalamy co ile zmieniamy kolor na kolejny 
			var color_count = layers.colors_active[layers.active].length - 1 //ilosc kolorów
			var diffrent = Math.abs( layers.min_value[layers.active] - layers.max_value[layers.active] ) / color_count;

			for (var i = 1, i_max = this.category.length; i < i_max; i++){
				
				for (var i_ex = 0, i_ex_max = excel.data[layers.category[layers.active]].length; i_ex < i_ex_max; i_ex++){
		
					if( this.category[i][0] == excel.data[i_ex][layers.category[layers.active]]){
				
						var color_i = Math.floor((parseFloat(excel.data[i_ex][layers.value[layers.active]])-parseFloat(layers.min_value[layers.active])) / diffrent);
						console.log(color_i, (parseFloat(excel.data[i_ex][layers.value[layers.active]])-parseFloat(layers.min_value[layers.active])), diffrent );
						this.category[i][1] = layers.colors_active[layers.active][color_i];
					}
				}
			}
			//po zaktualizowaniu kolorów w kategoriach rysujemy na nowo canvas
			canvas.draw();
			legends.update();
		}
	},

	remove : function(id){
		var th = this;

		$.each(this.category,function(index,value){
			if(index >= id){
				th.category[index] = th.category[index+1];
			}
		});

		for(var row = 0; row < pointers.pointers.length; row++){
			for(var column = 0; column < pointers.pointers[row].length; column++){

				if(pointers.pointers[row][column] == id){
					pointers.pointers[row][column] = 0;
				}

				if(pointers.pointers[row][column] > id){
					pointers.pointers[row][column] = parseInt(pointers.pointers[row][column]) - 1;
				}

			}
		}

		this.category.pop();
		this.show_list();

		//rysujemy na nową canvas
		canvas.draw();
	},

	show_list : function(){

		var add_category = "<table>";
		//var add_select ='<option name="0">pusty</option>';
		var add_select = '';

		for(var i = this.category.length; i > 1; i--){
			add_category += '<tr><td><span>'+(i-1)+'</span></td><td><input type="text" name="category_name" id_category="'+(i-1)+'" value="'+this.category[(i-1)][0]+'" /></td><td><div class="colorpicker_box" style="background-color:'+this.category[(i-1)][1]+'" id_category="'+(i-1)+'"></div></td><td><button class="remove" id_category="'+(i-1)+'">usun</button></td></tr>';
			add_select += '<option name="'+(i-1)+'">'+this.category[(i-1)][0]+'</option>';
		}
		if(menu_top.category == 0){
			add_select += '<option selected name="0">'+this.category[0][0]+'</option>';
		}
		else{
			add_select += '<option name="0">'+this.category[0][0]+'</option>';
		}


		add_category += "</table>";

		$('#category_box #list').html(add_category);
		$('select#change_category').html(add_select);

		colorpicker.add();
	}
}
