//czyszczenie i rysowanie po canvasie
var canvas = {
	
	scale : 100,
	width_canvas : 700,
	height_canvas : 400,
	canvas : null,
	context : null,
	thumbnail : null,
	title_project : 'nowy projekt',

	context_x : 0, //obecna pozycja contextu x
	context_y : 0, //obecna pozycja contextu y
	context_new_x : 0, //nowa pozycja contextu x
	context_new_y : 0, //nowa pozycja contextu y

	offset_left : null,
	offset_top : null,
	active_row : null, //liczba aktywnych wierszy i kolumn
	active_column : null, //liczba aktywnych wierszy i kolumn

	thumbnail : function(){
		var canvas = document.getElementById("main_canvas");
		var dataURL = canvas.toDataURL();
		console.log(dataURL);
	},

	//rysujemy canvas ze zdjęciem
	draw : function(){
		this.clear();

		pointers.create_array();
		pointers.draw();

		if (image.obj !== undefined)  image.draw();
	},

	draw_thumnail : function(){

		canvas.canvas = document.getElementById('thumbnail_canvas');
		canvas.thumbnail = document.getElementById('thumbnail_canvas');
		canvas.context = canvas.canvas.getContext('2d');

		this.clear();

		pointers.create_array();
		pointers.draw();

		canvas.canvas = document.getElementById('main_canvas');
		canvas.context = canvas.canvas.getContext('2d');

	},

	//resetujemy tło zdjęcia
	reset : function(){
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );
	},

	// czyścimy całe zdjęcie na canvasie
	clear : function(){
		this.context.clearRect ( 0, 0, this.width_canvas, this.height_canvas );
		//this.context.fillRect ( 0, 0, this.width_canvas, this.height_canvas );
	},

	resize_width : function(new_width){
		this.width_canvas = new_width;
		$('#main_canvas').attr('width',this.width_canvas + 'px');
		$('#canvas_box, #canvas_wrapper').css({'width': this.width_canvas + 'px'});
		$('#canvas_info #width').val(this.width_canvas + 'px');
		this.scale = 100;
		$('#canvas_info #size').val(this.scale + '%');
		menu_top.show_info();
	},

	resize_height : function(new_height){
		this.height_canvas = new_height;
		$('#main_canvas').attr('height',this.height_canvas + 'px');
		$('#canvas_box, #canvas_wrapper').css({'height': this.height_canvas + 'px'});
		$('#canvas_info #height').val(this.height_canvas + 'px');
		this.scale = 100;
		$('#canvas_info #size').val(this.scale+'%');
		menu_top.show_info(); // aktualizujemy dane odnośnie rozmiarów canvasa w menu u góry
		//this.draw(); //rysujemy na nowo canvas
	},

	set_default : function(){
		$('#canvas_box #right_resize, #canvas_box #bottom_resize').fadeIn(500);
		if(this.move_image) $('#canvas_box #image_resize').fadeIn(0);

		canvas.scale = 100;
		canvas.context_x = 0;
		canvas.context_y = 0;
		canvas.context.scale( canvas.scale / 100 , canvas.scale / 100 );

		var new_width = canvas.width_canvas * (canvas.scale/100);
		var new_height = canvas.height_canvas * (canvas.scale/100);
		$('#main_canvas').attr({'width': new_width + 'px','height': new_height + 'px'});
		$('#canvas_box, #canvas_wrapper').css({'width': new_width + 'px','height' : new_height + 'px'});

		canvas.reset();
		canvas.context.translate( ( canvas.context_x / (canvas.scale / 100) ),( canvas.context_y / (canvas.scale / 100) ));
		canvas.draw();
		menu_top.show_info();
		canvas.draw();
	}
}

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


			//dwie pętle odpowiedzialne za porównywanie kategorii z excela z katerogiami które mamy w bazie danych
			for (var i = 1, i_max = this.category.length; i < i_max; i++){
				for (var i_ex = 0, i_ex_max = excel.data.length; i_ex < i_ex_max; i_ex++){
					


					console.log('compate category: ',i,i_ex, this.category[i][0], excel.data[i_ex][layers.category[layers.active]]);

					if( this.category[i][0] == excel.data[i_ex][layers.category[layers.active]]){
		
					//console.log('categoryt',i_ex, this.category[i][0],excel.data[i_ex][layers.category[layers.active]]);
					
						var color_i = Math.floor((parseFloat(excel.data[i_ex][layers.value[layers.active]])-parseFloat(layers.min_value[layers.active])) / diffrent);
						//console.log(color_i, (parseFloat(excel.data[i_ex][layers.value[layers.active]])-parseFloat(layers.min_value[layers.active])), diffrent );
						this.category[i][1] = layers.colors_active[layers.active][color_i];
						//przerywamy pętlę (tak aby nie trzeba było niepotrzebnie sprawdzać dodatkowych rekordów w wybranej kategorii)
						i_ex = i_ex_max;
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
		var left = mouse.left - on_category.canvas_offset_left;
		var top = mouse.top - on_category.canvas_offset_top;

		$("#canvas_cloud").css({top:parseInt(top - $("#canvas_cloud").height()-30)+'px',left:left+'px'});
	},

	//funkcja odpowiedzialna za wyświetlenie dymka z odpowiednią zawartością
	update_text : function(name){

		if(name != "null"){

			var tmp_row = null;
			var find = 0;
			for( var i_row = 0, i_row_max = excel.data.length; i_row < i_row_max; i_row++ ){
				if(name == excel.data[i_row][layers.category[layers.active]]){
					
					this.set_position();
					var text_tmp = layers.cloud[layers.active];

					for(var i = 0, i_max = excel.data[0].length; i < i_max; i++){
						text_tmp = text_tmp.replace('$'+excel.data[0][i],excel.data[i_row][i]);
					}
					
					//dopiero jeśli dymek ma mieć jakaś konkretną zawartość wyświetlamy go
					if(text_tmp!=""){
						$("#canvas_cloud").fadeIn(200);
						$("#canvas_cloud").html(text_tmp);
						find = 1;
					}
				}
			}

			//jeśli nie znaleziono odpowiedniej kategorii
			if (!find) { 
				$("#canvas_cloud").fadeOut(200);
			}

		}
		else{
			$("#canvas_cloud").fadeOut(200);
		}
	}

}


$('#cloud textarea').keyup(function(){

cloud.get_textarea(this);

}) ;
//sama nazwa wiele tłumaczy po prostu colorpicker
var colorpicker = {

	click_id : null,

	add : function(){
		this.remove();
		$('.colorpicker_box').ColorPicker({
			color: '#ff0000',
			onShow: function (colpkr) {
				if($(colpkr).css('display')=='none'){
					$(colpkr).fadeIn(200);
					colorpicker.click_id = $(this).attr('id_category');
				}
				return false;
			},
			onHide: function (colpkr) {
				$(colpkr).fadeOut(200);
				return false;
			},
			onChange: function (hsb, hex, rgb) {
				$('.colorpicker_box[id_category="'+colorpicker.click_id+'"]').css('backgroundColor', '#' + hex);
				categories.category[colorpicker.click_id][1] = '#' + hex;
				canvas.draw();
			}
		});
	},

	remove : function(){
		$('.colorpicker').remove();
	}
}

//funkcja odpowiedzialna za tworzenie zapisywanie i aktualizacje danych dotycząćcyh mapy
var crud = {

	map_json : Array(), //główna zmienna przechowująca wszystkie dane
	map_hash : null,

	select_map : function( id_map ){

		//jeśli uruchomimy
		if (id_map == 'new_map') { 
			this.create_map() 
		}
		else{
			this.map_hash = id_map;
			this.get_map();
		}

	},

	//pobieramy dane z porojektu i zapisujemy je do json-a
	get_data : function(){

		//pobieramy dane dotyczące mapy (canvasa)

		//zerujemy na nowo całą tablicę pointerów
		this.map_json = Array();

		// data[x] = zmienne podstawowe dotyczące mapy
		this.map_json[0] = Array();
		this.map_json[0][0] = canvas.height_canvas;
		this.map_json[0][1] = canvas.width_canvas;
		this.map_json[0][2] = pointers.padding_x;
		this.map_json[0][3] = pointers.padding_y;
		this.map_json[0][4] = pointers.translate_modulo;
		this.map_json[0][5] = pointers.size_pointer;
		this.map_json[0][6] = pointers.main_kind;
		this.map_json[0][7] = canvas.title_project;

		// data[1] = tablica punktów (pointers.pointers) [wiersz][kolumna] = "none" || (numer kategorii)
		this.map_json[1] = pointers.pointers;

		// data[2] = tablica kategorii
		this.map_json[2] = categories.category;

		//data[3] = tablica wzorca (zdjęcia w tle do odrysowania)
		this.map_json[3] = Array();

		if(image.obj){
			this.map_json[3][0] = image.obj.src;
			this.map_json[3][1] = image.x;
			this.map_json[3][2] = image.y;
			this.map_json[3][3] = image.width;
			this.map_json[3][4] = image.height;
			this.map_json[3][5] = image.alpha;
		}

		//pobieramy dane dotyczące projektów (layers)
		//tworzymy obiekt warstwy zawierający wszystkie dane dotyczące projektu
		this.layers = {};
		this.layers.palets_active = layers.palets_active;
		this.layers.category = layers.category;
		this.layers.value = layers.value;
		this.layers.colors_pos = layers.colors_pos;
		this.layers.colors_active = layers.colors_active;
		this.layers.min_valie = layers.min_valie;
		this.layers.max_value = layers.max_value;
		this.layers.cloud = layers.cloud;
		this.layers.cloud_parser = layers.cloud_parser;
		this.layers.legends = layers.legends;

		//tworzymy obiekt excela

		this.excel = excel.data;


		//konwertujemy nasza tablice na json
		this.map_json = JSON.stringify(this.map_json);
		this.layers = JSON.stringify(this.layers);
		this.excel = JSON.stringify(this.excel);
	},

	//pobranie mapy z bazy danych
	get_map : function(){

		var th = this;

		$.ajax({
			  url: '/api/maps/' + th.map_hash,
		  	type: "GET",
		    contentType: "application/json"
			}).done(function( data ) {

			console.log( data.data[0] );

			//po zapisaniu danych do bazy aktualizujemy id (w przypadku jeśli istnieje nadpisujemy je)
			var response = JSON.parse(data.data[0].map_json);
			th.map_json = response;

			//pobieramy i wczytujemy dane o canvasie do obiektu
			canvas.height_canvas = response[0][0];
			canvas.width_canvas = response[0][1];
			pointers.padding_x = response[0][2];
			pointers.padding_y = response[0][3];
			pointers.translate_modulo = response[0][4];
			pointers.size_pointer = response[0][5];
			pointers.main_kind = response[0][6];
			canvas.title_project = response[0][7];

			$('#pointer_box input[name="padding_x"]').val( response[0][2] );
			$('#pointer_box input[name="padding_y"]').val( response[0][3] );
			$('#pointer_box input[name="size_pointer"]').val( response[0][5] );
			$('input[name="title_project"]').val( response[0][7] );

			if( response[0][4] ){
				$('#pointer_box div[name="translate_modulo"]').removeClass('switch-off');
				$('#pointer_box div[name="translate_modulo"]').addClass('switch-on');
			}

			$('#pointer_box select[name="main_kind"]').html('');

			pointers.kinds.forEach(function(kind){

				if(kind == response[0][6]){
					$('#pointer_box select[name="main_kind"]').append('<option selected="selected" name="'+kind+'">'+kind+'</option>');
				}
				else{
					$('#pointer_box select[name="main_kind"]').append('<option name="'+kind+'">'+kind+'</option>');
				}

			});

			//pobieramy dane o pointerach
			pointers.pointers = response[1];

			//pobieramy dane o kategoriach
			categories.category = response[2];

			//pobieranie danych o zdjęciu jeżeli istnieje
			if( response[3].length > 2){
				image.obj = new Image();
				image.obj.src = response[3][0];
				image.x = parseInt( response[3][1] );
				image.y = parseInt( response[3][2] );
				image.width = parseInt( response[3][3] );
				image.height = parseInt( response[3][4] );
				image.alpha = parseInt( response[3][5] );

				//zaznaczenie odpowiedniego selecta alpha w menu top
				$('#alpha_image option[name="'+	image.alpha +'"]').attr('selected',true);

				image.obj.onload = function() {
					canvas.draw();
				};
			}

			//zaktualizowanie danych w inputach
			$('#main_canvas').attr('width', canvas.width_canvas+'px');
			$('#main_canvas').attr('height', canvas.height_canvas+'px');
			$('#canvas_box, #canvas_wrapper').css({'width':canvas.width_canvas+'px','height':canvas.height_canvas+'px'});

			canvas.draw();
			categories.show_list();
			categories.color_from_excel();
		});
	},

	//tworzymy nową mapę danych
	create_map : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza
		console.log('create',th.map_json);

		//wysysłamy dane ajaxem do bazy danych
		//canvas.draw_thumnail();
		//new_image = image.dataURItoBlob( canvas.thumbnail.toDataURL() );
		//canvas.draw();

		//var formData = new FormData();
		//formData.append("action",	'create_map' );
		//formData.append("map_name", canvas.title_project);
		//formData.append("map_json", th.map_json);
		//formData.append("map_image", new_image);
		//formData.append("_method", 'POST');
		//formData.append("_token", csrf_token);
		
		var data = {
			map_json: th.map_json
		}

		jQuery.ajax({
			url: "api/maps",
			data: { map_json: th.map_json },
			type: 'POST',
			success: function(response){
				th.map_hash = response.hash_map;
				alert('zapisano nową mapę');
				menu_top.get_maps();
			}
		});

	},

	//aktualizujemy mapę
	update_map : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza

		//canvas.draw_thumnail();
		//new_image = image.dataURItoBlob( canvas.thumbnail.toDataURL() );
	/*
		var formData = new FormData();
		formData.append("map_hash", th.map_hash );
		formData.append("map_name", canvas.title_project);
		formData.append("map_json", th.map_json);
		formData.append("map_image", new_image);
		formData.append("_method", 'PUT');
		formData.append("_token", csrf_token);

		jQuery.ajax({
			url: basic_url + "/map/"+th.map_hash,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function(data){
				alert('zaktualizowano mapę');
			}
		});
	*/

		var data = {
			map_hash: th.map_hash,
			map_json: th.map_json
		}

		jQuery.ajax({
			url: "api/maps",
			//data: JSON.stringify(data),
			data: data,
			type: 'PUT',
			success: function(response){
				alert('zaktualizowano mapę');
			}
		});

	},

	//usuwamy mapę z bazy danych
	delete_map : function(){

		var th = this; //zmienna pomocnicza

		//sprawdzamy czy mapa do usunięcia posiada swoje id
		if(this.map_hash != null){
			$.post( basic_url + "/map/" + th.map_hash, {
				action: 'delete_map',
				_method: 'DELETE',
				_token: csrf_token,
				map_hash: th.map_hash
			})
			.done(function( response ) {
				response = JSON.parse(response);
				if (response.status = "OK") {
					window.location.replace(basic_url +"/map");
				}
				else{
					alert('błąd podczas usuwania mapy');
				}
			});
		}
		else{
			alert('brak hasha - mapa nie jest zapisana');
		}
	}
}

var excel = {
	
	alpha : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
	data : [["wojewodztwo","wartosc1","wartosc2","wartosc3","wartosc1","wartosc2","wartosc3"],["krowodrza",1.4,20,6,1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["srodmiescie",1.6,50,43],["nowa_huta",2,34,3],["podgorze",1,32,6],["nowa_huta1",2,34,3]],
	min_row : 10,
	min_col : 6,

	init : function(){

		//dodanie eventów przy kliknięciu excela
		$('#excel_box button').click(function(){ $('#excel_box input').click(); });
		$('#excel_box input').change(function(){ excel.send_file(); });

		//funkcja tymczasowa do narysowania tabelki excela
		this.draw();
	},

	//funkcja odpowiedziala za poprawne podpisanie osi
	draw : function(){

		add_html = '';

		//jeśli ilośc wierszy jest większa aktualizujemy wielkość tablicy
		if(excel.data.length > excel.min_row) excel.min_row = excel.data.length;
		if(excel.data[0].length > excel.min_col) excel.min_col = excel.data[0].length;

		//renderujemy całą tablicę excel
		for(var i = 0;i < this.min_row; i++){
			add_html += '<div class="tr">';
			for(var j = 0;j < this.min_col; j++){

				if((j == 0) && (i > 0)){
					add_html += '<div class="td" row="' + i + '" col="' + j + '" >'+ i +'</div>';
				}
				else{
					try{
						if(typeof(excel.data[i][(j-1)]) != "undefined"){
							add_html += '<div class="td" contenteditable="true" row="' + i + '" col="' + j + '">'+excel.data[i][(j-1)]+'</div>';
						}
						else{
							add_html += '<div class="td"  row="' + i + '" col="' + j + '"></div>';
						}
						//console.log(excel.data[i][(j+1)]);
					}catch(error){
						add_html += '<div class="td" row="' + i + '" col="' + j + '"></div>';
					}
				}

			}
			add_html += '</div>';
		}

		$('#excel_box .table').html( add_html );

		//dodajemy możliwość edycji excela
		$('#excel_box .table .td').blur(function(){ excel.edit(this); });

	},

	//funkcja umożliwiająca edycje zawartości komórki
	edit : function(obj){	
		excel.data[$(obj).attr('row')][($(obj).attr('col')-1)] = $(obj).html();
		palets.parse_color();
	},

	//pobieramy plik, z inputa i wyłamy do backendu w celu sparsowania a następnie przypisujemy do tablicy i wyświetlamyw formie tabelski
	send_file : function() {
	
		var excel_form = new FormData(); 
		excel_form.append("excel_file", $("#excel_box input")[0].files[0]);

 		$.ajax( {
      
      url: '/api/projects/excel_parse',
      type: 'POST',
      data: excel_form,
      processData: false,
      contentType: false

    }).done(function( response ) {

    	//po wczytaniu pliku excel przypisujemy dane rysujemy na nowo tabelę oraz wyświetlamy wszystkie palety kolorów
			console.log( response )
    	excel.data = response.excel[0].data;
    	excel.draw();
    	palets.show_select();
    });
	}
}

excel.init();

//funkcje rysujące pojedyńczy punkt (pointer)
var figures = {

	square : function(x,y,size){
		canvas.context.fillRect(x,y,size,size);
	},

	circle : function(x,y,size){
		var size = size / 2;
		var center_x = x + size;
		var center_y = y + size;
		canvas.context.beginPath();
		canvas.context.arc(center_x, center_y, size, 0, 2 * Math.PI);
		canvas.context.fill();
	},

	hexagon  : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x,y+a2);
    canvas.context.lineTo(x+a,y+a2-h);
  	canvas.context.lineTo(x+a+a2,y+a2-h);
		canvas.context.lineTo(x+size,y+a2);
		canvas.context.lineTo(x+size-a,y+a2+h);
		canvas.context.lineTo(x+a,y+a2+h);
		canvas.context.lineTo(x,y+a2);
		canvas.context.fill();
	},

	hexagon2 : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x+a2,y);
    canvas.context.lineTo(x+a2+h,y+a);
  	canvas.context.lineTo(x+a2+h,y+a2+a);
    canvas.context.lineTo(x+a2,y+size);
    canvas.context.lineTo(x+a2-h,y+a2+a);
    canvas.context.lineTo(x+a2-h,y+a);
    canvas.context.lineTo(x+a2,y);
		canvas.context.fill();

	}
}

//funkcje globalne kontener na wszystko i nic ;)
var global = {
	toogle_panel  : function(event){
		if (!event) {event = window.event;} //latka dla mozilli
	
		//sprawdzamy z jakim panelem mamy do czynienia (czy pokazującym się z lewej czy z prawej strony)
		if(  parseInt($(event.target).parent().css('left')) > 0 ){
			//panel jest z prawej strony
			if( $(event.target).parent().css('right') == '0px' ){
				$(event.target).parent().animate({right: [-$(event.target).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(event.target).parent().animate({right: ["0px","swing"]}, 1000, function() {});
	    }
		}
		else{
			//panel jest z lewej strony
			if( $(event.target).parent().css('left') == '0px' ){
				$(event.target).parent().animate({left: [-$(event.target).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(event.target).parent().animate({left: ["0px","swing"]}, 1000, function() {});
	    }
		}

	}
}

//główne zdjęcie od którego odrysowujemy mapy
var image = {
	obj : undefined,
	x : null,
	y : null,
	width : null,
	height : null,
	alpha : 10,

	draw : function(){
		canvas.context.globalAlpha = this.alpha/10;
		canvas.context.drawImage(this.obj,this.x,this.y,this.width,this.height);

		$('#canvas_box #image_resize').css({'height':this.height,'top':this.y+'px','left':(this.x+this.width)+'px'});
		canvas.context.globalAlpha = 1;
	},

	//funkcja pomocnicza konwertująca dataURI na plik
	dataURItoBlob : function(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
	}

}

var data_input = {

	//pobieranie informacji z inputów i zapisanie do obiektu map_svg
	get : function(){
		map.name = $('#map_form input[name="name"]').val();
		map.path = $('#map_form textarea').val().replace(/"/g, "'");
		$('#map_contener').html( $('textarea[name=map_path]').val() );
	},

	//pobranie informacji z obiektu map_svg i zapisanie do inputów
	set : function(){
		$('#map_form input[name="name"]').val( map.name );
		$('#map_form textarea').val( map.path );
		$('#map_contener').html( $('textarea[name=map_path]').val() );
	}

}

var layers = {

	list : ['warstwa1'],
	active : 0,

	//tablica z podstawowywmi danymi zagregowanymi dla każdej warstwy
	palets_active : [0],
	category : [-1],
	value : [-1],
	colors_pos : [[1,1,1,1,1,1,1,1,1]],
	colors_active : [["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"]],
	min_value : [0],
	max_value : [0],
	cloud : [""],
	cloud_parser : [""],
	legends : [[[20,"#f7fcfd"],[50,"#e5f5f9"],[80,"#ccece6"],[110,"#99d8c9"],[140,"#66c2a4"],[170,"#41ae76"],[200,"#238b45"],[230,"#006d2c"],[260,"#00441b"]]],

	show : function(){
		
		var html = "";

		for(var i = 0, i_max = this.list.length; i < i_max; i++){
			if(i == this.active){
				html += '<span class="active">' + this.list[i] + '</span>';
			}
			else{
				html += '<span>' + this.list[i] + '</span>';
			}
		}

		html += '<button class="add"> + </button><button class="remove"> - </button>';

		$('#layers').html(html);

		$('#layers .add').click(function(){layers.add();});
		$('#layers .remove').click(function(){layers.remove();});
		
		$('#layers span').click(function(){ console.log('clicl');layers.select(this);});
		$('#layers span').dblclick(function(){ layers.edit(this); });
		$('#layers span').focusout(function(){ layers.end_edit(this); });

	},

	select : function(obj){
		$('#layers span').removeClass('active');
		$(obj).addClass('active');
		layers.active = $(obj).index();
		palets.show();
		cloud.set_textarea();
		categories.color_from_excel();
	},

	add : function(){

		this.list.push( 'warstwa' + parseInt(this.list.length+1));


		this.category.push(-1);
		this.value.push(-1);
		this.palets_active.push(0);
		this.colors_active.push(['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']);
		this.colors_pos.push([1,1,1,1,1,1,1,1,1]);
		this.min_value.push(0);
		this.max_value.push(0);
		this.cloud.push("");
		this.cloud_parser.push("");
		this.legends.push([]);
		this.show();
	},

	remove : function(){

		console.log("remove",this.active,this.list.length-1)

		if(this.active == (this.list.length-1)){
			var i_tmp = this.list.length-1;
			this.select( $('#layers span').eq( i_tmp ) );
		} 
	
		this.palets_active.pop();
		this.list.pop();
		this.colors_pos.pop();
		this.category.pop();
		this.value.pop();
		this.colors_active.pop();
		this.min_value.pop();
		this.max_value.pop();
		this.cloud.pop();
		this.cloud_parser.pop();
		this.legends.pop();
		this.show();
	},

	edit : function(obj){
		$(obj).attr('contenteditable','true');
		$(obj).click();
	},


	end_edit : function(obj){
		$(obj).attr('contenteditable','false');
		layers.list[ $(obj).index() ] = $(obj).html();
	}
}

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
			
			var now_tmp = Math.round( (layers.min_value[layers.active]+diffrent/color_count*i)*100) / 100
			if(i+1 == i_max ){
				var next_tmp = layers.max_value[layers.active]
			}
			else{
				var next_tmp = Math.round( ((layers.min_value[layers.active]+diffrent/color_count*(i+1)) - 0.01)  *100) / 100 
			}
			layers.legends[layers.active].push([  now_tmp+' - '+next_tmp, layers.colors_active[layers.active][i] ]);
		}
		
		this.show();

	}
}

legends.show();
/*
    ____   ____ ____    __  ___ ___     ____     _____    ____ 
   / __ ) /  _// __ \  /  |/  //   |   / __ \   |__  /   / __ \
  / __  | / / / / / / / /|_/ // /| |  / /_/ /    /_ <   / / / /
 / /_/ /_/ / / /_/ / / /  / // ___ | / ____/   ___/ /_ / /_/ / 
/_____//___/ \___\_\/_/  /_//_/  |_|/_/       /____/(_)\____/  

varsion 3.0 by Marcin Gębala

lista obiektów:

 canvas = canvas() - obiekt canvasa
 crud = crud() - obiekt canvasa
 image = image() - obiekt zdjęcia od którego odrysowujemy mapy
 mouse = mouse()
 models = models()
 global = global() - funkcje nie przypisany do innych obiektów
 categories = categories()
 pointers = pointers()
 colorpicker = colorpicker()
 menu_top = menu_top()
 figures = figures()

*/

//po kliknięciu zmieniay aktualny panel
$('.box > ul > li').click(function(){ menu_top.change_box(this) });

$(document).ready(function(){

	menu_top.get_maps();
  layers.show();
  palets.show();

	//zablokowanie możliwości zaznaczania buttonów podczas edycji pola
	$(document).on("focusin","input",function(){ menu_top.disable_select = true; });
	$(document).on("focusout","input",function(){ menu_top.disable_select = false; });


	$('#toolbar_top button.save').click(function(){ 

		//jeśli nie mamy zdefiniowanega hasha tworzymy nową mapę w przeciwnym wypadku aktualizujemy już istniejącą
		
		console.log('crud',crud.map_hash)

		if(typeof crud.map_hash == 'string'){
			
			crud.update_map();

		}
		else{
			
			crud.create_map();
		
		}

	});


	$('#toolbar_top button.delete').click(function(){ alert('delete'); });


	//odznaczenie selecta przy zmianie
	$('#change_category').change(function(){ $('#change_category').blur(); });

	//rejestracja zdarzenia w momencie pusczenia przycisku myszki
	$(document).mouseup(function(){ mouse.mouse_down = false; });

	//rejestracja zdarzenia w momencie wciśnięcia przycisku myszki
	$(document).mousedown(function(event){
	
		if (!event) {event = window.event;} //łata dla mozilli
		mouse.set_mouse_down(event);
	
	});

	//wywołanie funkcji podczas poruszania myszką
	$(document).mousemove(function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		mouse.set_position(event); //zarejestrowanie pozycji myszki
		//jesli przycisk jest wciśnięty wykonujemy dodatkowe zdarzenia (przy ruszaniu myszką)
		if(mouse.mouse_down) mouse.mousemove(event);
		if(menu_top.auto_draw){ mouse.click_obj = "canvas"; mouse.mousemove(event);}
	
	});

	$('#main_canvas').mousedown(function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		mouse.set_mouse_down(event);//zarejestrowanie obiektuw  który klikamy
		mouse.set_position(event); //zarejestrowanie pozycji myszki
		//jesli przycisk jest wciśnięty wykonujemy dodatkowe zdarzenia (przy ruszaniu myszką)
		mouse.mousemove(event);

	});

	$(document).mouseup(function(){

		pointers.last_column = null;	//kolumna pointera który został ostatnio zmieniony
		pointers.last_row = null;
		canvas.context_x = canvas.context_new_x;
		canvas.context_y = canvas.context_new_y;

	});

	//dodanie nowej kategorii
	$('#add_category').click(function(){
		categories.add();
	});

	//dodanie nowej kategorii (po wciśnięciu enter)
	$('input[name="add_category"]').keypress(function(e) {
    	if(e.which == 13) {
    		categories.add();
    	}
	});

	//$(document).keypress(function(e) { menu_top.switch_mode( e.which ); });

	//zaktualizowanie kategorii
	$("#list").delegate("input","focusout", function() { categories.update($(this).attr('id_category') ,$(this).val() ); });
	$("#list").delegate("input","keypress", function(e) { if(e.which == 13) {categories.update($(this).attr('id_category') ,$(this).val() ); } });

	//usunięcie kategorii
	$("#list").delegate("button.remove","click", function() { categories.remove($(this).attr('id_category')); });

	//zaktualizowanie kategorii
	$("#list").delegate("input","click", function() { menu_top.mode_key = false;  });
	$("#list").delegate("input","focusout", function() { menu_top.mode_key = true;  });

	//pokazanie / ukrycie panelu kategorii
	$('#excel_box h2, #pointer_box h2, #palets_box h2').click(function(event){ global.toogle_panel(event); });

	//obsługa buttonów do inkrementacji i dekrementacji inputów
	$('button.increment').click(function(){ models.button_increment( $(this) ) });
	$('button.decrement').click(function(){ models.button_decrement( $(this) ) });

	//obługa inputów pobranie danych i zapisanie do bazy
	$('.switch').click(function(){ models.update_from_switch( $(this) ); }); //przyciski switch
	$('.input_base').change(function(){ models.update_from_input( $(this) ); }); //tradycyjne inputy
	$('.input_base_text').change(function(){ models.update_from_input_text( $(this) ); }); //tradycyjne inputy
	$('.select_base').change(function(){ models.update_from_select( $(this) ); }); //listy rozwijane select

	$('#menu_top #increment_canvas').click(function(){ menu_top.increment_scale(); });
	$('#menu_top #decrement_canvas').click(function(){ menu_top.decrement_scale(); });
	$('#menu_top #add_image').click(function(){ menu_top.add_image(); });

	$('#menu_top #reset_canvas').click(function(){ canvas.set_default(); });

	//przypisanie podstawowowych danych do obiektu canvas
	canvas.canvas = document.getElementById('main_canvas');
  canvas.context = canvas.canvas.getContext('2d');
  canvas.width_canvas = parseInt( $('#main_canvas').attr('width') );
  canvas.height_canvas = parseInt( $('#main_canvas').attr('height') );
  var offset = $('#canvas_box').offset();
  canvas.offset_left = offset.left;
  canvas.offset_top = offset.top;

  //tworzymy tablice pointerów
	pointers.create_array();

  $('#canvas_info #width').val(canvas.width_canvas+'px');
	$('#canvas_info #height').val(canvas.height_canvas+'px');
  $('#canvas_box, #canvas_wrapper').css({'width': canvas.width_canvas + 'px','height':canvas.height_canvas + 'px'});
	$('#canvas_info #width,#canvas_info #height,#canvas_info #size').change(function(){menu_top.update_canvas_info()});

	$('#alpha_image').change(function(){ menu_top.change_alpha() });

	$('input').click(function(){ menu_top.mode_key = false; });
	$('input').focusout(function(){ menu_top.mode_key = true; });

	$(document).mouseup(function(){ canvas.draw(); });
	canvas.draw(); //rysowanie canvas

	//zapisujemy lub aktualizujemy mapę po kliknięciu w buttow w zależności od tego czy mamy zdefiniowane id mapy
	$('.menu_right .save').click(function(){
		if(crud.map_hash == null){ crud.create_map(); }
		else{ crud.update_map(); }
	});

	//usuwamy mapę po kliknięciu w button
	$('.menu_right .remove').click(function(){if(confirm("czy napewno usunąć mapę ?")){crud.delete_map();} });

});

//obiekt menu_top
menu_top = {

	move_image : false,
	move_canvas : false,
	auto_draw : false,
	mode_key : true,
	category : 0,
	disable_select : false,

	//zmiana aktualnej zakładki
	change_box : function(obj){
		$(obj).parent().children('li').removeClass('active');
		$(obj).addClass('active');

		var category = $(obj).html();
		$(obj).parent().parent().children('div').fadeOut(500, function(){
			$(obj).parent().parent().children('#'+category).delay(100).fadeIn(500);
		});
	
	
	},

	//funkcja służąca do pobierania danych dotyczących map
	get_maps : function(){
	
		$.ajax({
   		url: '/api/maps',
    	type: "GET",
    	contentType: "application/json"
		}).done( function( response ) {
			
			//wyświetlamy listę map w panelu u góry
			if(response.status == "ok"){

				var add_html = '';
				for (var i = 0, i_max = response.data.length; i < i_max ;i++){

					if(response.data[i]._id == crud.map_hash){
						add_html += '<option selected id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
					else{
						add_html += '<option id="' + response.data[i]._id + '">' + JSON.parse(response.data[i].map_json)[0][7] + '</option>';
					}
				
				}

				$('#toolbar_top select.select_maps').append( add_html );
			}

		});

		//dodajemu zdarzenie change map 
		$('.select_maps').change(function(){
			if (confirm('Czy chcesz wczytać nową mapę ?')) {
				if( $(this).find('option:selected').attr('id') == 'new_map' ){
					location.reload();
				}
				else{
					crud.select_map( $(this).find('option:selected').attr('id') );
				}
			}
		});

	},

	update_canvas_info : function(){
		canvas.scale = parseInt( $('#canvas_info #size').val() );
		canvas.width_canvas = parseInt( $('#canvas_info #width').val() );
		canvas.height_canvas = parseInt( $('#canvas_info #height').val() );

		$('#canvas_info #size').val( canvas.scale + '%' );
		$('#canvas_info #width').val( canvas.width_canvas + 'px' );
		$('#canvas_info #height').val( canvas.height_canvas + 'px' );

		$('#canvas_box, #canvas_wrapper').css({'width': canvas.width_canvas + 'px','height':canvas.height_canvas + 'px'});
		$('#canvas_box #main_canvas').attr('width',canvas.width_canvas + 'px');
		$('#canvas_box #main_canvas').attr('height',canvas.height_canvas + 'px');
		canvas.draw();
	},

	change_alpha : function(){
		image.alpha = $('#alpha_image').find('option:selected').attr('name');
		canvas.draw();
	},

	add_image : function(){

		//jesli podany parametr nie jest pusty
		var src_image = prompt("Podaj ścieżkę do zdjęcia: ");

		if(src_image){
			if(src_image.length > 0){

				image.obj = new Image();

				//wczytanie zdjęcia:
					image.obj.onload = function() {
	    		image.width = image.obj.width;
	    		image.height = image.obj.height;
	    		image.draw();
	  		};

			  image.x = 0;
			  image.y = 0;
			  image.obj.src = src_image;
				//simage.obj.setAttribute('crossOrigin', 'anonymous');
			}
		}
	},

	show_info : function(){
		$('#canvas_info #size').val(parseInt(canvas.scale) + '%');
		$('#canvas_info #width').val(parseInt(canvas.width_canvas) + 'px');
		$('#canvas_info #height').val(parseInt(canvas.height_canvas) + 'px');
	}

}

// pobieranie danych z selekta inputa switchy (aktualizacja obiektów) button inkrement i dekrement
var models = {

	button_increment : function(obj){

		var input_to_update = $(obj).attr('nameinput');
		var value = parseInt($('input[name="'+input_to_update+'"]').val()) + 1;

		$('input[name="'+input_to_update+'"]').val(value);
		this.update_from_input( $('input[name="'+input_to_update+'"]') );
	},

	button_decrement : function(obj){

		var input_to_update = $(obj).attr('nameinput');
		var value = parseInt($('input[name="'+input_to_update+'"]').val()) - 1;

		$('input[name="'+input_to_update+'"]').val(value);
		this.update_from_input( $('input[name="'+input_to_update+'"]') );
	},

	update_from_input : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = parseInt($(obj).val());
		canvas.draw();
	},

	update_from_input_text : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = $(obj).val();
		canvas.draw();
	},

	update_from_select : function(obj){
		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		window[name_class][name_method] = $(obj).find('option:selected').attr('name');
		canvas.draw();
	},

	update_from_switch : function(obj){

		var name_class = $(obj).attr('obj');
		var name_method = $(obj).attr('name');

		if( $(obj).attr("value") == 'false' ){
			$(obj).attr("value",'true');
			$(obj).removeClass('switch-off');
			$(obj).addClass('switch-on');
			window[name_class][name_method] = true;
		}
		else{ //wyłączamy przełącznik
			$(obj).attr("value",'false');
			$(obj).removeClass('switch-on');
			$(obj).addClass('switch-off');
			window[name_class][name_method] = false;
		}
		canvas.draw();
	}
}

//obiekt myszki (do ogarniecia)
var mouse = {
	mouse_down : false,
	click_obj : null,

	tmp_mouse_x : null, //zmienne tymczasowe umożliwiające przesuwanie tła
	tmp_mouse_y : null, //zmienne tymczasowe umożliwiające przesuwanie tła

	left : null, //pozycja x myszki
	top : null, //pozycja y myszki
	padding_x : null, //pozycja x myszki od górnej krawędzi
	padding_y : null, //pozycja y myszki od górnej krawędzi
	offset_x : null, //offset x obiektu klikniętego
	offset_y : null, //offset y obiektu klikniętego

	//funckja wykrywająca w co kliknięto pobierająca padding kliknięcia oraz zapisująca kliknięcie
	set_mouse_down : function(event){

		if (!event) {event = window.event;} //lata dla mozilli
		var obj = event.target;

		//jeśli element na który kliknięto ma atrybut nameclick przypisujemy go do obiektu myszki
		if(typeof($(event.target).attr('nameclick')) != "undefined"){
			this.click_obj = $(event.target).attr('nameclick');

			var position = $(obj).offset();
			this.offset_x = position.left;
			this.offset_y = position.top;
			this.padding_x = this.left - position.left;
			this.padding_y = this.top - position.top;
			mouse.mouse_down = true;

			this.tmp_mouse_x = image.x;
			this.tmp_mouse_y = image.y;
		}
	},

	set_position : function(event){
		this.left = event.pageX,
		this.top = event.pageY
	},

	//funkcja wykonywana podczas wciśniecia przyciksku myszki (w zależności od klikniętego elementu wykonujemy różne rzeczy)
	mousemove : function(){
		switch(this.click_obj){
			case 'right_resize':
				//rozszerzanie canvasa w prawo
				var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
				var new_width = this.left - this.padding_x - position.left
				if(new_width < screen.width - 100)
				{
					canvas.resize_width(new_width);
				}
			break;

			case 'bottom_resize':
				//zmieniamy wysokość canvasa
				var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
				canvas.resize_height(this.top - this.padding_y - position.top);
			break;

			case 'image_resize':

				if(image.obj !== undefined){

					var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();
					var x_actual = this.left - position.left;	//aktualna pozycja myszki
					var substract = image.x + image.width - x_actual + this.padding_x;
					var facor = image.width / image.height;

					if (image.width - substract > 100){
						image.width -= substract;
						image.height -= substract/facor;
						canvas.draw();
					}
				}
			break;

			case 'canvas':

				//przesuwanie zdjęciem (np. mapa / wzorzec)
				if((menu_top.move_image) && (image.obj !== undefined))
				{
					var position = $('#canvas_box #canvas_wrapper').children('canvas').offset();

					var x_actual = this.left - position.left; //aktualna pozycja myszki
					var y_actual = this.top - position.top; // aktualna pozycja myszki

					var x_translate = x_actual - this.padding_x + mouse.tmp_mouse_x; //przesunięcie obrazka względem aktualnej pozycji myszki
					var y_translate = y_actual - this.padding_y + mouse.tmp_mouse_y; //przesuniecie obrazka względem aktualnej pozycji myszki

					var x_new = x_translate ;
					var y_new = y_translate ;

					image.x = x_new;
      				image.y = y_new;
      				canvas.draw();
				}

				//rysowanie
				else if ((!menu_top.move_image) && (!menu_top.move_canvas))
				{
					var row_click = parseInt( (this.top - canvas.offset_top + canvas.context_y*(-1) ) / ( (pointers.size_pointer + pointers.padding_y)*(canvas.scale / 100)  ) );
					var column_click = parseInt( (this.left - canvas.offset_left + canvas.context_x*(-1) ) / ( (pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100) ) );

				//	console.log('klik',row_click,column_click,canvas.context_x,canvas.context_y);

					if((pointers.translate_modulo) && (row_click%2 ==0)){
						//column_click = parseInt( (this.left - canvas.offset_left - pointers.size_pointer/2) / ((pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100))  );
						column_click = parseInt( (this.left - canvas.offset_left + canvas.context_x*(-1) - pointers.size_pointer/2) / ( (pointers.size_pointer + pointers.padding_x)*(canvas.scale / 100) ) );
					}

					if( (row_click >= 0) && (row_click < canvas.active_row) && (column_click >= 0) && (column_click < canvas.active_column) )
					{
						pointers.update_point(row_click,column_click,pointers.last_row,pointers.last_column);
						pointers.last_column = column_click;
						pointers.last_row = row_click;
						canvas.draw();
					}
					else{
						pointers.last_row = null;
						pointers.last_column = null;
					}
				}

				//przesuwanie całym canvasem
				else if(menu_top.move_canvas)
				{
					canvas.reset();
					canvas.clear();

					canvas.context_new_x = (mouse.left - mouse.offset_x) - mouse.padding_x + canvas.context_x;
					canvas.context_new_y = (mouse.top - mouse.offset_y) - mouse.padding_y + canvas.context_y;

					if(canvas.context_new_x > 0) canvas.context_new_x = 0;
					if(canvas.context_new_y > 0) canvas.context_new_y = 0;

					canvas.context.translate( ( canvas.context_new_x / (canvas.scale / 100) ),( canvas.context_new_y / (canvas.scale / 100) ));
					canvas.draw();
				}

			break;
		}
	}
}

//obiekt mówiący nam nad jaką kategoria jesteśmy
var on_category = {
	
	canvas_offset_top : $('#canvas_wrapper').offset().top,
	canvas_offset_left : $('#canvas_wrapper').offset().left,

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	get_name : function(){
		
		var left = mouse.left - this.canvas_offset_left;
		var top = mouse.top - this.canvas_offset_top;
		var row = Math.ceil( top / (pointers.size + pointers.padding_y) );
		
		if((pointers.translate_modulo) && (row % 2 != 0)){
			var column = Math.ceil( (left + (pointers.size/2))/ (pointers.size + pointers.padding_x) ) - 1;
		}
		else{
			var column = Math.ceil( left/ (pointers.size + pointers.padding_x) );
		}

		try{
			var category_num = pointers.pointers[row-1][column-1] 
			var category_name = categories.category[category_num][0]
		}
		catch(e){
			return 'null';
		}
		
		if( category_name == 'pusty'){
			return 'null';
		}
		else{
			return category_name;		
		}

	}

}

$('#canvas_wrapper').mouseleave(function(){ $("#canvas_cloud").fadeOut(200); });
$('#canvas_wrapper').mousemove(function(){ cloud.update_text( on_category.get_name() ); });
$("#canvas_cloud").mousemove(function(){ cloud.set_position(); });
palets = {
  val_max : null,
  val_min : null,
  val_interval : null,   
  palets_active : 0,
  //value : -1,
  //category : -1,

  //podstawowe palety kolorów ( ostatnia paleta jest naszą własną do zdefiniowania )
  color_arr : [
    ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b'],
    ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b'],
    ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'],
    ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000'],
    ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858'],
    ['#fff7fb','#ece2f0','#d0d1e6','#a6bddb','#67a9cf','#3690c0','#02818a','#016c59','#014636'],
    ['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#980043','#67001f'],
    ['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a'],
    ['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529'],
    ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'],
    ['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506'],
    ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'],
    ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
    ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'],
    ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'],
    ['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704'],
    ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'],
    ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'],
    ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']
  ],

  show : function(){
    this.show_color();
    this.show_palets();
    this.show_select();
    //layers.data.color_active[layers.active] = layers.colors_active[layers.active];
  },

  show_select : function(){

    //wyświetlamy panel do wyboru kolumny kategorii
    add_html = '<option col="-1">wybierz kolumnę</option>';
    for(var i = 0, i_max = excel.data[0].length;  i < i_max; i++){
      if(i == layers.category[layers.active]){
        add_html += '<option col="'+i+'" selected>' +excel.data[0][i]+ '</option>';  
      }
      else{
        add_html += '<option col="'+i+'">' +excel.data[0][i]+ '</option>';  
      }
    }
    $('#excel_box .category').html( add_html );

    //wyświetlamy panel do wyboru kolumny wartości
    add_html = '<option col="-1">wybierz kolumnę</option>';
    for(var i = 0, i_max = excel.data[0].length;  i < i_max; i++){
      if(i == layers.value[layers.active]){
        add_html += '<option col="'+i+'" selected>' +excel.data[0][i]+ '</option>';  
      }
      else{
        add_html += '<option col="'+i+'">' +excel.data[0][i]+ '</option>';  
      }
    }
    $('#excel_box .value').html( add_html );

    //kolorujemy odpowiednio excela
    $('#excel_wrapper .td').removeClass("value");
    $('#excel_wrapper .td').removeClass("category");
    
    if( layers.value[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
    }

    if( layers.category[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    }
  },

  set_category : function(obj){
    layers.category[layers.active] = parseFloat($("#excel_box select.category option:selected").attr('col'));
    $('#excel_wrapper .td').removeClass("category");
    $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    categories.color_from_excel();
  }, 

  set_value : function(obj){

    var value_tmp = parseFloat($("#excel_box select.value option:selected").attr('col'));

    if($.isNumeric( excel.data[1][value_tmp] )){
      layers.value[layers.active] = value_tmp;
    }
    else{
      alert('wybrana kolumna nie zawiera liczb')
    }
  
    $('#excel_wrapper .td').removeClass("value");
    $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
  
    var tmp_value = layers.value[layers.active];
    
    //wyszukujemy najmniejsza i największą wartość w kolumnie wartości
    if( layers.value[tmp_value] != -1 ){
      
      var tmp_min = excel.data[1][tmp_value]
      var tmp_max = excel.data[1][tmp_value];
      for(var i = 1, i_max = excel.data.length; i < i_max; i++){
        if(tmp_min > excel.data[i][tmp_value]) tmp_min = excel.data[i][tmp_value];
        if(tmp_max < excel.data[i][tmp_value]) tmp_max = excel.data[i][tmp_value];
      }
      console.log("min max value: ",tmp_min, tmp_max);
    }

    layers.min_value[layers.active] = tmp_min
    layers.max_value[layers.active] = tmp_max;
    categories.color_from_excel();
  },

  show_color : function(){
    //wyświetlamy pierwszalistę kolorów
    var html = '';

    for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){
      
      if(layers.colors_pos[layers.active][i] == 1){
        html += '<span class="active" style="background:'+this.color_arr[layers.palets_active[layers.active]][i]+'"></span>';
      }
      else{
        html += '<span style="background:'+this.color_arr[layers.palets_active[layers.active]][i]+'"></span>';
      }
    }

    $('#palets #select').html( html );
    
    $('#palets #select > span').click(function(){ palets.select_color(this); });

  },

  show_palets : function(){
    
    //wyswietlamy wszystkie palety
    var html = '';
    for (var i = 0, i_max = this.color_arr.length;i < i_max; i++){
      
      if(i == layers.palets_active[layers.active]){
        html += '<span class="active">';
      }
      else{
        html += '<span>';
      }

      for (var j = 0, j_max = this.color_arr[0].length; j < j_max; j++){
        html += '<span style="background:' + this.color_arr[i][j] + '"></span>';
      }
      html += '</span>';

    }
    $('#palets #all').html( html );
    $('#palets #all > span').click(function(){ palets.select_palets(this);});
 
  },

  //zaznaczamy konkretne kolory do wyświetlenia
  select_color : function(obj){
    if( $(obj).hasClass('active') ){
      layers.colors_pos[layers.active][$(obj).index()] = 0;
      $(obj).removeClass('active');
    }
    else{
      layers.colors_pos[layers.active][$(obj).index()] = 1;
      $(obj).addClass('active');
    }
    this.parse_color();

  },

  parse_color : function(){
    layers.colors_active[layers.active] = [];
     for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){

      if( $('#palets #select span').eq(i).hasClass('active') ){
        layers.colors_active[layers.active].push( rgb2hex($('#palets #select span').eq(i).css('background-color')) );
      }
     }
    categories.color_from_excel();
    //funkcja pomocnicza
    function rgb2hex(rgb) {
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      
      function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
  },

  //zaznaczamy palete kolorów
  select_palets : function(obj){
    $('#palets #all > span').removeClass('active');
    $(obj).addClass('active');
    layers.palets_active[layers.active] = $(obj).index();
    
    //aktualizujemy paletę aktywnych kolorów
    layers.colors_active[layers.active] = [];
    for(var i = 0, i_max = layers.colors_pos[layers.active].length; i < i_max; i++){
      if(layers.colors_pos[layers.active][i] == 1){
        layers.colors_active[layers.active].push( palets.color_arr[layers.palets_active[layers.active]][i] );
      }
    }

    this.show_color();
    categories.color_from_excel();
  }
}

//zdarzenia dotyczące palet
$('#excel_box select.category').change(function(){ palets.set_category(this); });
$('#excel_box select.value').change(function(){ palets.set_value(this); });
//menu pointer
var pointers = {
	show_all_point : true,
	padding_x : 1,
	padding_y : 1,
	translate_modulo : false,
	size : 10,
	main_kind : 'square',
	kinds : Array('square','circle','hexagon','hexagon2'),

	pointers : Array(), //pointers.pointers[rzad][kolumna] : kategoria[numer]

	last_column : null,	//kolumna pointera który został ostatnio zmieniony
	last_row : null,	//wiersz pointera który został ostatnio zmieniony


	//rysowanie wszystkich punktów
	draw : function(){
		var width_pointer = this.size + this.padding_x;
		var height_pointer = this.size + this.padding_y;
		var none_color = "rgba(0,0,0,0)"

		if(this.show_all_point) none_color = "rgba(128,128,128,1)";

		for(var row = 0; row < canvas.active_row; row++){
			for(var column = 0; column < canvas.active_column; column++){

				if(this.pointers[row][column] == 0){
					canvas.context.fillStyle = none_color;
					canvas.context.globalAlpha = 0.5;
				}
				else{
					if( (this.pointers[row][column] != menu_top.category) && (menu_top.category != 0) ){
						canvas.context.globalAlpha = 0.2
					}
					else{
						canvas.context.globalAlpha = 1
					}
					try{
						canvas.context.fillStyle = categories.category[ this.pointers[row][column] ][1];
					}
					catch(e){
						console.log('ERROR 39 LINE ! ',this.pointers[row][column],row,column);
					}
				}

				if( (row % 2 == 0) && (pointers.translate_modulo) ){
					window['figures'][this.main_kind]( column*width_pointer + width_pointer/2 , row*height_pointer , this.size);
				}
				else{
					window['figures'][this.main_kind]( column*width_pointer , row*height_pointer , this.size);
				}

			}
		}
	},

	//tworzymy tablice ponterów (jeśli jakiś ponter istnieje zostawiamy go, w przypadku gdy pointera nie ma tworzymy go na nowo)
	create_array : function(){
		canvas.active_row = parseInt( canvas.height_canvas / (pointers.size + pointers.padding_y) );
		canvas.active_column = parseInt( canvas.width_canvas / (pointers.size + pointers.padding_x) );

		if( (this.pointers.length < canvas.active_row) || (this.pointers[0].length < canvas.active_column) )
		{
			for (var row = 0; row < canvas.active_row; row++)
			{
				for (var column = 0; column < canvas.active_column; column++)
				{
					if(this.pointers[row] == undefined) this.pointers[row] = new Array();
					if(this.pointers[row][column] == undefined)	this.pointers[row][column] = 0;
				}
			}
		}
	},

	update_point : function(y,x,y_last,x_last){

		this.pointers[y][x] = parseInt( menu_top.category );

		//wyznaczenie równania prostej
		if( ((y_last != y) || (x_last != x)) && (y_last != null) && (x_last != null) ){
			var a = (y_last - y) / (x_last - x);
			var b = y - a*x;

			if(x_last > x){
				var col_from = x;
				var col_to = x_last;
			}else{
				var col_to = x;
				var col_from = x_last;
			}

			if(y_last > y){
				var row_from = y;
				var row_to = y_last;
			}else{
				var row_to = y;
				var row_from = y_last;
			}

			var row = null;
			for(var col = col_from; col <= col_to; col++)
			{
				row = parseInt( a*col+b );
				if(!$.isNumeric(row)) row = y;
				this.pointers[row][col] = parseInt( menu_top.category );
			}

			var col = null;
			for(var row = row_from; row <= row_to; row++)
			{
				col = parseInt( (row-b)/a );
				if(!$.isNumeric(col)) col = x;
				this.pointers[row][col] = parseInt( menu_top.category );
			}
		}
		else{
			this.pointers[y][x] = parseInt( menu_top.category );
		}
	}
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL2N6eXN6Y3plbmllIGkgcnlzb3dhbmllIHBvIGNhbnZhc2llXG52YXIgY2FudmFzID0ge1xuXHRcblx0c2NhbGUgOiAxMDAsXG5cdHdpZHRoX2NhbnZhcyA6IDcwMCxcblx0aGVpZ2h0X2NhbnZhcyA6IDQwMCxcblx0Y2FudmFzIDogbnVsbCxcblx0Y29udGV4dCA6IG51bGwsXG5cdHRodW1ibmFpbCA6IG51bGwsXG5cdHRpdGxlX3Byb2plY3QgOiAnbm93eSBwcm9qZWt0JyxcblxuXHRjb250ZXh0X3ggOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF95IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB5XG5cdGNvbnRleHRfbmV3X3ggOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfbmV3X3kgOiAwLCAvL25vd2EgcG96eWNqYSBjb250ZXh0dSB5XG5cblx0b2Zmc2V0X2xlZnQgOiBudWxsLFxuXHRvZmZzZXRfdG9wIDogbnVsbCxcblx0YWN0aXZlX3JvdyA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cdGFjdGl2ZV9jb2x1bW4gOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXG5cdHRodW1ibmFpbCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbl9jYW52YXNcIik7XG5cdFx0dmFyIGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG5cdFx0Y29uc29sZS5sb2coZGF0YVVSTCk7XG5cdH0sXG5cblx0Ly9yeXN1amVteSBjYW52YXMgemUgemRqxJljaWVtXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGlmIChpbWFnZS5vYmogIT09IHVuZGVmaW5lZCkgIGltYWdlLmRyYXcoKTtcblx0fSxcblxuXHRkcmF3X3RodW1uYWlsIDogZnVuY3Rpb24oKXtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy50aHVtYm5haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWJuYWlsX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuXHRcdGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdH0sXG5cblx0Ly9yZXNldHVqZW15IHTFgm8gemRqxJljaWFcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXHR9LFxuXG5cdC8vIGN6ecWbY2lteSBjYcWCZSB6ZGrEmWNpZSBuYSBjYW52YXNpZVxuXHRjbGVhciA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LmNsZWFyUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0XHQvL3RoaXMuY29udGV4dC5maWxsUmVjdCAoIDAsIDAsIHRoaXMud2lkdGhfY2FudmFzLCB0aGlzLmhlaWdodF9jYW52YXMgKTtcblx0fSxcblxuXHRyZXNpemVfd2lkdGggOiBmdW5jdGlvbihuZXdfd2lkdGgpe1xuXHRcdHRoaXMud2lkdGhfY2FudmFzID0gbmV3X3dpZHRoO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyx0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IHRoaXMud2lkdGhfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwodGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlICsgJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0fSxcblxuXHRyZXNpemVfaGVpZ2h0IDogZnVuY3Rpb24obmV3X2hlaWdodCl7XG5cdFx0dGhpcy5oZWlnaHRfY2FudmFzID0gbmV3X2hlaWdodDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3MoeydoZWlnaHQnOiB0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwodGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSsnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpOyAvLyBha3R1YWxpenVqZW15IGRhbmUgb2Rub8WbbmllIHJvem1pYXLDs3cgY2FudmFzYSB3IG1lbnUgdSBnw7NyeVxuXHRcdC8vdGhpcy5kcmF3KCk7IC8vcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0fSxcblxuXHRzZXRfZGVmYXVsdCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19ib3ggI3JpZ2h0X3Jlc2l6ZSwgI2NhbnZhc19ib3ggI2JvdHRvbV9yZXNpemUnKS5mYWRlSW4oNTAwKTtcblx0XHRpZih0aGlzLm1vdmVfaW1hZ2UpICQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5mYWRlSW4oMCk7XG5cblx0XHRjYW52YXMuc2NhbGUgPSAxMDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IDA7XG5cdFx0Y2FudmFzLmNvbnRleHQuc2NhbGUoIGNhbnZhcy5zY2FsZSAvIDEwMCAsIGNhbnZhcy5zY2FsZSAvIDEwMCApO1xuXG5cdFx0dmFyIG5ld193aWR0aCA9IGNhbnZhcy53aWR0aF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0dmFyIG5ld19oZWlnaHQgPSBjYW52YXMuaGVpZ2h0X2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCcgOiBuZXdfaGVpZ2h0ICsgJ3B4J30pO1xuXG5cdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0Y2FudmFzLmNvbnRleHQudHJhbnNsYXRlKCAoIGNhbnZhcy5jb250ZXh0X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3Qga2F0ZWdvcmlpIGRvZGFuaWUgLyBha3R1YWxpemFjamEgLyB1c3VuacSZY2llIC8gcG9rYXphbmllIGthdGVnb3JpaVxudmFyIGNhdGVnb3JpZXMgPSB7XG5cdGNhdGVnb3J5IDogbmV3IEFycmF5KFsncHVzdHknLCcjODA4MDgwJ10pLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWUgPSBBcnJheSgkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoKSwnI2ZmMDAwMCcpO1xuXHRcdCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgnJyk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2gobmFtZSk7XG5cdFx0bWVudV90b3AuY2F0ZWdvcnkgPSAodGhpcy5jYXRlZ29yeS5sZW5ndGgtMSk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbihpbmRleCxuYW1lKXtcblx0XHR0aGlzLmNhdGVnb3J5W2luZGV4XVswXSA9IG5hbWU7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblx0fSxcblxuXHQvL3BvIHd5YnJhbml1IG9kcG93aWVkbmllaiBrb2x1bW55IGthdGVyb2dpaSBpIHdhcnRvxZtjaSBha3R1YWxpenVqZW15IGtvbG9yIGthdGVnb3JpaSBuYSBwb2RzdGF3aWUgZXhjZWxhXG5cdGNvbG9yX2Zyb21fZXhjZWwgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9tb8W8bGl3YSBha3R1YWxpemFjamEgamVkeW5pZSB3IHByenlwYWRrdSB3eWJyYW5pYSBrb25rcmV0bmVqIGtvbHVtbnkgd2FydG/Fm2NpIGkga2F0ZWdvcmlpIHcgZXhjZWx1XG5cdFx0aWYoKGNydWQubWFwX2pzb24ubGVuZ3RoID4gMCkgJiYgKGV4Y2VsLmRhdGEubGVuZ3RoID4gMCkgJiYgKGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSkgJiYgKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSkpe1xuXG5cdFx0XHQvL3VzdGFsYW15IGNvIGlsZSB6bWllbmlhbXkga29sb3IgbmEga29sZWpueSBcblx0XHRcdHZhciBjb2xvcl9jb3VudCA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLmxlbmd0aCAtIDEgLy9pbG9zYyBrb2xvcsOzd1xuXHRcdFx0dmFyIGRpZmZyZW50ID0gTWF0aC5hYnMoIGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gLSBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdICkgLyBjb2xvcl9jb3VudDtcblxuXG5cdFx0XHQvL2R3aWUgcMSZdGxlIG9kcG93aWVkemlhbG5lIHphIHBvcsOzd255d2FuaWUga2F0ZWdvcmlpIHogZXhjZWxhIHoga2F0ZXJvZ2lhbWkga3TDs3JlIG1hbXkgdyBiYXppZSBkYW55Y2hcblx0XHRcdGZvciAodmFyIGkgPSAxLCBpX21heCA9IHRoaXMuY2F0ZWdvcnkubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdGZvciAodmFyIGlfZXggPSAwLCBpX2V4X21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX2V4IDwgaV9leF9tYXg7IGlfZXgrKyl7XG5cdFx0XHRcdFx0XG5cblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdjb21wYXRlIGNhdGVnb3J5OiAnLGksaV9leCwgdGhpcy5jYXRlZ29yeVtpXVswXSwgZXhjZWwuZGF0YVtpX2V4XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKTtcblxuXHRcdFx0XHRcdGlmKCB0aGlzLmNhdGVnb3J5W2ldWzBdID09IGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSl7XG5cdFx0XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygnY2F0ZWdvcnl0JyxpX2V4LCB0aGlzLmNhdGVnb3J5W2ldWzBdLGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR2YXIgY29sb3JfaSA9IE1hdGguZmxvb3IoKHBhcnNlRmxvYXQoZXhjZWwuZGF0YVtpX2V4XVtsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV1dKS1wYXJzZUZsb2F0KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pKSAvIGRpZmZyZW50KTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coY29sb3JfaSwgKHBhcnNlRmxvYXQoZXhjZWwuZGF0YVtpX2V4XVtsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV1dKS1wYXJzZUZsb2F0KGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0pKSwgZGlmZnJlbnQgKTtcblx0XHRcdFx0XHRcdHRoaXMuY2F0ZWdvcnlbaV1bMV0gPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVtjb2xvcl9pXTtcblx0XHRcdFx0XHRcdC8vcHJ6ZXJ5d2FteSBwxJl0bMSZICh0YWsgYWJ5IG5pZSB0cnplYmEgYnnFgm8gbmllcG90cnplYm5pZSBzcHJhd2R6YcSHIGRvZGF0a293eWNoIHJla29yZMOzdyB3IHd5YnJhbmVqIGthdGVnb3JpaSlcblx0XHRcdFx0XHRcdGlfZXggPSBpX2V4X21heDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vcG8gemFrdHVhbGl6b3dhbml1IGtvbG9yw7N3IHcga2F0ZWdvcmlhY2ggcnlzdWplbXkgbmEgbm93byBjYW52YXNcblx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRsZWdlbmRzLnVwZGF0ZSgpO1xuXHRcdH1cblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbihpZCl7XG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuZWFjaCh0aGlzLmNhdGVnb3J5LGZ1bmN0aW9uKGluZGV4LHZhbHVlKXtcblx0XHRcdGlmKGluZGV4ID49IGlkKXtcblx0XHRcdFx0dGguY2F0ZWdvcnlbaW5kZXhdID0gdGguY2F0ZWdvcnlbaW5kZXgrMV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IHBvaW50ZXJzLnBvaW50ZXJzLmxlbmd0aDsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBwb2ludGVycy5wb2ludGVyc1tyb3ddLmxlbmd0aDsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA+IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSBwYXJzZUludChwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0pIC0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jYXRlZ29yeS5wb3AoKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXG5cdFx0Ly9yeXN1amVteSBuYSBub3fEhSBjYW52YXNcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHNob3dfbGlzdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgYWRkX2NhdGVnb3J5ID0gXCI8dGFibGU+XCI7XG5cdFx0Ly92YXIgYWRkX3NlbGVjdCA9JzxvcHRpb24gbmFtZT1cIjBcIj5wdXN0eTwvb3B0aW9uPic7XG5cdFx0dmFyIGFkZF9zZWxlY3QgPSAnJztcblxuXHRcdGZvcih2YXIgaSA9IHRoaXMuY2F0ZWdvcnkubGVuZ3RoOyBpID4gMTsgaS0tKXtcblx0XHRcdGFkZF9jYXRlZ29yeSArPSAnPHRyPjx0ZD48c3Bhbj4nKyhpLTEpKyc8L3NwYW4+PC90ZD48dGQ+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImNhdGVnb3J5X25hbWVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiIHZhbHVlPVwiJyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnXCIgLz48L3RkPjx0ZD48ZGl2IGNsYXNzPVwiY29sb3JwaWNrZXJfYm94XCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMV0rJ1wiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+PC9kaXY+PC90ZD48dGQ+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCI+dXN1bjwvYnV0dG9uPjwvdGQ+PC90cj4nO1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiJysoaS0xKSsnXCI+Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cdFx0aWYobWVudV90b3AuY2F0ZWdvcnkgPT0gMCl7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIHNlbGVjdGVkIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cblxuXHRcdGFkZF9jYXRlZ29yeSArPSBcIjwvdGFibGU+XCI7XG5cblx0XHQkKCcjY2F0ZWdvcnlfYm94ICNsaXN0JykuaHRtbChhZGRfY2F0ZWdvcnkpO1xuXHRcdCQoJ3NlbGVjdCNjaGFuZ2VfY2F0ZWdvcnknKS5odG1sKGFkZF9zZWxlY3QpO1xuXG5cdFx0Y29sb3JwaWNrZXIuYWRkKCk7XG5cdH1cbn1cbiIsImNsb3VkID0ge1xuXG5cdHNldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2Nsb3VkIHRleHRhcmVhJykudmFsKCBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gKTtcblx0fSxcblxuXHRnZXRfdGV4dGFyZWEgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIHRleHRfdG1wID0gJChvYmopLnZhbCgpO1xuXG5cdFx0bGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdID0gdGV4dF90bXA7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHR0ZXh0X3RtcCA9IHRleHRfdG1wLnJlcGxhY2UoJyQnK2V4Y2VsLmRhdGFbMF1baV0sJ1wiK2V4Y2VsLmRhdGFbdG1wX3Jvd11bJytpKyddXCIrJyk7XG5cdFx0fVxuXG5cdFx0bGF5ZXJzLmNsb3VkX3BhcnNlcltsYXllcnMuYWN0aXZlXSA9ICdcIicrdGV4dF90bXArJ1wiJztcblx0fSxcblxuXHQvL3VzdGF3aWFteSBwb3ByYXduxIUgcG96eWNqxJkgZHlta2Fcblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfdG9wO1xuXG5cdFx0JChcIiNjYW52YXNfY2xvdWRcIikuY3NzKHt0b3A6cGFyc2VJbnQodG9wIC0gJChcIiNjYW52YXNfY2xvdWRcIikuaGVpZ2h0KCktMzApKydweCcsbGVmdDpsZWZ0KydweCd9KTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgd3nFm3dpZXRsZW5pZSBkeW1rYSB6IG9kcG93aWVkbmnEhSB6YXdhcnRvxZtjacSFXG5cdHVwZGF0ZV90ZXh0IDogZnVuY3Rpb24obmFtZSl7XG5cblx0XHRpZihuYW1lICE9IFwibnVsbFwiKXtcblxuXHRcdFx0dmFyIHRtcF9yb3cgPSBudWxsO1xuXHRcdFx0dmFyIGZpbmQgPSAwO1xuXHRcdFx0Zm9yKCB2YXIgaV9yb3cgPSAwLCBpX3Jvd19tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9yb3cgPCBpX3Jvd19tYXg7IGlfcm93KysgKXtcblx0XHRcdFx0aWYobmFtZSA9PSBleGNlbC5kYXRhW2lfcm93XVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR0aGlzLnNldF9wb3NpdGlvbigpO1xuXHRcdFx0XHRcdHZhciB0ZXh0X3RtcCA9IGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXTtcblxuXHRcdFx0XHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgnJCcrZXhjZWwuZGF0YVswXVtpXSxleGNlbC5kYXRhW2lfcm93XVtpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vZG9waWVybyBqZcWbbGkgZHltZWsgbWEgbWllxIcgamFrYcWbIGtvbmtyZXRuxIUgemF3YXJ0b8WbxIcgd3nFm3dpZXRsYW15IGdvXG5cdFx0XHRcdFx0aWYodGV4dF90bXAhPVwiXCIpe1xuXHRcdFx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZUluKDIwMCk7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5odG1sKHRleHRfdG1wKTtcblx0XHRcdFx0XHRcdGZpbmQgPSAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2plxZtsaSBuaWUgem5hbGV6aW9ubyBvZHBvd2llZG5pZWoga2F0ZWdvcmlpXG5cdFx0XHRpZiAoIWZpbmQpIHsgXG5cdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTtcblx0XHRcdH1cblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgyMDApO1xuXHRcdH1cblx0fVxuXG59XG5cblxuJCgnI2Nsb3VkIHRleHRhcmVhJykua2V5dXAoZnVuY3Rpb24oKXtcblxuY2xvdWQuZ2V0X3RleHRhcmVhKHRoaXMpO1xuXG59KSA7IiwiLy9zYW1hIG5hendhIHdpZWxlIHTFgnVtYWN6eSBwbyBwcm9zdHUgY29sb3JwaWNrZXJcbnZhciBjb2xvcnBpY2tlciA9IHtcblxuXHRjbGlja19pZCA6IG51bGwsXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLnJlbW92ZSgpO1xuXHRcdCQoJy5jb2xvcnBpY2tlcl9ib3gnKS5Db2xvclBpY2tlcih7XG5cdFx0XHRjb2xvcjogJyNmZjAwMDAnLFxuXHRcdFx0b25TaG93OiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdGlmKCQoY29scGtyKS5jc3MoJ2Rpc3BsYXknKT09J25vbmUnKXtcblx0XHRcdFx0XHQkKGNvbHBrcikuZmFkZUluKDIwMCk7XG5cdFx0XHRcdFx0Y29sb3JwaWNrZXIuY2xpY2tfaWQgPSAkKHRoaXMpLmF0dHIoJ2lkX2NhdGVnb3J5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uSGlkZTogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHQkKGNvbHBrcikuZmFkZU91dCgyMDApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25DaGFuZ2U6IGZ1bmN0aW9uIChoc2IsIGhleCwgcmdiKSB7XG5cdFx0XHRcdCQoJy5jb2xvcnBpY2tlcl9ib3hbaWRfY2F0ZWdvcnk9XCInK2NvbG9ycGlja2VyLmNsaWNrX2lkKydcIl0nKS5jc3MoJ2JhY2tncm91bmRDb2xvcicsICcjJyArIGhleCk7XG5cdFx0XHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnlbY29sb3JwaWNrZXIuY2xpY2tfaWRdWzFdID0gJyMnICsgaGV4O1xuXHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnLmNvbG9ycGlja2VyJykucmVtb3ZlKCk7XG5cdH1cbn1cbiIsIi8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB0d29yemVuaWUgemFwaXN5d2FuaWUgaSBha3R1YWxpemFjamUgZGFueWNoIGRvdHljesSFxIdjeWggbWFweVxudmFyIGNydWQgPSB7XG5cblx0bWFwX2pzb24gOiBBcnJheSgpLCAvL2fFgsOzd25hIHptaWVubmEgcHJ6ZWNob3d1asSFY2Egd3N6eXN0a2llIGRhbmVcblx0bWFwX2hhc2ggOiBudWxsLFxuXG5cdHNlbGVjdF9tYXAgOiBmdW5jdGlvbiggaWRfbWFwICl7XG5cblx0XHQvL2plxZtsaSB1cnVjaG9taW15XG5cdFx0aWYgKGlkX21hcCA9PSAnbmV3X21hcCcpIHsgXG5cdFx0XHR0aGlzLmNyZWF0ZV9tYXAoKSBcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMubWFwX2hhc2ggPSBpZF9tYXA7XG5cdFx0XHR0aGlzLmdldF9tYXAoKTtcblx0XHR9XG5cblx0fSxcblxuXHQvL3BvYmllcmFteSBkYW5lIHogcG9yb2pla3R1IGkgemFwaXN1amVteSBqZSBkbyBqc29uLWFcblx0Z2V0X2RhdGEgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBkb3R5Y3rEhWNlIG1hcHkgKGNhbnZhc2EpXG5cblx0XHQvL3plcnVqZW15IG5hIG5vd28gY2HFgsSFIHRhYmxpY8SZIHBvaW50ZXLDs3dcblx0XHR0aGlzLm1hcF9qc29uID0gQXJyYXkoKTtcblxuXHRcdC8vIGRhdGFbeF0gPSB6bWllbm5lIHBvZHN0YXdvd2UgZG90eWN6xIVjZSBtYXB5XG5cdFx0dGhpcy5tYXBfanNvblswXSA9IEFycmF5KCk7XG5cdFx0dGhpcy5tYXBfanNvblswXVswXSA9IGNhbnZhcy5oZWlnaHRfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMV0gPSBjYW52YXMud2lkdGhfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMl0gPSBwb2ludGVycy5wYWRkaW5nX3g7XG5cdFx0dGhpcy5tYXBfanNvblswXVszXSA9IHBvaW50ZXJzLnBhZGRpbmdfeTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzRdID0gcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzVdID0gcG9pbnRlcnMuc2l6ZV9wb2ludGVyO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNl0gPSBwb2ludGVycy5tYWluX2tpbmQ7XG5cdFx0dGhpcy5tYXBfanNvblswXVs3XSA9IGNhbnZhcy50aXRsZV9wcm9qZWN0O1xuXG5cdFx0Ly8gZGF0YVsxXSA9IHRhYmxpY2EgcHVua3TDs3cgKHBvaW50ZXJzLnBvaW50ZXJzKSBbd2llcnN6XVtrb2x1bW5hXSA9IFwibm9uZVwiIHx8IChudW1lciBrYXRlZ29yaWkpXG5cdFx0dGhpcy5tYXBfanNvblsxXSA9IHBvaW50ZXJzLnBvaW50ZXJzO1xuXG5cdFx0Ly8gZGF0YVsyXSA9IHRhYmxpY2Ega2F0ZWdvcmlpXG5cdFx0dGhpcy5tYXBfanNvblsyXSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnk7XG5cblx0XHQvL2RhdGFbM10gPSB0YWJsaWNhIHd6b3JjYSAoemRqxJljaWEgdyB0bGUgZG8gb2RyeXNvd2FuaWEpXG5cdFx0dGhpcy5tYXBfanNvblszXSA9IEFycmF5KCk7XG5cblx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVswXSA9IGltYWdlLm9iai5zcmM7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzFdID0gaW1hZ2UueDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMl0gPSBpbWFnZS55O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVszXSA9IGltYWdlLndpZHRoO1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs0XSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bNV0gPSBpbWFnZS5hbHBoYTtcblx0XHR9XG5cblx0XHQvL3BvYmllcmFteSBkYW5lIGRvdHljesSFY2UgcHJvamVrdMOzdyAobGF5ZXJzKVxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IHdhcnN0d3kgemF3aWVyYWrEhWN5IHdzenlzdGtpZSBkYW5lIGRvdHljesSFY2UgcHJvamVrdHVcblx0XHR0aGlzLmxheWVycyA9IHt9O1xuXHRcdHRoaXMubGF5ZXJzLnBhbGV0c19hY3RpdmUgPSBsYXllcnMucGFsZXRzX2FjdGl2ZTtcblx0XHR0aGlzLmxheWVycy5jYXRlZ29yeSA9IGxheWVycy5jYXRlZ29yeTtcblx0XHR0aGlzLmxheWVycy52YWx1ZSA9IGxheWVycy52YWx1ZTtcblx0XHR0aGlzLmxheWVycy5jb2xvcnNfcG9zID0gbGF5ZXJzLmNvbG9yc19wb3M7XG5cdFx0dGhpcy5sYXllcnMuY29sb3JzX2FjdGl2ZSA9IGxheWVycy5jb2xvcnNfYWN0aXZlO1xuXHRcdHRoaXMubGF5ZXJzLm1pbl92YWxpZSA9IGxheWVycy5taW5fdmFsaWU7XG5cdFx0dGhpcy5sYXllcnMubWF4X3ZhbHVlID0gbGF5ZXJzLm1heF92YWx1ZTtcblx0XHR0aGlzLmxheWVycy5jbG91ZCA9IGxheWVycy5jbG91ZDtcblx0XHR0aGlzLmxheWVycy5jbG91ZF9wYXJzZXIgPSBsYXllcnMuY2xvdWRfcGFyc2VyO1xuXHRcdHRoaXMubGF5ZXJzLmxlZ2VuZHMgPSBsYXllcnMubGVnZW5kcztcblxuXHRcdC8vdHdvcnp5bXkgb2JpZWt0IGV4Y2VsYVxuXG5cdFx0dGhpcy5leGNlbCA9IGV4Y2VsLmRhdGE7XG5cblxuXHRcdC8va29ud2VydHVqZW15IG5hc3phIHRhYmxpY2UgbmEganNvblxuXHRcdHRoaXMubWFwX2pzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1hcF9qc29uKTtcblx0XHR0aGlzLmxheWVycyA9IEpTT04uc3RyaW5naWZ5KHRoaXMubGF5ZXJzKTtcblx0XHR0aGlzLmV4Y2VsID0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGNlbCk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBtYXB5IHogYmF6eSBkYW55Y2hcblx0Z2V0X21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdCAgdXJsOiAnL2FwaS9tYXBzLycgKyB0aC5tYXBfaGFzaCxcblx0XHQgIFx0dHlwZTogXCJHRVRcIixcblx0XHQgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0XHR9KS5kb25lKGZ1bmN0aW9uKCBkYXRhICkge1xuXG5cdFx0XHRjb25zb2xlLmxvZyggZGF0YS5kYXRhWzBdICk7XG5cblx0XHRcdC8vcG8gemFwaXNhbml1IGRhbnljaCBkbyBiYXp5IGFrdHVhbGl6dWplbXkgaWQgKHcgcHJ6eXBhZGt1IGplxZtsaSBpc3RuaWVqZSBuYWRwaXN1amVteSBqZSlcblx0XHRcdHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YS5kYXRhWzBdLm1hcF9qc29uKTtcblx0XHRcdHRoLm1hcF9qc29uID0gcmVzcG9uc2U7XG5cblx0XHRcdC8vcG9iaWVyYW15IGkgd2N6eXR1amVteSBkYW5lIG8gY2FudmFzaWUgZG8gb2JpZWt0dVxuXHRcdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSByZXNwb25zZVswXVswXTtcblx0XHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSByZXNwb25zZVswXVsxXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeCA9IHJlc3BvbnNlWzBdWzJdO1xuXHRcdFx0cG9pbnRlcnMucGFkZGluZ195ID0gcmVzcG9uc2VbMF1bM107XG5cdFx0XHRwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvID0gcmVzcG9uc2VbMF1bNF07XG5cdFx0XHRwb2ludGVycy5zaXplX3BvaW50ZXIgPSByZXNwb25zZVswXVs1XTtcblx0XHRcdHBvaW50ZXJzLm1haW5fa2luZCA9IHJlc3BvbnNlWzBdWzZdO1xuXHRcdFx0Y2FudmFzLnRpdGxlX3Byb2plY3QgPSByZXNwb25zZVswXVs3XTtcblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3hcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzJdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInBhZGRpbmdfeVwiXScpLnZhbCggcmVzcG9uc2VbMF1bM10gKTtcblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwic2l6ZV9wb2ludGVyXCJdJykudmFsKCByZXNwb25zZVswXVs1XSApO1xuXHRcdFx0JCgnaW5wdXRbbmFtZT1cInRpdGxlX3Byb2plY3RcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzddICk7XG5cblx0XHRcdGlmKCByZXNwb25zZVswXVs0XSApe1xuXHRcdFx0XHQkKCcjcG9pbnRlcl9ib3ggZGl2W25hbWU9XCJ0cmFuc2xhdGVfbW9kdWxvXCJdJykucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdH1cblxuXHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuaHRtbCgnJyk7XG5cblx0XHRcdHBvaW50ZXJzLmtpbmRzLmZvckVhY2goZnVuY3Rpb24oa2luZCl7XG5cblx0XHRcdFx0aWYoa2luZCA9PSByZXNwb25zZVswXVs2XSl7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIHNlbGVjdGVkPVwic2VsZWN0ZWRcIiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IHNlbGVjdFtuYW1lPVwibWFpbl9raW5kXCJdJykuYXBwZW5kKCc8b3B0aW9uIG5hbWU9XCInK2tpbmQrJ1wiPicra2luZCsnPC9vcHRpb24+Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHRcdC8vcG9iaWVyYW15IGRhbmUgbyBwb2ludGVyYWNoXG5cdFx0XHRwb2ludGVycy5wb2ludGVycyA9IHJlc3BvbnNlWzFdO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8ga2F0ZWdvcmlhY2hcblx0XHRcdGNhdGVnb3JpZXMuY2F0ZWdvcnkgPSByZXNwb25zZVsyXTtcblxuXHRcdFx0Ly9wb2JpZXJhbmllIGRhbnljaCBvIHpkasSZY2l1IGplxbxlbGkgaXN0bmllamVcblx0XHRcdGlmKCByZXNwb25zZVszXS5sZW5ndGggPiAyKXtcblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdGltYWdlLm9iai5zcmMgPSByZXNwb25zZVszXVswXTtcblx0XHRcdFx0aW1hZ2UueCA9IHBhcnNlSW50KCByZXNwb25zZVszXVsxXSApO1xuXHRcdFx0XHRpbWFnZS55ID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzJdICk7XG5cdFx0XHRcdGltYWdlLndpZHRoID0gcGFyc2VJbnQoIHJlc3BvbnNlWzNdWzNdICk7XG5cdFx0XHRcdGltYWdlLmhlaWdodCA9IHBhcnNlSW50KCByZXNwb25zZVszXVs0XSApO1xuXHRcdFx0XHRpbWFnZS5hbHBoYSA9IHBhcnNlSW50KCByZXNwb25zZVszXVs1XSApO1xuXG5cdFx0XHRcdC8vemF6bmFjemVuaWUgb2Rwb3dpZWRuaWVnbyBzZWxlY3RhIGFscGhhIHcgbWVudSB0b3Bcblx0XHRcdFx0JCgnI2FscGhhX2ltYWdlIG9wdGlvbltuYW1lPVwiJytcdGltYWdlLmFscGhhICsnXCJdJykuYXR0cignc2VsZWN0ZWQnLHRydWUpO1xuXG5cdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvL3pha3R1YWxpem93YW5pZSBkYW55Y2ggdyBpbnB1dGFjaFxuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLCBjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JywgY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG5cdFx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOmNhbnZhcy53aWR0aF9jYW52YXMrJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnfSk7XG5cblx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRjYXRlZ29yaWVzLnNob3dfbGlzdCgpO1xuXHRcdFx0Y2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0Ly90d29yenlteSBub3fEhSBtYXDEmSBkYW55Y2hcblx0Y3JlYXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMuZ2V0X2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXHRcdGNvbnNvbGUubG9nKCdjcmVhdGUnLHRoLm1hcF9qc29uKTtcblxuXHRcdC8vd3lzeXPFgmFteSBkYW5lIGFqYXhlbSBkbyBiYXp5IGRhbnljaFxuXHRcdC8vY2FudmFzLmRyYXdfdGh1bW5haWwoKTtcblx0XHQvL25ld19pbWFnZSA9IGltYWdlLmRhdGFVUkl0b0Jsb2IoIGNhbnZhcy50aHVtYm5haWwudG9EYXRhVVJMKCkgKTtcblx0XHQvL2NhbnZhcy5kcmF3KCk7XG5cblx0XHQvL3ZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiYWN0aW9uXCIsXHQnY3JlYXRlX21hcCcgKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9uYW1lXCIsIGNhbnZhcy50aXRsZV9wcm9qZWN0KTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9qc29uXCIsIHRoLm1hcF9qc29uKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX21ldGhvZFwiLCAnUE9TVCcpO1xuXHRcdC8vZm9ybURhdGEuYXBwZW5kKFwiX3Rva2VuXCIsIGNzcmZfdG9rZW4pO1xuXHRcdFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bWFwX2pzb246IHRoLm1hcF9qc29uXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9tYXBzXCIsXG5cdFx0XHRkYXRhOiB7IG1hcF9qc29uOiB0aC5tYXBfanNvbiB9LFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHR0aC5tYXBfaGFzaCA9IHJlc3BvbnNlLmhhc2hfbWFwO1xuXHRcdFx0XHRhbGVydCgnemFwaXNhbm8gbm93xIUgbWFwxJknKTtcblx0XHRcdFx0bWVudV90b3AuZ2V0X21hcHMoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdC8vYWt0dWFsaXp1amVteSBtYXDEmVxuXHR1cGRhdGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vYWt0dWFsaXp1amVteSBqc29uYSBkbyB3eXPFgmFuaWEgYWpheGVtXG5cdFx0dGhpcy5nZXRfZGF0YSgpO1xuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL2NhbnZhcy5kcmF3X3RodW1uYWlsKCk7XG5cdFx0Ly9uZXdfaW1hZ2UgPSBpbWFnZS5kYXRhVVJJdG9CbG9iKCBjYW52YXMudGh1bWJuYWlsLnRvRGF0YVVSTCgpICk7XG5cdC8qXG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2hhc2hcIiwgdGgubWFwX2hhc2ggKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfbmFtZVwiLCBjYW52YXMudGl0bGVfcHJvamVjdCk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX2pzb25cIiwgdGgubWFwX2pzb24pO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9pbWFnZVwiLCBuZXdfaW1hZ2UpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl9tZXRob2RcIiwgJ1BVVCcpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIl90b2tlblwiLCBjc3JmX3Rva2VuKTtcblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogYmFzaWNfdXJsICsgXCIvbWFwL1wiK3RoLm1hcF9oYXNoLFxuXHRcdFx0ZGF0YTogZm9ybURhdGEsXG5cdFx0XHRjYWNoZTogZmFsc2UsXG5cdFx0XHRjb250ZW50VHlwZTogZmFsc2UsXG5cdFx0XHRwcm9jZXNzRGF0YTogZmFsc2UsXG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdCovXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9oYXNoOiB0aC5tYXBfaGFzaCxcblx0XHRcdG1hcF9qc29uOiB0aC5tYXBfanNvblxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvbWFwc1wiLFxuXHRcdFx0Ly9kYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHR0eXBlOiAnUFVUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0YWxlcnQoJ3pha3R1YWxpem93YW5vIG1hcMSZJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL3VzdXdhbXkgbWFwxJkgeiBiYXp5IGRhbnljaFxuXHRkZWxldGVfbWFwIDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciB0aCA9IHRoaXM7IC8vem1pZW5uYSBwb21vY25pY3phXG5cblx0XHQvL3NwcmF3ZHphbXkgY3p5IG1hcGEgZG8gdXN1bmnEmWNpYSBwb3NpYWRhIHN3b2plIGlkXG5cdFx0aWYodGhpcy5tYXBfaGFzaCAhPSBudWxsKXtcblx0XHRcdCQucG9zdCggYmFzaWNfdXJsICsgXCIvbWFwL1wiICsgdGgubWFwX2hhc2gsIHtcblx0XHRcdFx0YWN0aW9uOiAnZGVsZXRlX21hcCcsXG5cdFx0XHRcdF9tZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0XHRfdG9rZW46IGNzcmZfdG9rZW4sXG5cdFx0XHRcdG1hcF9oYXNoOiB0aC5tYXBfaGFzaFxuXHRcdFx0fSlcblx0XHRcdC5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdFx0cmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9IFwiT0tcIikge1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGJhc2ljX3VybCArXCIvbWFwXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0YWxlcnQoJ2LFgsSFZCBwb2RjemFzIHVzdXdhbmlhIG1hcHknKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhbGVydCgnYnJhayBoYXNoYSAtIG1hcGEgbmllIGplc3QgemFwaXNhbmEnKTtcblx0XHR9XG5cdH1cbn1cbiIsInZhciBleGNlbCA9IHtcblx0XG5cdGFscGhhIDogWydhJywnYicsJ2MnLCdkJywnZScsJ2YnLCdnJywnaCcsJ2knLCdqJywnaycsJ2wnLCdtJywnbicsJ28nLCdwJywncScsJ3InLCdzJywndCcsJ3UnLCd3JywneCcsJ3knLCd6J10sXG5cdGRhdGEgOiBbW1wid29qZXdvZHp0d29cIixcIndhcnRvc2MxXCIsXCJ3YXJ0b3NjMlwiLFwid2FydG9zYzNcIixcIndhcnRvc2MxXCIsXCJ3YXJ0b3NjMlwiLFwid2FydG9zYzNcIl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDYsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJzcm9kbWllc2NpZVwiLDEuNiw1MCw0M10sW1wibm93YV9odXRhXCIsMiwzNCwzXSxbXCJwb2Rnb3J6ZVwiLDEsMzIsNl0sW1wibm93YV9odXRhMVwiLDIsMzQsM11dLFxuXHRtaW5fcm93IDogMTAsXG5cdG1pbl9jb2wgOiA2LFxuXG5cdGluaXQgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9kb2RhbmllIGV2ZW50w7N3IHByenkga2xpa25pxJljaXUgZXhjZWxhXG5cdFx0JCgnI2V4Y2VsX2JveCBidXR0b24nKS5jbGljayhmdW5jdGlvbigpeyAkKCcjZXhjZWxfYm94IGlucHV0JykuY2xpY2soKTsgfSk7XG5cdFx0JCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNoYW5nZShmdW5jdGlvbigpeyBleGNlbC5zZW5kX2ZpbGUoKTsgfSk7XG5cblx0XHQvL2Z1bmtjamEgdHltY3phc293YSBkbyBuYXJ5c293YW5pYSB0YWJlbGtpIGV4Y2VsYVxuXHRcdHRoaXMuZHJhdygpO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxhIHphIHBvcHJhd25lIHBvZHBpc2FuaWUgb3NpXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXG5cdFx0YWRkX2h0bWwgPSAnJztcblxuXHRcdC8vamXFm2xpIGlsb8WbYyB3aWVyc3p5IGplc3Qgd2nEmWtzemEgYWt0dWFsaXp1amVteSB3aWVsa2/Fm8SHIHRhYmxpY3lcblx0XHRpZihleGNlbC5kYXRhLmxlbmd0aCA+IGV4Y2VsLm1pbl9yb3cpIGV4Y2VsLm1pbl9yb3cgPSBleGNlbC5kYXRhLmxlbmd0aDtcblx0XHRpZihleGNlbC5kYXRhWzBdLmxlbmd0aCA+IGV4Y2VsLm1pbl9jb2wpIGV4Y2VsLm1pbl9jb2wgPSBleGNlbC5kYXRhWzBdLmxlbmd0aDtcblxuXHRcdC8vcmVuZGVydWplbXkgY2HFgsSFIHRhYmxpY8SZIGV4Y2VsXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5taW5fcm93OyBpKyspe1xuXHRcdFx0YWRkX2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0clwiPic7XG5cdFx0XHRmb3IodmFyIGogPSAwO2ogPCB0aGlzLm1pbl9jb2w7IGorKyl7XG5cblx0XHRcdFx0aWYoKGogPT0gMCkgJiYgKGkgPiAwKSl7XG5cdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0ZFwiIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiID4nKyBpICsnPC9kaXY+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGlmKHR5cGVvZihleGNlbC5kYXRhW2ldWyhqLTEpXSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8ZGl2IGNsYXNzPVwidGRcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+JytleGNlbC5kYXRhW2ldWyhqLTEpXSsnPC9kaXY+Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8ZGl2IGNsYXNzPVwidGRcIiAgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+PC9kaXY+Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZXhjZWwuZGF0YVtpXVsoaisxKV0pO1xuXHRcdFx0XHRcdH1jYXRjaChlcnJvcil7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPGRpdiBjbGFzcz1cInRkXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCI+PC9kaXY+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdFx0YWRkX2h0bWwgKz0gJzwvZGl2Pic7XG5cdFx0fVxuXG5cdFx0JCgnI2V4Y2VsX2JveCAudGFibGUnKS5odG1sKCBhZGRfaHRtbCApO1xuXG5cdFx0Ly9kb2RhamVteSBtb8W8bGl3b8WbxIcgZWR5Y2ppIGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlIC50ZCcpLmJsdXIoZnVuY3Rpb24oKXsgZXhjZWwuZWRpdCh0aGlzKTsgfSk7XG5cblx0fSxcblxuXHQvL2Z1bmtjamEgdW1vxbxsaXdpYWrEhWNhIGVkeWNqZSB6YXdhcnRvxZtjaSBrb23Ds3JraVxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKXtcdFxuXHRcdGV4Y2VsLmRhdGFbJChvYmopLmF0dHIoJ3JvdycpXVsoJChvYmopLmF0dHIoJ2NvbCcpLTEpXSA9ICQob2JqKS5odG1sKCk7XG5cdFx0cGFsZXRzLnBhcnNlX2NvbG9yKCk7XG5cdH0sXG5cblx0Ly9wb2JpZXJhbXkgcGxpaywgeiBpbnB1dGEgaSB3ecWCYW15IGRvIGJhY2tlbmR1IHcgY2VsdSBzcGFyc293YW5pYSBhIG5hc3TEmXBuaWUgcHJ6eXBpc3VqZW15IGRvIHRhYmxpY3kgaSB3ecWbd2lldGxhbXl3IGZvcm1pZSB0YWJlbHNraVxuXHRzZW5kX2ZpbGUgOiBmdW5jdGlvbigpIHtcblx0XG5cdFx0dmFyIGV4Y2VsX2Zvcm0gPSBuZXcgRm9ybURhdGEoKTsgXG5cdFx0ZXhjZWxfZm9ybS5hcHBlbmQoXCJleGNlbF9maWxlXCIsICQoXCIjZXhjZWxfYm94IGlucHV0XCIpWzBdLmZpbGVzWzBdKTtcblxuIFx0XHQkLmFqYXgoIHtcbiAgICAgIFxuICAgICAgdXJsOiAnL2FwaS9wcm9qZWN0cy9leGNlbF9wYXJzZScsXG4gICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICBkYXRhOiBleGNlbF9mb3JtLFxuICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgY29udGVudFR5cGU6IGZhbHNlXG5cbiAgICB9KS5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblxuICAgIFx0Ly9wbyB3Y3p5dGFuaXUgcGxpa3UgZXhjZWwgcHJ6eXBpc3VqZW15IGRhbmUgcnlzdWplbXkgbmEgbm93byB0YWJlbMSZIG9yYXogd3nFm3dpZXRsYW15IHdzenlzdGtpZSBwYWxldHkga29sb3LDs3dcblx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApXG4gICAgXHRleGNlbC5kYXRhID0gcmVzcG9uc2UuZXhjZWxbMF0uZGF0YTtcbiAgICBcdGV4Y2VsLmRyYXcoKTtcbiAgICBcdHBhbGV0cy5zaG93X3NlbGVjdCgpO1xuICAgIH0pO1xuXHR9XG59XG5cbmV4Y2VsLmluaXQoKTtcbiIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cblx0fVxufVxuIiwiLy9mdW5rY2plIGdsb2JhbG5lIGtvbnRlbmVyIG5hIHdzenlzdGtvIGkgbmljIDspXG52YXIgZ2xvYmFsID0ge1xuXHR0b29nbGVfcGFuZWwgIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0a2EgZGxhIG1vemlsbGlcblx0XG5cdFx0Ly9zcHJhd2R6YW15IHogamFraW0gcGFuZWxlbSBtYW15IGRvIGN6eW5pZW5pYSAoY3p5IHBva2F6dWrEhWN5bSBzacSZIHogbGV3ZWogY3p5IHogcHJhd2VqIHN0cm9ueSlcblx0XHRpZiggIHBhcnNlSW50KCQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5jc3MoJ2xlZnQnKSkgPiAwICl7XG5cdFx0XHQvL3BhbmVsIGplc3QgeiBwcmF3ZWogc3Ryb255XG5cdFx0XHRpZiggJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygncmlnaHQnKSA9PSAnMHB4JyApe1xuXHRcdFx0XHQkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFstJChldmVudC50YXJnZXQpLnBhcmVudCgpLndpZHRoKCktMjAsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgICAgfVxuXHQgICAgZWxzZXtcblx0ICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogW1wiMHB4XCIsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgICAgfVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0Ly9wYW5lbCBqZXN0IHogbGV3ZWogc3Ryb255XG5cdFx0XHRpZiggJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygnbGVmdCcpID09ICcwcHgnICl7XG5cdFx0XHRcdCQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtsZWZ0OiBbLSQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS53aWR0aCgpLTIwLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0ICAgIGVsc2V7XG5cdCAgICBcdCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7bGVmdDogW1wiMHB4XCIsXCJzd2luZ1wiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuXHQgICAgfVxuXHRcdH1cblxuXHR9XG59XG4iLCIvL2fFgsOzd25lIHpkasSZY2llIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG52YXIgaW1hZ2UgPSB7XG5cdG9iaiA6IHVuZGVmaW5lZCxcblx0eCA6IG51bGwsXG5cdHkgOiBudWxsLFxuXHR3aWR0aCA6IG51bGwsXG5cdGhlaWdodCA6IG51bGwsXG5cdGFscGhhIDogMTAsXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwidmFyIGxheWVycyA9IHtcblxuXHRsaXN0IDogWyd3YXJzdHdhMSddLFxuXHRhY3RpdmUgOiAwLFxuXG5cdC8vdGFibGljYSB6IHBvZHN0YXdvd3l3bWkgZGFueW1pIHphZ3JlZ293YW55bWkgZGxhIGthxbxkZWogd2Fyc3R3eVxuXHRwYWxldHNfYWN0aXZlIDogWzBdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdHZhbHVlIDogWy0xXSxcblx0Y29sb3JzX3BvcyA6IFtbMSwxLDEsMSwxLDEsMSwxLDFdXSxcblx0Y29sb3JzX2FjdGl2ZSA6IFtbXCIjZjdmY2ZkXCIsIFwiI2U1ZjVmOVwiLCBcIiNjY2VjZTZcIiwgXCIjOTlkOGM5XCIsIFwiIzY2YzJhNFwiLCBcIiM0MWFlNzZcIiwgXCIjMjM4YjQ1XCIsIFwiIzAwNmQyY1wiLCBcIiMwMDQ0MWJcIl1dLFxuXHRtaW5fdmFsdWUgOiBbMF0sXG5cdG1heF92YWx1ZSA6IFswXSxcblx0Y2xvdWQgOiBbXCJcIl0sXG5cdGNsb3VkX3BhcnNlciA6IFtcIlwiXSxcblx0bGVnZW5kcyA6IFtbWzIwLFwiI2Y3ZmNmZFwiXSxbNTAsXCIjZTVmNWY5XCJdLFs4MCxcIiNjY2VjZTZcIl0sWzExMCxcIiM5OWQ4YzlcIl0sWzE0MCxcIiM2NmMyYTRcIl0sWzE3MCxcIiM0MWFlNzZcIl0sWzIwMCxcIiMyMzhiNDVcIl0sWzIzMCxcIiMwMDZkMmNcIl0sWzI2MCxcIiMwMDQ0MWJcIl1dXSxcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IHRoaXMubGlzdC5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGlmKGkgPT0gdGhpcy5hY3RpdmUpe1xuXHRcdFx0XHRodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRodG1sICs9ICc8c3Bhbj4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJhZGRcIj4gKyA8L2J1dHRvbj48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCI+IC0gPC9idXR0b24+JztcblxuXHRcdCQoJyNsYXllcnMnKS5odG1sKGh0bWwpO1xuXG5cdFx0JCgnI2xheWVycyAuYWRkJykuY2xpY2soZnVuY3Rpb24oKXtsYXllcnMuYWRkKCk7fSk7XG5cdFx0JCgnI2xheWVycyAucmVtb3ZlJykuY2xpY2soZnVuY3Rpb24oKXtsYXllcnMucmVtb3ZlKCk7fSk7XG5cdFx0XG5cdFx0JCgnI2xheWVycyBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgY29uc29sZS5sb2coJ2NsaWNsJyk7bGF5ZXJzLnNlbGVjdCh0aGlzKTt9KTtcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5kYmxjbGljayhmdW5jdGlvbigpeyBsYXllcnMuZWRpdCh0aGlzKTsgfSk7XG5cdFx0JCgnI2xheWVycyBzcGFuJykuZm9jdXNvdXQoZnVuY3Rpb24oKXsgbGF5ZXJzLmVuZF9lZGl0KHRoaXMpOyB9KTtcblxuXHR9LFxuXG5cdHNlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JCgnI2xheWVycyBzcGFuJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0bGF5ZXJzLmFjdGl2ZSA9ICQob2JqKS5pbmRleCgpO1xuXHRcdHBhbGV0cy5zaG93KCk7XG5cdFx0Y2xvdWQuc2V0X3RleHRhcmVhKCk7XG5cdFx0Y2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG5cdH0sXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblxuXHRcdHRoaXMubGlzdC5wdXNoKCAnd2Fyc3R3YScgKyBwYXJzZUludCh0aGlzLmxpc3QubGVuZ3RoKzEpKTtcblxuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKC0xKTtcblx0XHR0aGlzLnZhbHVlLnB1c2goLTEpO1xuXHRcdHRoaXMucGFsZXRzX2FjdGl2ZS5wdXNoKDApO1xuXHRcdHRoaXMuY29sb3JzX2FjdGl2ZS5wdXNoKFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10pO1xuXHRcdHRoaXMuY29sb3JzX3Bvcy5wdXNoKFsxLDEsMSwxLDEsMSwxLDEsMV0pO1xuXHRcdHRoaXMubWluX3ZhbHVlLnB1c2goMCk7XG5cdFx0dGhpcy5tYXhfdmFsdWUucHVzaCgwKTtcblx0XHR0aGlzLmNsb3VkLnB1c2goXCJcIik7XG5cdFx0dGhpcy5jbG91ZF9wYXJzZXIucHVzaChcIlwiKTtcblx0XHR0aGlzLmxlZ2VuZHMucHVzaChbXSk7XG5cdFx0dGhpcy5zaG93KCk7XG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oKXtcblxuXHRcdGNvbnNvbGUubG9nKFwicmVtb3ZlXCIsdGhpcy5hY3RpdmUsdGhpcy5saXN0Lmxlbmd0aC0xKVxuXG5cdFx0aWYodGhpcy5hY3RpdmUgPT0gKHRoaXMubGlzdC5sZW5ndGgtMSkpe1xuXHRcdFx0dmFyIGlfdG1wID0gdGhpcy5saXN0Lmxlbmd0aC0xO1xuXHRcdFx0dGhpcy5zZWxlY3QoICQoJyNsYXllcnMgc3BhbicpLmVxKCBpX3RtcCApICk7XG5cdFx0fSBcblx0XG5cdFx0dGhpcy5wYWxldHNfYWN0aXZlLnBvcCgpO1xuXHRcdHRoaXMubGlzdC5wb3AoKTtcblx0XHR0aGlzLmNvbG9yc19wb3MucG9wKCk7XG5cdFx0dGhpcy5jYXRlZ29yeS5wb3AoKTtcblx0XHR0aGlzLnZhbHVlLnBvcCgpO1xuXHRcdHRoaXMuY29sb3JzX2FjdGl2ZS5wb3AoKTtcblx0XHR0aGlzLm1pbl92YWx1ZS5wb3AoKTtcblx0XHR0aGlzLm1heF92YWx1ZS5wb3AoKTtcblx0XHR0aGlzLmNsb3VkLnBvcCgpO1xuXHRcdHRoaXMuY2xvdWRfcGFyc2VyLnBvcCgpO1xuXHRcdHRoaXMubGVnZW5kcy5wb3AoKTtcblx0XHR0aGlzLnNob3coKTtcblx0fSxcblxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikuYXR0cignY29udGVudGVkaXRhYmxlJywndHJ1ZScpO1xuXHRcdCQob2JqKS5jbGljaygpO1xuXHR9LFxuXG5cblx0ZW5kX2VkaXQgOiBmdW5jdGlvbihvYmope1xuXHRcdCQob2JqKS5hdHRyKCdjb250ZW50ZWRpdGFibGUnLCdmYWxzZScpO1xuXHRcdGxheWVycy5saXN0WyAkKG9iaikuaW5kZXgoKSBdID0gJChvYmopLmh0bWwoKTtcblx0fVxufVxuIiwiLy9vYmlla3QgZG90eWN6xIVzeSB3eXN3aWV0bGFuaWEgYWt1dGFsaXphY2ppIGkgZWR5Y2ppIHBhbmVsdSBsZWdlbmRcbmxlZ2VuZHMgPSB7XG5cblx0Ly93ecWbd2lldGxhbXkgd3N6eXN0a2llIGxlZ2VuZHkgdyBwYW5lbHUgbWFwXG5cdHNob3cgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFxuXHRcdFx0aHRtbCArPSBcIjxzcGFuIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzFdK1wiJyBjbGFzcz0nY29sb3InPjwvc3Bhbj48c3BhbiBjb250ZW50ZWRpdGFibGU9J3RydWUnPlwiK2xheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdW2ldWzBdK1wiPC9zcGFuPlwiO1xuXG5cdFx0fVxuXG5cdFx0JCgnI2xlZ2VuZHMnKS5odG1sKGh0bWwpO1xuXG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY29sb3JfY291bnQgPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGggLy9pbG9zYyBrb2xvcsOzd1xuXHRcdHZhciBkaWZmcmVudCA9IE1hdGguYWJzKCBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdIC0gbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSApOyAvLyBjb2xvcl9jb3VudDtcblx0XHRcblx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXSA9IFtdO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdFxuXHRcdFx0dmFyIG5vd190bXAgPSBNYXRoLnJvdW5kKCAobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXStkaWZmcmVudC9jb2xvcl9jb3VudCppKSoxMDApIC8gMTAwXG5cdFx0XHRpZihpKzEgPT0gaV9tYXggKXtcblx0XHRcdFx0dmFyIG5leHRfdG1wID0gbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0dmFyIG5leHRfdG1wID0gTWF0aC5yb3VuZCggKChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdK2RpZmZyZW50L2NvbG9yX2NvdW50KihpKzEpKSAtIDAuMDEpICAqMTAwKSAvIDEwMCBcblx0XHRcdH1cblx0XHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLnB1c2goWyAgbm93X3RtcCsnIC0gJytuZXh0X3RtcCwgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1baV0gXSk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuc2hvdygpO1xuXG5cdH1cbn1cblxubGVnZW5kcy5zaG93KCk7IiwiLypcbiAgICBfX19fICAgX19fXyBfX19fICAgIF9fICBfX18gX19fICAgICBfX19fICAgICBfX19fXyAgICBfX19fIFxuICAgLyBfXyApIC8gIF8vLyBfXyBcXCAgLyAgfC8gIC8vICAgfCAgIC8gX18gXFwgICB8X18gIC8gICAvIF9fIFxcXG4gIC8gX18gIHwgLyAvIC8gLyAvIC8gLyAvfF8vIC8vIC98IHwgIC8gL18vIC8gICAgL18gPCAgIC8gLyAvIC9cbiAvIC9fLyAvXy8gLyAvIC9fLyAvIC8gLyAgLyAvLyBfX18gfCAvIF9fX18vICAgX19fLyAvXyAvIC9fLyAvIFxuL19fX19fLy9fX18vIFxcX19fXFxfXFwvXy8gIC9fLy9fLyAgfF98L18vICAgICAgIC9fX19fLyhfKVxcX19fXy8gIFxuXG52YXJzaW9uIDMuMCBieSBNYXJjaW4gR8SZYmFsYVxuXG5saXN0YSBvYmlla3TDs3c6XG5cbiBjYW52YXMgPSBjYW52YXMoKSAtIG9iaWVrdCBjYW52YXNhXG4gY3J1ZCA9IGNydWQoKSAtIG9iaWVrdCBjYW52YXNhXG4gaW1hZ2UgPSBpbWFnZSgpIC0gb2JpZWt0IHpkasSZY2lhIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG4gbW91c2UgPSBtb3VzZSgpXG4gbW9kZWxzID0gbW9kZWxzKClcbiBnbG9iYWwgPSBnbG9iYWwoKSAtIGZ1bmtjamUgbmllIHByenlwaXNhbnkgZG8gaW5ueWNoIG9iaWVrdMOzd1xuIGNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzKClcbiBwb2ludGVycyA9IHBvaW50ZXJzKClcbiBjb2xvcnBpY2tlciA9IGNvbG9ycGlja2VyKClcbiBtZW51X3RvcCA9IG1lbnVfdG9wKClcbiBmaWd1cmVzID0gZmlndXJlcygpXG5cbiovXG5cbi8vcG8ga2xpa25pxJljaXUgem1pZW5pYXkgYWt0dWFsbnkgcGFuZWxcbiQoJy5ib3ggPiB1bCA+IGxpJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2JveCh0aGlzKSB9KTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuICBsYXllcnMuc2hvdygpO1xuICBwYWxldHMuc2hvdygpO1xuXG5cdC8vemFibG9rb3dhbmllIG1vxbxsaXdvxZtjaSB6YXpuYWN6YW5pYSBidXR0b27Ds3cgcG9kY3phcyBlZHljamkgcG9sYVxuXHQkKGRvY3VtZW50KS5vbihcImZvY3VzaW5cIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSB0cnVlOyB9KTtcblx0JChkb2N1bWVudCkub24oXCJmb2N1c291dFwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IGZhbHNlOyB9KTtcblxuXG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IFxuXG5cdFx0Ly9qZcWbbGkgbmllIG1hbXkgemRlZmluaW93YW5lZ2EgaGFzaGEgdHdvcnp5bXkgbm93xIUgbWFwxJkgdyBwcnplY2l3bnltIHd5cGFka3UgYWt0dWFsaXp1amVteSBqdcW8IGlzdG5pZWrEhWPEhVxuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCdjcnVkJyxjcnVkLm1hcF9oYXNoKVxuXG5cdFx0aWYodHlwZW9mIGNydWQubWFwX2hhc2ggPT0gJ3N0cmluZycpe1xuXHRcdFx0XG5cdFx0XHRjcnVkLnVwZGF0ZV9tYXAoKTtcblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0XG5cdFx0XHRjcnVkLmNyZWF0ZV9tYXAoKTtcblx0XHRcblx0XHR9XG5cblx0fSk7XG5cblxuXHQkKCcjdG9vbGJhcl90b3AgYnV0dG9uLmRlbGV0ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IGFsZXJ0KCdkZWxldGUnKTsgfSk7XG5cblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdCQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgJCgnI2NoYW5nZV9jYXRlZ29yeScpLmJsdXIoKTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSBwdXNjemVuaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IG1vdXNlLm1vdXNlX2Rvd24gPSBmYWxzZTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSB3Y2nFm25pxJljaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXHRcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL8WCYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpO1xuXHRcblx0fSk7XG5cblx0Ly93eXdvxYJhbmllIGZ1bmtjamkgcG9kY3phcyBwb3J1c3phbmlhIG15c3prxIVcblx0JChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdGlmKG1vdXNlLm1vdXNlX2Rvd24pIG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cdFx0aWYobWVudV90b3AuYXV0b19kcmF3KXsgbW91c2UuY2xpY2tfb2JqID0gXCJjYW52YXNcIjsgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTt9XG5cdFxuXHR9KTtcblxuXHQkKCcjbWFpbl9jYW52YXMnKS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpOy8vemFyZWplc3Ryb3dhbmllIG9iaWVrdHV3ICBrdMOzcnkga2xpa2FteVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cblx0fSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpe1xuXG5cdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1x0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gY2FudmFzLmNvbnRleHRfbmV3X3g7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IGNhbnZhcy5jb250ZXh0X25ld195O1xuXG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWlcblx0JCgnI2FkZF9jYXRlZ29yeScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0Y2F0ZWdvcmllcy5hZGQoKTtcblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaSAocG8gd2NpxZtuacSZY2l1IGVudGVyKVxuXHQkKCdpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykua2V5cHJlc3MoZnVuY3Rpb24oZSkge1xuICAgIFx0aWYoZS53aGljaCA9PSAxMykge1xuICAgIFx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuICAgIFx0fVxuXHR9KTtcblxuXHQvLyQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgIH0pO1xuXG5cdC8vcG9rYXphbmllIC8gdWtyeWNpZSBwYW5lbHUga2F0ZWdvcmlpXG5cdCQoJyNleGNlbF9ib3ggaDIsICNwb2ludGVyX2JveCBoMiwgI3BhbGV0c19ib3ggaDInKS5jbGljayhmdW5jdGlvbihldmVudCl7IGdsb2JhbC50b29nbGVfcGFuZWwoZXZlbnQpOyB9KTtcblxuXHQvL29ic8WCdWdhIGJ1dHRvbsOzdyBkbyBpbmtyZW1lbnRhY2ppIGkgZGVrcmVtZW50YWNqaSBpbnB1dMOzd1xuXHQkKCdidXR0b24uaW5jcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9pbmNyZW1lbnQoICQodGhpcykgKSB9KTtcblx0JCgnYnV0dG9uLmRlY3JlbWVudCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy5idXR0b25fZGVjcmVtZW50KCAkKHRoaXMpICkgfSk7XG5cblx0Ly9vYsWCdWdhIGlucHV0w7N3IHBvYnJhbmllIGRhbnljaCBpIHphcGlzYW5pZSBkbyBiYXp5XG5cdCQoJy5zd2l0Y2gnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21fc3dpdGNoKCAkKHRoaXMpICk7IH0pOyAvL3ByenljaXNraSBzd2l0Y2hcblx0JCgnLmlucHV0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX2lucHV0KCAkKHRoaXMpICk7IH0pOyAvL3RyYWR5Y3lqbmUgaW5wdXR5XG5cdCQoJy5pbnB1dF9iYXNlX3RleHQnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX2lucHV0X3RleHQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLnNlbGVjdF9iYXNlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zZWxlY3QoICQodGhpcykgKTsgfSk7IC8vbGlzdHkgcm96d2lqYW5lIHNlbGVjdFxuXG5cdCQoJyNtZW51X3RvcCAjaW5jcmVtZW50X2NhbnZhcycpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmluY3JlbWVudF9zY2FsZSgpOyB9KTtcblx0JCgnI21lbnVfdG9wICNkZWNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuZGVjcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2FkZF9pbWFnZScpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmFkZF9pbWFnZSgpOyB9KTtcblxuXHQkKCcjbWVudV90b3AgI3Jlc2V0X2NhbnZhcycpLmNsaWNrKGZ1bmN0aW9uKCl7IGNhbnZhcy5zZXRfZGVmYXVsdCgpOyB9KTtcblxuXHQvL3ByenlwaXNhbmllIHBvZHN0YXdvd293eWNoIGRhbnljaCBkbyBvYmlla3R1IGNhbnZhc1xuXHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5fY2FudmFzJyk7XG4gIGNhbnZhcy5jb250ZXh0ID0gY2FudmFzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjYW52YXMud2lkdGhfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJykgKTtcbiAgY2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JykgKTtcbiAgdmFyIG9mZnNldCA9ICQoJyNjYW52YXNfYm94Jykub2Zmc2V0KCk7XG4gIGNhbnZhcy5vZmZzZXRfbGVmdCA9IG9mZnNldC5sZWZ0O1xuICBjYW52YXMub2Zmc2V0X3RvcCA9IG9mZnNldC50b3A7XG5cbiAgLy90d29yenlteSB0YWJsaWNlIHBvaW50ZXLDs3dcblx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cbiAgJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbChjYW52YXMud2lkdGhfY2FudmFzKydweCcpO1xuXHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChjYW52YXMuaGVpZ2h0X2NhbnZhcysncHgnKTtcbiAgJCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgsI2NhbnZhc19pbmZvICNoZWlnaHQsI2NhbnZhc19pbmZvICNzaXplJykuY2hhbmdlKGZ1bmN0aW9uKCl7bWVudV90b3AudXBkYXRlX2NhbnZhc19pbmZvKCl9KTtcblxuXHQkKCcjYWxwaGFfaW1hZ2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbWVudV90b3AuY2hhbmdlX2FscGhhKCkgfSk7XG5cblx0JCgnaW5wdXQnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IGZhbHNlOyB9KTtcblx0JCgnaW5wdXQnKS5mb2N1c291dChmdW5jdGlvbigpeyBtZW51X3RvcC5tb2RlX2tleSA9IHRydWU7IH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXsgY2FudmFzLmRyYXcoKTsgfSk7XG5cdGNhbnZhcy5kcmF3KCk7IC8vcnlzb3dhbmllIGNhbnZhc1xuXG5cdC8vemFwaXN1amVteSBsdWIgYWt0dWFsaXp1amVteSBtYXDEmSBwbyBrbGlrbmnEmWNpdSB3IGJ1dHRvdyB3IHphbGXFvG5vxZtjaSBvZCB0ZWdvIGN6eSBtYW15IHpkZWZpbmlvd2FuZSBpZCBtYXB5XG5cdCQoJy5tZW51X3JpZ2h0IC5zYXZlJykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRpZihjcnVkLm1hcF9oYXNoID09IG51bGwpeyBjcnVkLmNyZWF0ZV9tYXAoKTsgfVxuXHRcdGVsc2V7IGNydWQudXBkYXRlX21hcCgpOyB9XG5cdH0pO1xuXG5cdC8vdXN1d2FteSBtYXDEmSBwbyBrbGlrbmnEmWNpdSB3IGJ1dHRvblxuXHQkKCcubWVudV9yaWdodCAucmVtb3ZlJykuY2xpY2soZnVuY3Rpb24oKXtpZihjb25maXJtKFwiY3p5IG5hcGV3bm8gdXN1bsSFxIcgbWFwxJkgP1wiKSl7Y3J1ZC5kZWxldGVfbWFwKCk7fSB9KTtcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikucGFyZW50KCkuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHR2YXIgY2F0ZWdvcnkgPSAkKG9iaikuaHRtbCgpO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignZGl2JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJyMnK2NhdGVnb3J5KS5kZWxheSgxMDApLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcblx0XG5cdH0sXG5cblx0Ly9mdW5rY2phIHPFgnXFvMSFY2EgZG8gcG9iaWVyYW5pYSBkYW55Y2ggZG90eWN6xIVjeWNoIG1hcFxuXHRnZXRfbWFwcyA6IGZ1bmN0aW9uKCl7XG5cdFxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2FwaS9tYXBzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBtYXAgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cblx0XHRcdFx0dmFyIGFkZF9odG1sID0gJyc7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBpX21heCA9IHJlc3BvbnNlLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXggO2krKyl7XG5cblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXBzJykuYXBwZW5kKCBhZGRfaHRtbCApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgbWFwIFxuXHRcdCQoJy5zZWxlY3RfbWFwcycpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93xIUgbWFwxJkgPycpKSB7XG5cdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19tYXAnICl7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRjcnVkLnNlbGVjdF9tYXAoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHR1cGRhdGVfY2FudmFzX2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5zY2FsZSA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoKSApO1xuXHRcdGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCgpICk7XG5cdFx0Y2FudmFzLmhlaWdodF9jYW52YXMgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoKSApO1xuXG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCBjYW52YXMuc2NhbGUgKyAnJScgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCBjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcgKTtcblxuXHRcdCQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJyxjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0JyxjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0Y2hhbmdlX2FscGhhIDogZnVuY3Rpb24oKXtcblx0XHRpbWFnZS5hbHBoYSA9ICQoJyNhbHBoYV9pbWFnZScpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGFkZF9pbWFnZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2plc2xpIHBvZGFueSBwYXJhbWV0ciBuaWUgamVzdCBwdXN0eVxuXHRcdHZhciBzcmNfaW1hZ2UgPSBwcm9tcHQoXCJQb2RhaiDFm2NpZcW8a8SZIGRvIHpkasSZY2lhOiBcIik7XG5cblx0XHRpZihzcmNfaW1hZ2Upe1xuXHRcdFx0aWYoc3JjX2ltYWdlLmxlbmd0aCA+IDApe1xuXG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0XHRcdC8vd2N6eXRhbmllIHpkasSZY2lhOlxuXHRcdFx0XHRcdGltYWdlLm9iai5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHRpbWFnZS53aWR0aCA9IGltYWdlLm9iai53aWR0aDtcblx0ICAgIFx0XHRpbWFnZS5oZWlnaHQgPSBpbWFnZS5vYmouaGVpZ2h0O1xuXHQgICAgXHRcdGltYWdlLmRyYXcoKTtcblx0ICBcdFx0fTtcblxuXHRcdFx0ICBpbWFnZS54ID0gMDtcblx0XHRcdCAgaW1hZ2UueSA9IDA7XG5cdFx0XHQgIGltYWdlLm9iai5zcmMgPSBzcmNfaW1hZ2U7XG5cdFx0XHRcdC8vc2ltYWdlLm9iai5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRzaG93X2luZm8gOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbChwYXJzZUludChjYW52YXMuc2NhbGUpICsgJyUnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHBhcnNlSW50KGNhbnZhcy53aWR0aF9jYW52YXMpICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwocGFyc2VJbnQoY2FudmFzLmhlaWdodF9jYW52YXMpICsgJ3B4Jyk7XG5cdH1cblxufVxuIiwiLy8gcG9iaWVyYW5pZSBkYW55Y2ggeiBzZWxla3RhIGlucHV0YSBzd2l0Y2h5IChha3R1YWxpemFjamEgb2JpZWt0w7N3KSBidXR0b24gaW5rcmVtZW50IGkgZGVrcmVtZW50XG52YXIgbW9kZWxzID0ge1xuXG5cdGJ1dHRvbl9pbmNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSArIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdGJ1dHRvbl9kZWNyZW1lbnQgOiBmdW5jdGlvbihvYmope1xuXG5cdFx0dmFyIGlucHV0X3RvX3VwZGF0ZSA9ICQob2JqKS5hdHRyKCduYW1laW5wdXQnKTtcblx0XHR2YXIgdmFsdWUgPSBwYXJzZUludCgkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCgpKSAtIDE7XG5cblx0XHQkKCdpbnB1dFtuYW1lPVwiJytpbnB1dF90b191cGRhdGUrJ1wiXScpLnZhbCh2YWx1ZSk7XG5cdFx0dGhpcy51cGRhdGVfZnJvbV9pbnB1dCggJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKSApO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX2lucHV0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9IHBhcnNlSW50KCQob2JqKS52YWwoKSk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dF90ZXh0IDogZnVuY3Rpb24ob2JqKXtcblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0d2luZG93W25hbWVfY2xhc3NdW25hbWVfbWV0aG9kXSA9ICQob2JqKS52YWwoKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3NlbGVjdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21fc3dpdGNoIDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHRpZiggJChvYmopLmF0dHIoXCJ2YWx1ZVwiKSA9PSAnZmFsc2UnICl7XG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ3RydWUnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9mZicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb24nKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRlbHNleyAvL3d5xYLEhWN6YW15IHByemXFgsSFY3puaWtcblx0XHRcdCQob2JqKS5hdHRyKFwidmFsdWVcIiwnZmFsc2UnKTtcblx0XHRcdCQob2JqKS5yZW1vdmVDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHQkKG9iaikuYWRkQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBmYWxzZTtcblx0XHR9XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fVxufVxuIiwiLy9vYmlla3QgbXlzemtpIChkbyBvZ2FybmllY2lhKVxudmFyIG1vdXNlID0ge1xuXHRtb3VzZV9kb3duIDogZmFsc2UsXG5cdGNsaWNrX29iaiA6IG51bGwsXG5cblx0dG1wX21vdXNlX3ggOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXHR0bXBfbW91c2VfeSA6IG51bGwsIC8vem1pZW5uZSB0eW1jemFzb3dlIHVtb8W8bGl3aWFqxIVjZSBwcnplc3V3YW5pZSB0xYJhXG5cblx0bGVmdCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praVxuXHR0b3AgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2lcblx0cGFkZGluZ194IDogbnVsbCwgLy9wb3p5Y2phIHggbXlzemtpIG9kIGfDs3JuZWoga3Jhd8SZZHppXG5cdHBhZGRpbmdfeSA6IG51bGwsIC8vcG96eWNqYSB5IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRvZmZzZXRfeCA6IG51bGwsIC8vb2Zmc2V0IHggb2JpZWt0dSBrbGlrbmnEmXRlZ29cblx0b2Zmc2V0X3kgOiBudWxsLCAvL29mZnNldCB5IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cblx0Ly9mdW5ja2phIHd5a3J5d2FqxIVjYSB3IGNvIGtsaWtuacSZdG8gcG9iaWVyYWrEhWNhIHBhZGRpbmcga2xpa25pxJljaWEgb3JheiB6YXBpc3VqxIVjYSBrbGlrbmnEmWNpZVxuXHRzZXRfbW91c2VfZG93biA6IGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdHZhciBvYmogPSBldmVudC50YXJnZXQ7XG5cblx0XHQvL2plxZtsaSBlbGVtZW50IG5hIGt0w7NyeSBrbGlrbmnEmXRvIG1hIGF0cnlidXQgbmFtZWNsaWNrIHByenlwaXN1amVteSBnbyBkbyBvYmlla3R1IG15c3praVxuXHRcdGlmKHR5cGVvZigkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJykpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0dGhpcy5jbGlja19vYmogPSAkKGV2ZW50LnRhcmdldCkuYXR0cignbmFtZWNsaWNrJyk7XG5cblx0XHRcdHZhciBwb3NpdGlvbiA9ICQob2JqKS5vZmZzZXQoKTtcblx0XHRcdHRoaXMub2Zmc2V0X3ggPSBwb3NpdGlvbi5sZWZ0O1xuXHRcdFx0dGhpcy5vZmZzZXRfeSA9IHBvc2l0aW9uLnRvcDtcblx0XHRcdHRoaXMucGFkZGluZ194ID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMucGFkZGluZ195ID0gdGhpcy50b3AgLSBwb3NpdGlvbi50b3A7XG5cdFx0XHRtb3VzZS5tb3VzZV9kb3duID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy50bXBfbW91c2VfeCA9IGltYWdlLng7XG5cdFx0XHR0aGlzLnRtcF9tb3VzZV95ID0gaW1hZ2UueTtcblx0XHR9XG5cdH0sXG5cblx0c2V0X3Bvc2l0aW9uIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHRoaXMubGVmdCA9IGV2ZW50LnBhZ2VYLFxuXHRcdHRoaXMudG9wID0gZXZlbnQucGFnZVlcblx0fSxcblxuXHQvL2Z1bmtjamEgd3lrb255d2FuYSBwb2RjemFzIHdjacWbbmllY2lhIHByenljaWtza3UgbXlzemtpICh3IHphbGXFvG5vxZtjaSBvZCBrbGlrbmnEmXRlZ28gZWxlbWVudHUgd3lrb251amVteSByw7PFvG5lIHJ6ZWN6eSlcblx0bW91c2Vtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHRzd2l0Y2godGhpcy5jbGlja19vYmope1xuXHRcdFx0Y2FzZSAncmlnaHRfcmVzaXplJzpcblx0XHRcdFx0Ly9yb3pzemVyemFuaWUgY2FudmFzYSB3IHByYXdvXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0dmFyIG5ld193aWR0aCA9IHRoaXMubGVmdCAtIHRoaXMucGFkZGluZ194IC0gcG9zaXRpb24ubGVmdFxuXHRcdFx0XHRpZihuZXdfd2lkdGggPCBzY3JlZW4ud2lkdGggLSAxMDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYW52YXMucmVzaXplX3dpZHRoKG5ld193aWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdib3R0b21fcmVzaXplJzpcblx0XHRcdFx0Ly96bWllbmlhbXkgd3lzb2tvxZvEhyBjYW52YXNhXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblx0XHRcdFx0Y2FudmFzLnJlc2l6ZV9oZWlnaHQodGhpcy50b3AgLSB0aGlzLnBhZGRpbmdfeSAtIHBvc2l0aW9uLnRvcCk7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnaW1hZ2VfcmVzaXplJzpcblxuXHRcdFx0XHRpZihpbWFnZS5vYmogIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdFx0dmFyIHhfYWN0dWFsID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDtcdC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgc3Vic3RyYWN0ID0gaW1hZ2UueCArIGltYWdlLndpZHRoIC0geF9hY3R1YWwgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHRcdFx0XHR2YXIgZmFjb3IgPSBpbWFnZS53aWR0aCAvIGltYWdlLmhlaWdodDtcblxuXHRcdFx0XHRcdGlmIChpbWFnZS53aWR0aCAtIHN1YnN0cmFjdCA+IDEwMCl7XG5cdFx0XHRcdFx0XHRpbWFnZS53aWR0aCAtPSBzdWJzdHJhY3Q7XG5cdFx0XHRcdFx0XHRpbWFnZS5oZWlnaHQgLT0gc3Vic3RyYWN0L2ZhY29yO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdjYW52YXMnOlxuXG5cdFx0XHRcdC8vcHJ6ZXN1d2FuaWUgemRqxJljaWVtIChucC4gbWFwYSAvIHd6b3J6ZWMpXG5cdFx0XHRcdGlmKChtZW51X3RvcC5tb3ZlX2ltYWdlKSAmJiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXG5cdFx0XHRcdFx0dmFyIHhfYWN0dWFsID0gdGhpcy5sZWZ0IC0gcG9zaXRpb24ubGVmdDsgLy9ha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXHRcdFx0XHRcdHZhciB5X2FjdHVhbCA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wOyAvLyBha3R1YWxuYSBwb3p5Y2phIG15c3praVxuXG5cdFx0XHRcdFx0dmFyIHhfdHJhbnNsYXRlID0geF9hY3R1YWwgLSB0aGlzLnBhZGRpbmdfeCArIG1vdXNlLnRtcF9tb3VzZV94OyAvL3ByemVzdW5pxJljaWUgb2JyYXprYSB3emdsxJlkZW0gYWt0dWFsbmVqIHBvenljamkgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHlfdHJhbnNsYXRlID0geV9hY3R1YWwgLSB0aGlzLnBhZGRpbmdfeSArIG1vdXNlLnRtcF9tb3VzZV95OyAvL3ByemVzdW5pZWNpZSBvYnJhemthIHd6Z2zEmWRlbSBha3R1YWxuZWogcG96eWNqaSBteXN6a2lcblxuXHRcdFx0XHRcdHZhciB4X25ldyA9IHhfdHJhbnNsYXRlIDtcblx0XHRcdFx0XHR2YXIgeV9uZXcgPSB5X3RyYW5zbGF0ZSA7XG5cblx0XHRcdFx0XHRpbWFnZS54ID0geF9uZXc7XG4gICAgICBcdFx0XHRcdGltYWdlLnkgPSB5X25ldztcbiAgICAgIFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vcnlzb3dhbmllXG5cdFx0XHRcdGVsc2UgaWYgKCghbWVudV90b3AubW92ZV9pbWFnZSkgJiYgKCFtZW51X3RvcC5tb3ZlX2NhbnZhcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgcm93X2NsaWNrID0gcGFyc2VJbnQoICh0aGlzLnRvcCAtIGNhbnZhcy5vZmZzZXRfdG9wICsgY2FudmFzLmNvbnRleHRfeSooLTEpICkgLyAoIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3kpKihjYW52YXMuc2NhbGUgLyAxMDApICApICk7XG5cdFx0XHRcdFx0dmFyIGNvbHVtbl9jbGljayA9IHBhcnNlSW50KCAodGhpcy5sZWZ0IC0gY2FudmFzLm9mZnNldF9sZWZ0ICsgY2FudmFzLmNvbnRleHRfeCooLTEpICkgLyAoIChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3gpKihjYW52YXMuc2NhbGUgLyAxMDApICkgKTtcblxuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coJ2tsaWsnLHJvd19jbGljayxjb2x1bW5fY2xpY2ssY2FudmFzLmNvbnRleHRfeCxjYW52YXMuY29udGV4dF95KTtcblxuXHRcdFx0XHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93X2NsaWNrJTIgPT0wKSl7XG5cdFx0XHRcdFx0XHQvL2NvbHVtbl9jbGljayA9IHBhcnNlSW50KCAodGhpcy5sZWZ0IC0gY2FudmFzLm9mZnNldF9sZWZ0IC0gcG9pbnRlcnMuc2l6ZV9wb2ludGVyLzIpIC8gKChwb2ludGVycy5zaXplX3BvaW50ZXIgKyBwb2ludGVycy5wYWRkaW5nX3gpKihjYW52YXMuc2NhbGUgLyAxMDApKSAgKTtcblx0XHRcdFx0XHRcdGNvbHVtbl9jbGljayA9IHBhcnNlSW50KCAodGhpcy5sZWZ0IC0gY2FudmFzLm9mZnNldF9sZWZ0ICsgY2FudmFzLmNvbnRleHRfeCooLTEpIC0gcG9pbnRlcnMuc2l6ZV9wb2ludGVyLzIpIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSApICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoIChyb3dfY2xpY2sgPj0gMCkgJiYgKHJvd19jbGljayA8IGNhbnZhcy5hY3RpdmVfcm93KSAmJiAoY29sdW1uX2NsaWNrID49IDApICYmIChjb2x1bW5fY2xpY2sgPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLnVwZGF0ZV9wb2ludChyb3dfY2xpY2ssY29sdW1uX2NsaWNrLHBvaW50ZXJzLmxhc3Rfcm93LHBvaW50ZXJzLmxhc3RfY29sdW1uKTtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gY29sdW1uX2NsaWNrO1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMubGFzdF9yb3cgPSByb3dfY2xpY2s7XG5cdFx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMubGFzdF9yb3cgPSBudWxsO1xuXHRcdFx0XHRcdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vcHJ6ZXN1d2FuaWUgY2HFgnltIGNhbnZhc2VtXG5cdFx0XHRcdGVsc2UgaWYobWVudV90b3AubW92ZV9jYW52YXMpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYW52YXMucmVzZXQoKTtcblx0XHRcdFx0XHRjYW52YXMuY2xlYXIoKTtcblxuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0X25ld194ID0gKG1vdXNlLmxlZnQgLSBtb3VzZS5vZmZzZXRfeCkgLSBtb3VzZS5wYWRkaW5nX3ggKyBjYW52YXMuY29udGV4dF94O1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0X25ld195ID0gKG1vdXNlLnRvcCAtIG1vdXNlLm9mZnNldF95KSAtIG1vdXNlLnBhZGRpbmdfeSArIGNhbnZhcy5jb250ZXh0X3k7XG5cblx0XHRcdFx0XHRpZihjYW52YXMuY29udGV4dF9uZXdfeCA+IDApIGNhbnZhcy5jb250ZXh0X25ld194ID0gMDtcblx0XHRcdFx0XHRpZihjYW52YXMuY29udGV4dF9uZXdfeSA+IDApIGNhbnZhcy5jb250ZXh0X25ld195ID0gMDtcblxuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF9uZXdfeCAvIChjYW52YXMuc2NhbGUgLyAxMDApICksKCBjYW52YXMuY29udGV4dF9uZXdfeSAvIChjYW52YXMuc2NhbGUgLyAxMDApICkpO1xuXHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG4iLCIvL29iaWVrdCBtw7N3acSFY3kgbmFtIG5hZCBqYWvEhSBrYXRlZ29yaWEgamVzdGXFm215XG52YXIgb25fY2F0ZWdvcnkgPSB7XG5cdFxuXHRjYW52YXNfb2Zmc2V0X3RvcCA6ICQoJyNjYW52YXNfd3JhcHBlcicpLm9mZnNldCgpLnRvcCxcblx0Y2FudmFzX29mZnNldF9sZWZ0IDogJCgnI2NhbnZhc193cmFwcGVyJykub2Zmc2V0KCkubGVmdCxcblxuXHQvL2Z1bmtjamEgendyYWNhasSFY2EgYWt0dWFsbsSFIGthdGVnb3JpxJkgbmFkIGt0w7NyxIUgem5hamR1amUgc2nEmSBrdXJzb3Jcblx0Z2V0X25hbWUgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIHRoaXMuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSB0aGlzLmNhbnZhc19vZmZzZXRfdG9wO1xuXHRcdHZhciByb3cgPSBNYXRoLmNlaWwoIHRvcCAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdFxuXHRcdGlmKChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSAmJiAocm93ICUgMiAhPSAwKSl7XG5cdFx0XHR2YXIgY29sdW1uID0gTWF0aC5jZWlsKCAobGVmdCArIChwb2ludGVycy5zaXplLzIpKS8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICkgLSAxO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggbGVmdC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cdFx0fVxuXG5cdFx0dHJ5e1xuXHRcdFx0dmFyIGNhdGVnb3J5X251bSA9IHBvaW50ZXJzLnBvaW50ZXJzW3Jvdy0xXVtjb2x1bW4tMV0gXG5cdFx0XHR2YXIgY2F0ZWdvcnlfbmFtZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbY2F0ZWdvcnlfbnVtXVswXVxuXHRcdH1cblx0XHRjYXRjaChlKXtcblx0XHRcdHJldHVybiAnbnVsbCc7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKCBjYXRlZ29yeV9uYW1lID09ICdwdXN0eScpe1xuXHRcdFx0cmV0dXJuICdudWxsJztcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHJldHVybiBjYXRlZ29yeV9uYW1lO1x0XHRcblx0XHR9XG5cblx0fVxuXG59XG5cbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbGVhdmUoZnVuY3Rpb24oKXsgJChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgyMDApOyB9KTtcbiQoJyNjYW52YXNfd3JhcHBlcicpLm1vdXNlbW92ZShmdW5jdGlvbigpeyBjbG91ZC51cGRhdGVfdGV4dCggb25fY2F0ZWdvcnkuZ2V0X25hbWUoKSApOyB9KTtcbiQoXCIjY2FudmFzX2Nsb3VkXCIpLm1vdXNlbW92ZShmdW5jdGlvbigpeyBjbG91ZC5zZXRfcG9zaXRpb24oKTsgfSk7IiwicGFsZXRzID0ge1xuICB2YWxfbWF4IDogbnVsbCxcbiAgdmFsX21pbiA6IG51bGwsXG4gIHZhbF9pbnRlcnZhbCA6IG51bGwsICAgXG4gIHBhbGV0c19hY3RpdmUgOiAwLFxuICAvL3ZhbHVlIDogLTEsXG4gIC8vY2F0ZWdvcnkgOiAtMSxcblxuICAvL3BvZHN0YXdvd2UgcGFsZXR5IGtvbG9yw7N3ICggb3N0YXRuaWEgcGFsZXRhIGplc3QgbmFzesSFIHfFgmFzbsSFIGRvIHpkZWZpbmlvd2FuaWEgKVxuICBjb2xvcl9hcnIgOiBbXG4gICAgWycjZjdmY2ZkJywnI2U1ZjVmOScsJyNjY2VjZTYnLCcjOTlkOGM5JywnIzY2YzJhNCcsJyM0MWFlNzYnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSxcbiAgICBbJyNmN2ZjZmQnLCcjZTBlY2Y0JywnI2JmZDNlNicsJyM5ZWJjZGEnLCcjOGM5NmM2JywnIzhjNmJiMScsJyM4ODQxOWQnLCcjODEwZjdjJywnIzRkMDA0YiddLFxuICAgIFsnI2Y3ZmNmMCcsJyNlMGYzZGInLCcjY2NlYmM1JywnI2E4ZGRiNScsJyM3YmNjYzQnLCcjNGViM2QzJywnIzJiOGNiZScsJyMwODY4YWMnLCcjMDg0MDgxJ10sXG4gICAgWycjZmZmN2VjJywnI2ZlZThjOCcsJyNmZGQ0OWUnLCcjZmRiYjg0JywnI2ZjOGQ1OScsJyNlZjY1NDgnLCcjZDczMDFmJywnI2IzMDAwMCcsJyM3ZjAwMDAnXSxcbiAgICBbJyNmZmY3ZmInLCcjZWNlN2YyJywnI2QwZDFlNicsJyNhNmJkZGInLCcjNzRhOWNmJywnIzM2OTBjMCcsJyMwNTcwYjAnLCcjMDQ1YThkJywnIzAyMzg1OCddLFxuICAgIFsnI2ZmZjdmYicsJyNlY2UyZjAnLCcjZDBkMWU2JywnI2E2YmRkYicsJyM2N2E5Y2YnLCcjMzY5MGMwJywnIzAyODE4YScsJyMwMTZjNTknLCcjMDE0NjM2J10sXG4gICAgWycjZjdmNGY5JywnI2U3ZTFlZicsJyNkNGI5ZGEnLCcjYzk5NGM3JywnI2RmNjViMCcsJyNlNzI5OGEnLCcjY2UxMjU2JywnIzk4MDA0MycsJyM2NzAwMWYnXSxcbiAgICBbJyNmZmY3ZjMnLCcjZmRlMGRkJywnI2ZjYzVjMCcsJyNmYTlmYjUnLCcjZjc2OGExJywnI2RkMzQ5NycsJyNhZTAxN2UnLCcjN2EwMTc3JywnIzQ5MDA2YSddLFxuICAgIFsnI2ZmZmZlNScsJyNmN2ZjYjknLCcjZDlmMGEzJywnI2FkZGQ4ZScsJyM3OGM2NzknLCcjNDFhYjVkJywnIzIzODQ0MycsJyMwMDY4MzcnLCcjMDA0NTI5J10sXG4gICAgWycjZmZmZmQ5JywnI2VkZjhiMScsJyNjN2U5YjQnLCcjN2ZjZGJiJywnIzQxYjZjNCcsJyMxZDkxYzAnLCcjMjI1ZWE4JywnIzI1MzQ5NCcsJyMwODFkNTgnXSxcbiAgICBbJyNmZmZmZTUnLCcjZmZmN2JjJywnI2ZlZTM5MScsJyNmZWM0NGYnLCcjZmU5OTI5JywnI2VjNzAxNCcsJyNjYzRjMDInLCcjOTkzNDA0JywnIzY2MjUwNiddLFxuICAgIFsnI2ZmZmZjYycsJyNmZmVkYTAnLCcjZmVkOTc2JywnI2ZlYjI0YycsJyNmZDhkM2MnLCcjZmM0ZTJhJywnI2UzMWExYycsJyNiZDAwMjYnLCcjODAwMDI2J10sXG4gICAgWycjZjdmYmZmJywnI2RlZWJmNycsJyNjNmRiZWYnLCcjOWVjYWUxJywnIzZiYWVkNicsJyM0MjkyYzYnLCcjMjE3MWI1JywnIzA4NTE5YycsJyMwODMwNmInXSxcbiAgICBbJyNmN2ZjZjUnLCcjZTVmNWUwJywnI2M3ZTljMCcsJyNhMWQ5OWInLCcjNzRjNDc2JywnIzQxYWI1ZCcsJyMyMzhiNDUnLCcjMDA2ZDJjJywnIzAwNDQxYiddLFxuICAgIFsnI2ZmZmZmZicsJyNmMGYwZjAnLCcjZDlkOWQ5JywnI2JkYmRiZCcsJyM5Njk2OTYnLCcjNzM3MzczJywnIzUyNTI1MicsJyMyNTI1MjUnLCcjMDAwMDAwJ10sXG4gICAgWycjZmZmNWViJywnI2ZlZTZjZScsJyNmZGQwYTInLCcjZmRhZTZiJywnI2ZkOGQzYycsJyNmMTY5MTMnLCcjZDk0ODAxJywnI2E2MzYwMycsJyM3ZjI3MDQnXSxcbiAgICBbJyNmY2ZiZmQnLCcjZWZlZGY1JywnI2RhZGFlYicsJyNiY2JkZGMnLCcjOWU5YWM4JywnIzgwN2RiYScsJyM2YTUxYTMnLCcjNTQyNzhmJywnIzNmMDA3ZCddLFxuICAgIFsnI2ZmZjVmMCcsJyNmZWUwZDInLCcjZmNiYmExJywnI2ZjOTI3MicsJyNmYjZhNGEnLCcjZWYzYjJjJywnI2NiMTgxZCcsJyNhNTBmMTUnLCcjNjcwMDBkJ10sXG4gICAgWycjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnXVxuICBdLFxuXG4gIHNob3cgOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuc2hvd19jb2xvcigpO1xuICAgIHRoaXMuc2hvd19wYWxldHMoKTtcbiAgICB0aGlzLnNob3dfc2VsZWN0KCk7XG4gICAgLy9sYXllcnMuZGF0YS5jb2xvcl9hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXTtcbiAgfSxcblxuICBzaG93X3NlbGVjdCA6IGZ1bmN0aW9uKCl7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSBrYXRlZ29yaWlcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyeiBrb2x1bW7EmTwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjZXhjZWxfYm94IC5jYXRlZ29yeScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSB3YXJ0b8WbY2lcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyeiBrb2x1bW7EmTwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjZXhjZWxfYm94IC52YWx1ZScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL2tvbG9ydWplbXkgb2Rwb3dpZWRuaW8gZXhjZWxhXG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIFxuICAgIGlmKCBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpe1xuICAgICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBpZiggbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgfVxuICB9LFxuXG4gIHNldF9jYXRlZ29yeSA6IGZ1bmN0aW9uKG9iail7XG4gICAgbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdID0gcGFyc2VGbG9hdCgkKFwiI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnkgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoJ2NvbCcpKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gIH0sIFxuXG4gIHNldF92YWx1ZSA6IGZ1bmN0aW9uKG9iail7XG5cbiAgICB2YXIgdmFsdWVfdG1wID0gcGFyc2VGbG9hdCgkKFwiI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoJ2NvbCcpKTtcblxuICAgIGlmKCQuaXNOdW1lcmljKCBleGNlbC5kYXRhWzFdW3ZhbHVlX3RtcF0gKSl7XG4gICAgICBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB2YWx1ZV90bXA7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhbGVydCgnd3licmFuYSBrb2x1bW5hIG5pZSB6YXdpZXJhIGxpY3piJylcbiAgICB9XG4gIFxuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgXG4gICAgdmFyIHRtcF92YWx1ZSA9IGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXTtcbiAgICBcbiAgICAvL3d5c3p1a3VqZW15IG5ham1uaWVqc3phIGkgbmFqd2nEmWtzesSFIHdhcnRvxZvEhyB3IGtvbHVtbmllIHdhcnRvxZtjaVxuICAgIGlmKCBsYXllcnMudmFsdWVbdG1wX3ZhbHVlXSAhPSAtMSApe1xuICAgICAgXG4gICAgICB2YXIgdG1wX21pbiA9IGV4Y2VsLmRhdGFbMV1bdG1wX3ZhbHVlXVxuICAgICAgdmFyIHRtcF9tYXggPSBleGNlbC5kYXRhWzFdW3RtcF92YWx1ZV07XG4gICAgICBmb3IodmFyIGkgPSAxLCBpX21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICAgIGlmKHRtcF9taW4gPiBleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pIHRtcF9taW4gPSBleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV07XG4gICAgICAgIGlmKHRtcF9tYXggPCBleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV0pIHRtcF9tYXggPSBleGNlbC5kYXRhW2ldW3RtcF92YWx1ZV07XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhcIm1pbiBtYXggdmFsdWU6IFwiLHRtcF9taW4sIHRtcF9tYXgpO1xuICAgIH1cblxuICAgIGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB0bXBfbWluXG4gICAgbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHRtcF9tYXg7XG4gICAgY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gIH0sXG5cbiAgc2hvd19jb2xvciA6IGZ1bmN0aW9uKCl7XG4gICAgLy93ecWbd2lldGxhbXkgcGllcndzemFsaXN0xJkga29sb3LDs3dcbiAgICB2YXIgaHRtbCA9ICcnO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnJbMF0ubGVuZ3RoOyBpPGlfbWF4OyBpKyspe1xuICAgICAgXG4gICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJhY3RpdmVcIiBzdHlsZT1cImJhY2tncm91bmQ6Jyt0aGlzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0rJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkKCcjcGFsZXRzICNzZWxlY3QnKS5odG1sKCBodG1sICk7XG4gICAgXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0ID4gc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZWxlY3RfY29sb3IodGhpcyk7IH0pO1xuXG4gIH0sXG5cbiAgc2hvd19wYWxldHMgOiBmdW5jdGlvbigpe1xuICAgIFxuICAgIC8vd3lzd2lldGxhbXkgd3N6eXN0a2llIHBhbGV0eVxuICAgIHZhciBodG1sID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnIubGVuZ3RoO2kgPCBpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYoaSA9PSBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCI+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuPic7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwLCBqX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaiA8IGpfbWF4OyBqKyspe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JfYXJyW2ldW2pdICsgJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgICAgaHRtbCArPSAnPC9zcGFuPic7XG5cbiAgICB9XG4gICAgJCgnI3BhbGV0cyAjYWxsJykuaHRtbCggaHRtbCApO1xuICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X3BhbGV0cyh0aGlzKTt9KTtcbiBcbiAgfSxcblxuICAvL3phem5hY3phbXkga29ua3JldG5lIGtvbG9yeSBkbyB3ecWbd2lldGxlbmlhXG4gIHNlbGVjdF9jb2xvciA6IGZ1bmN0aW9uKG9iail7XG4gICAgaWYoICQob2JqKS5oYXNDbGFzcygnYWN0aXZlJykgKXtcbiAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDA7XG4gICAgICAkKG9iaikucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1bJChvYmopLmluZGV4KCldID0gMTtcbiAgICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgfVxuICAgIHRoaXMucGFyc2VfY29sb3IoKTtcblxuICB9LFxuXG4gIHBhcnNlX2NvbG9yIDogZnVuY3Rpb24oKXtcbiAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGk8aV9tYXg7IGkrKyl7XG5cbiAgICAgIGlmKCAkKCcjcGFsZXRzICNzZWxlY3Qgc3BhbicpLmVxKGkpLmhhc0NsYXNzKCdhY3RpdmUnKSApe1xuICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCByZ2IyaGV4KCQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJykpICk7XG4gICAgICB9XG4gICAgIH1cbiAgICBjYXRlZ29yaWVzLmNvbG9yX2Zyb21fZXhjZWwoKTtcbiAgICAvL2Z1bmtjamEgcG9tb2NuaWN6YVxuICAgIGZ1bmN0aW9uIHJnYjJoZXgocmdiKSB7XG4gICAgICByZ2IgPSByZ2IubWF0Y2goL15yZ2JcXCgoXFxkKyksXFxzKihcXGQrKSxcXHMqKFxcZCspXFwpJC8pO1xuICAgICAgXG4gICAgICBmdW5jdGlvbiBoZXgoeCkge1xuICAgICAgICByZXR1cm4gKFwiMFwiICsgcGFyc2VJbnQoeCkudG9TdHJpbmcoMTYpKS5zbGljZSgtMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gXCIjXCIgKyBoZXgocmdiWzFdKSArIGhleChyZ2JbMl0pICsgaGV4KHJnYlszXSk7XG4gICAgfVxuICB9LFxuXG4gIC8vemF6bmFjemFteSBwYWxldGUga29sb3LDs3dcbiAgc2VsZWN0X3BhbGV0cyA6IGZ1bmN0aW9uKG9iail7XG4gICAgJCgnI3BhbGV0cyAjYWxsID4gc3BhbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gJChvYmopLmluZGV4KCk7XG4gICAgXG4gICAgLy9ha3R1YWxpenVqZW15IHBhbGV0xJkgYWt0eXdueWNoIGtvbG9yw7N3XG4gICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLnB1c2goIHBhbGV0cy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zaG93X2NvbG9yKCk7XG4gICAgY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gIH1cbn1cblxuLy96ZGFyemVuaWEgZG90eWN6xIVjZSBwYWxldFxuJCgnI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF9jYXRlZ29yeSh0aGlzKTsgfSk7XG4kKCcjZXhjZWxfYm94IHNlbGVjdC52YWx1ZScpLmNoYW5nZShmdW5jdGlvbigpeyBwYWxldHMuc2V0X3ZhbHVlKHRoaXMpOyB9KTsiLCIvL21lbnUgcG9pbnRlclxudmFyIHBvaW50ZXJzID0ge1xuXHRzaG93X2FsbF9wb2ludCA6IHRydWUsXG5cdHBhZGRpbmdfeCA6IDEsXG5cdHBhZGRpbmdfeSA6IDEsXG5cdHRyYW5zbGF0ZV9tb2R1bG8gOiBmYWxzZSxcblx0c2l6ZSA6IDEwLFxuXHRtYWluX2tpbmQgOiAnc3F1YXJlJyxcblx0a2luZHMgOiBBcnJheSgnc3F1YXJlJywnY2lyY2xlJywnaGV4YWdvbicsJ2hleGFnb24yJyksXG5cblx0cG9pbnRlcnMgOiBBcnJheSgpLCAvL3BvaW50ZXJzLnBvaW50ZXJzW3J6YWRdW2tvbHVtbmFdIDoga2F0ZWdvcmlhW251bWVyXVxuXG5cdGxhc3RfY29sdW1uIDogbnVsbCxcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0bGFzdF9yb3cgOiBudWxsLFx0Ly93aWVyc3ogcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cblxuXHQvL3J5c293YW5pZSB3c3p5c3RraWNoIHB1bmt0w7N3XG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aWR0aF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0dmFyIGhlaWdodF9wb2ludGVyID0gdGhpcy5zaXplICsgdGhpcy5wYWRkaW5nX3k7XG5cdFx0dmFyIG5vbmVfY29sb3IgPSBcInJnYmEoMCwwLDAsMClcIlxuXG5cdFx0aWYodGhpcy5zaG93X2FsbF9wb2ludCkgbm9uZV9jb2xvciA9IFwicmdiYSgxMjgsMTI4LDEyOCwxKVwiO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93Kyspe1xuXHRcdFx0Zm9yKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspe1xuXG5cdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IDApe1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IG5vbmVfY29sb3I7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRpZiggKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dICE9IG1lbnVfdG9wLmNhdGVnb3J5KSAmJiAobWVudV90b3AuY2F0ZWdvcnkgIT0gMCkgKXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC4yXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gY2F0ZWdvcmllcy5jYXRlZ29yeVsgdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gXVsxXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnRVJST1IgMzkgTElORSAhICcsdGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0scm93LGNvbHVtbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIChyb3cgJSAyID09IDApICYmIChwb2ludGVycy50cmFuc2xhdGVfbW9kdWxvKSApe1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgKyB3aWR0aF9wb2ludGVyLzIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvL3R3b3J6eW15IHRhYmxpY2UgcG9udGVyw7N3IChqZcWbbGkgamFracWbIHBvbnRlciBpc3RuaWVqZSB6b3N0YXdpYW15IGdvLCB3IHByenlwYWRrdSBnZHkgcG9pbnRlcmEgbmllIG1hIHR3b3J6eW15IGdvIG5hIG5vd28pXG5cdGNyZWF0ZV9hcnJheSA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmFjdGl2ZV9yb3cgPSBwYXJzZUludCggY2FudmFzLmhlaWdodF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHRjYW52YXMuYWN0aXZlX2NvbHVtbiA9IHBhcnNlSW50KCBjYW52YXMud2lkdGhfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3gpICk7XG5cblx0XHRpZiggKHRoaXMucG9pbnRlcnMubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9yb3cpIHx8ICh0aGlzLnBvaW50ZXJzWzBdLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfY29sdW1uKSApXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjYW52YXMuYWN0aXZlX2NvbHVtbjsgY29sdW1uKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd10gPT0gdW5kZWZpbmVkKSB0aGlzLnBvaW50ZXJzW3Jvd10gPSBuZXcgQXJyYXkoKTtcblx0XHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSB1bmRlZmluZWQpXHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlX3BvaW50IDogZnVuY3Rpb24oeSx4LHlfbGFzdCx4X2xhc3Qpe1xuXG5cdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXG5cdFx0Ly93eXpuYWN6ZW5pZSByw7N3bmFuaWEgcHJvc3RlalxuXHRcdGlmKCAoKHlfbGFzdCAhPSB5KSB8fCAoeF9sYXN0ICE9IHgpKSAmJiAoeV9sYXN0ICE9IG51bGwpICYmICh4X2xhc3QgIT0gbnVsbCkgKXtcblx0XHRcdHZhciBhID0gKHlfbGFzdCAtIHkpIC8gKHhfbGFzdCAtIHgpO1xuXHRcdFx0dmFyIGIgPSB5IC0gYSp4O1xuXG5cdFx0XHRpZih4X2xhc3QgPiB4KXtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geDtcblx0XHRcdFx0dmFyIGNvbF90byA9IHhfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgY29sX3RvID0geDtcblx0XHRcdFx0dmFyIGNvbF9mcm9tID0geF9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5X2xhc3QgPiB5KXtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geTtcblx0XHRcdFx0dmFyIHJvd190byA9IHlfbGFzdDtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgcm93X3RvID0geTtcblx0XHRcdFx0dmFyIHJvd19mcm9tID0geV9sYXN0O1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcm93ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgY29sID0gY29sX2Zyb207IGNvbCA8PSBjb2xfdG87IGNvbCsrKVxuXHRcdFx0e1xuXHRcdFx0XHRyb3cgPSBwYXJzZUludCggYSpjb2wrYiApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMocm93KSkgcm93ID0geTtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGNvbCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIHJvdyA9IHJvd19mcm9tOyByb3cgPD0gcm93X3RvOyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Y29sID0gcGFyc2VJbnQoIChyb3ctYikvYSApO1xuXHRcdFx0XHRpZighJC5pc051bWVyaWMoY29sKSkgY29sID0geDtcblx0XHRcdFx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblx0XHR9XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
