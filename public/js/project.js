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
		$('#cloud .cloud_text').val( layers.cloud[layers.active] );
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


$('#cloud .cloud_text').keyup(function(){

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
	project_hash : null, //główny hash dotyczący naszego projektu

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
		this.layers.labels = layers.labels;
		
		//tworzymy obiekt excela

		this.excel = excel.data;


		//konwertujemy nasza tablice na json

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

	//tworzymy nową projekt
	create_project : function(){

		//aktualizujemy jsona do wysłania ajaxem
		this.get_data();
		var th = this; //zmienna pomocnicza


		var data = {
			map_json : th.map_json,
			layers : th.layers,
			excel : th.excel
		}

		jQuery.ajax({
			url: "api/projects",
			data: JSON.sringify(data),
			type: 'POST',
			success: function(response){
				th.map_hash = response.hash_map;
				alert('zapisano nowy projekt');
				//menu_top.get_maps();
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

labels = {

	show : function(){
		$('#layers .label_layer').val( layers.labels[layers.active] );
	
	},

	edit : function(obj) {
		
		 layers.labels[layers.active] = $(obj).val();
	}
}

$('#layers .label_layer').keyup(function(){
	labels.edit(this);
}); 

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
	labels : [""],
	main_name : '',

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

		$('#layers div').html(html);

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
		labels.show();
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
		this.labels.push("");
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
		this.labels.pop();
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

	//zaznaczenie dymka do publikacji po kliknięciu
	$('#cloud .embed').click(function(){	$(this).select();	});

	$('#toolbar_top button.save').click(function(){ 

		//jeśli nie mamy zdefiniowanega hasha tworzymy nową mapę w przeciwnym wypadku aktualizujemy już istniejącą
		
		console.log('crud',crud.project_hash)

		if(typeof crud.project_hash == 'string'){
			
			crud.update_project();

		}
		else{
			
			crud.create_project();
		
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
	
alert('klik')
	//	if(crud.map_hash == null){ crud.create_map(); }
	//	else{ crud.update_map(); }
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


	//funkcja służąca do pobierania danych dotyczących map
	get_projects : function(){
	
		$.ajax({
   		url: '/api/projects',
    	type: "GET",
    	contentType: "application/json"
		}).done( function( response ) {
			
			//wyświetlamy listę projektów w panelu u góry
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

				$('#toolbar_top select.select_projects').append( add_html );
			}

		});

		//dodajemu zdarzenie change project 
		$('.select_projects').change(function(){
			if (confirm('Czy chcesz wczytać nowy projekt ?')) {
				if( $(this).find('option:selected').attr('id') == 'new_project' ){
					location.reload();
				}
				else{
					crud.select_project( $(this).find('option:selected').attr('id') );
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
	
	canvas_offset_top : 187,
	canvas_offset_left : 10,

	//funkcja zwracająca aktualną kategorię nad którą znajduje się kursor
	get_name : function(){
		
		var left = mouse.left - this.canvas_offset_left;
		var top = mouse.top - this.canvas_offset_top;
		var row = Math.ceil( top / (pointers.size + pointers.padding_y) );
		//console.log(left,top,this.canvas_offset_left,this.canvas_offset_top);
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
    $('#excel_box select.category').html( add_html );

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
    $('#excel_box select.value').html( add_html );

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGFiZWxzLmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwcm9qZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9jenlzemN6ZW5pZSBpIHJ5c293YW5pZSBwbyBjYW52YXNpZVxudmFyIGNhbnZhcyA9IHtcblx0XG5cdHNjYWxlIDogMTAwLFxuXHR3aWR0aF9jYW52YXMgOiA3MDAsXG5cdGhlaWdodF9jYW52YXMgOiA0MDAsXG5cdGNhbnZhcyA6IG51bGwsXG5cdGNvbnRleHQgOiBudWxsLFxuXHR0aHVtYm5haWwgOiBudWxsLFxuXHR0aXRsZV9wcm9qZWN0IDogJ25vd3kgcHJvamVrdCcsXG5cblx0Y29udGV4dF94IDogMCwgLy9vYmVjbmEgcG96eWNqYSBjb250ZXh0dSB4XG5cdGNvbnRleHRfeSA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeVxuXHRjb250ZXh0X25ld194IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X25ld195IDogMCwgLy9ub3dhIHBvenljamEgY29udGV4dHUgeVxuXG5cdG9mZnNldF9sZWZ0IDogbnVsbCxcblx0b2Zmc2V0X3RvcCA6IG51bGwsXG5cdGFjdGl2ZV9yb3cgOiBudWxsLCAvL2xpY3piYSBha3R5d255Y2ggd2llcnN6eSBpIGtvbHVtblxuXHRhY3RpdmVfY29sdW1uIDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblxuXHR0aHVtYm5haWwgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5fY2FudmFzXCIpO1xuXHRcdHZhciBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpO1xuXHRcdGNvbnNvbGUubG9nKGRhdGFVUkwpO1xuXHR9LFxuXG5cdC8vcnlzdWplbXkgY2FudmFzIHplIHpkasSZY2llbVxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRpZiAoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpICBpbWFnZS5kcmF3KCk7XG5cdH0sXG5cblx0ZHJhd190aHVtbmFpbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMudGh1bWJuYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1ibmFpbF9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXHRcdHBvaW50ZXJzLmRyYXcoKTtcblxuXHRcdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcblx0XHRjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHR9LFxuXG5cdC8vcmVzZXR1amVteSB0xYJvIHpkasSZY2lhXG5cdHJlc2V0IDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblx0fSxcblxuXHQvLyBjennFm2NpbXkgY2HFgmUgemRqxJljaWUgbmEgY2FudmFzaWVcblx0Y2xlYXIgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29udGV4dC5jbGVhclJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdFx0Ly90aGlzLmNvbnRleHQuZmlsbFJlY3QgKCAwLCAwLCB0aGlzLndpZHRoX2NhbnZhcywgdGhpcy5oZWlnaHRfY2FudmFzICk7XG5cdH0sXG5cblx0cmVzaXplX3dpZHRoIDogZnVuY3Rpb24obmV3X3dpZHRoKXtcblx0XHR0aGlzLndpZHRoX2NhbnZhcyA9IG5ld193aWR0aDtcblx0XHQkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsdGhpcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiB0aGlzLndpZHRoX2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0dGhpcy5zY2FsZSA9IDEwMDtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwodGhpcy5zY2FsZSArICclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7XG5cdH0sXG5cblx0cmVzaXplX2hlaWdodCA6IGZ1bmN0aW9uKG5ld19oZWlnaHQpe1xuXHRcdHRoaXMuaGVpZ2h0X2NhbnZhcyA9IG5ld19oZWlnaHQ7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignaGVpZ2h0Jyx0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnaGVpZ2h0JzogdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUrJyUnKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTsgLy8gYWt0dWFsaXp1amVteSBkYW5lIG9kbm/Fm25pZSByb3ptaWFyw7N3IGNhbnZhc2EgdyBtZW51IHUgZ8Ozcnlcblx0XHQvL3RoaXMuZHJhdygpOyAvL3J5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdH0sXG5cblx0c2V0X2RlZmF1bHQgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjYW52YXNfYm94ICNyaWdodF9yZXNpemUsICNjYW52YXNfYm94ICNib3R0b21fcmVzaXplJykuZmFkZUluKDUwMCk7XG5cdFx0aWYodGhpcy5tb3ZlX2ltYWdlKSAkKCcjY2FudmFzX2JveCAjaW1hZ2VfcmVzaXplJykuZmFkZUluKDApO1xuXG5cdFx0Y2FudmFzLnNjYWxlID0gMTAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3ggPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSAwO1xuXHRcdGNhbnZhcy5jb250ZXh0LnNjYWxlKCBjYW52YXMuc2NhbGUgLyAxMDAgLCBjYW52YXMuc2NhbGUgLyAxMDAgKTtcblxuXHRcdHZhciBuZXdfd2lkdGggPSBjYW52YXMud2lkdGhfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdHZhciBuZXdfaGVpZ2h0ID0gY2FudmFzLmhlaWdodF9jYW52YXMgKiAoY2FudmFzLnNjYWxlLzEwMCk7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cih7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JzogbmV3X2hlaWdodCArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBuZXdfd2lkdGggKyAncHgnLCdoZWlnaHQnIDogbmV3X2hlaWdodCArICdweCd9KTtcblxuXHRcdGNhbnZhcy5yZXNldCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LnRyYW5zbGF0ZSggKCBjYW52YXMuY29udGV4dF94IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSwoIGNhbnZhcy5jb250ZXh0X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGthdGVnb3JpaSBkb2RhbmllIC8gYWt0dWFsaXphY2phIC8gdXN1bmnEmWNpZSAvIHBva2F6YW5pZSBrYXRlZ29yaWlcbnZhciBjYXRlZ29yaWVzID0ge1xuXHRjYXRlZ29yeSA6IG5ldyBBcnJheShbJ3B1c3R5JywnIzgwODA4MCddKSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lID0gQXJyYXkoJCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCksJyNmZjAwMDAnKTtcblx0XHQkKCcjY2F0ZWdvcnlfYm94IGlucHV0W25hbWU9XCJhZGRfY2F0ZWdvcnlcIl0nKS52YWwoJycpO1xuXG5cdFx0dGhpcy5jYXRlZ29yeS5wdXNoKG5hbWUpO1xuXHRcdG1lbnVfdG9wLmNhdGVnb3J5ID0gKHRoaXMuY2F0ZWdvcnkubGVuZ3RoLTEpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0dXBkYXRlIDogZnVuY3Rpb24oaW5kZXgsbmFtZSl7XG5cdFx0dGhpcy5jYXRlZ29yeVtpbmRleF1bMF0gPSBuYW1lO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cdH0sXG5cblx0Ly9wbyB3eWJyYW5pdSBvZHBvd2llZG5pZWoga29sdW1ueSBrYXRlcm9naWkgaSB3YXJ0b8WbY2kgYWt0dWFsaXp1amVteSBrb2xvciBrYXRlZ29yaWkgbmEgcG9kc3Rhd2llIGV4Y2VsYVxuXHRjb2xvcl9mcm9tX2V4Y2VsIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vbW/FvGxpd2EgYWt0dWFsaXphY2phIGplZHluaWUgdyBwcnp5cGFka3Ugd3licmFuaWEga29ua3JldG5laiBrb2x1bW55IHdhcnRvxZtjaSBpIGthdGVnb3JpaSB3IGV4Y2VsdVxuXHRcdGlmKChjcnVkLm1hcF9qc29uLmxlbmd0aCA+IDApICYmIChleGNlbC5kYXRhLmxlbmd0aCA+IDApICYmIChsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpICYmIChsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gIT0gLTEpKXtcblxuXHRcdFx0Ly91c3RhbGFteSBjbyBpbGUgem1pZW5pYW15IGtvbG9yIG5hIGtvbGVqbnkgXG5cdFx0XHR2YXIgY29sb3JfY291bnQgPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5sZW5ndGggLSAxIC8vaWxvc2Mga29sb3LDs3dcblx0XHRcdHZhciBkaWZmcmVudCA9IE1hdGguYWJzKCBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdIC0gbGF5ZXJzLm1heF92YWx1ZVtsYXllcnMuYWN0aXZlXSApIC8gY29sb3JfY291bnQ7XG5cblxuXHRcdFx0Ly9kd2llIHDEmXRsZSBvZHBvd2llZHppYWxuZSB6YSBwb3LDs3dueXdhbmllIGthdGVnb3JpaSB6IGV4Y2VsYSB6IGthdGVyb2dpYW1pIGt0w7NyZSBtYW15IHcgYmF6aWUgZGFueWNoXG5cdFx0XHRmb3IgKHZhciBpID0gMSwgaV9tYXggPSB0aGlzLmNhdGVnb3J5Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRmb3IgKHZhciBpX2V4ID0gMCwgaV9leF9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaV9leCA8IGlfZXhfbWF4OyBpX2V4Kyspe1xuXHRcdFx0XHRcdFxuXG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZygnY29tcGF0ZSBjYXRlZ29yeTogJyxpLGlfZXgsIHRoaXMuY2F0ZWdvcnlbaV1bMF0sIGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSk7XG5cblx0XHRcdFx0XHRpZiggdGhpcy5jYXRlZ29yeVtpXVswXSA9PSBleGNlbC5kYXRhW2lfZXhdW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0pe1xuXHRcdFxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ2NhdGVnb3J5dCcsaV9leCwgdGhpcy5jYXRlZ29yeVtpXVswXSxleGNlbC5kYXRhW2lfZXhdW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0dmFyIGNvbG9yX2kgPSBNYXRoLmZsb29yKChwYXJzZUZsb2F0KGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdXSktcGFyc2VGbG9hdChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdKSkgLyBkaWZmcmVudCk7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGNvbG9yX2ksIChwYXJzZUZsb2F0KGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdXSktcGFyc2VGbG9hdChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdKSksIGRpZmZyZW50ICk7XG5cdFx0XHRcdFx0XHR0aGlzLmNhdGVnb3J5W2ldWzFdID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1bY29sb3JfaV07XG5cdFx0XHRcdFx0XHQvL3ByemVyeXdhbXkgcMSZdGzEmSAodGFrIGFieSBuaWUgdHJ6ZWJhIGJ5xYJvIG5pZXBvdHJ6ZWJuaWUgc3ByYXdkemHEhyBkb2RhdGtvd3ljaCByZWtvcmTDs3cgdyB3eWJyYW5laiBrYXRlZ29yaWkpXG5cdFx0XHRcdFx0XHRpX2V4ID0gaV9leF9tYXg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL3BvIHpha3R1YWxpem93YW5pdSBrb2xvcsOzdyB3IGthdGVnb3JpYWNoIHJ5c3VqZW15IG5hIG5vd28gY2FudmFzXG5cdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0bGVnZW5kcy51cGRhdGUoKTtcblx0XHR9XG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oaWQpe1xuXHRcdHZhciB0aCA9IHRoaXM7XG5cblx0XHQkLmVhY2godGhpcy5jYXRlZ29yeSxmdW5jdGlvbihpbmRleCx2YWx1ZSl7XG5cdFx0XHRpZihpbmRleCA+PSBpZCl7XG5cdFx0XHRcdHRoLmNhdGVnb3J5W2luZGV4XSA9IHRoLmNhdGVnb3J5W2luZGV4KzFdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Zm9yKHZhciByb3cgPSAwOyByb3cgPCBwb2ludGVycy5wb2ludGVycy5sZW5ndGg7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgcG9pbnRlcnMucG9pbnRlcnNbcm93XS5sZW5ndGg7IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IDA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPiBpZCl7XG5cdFx0XHRcdFx0cG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gcGFyc2VJbnQocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dKSAtIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuY2F0ZWdvcnkucG9wKCk7XG5cdFx0dGhpcy5zaG93X2xpc3QoKTtcblxuXHRcdC8vcnlzdWplbXkgbmEgbm93xIUgY2FudmFzXG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRzaG93X2xpc3QgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGFkZF9jYXRlZ29yeSA9IFwiPHRhYmxlPlwiO1xuXHRcdC8vdmFyIGFkZF9zZWxlY3QgPSc8b3B0aW9uIG5hbWU9XCIwXCI+cHVzdHk8L29wdGlvbj4nO1xuXHRcdHZhciBhZGRfc2VsZWN0ID0gJyc7XG5cblx0XHRmb3IodmFyIGkgPSB0aGlzLmNhdGVnb3J5Lmxlbmd0aDsgaSA+IDE7IGktLSl7XG5cdFx0XHRhZGRfY2F0ZWdvcnkgKz0gJzx0cj48dGQ+PHNwYW4+JysoaS0xKSsnPC9zcGFuPjwvdGQ+PHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJjYXRlZ29yeV9uYW1lXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIiB2YWx1ZT1cIicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJ1wiIC8+PC90ZD48dGQ+PGRpdiBjbGFzcz1cImNvbG9ycGlja2VyX2JveFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjonK3RoaXMuY2F0ZWdvcnlbKGktMSldWzFdKydcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPjwvZGl2PjwvdGQ+PHRkPjxidXR0b24gY2xhc3M9XCJyZW1vdmVcIiBpZF9jYXRlZ29yeT1cIicrKGktMSkrJ1wiPnVzdW48L2J1dHRvbj48L3RkPjwvdHI+Jztcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gbmFtZT1cIicrKGktMSkrJ1wiPicrdGhpcy5jYXRlZ29yeVsoaS0xKV1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXHRcdGlmKG1lbnVfdG9wLmNhdGVnb3J5ID09IDApe1xuXHRcdFx0YWRkX3NlbGVjdCArPSAnPG9wdGlvbiBzZWxlY3RlZCBuYW1lPVwiMFwiPicrdGhpcy5jYXRlZ29yeVswXVswXSsnPC9vcHRpb24+Jztcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gbmFtZT1cIjBcIj4nK3RoaXMuY2F0ZWdvcnlbMF1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXG5cblx0XHRhZGRfY2F0ZWdvcnkgKz0gXCI8L3RhYmxlPlwiO1xuXG5cdFx0JCgnI2NhdGVnb3J5X2JveCAjbGlzdCcpLmh0bWwoYWRkX2NhdGVnb3J5KTtcblx0XHQkKCdzZWxlY3QjY2hhbmdlX2NhdGVnb3J5JykuaHRtbChhZGRfc2VsZWN0KTtcblxuXHRcdGNvbG9ycGlja2VyLmFkZCgpO1xuXHR9XG59XG4iLCJjbG91ZCA9IHtcblxuXHRzZXRfdGV4dGFyZWEgOiBmdW5jdGlvbigpe1xuXHRcdCQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLnZhbCggbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdICk7XG5cdH0sXG5cblx0Z2V0X3RleHRhcmVhIDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciB0ZXh0X3RtcCA9ICQob2JqKS52YWwoKTtcblxuXHRcdGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSA9IHRleHRfdG1wO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0dGV4dF90bXAgPSB0ZXh0X3RtcC5yZXBsYWNlKCckJytleGNlbC5kYXRhWzBdW2ldLCdcIitleGNlbC5kYXRhW3RtcF9yb3ddWycraSsnXVwiKycpO1xuXHRcdH1cblxuXHRcdGxheWVycy5jbG91ZF9wYXJzZXJbbGF5ZXJzLmFjdGl2ZV0gPSAnXCInK3RleHRfdG1wKydcIic7XG5cdH0sXG5cblx0Ly91c3Rhd2lhbXkgcG9wcmF3bsSFIHBvenljasSZIGR5bWthXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF9sZWZ0O1xuXHRcdHZhciB0b3AgPSBtb3VzZS50b3AgLSBvbl9jYXRlZ29yeS5jYW52YXNfb2Zmc2V0X3RvcDtcblxuXHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmNzcyh7dG9wOnBhcnNlSW50KHRvcCAtICQoXCIjY2FudmFzX2Nsb3VkXCIpLmhlaWdodCgpLTMwKSsncHgnLGxlZnQ6bGVmdCsncHgnfSk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHd5xZt3aWV0bGVuaWUgZHlta2EgeiBvZHBvd2llZG5pxIUgemF3YXJ0b8WbY2nEhVxuXHR1cGRhdGVfdGV4dCA6IGZ1bmN0aW9uKG5hbWUpe1xuXG5cdFx0aWYobmFtZSAhPSBcIm51bGxcIil7XG5cblx0XHRcdHZhciB0bXBfcm93ID0gbnVsbDtcblx0XHRcdHZhciBmaW5kID0gMDtcblx0XHRcdGZvciggdmFyIGlfcm93ID0gMCwgaV9yb3dfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGlfcm93IDwgaV9yb3dfbWF4OyBpX3JvdysrICl7XG5cdFx0XHRcdGlmKG5hbWUgPT0gZXhjZWwuZGF0YVtpX3Jvd11bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dGhpcy5zZXRfcG9zaXRpb24oKTtcblx0XHRcdFx0XHR2YXIgdGV4dF90bXAgPSBsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV07XG5cblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcdFx0XHR0ZXh0X3RtcCA9IHRleHRfdG1wLnJlcGxhY2UoJyQnK2V4Y2VsLmRhdGFbMF1baV0sZXhjZWwuZGF0YVtpX3Jvd11baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvL2RvcGllcm8gamXFm2xpIGR5bWVrIG1hIG1pZcSHIGpha2HFmyBrb25rcmV0bsSFIHphd2FydG/Fm8SHIHd5xZt3aWV0bGFteSBnb1xuXHRcdFx0XHRcdGlmKHRleHRfdG1wIT1cIlwiKXtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuaHRtbCh0ZXh0X3RtcCk7XG5cdFx0XHRcdFx0XHRmaW5kID0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9qZcWbbGkgbmllIHpuYWxlemlvbm8gb2Rwb3dpZWRuaWVqIGthdGVnb3JpaVxuXHRcdFx0aWYgKCFmaW5kKSB7IFxuXHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTtcblx0XHR9XG5cdH1cblxufVxuXG5cbiQoJyNjbG91ZCAuY2xvdWRfdGV4dCcpLmtleXVwKGZ1bmN0aW9uKCl7XG5cbmNsb3VkLmdldF90ZXh0YXJlYSh0aGlzKTtcblxufSkgOyIsIi8vc2FtYSBuYXp3YSB3aWVsZSB0xYJ1bWFjenkgcG8gcHJvc3R1IGNvbG9ycGlja2VyXG52YXIgY29sb3JwaWNrZXIgPSB7XG5cblx0Y2xpY2tfaWQgOiBudWxsLFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5yZW1vdmUoKTtcblx0XHQkKCcuY29sb3JwaWNrZXJfYm94JykuQ29sb3JQaWNrZXIoe1xuXHRcdFx0Y29sb3I6ICcjZmYwMDAwJyxcblx0XHRcdG9uU2hvdzogZnVuY3Rpb24gKGNvbHBrcikge1xuXHRcdFx0XHRpZigkKGNvbHBrcikuY3NzKCdkaXNwbGF5Jyk9PSdub25lJyl7XG5cdFx0XHRcdFx0JChjb2xwa3IpLmZhZGVJbigyMDApO1xuXHRcdFx0XHRcdGNvbG9ycGlja2VyLmNsaWNrX2lkID0gJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRvbkhpZGU6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0JChjb2xwa3IpLmZhZGVPdXQoMjAwKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAoaHNiLCBoZXgsIHJnYikge1xuXHRcdFx0XHQkKCcuY29sb3JwaWNrZXJfYm94W2lkX2NhdGVnb3J5PVwiJytjb2xvcnBpY2tlci5jbGlja19pZCsnXCJdJykuY3NzKCdiYWNrZ3JvdW5kQ29sb3InLCAnIycgKyBoZXgpO1xuXHRcdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5W2NvbG9ycGlja2VyLmNsaWNrX2lkXVsxXSA9ICcjJyArIGhleDtcblx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbigpe1xuXHRcdCQoJy5jb2xvcnBpY2tlcicpLnJlbW92ZSgpO1xuXHR9XG59XG4iLCIvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsbmEgemEgdHdvcnplbmllIHphcGlzeXdhbmllIGkgYWt0dWFsaXphY2plIGRhbnljaCBkb3R5Y3rEhcSHY3loIG1hcHlcbnZhciBjcnVkID0ge1xuXG5cdG1hcF9qc29uIDogQXJyYXkoKSwgLy9nxYLDs3duYSB6bWllbm5hIHByemVjaG93dWrEhWNhIHdzenlzdGtpZSBkYW5lXG5cdHByb2plY3RfaGFzaCA6IG51bGwsIC8vZ8WCw7N3bnkgaGFzaCBkb3R5Y3rEhWN5IG5hc3plZ28gcHJvamVrdHVcblxuXHRzZWxlY3RfbWFwIDogZnVuY3Rpb24oIGlkX21hcCApe1xuXG5cdFx0Ly9qZcWbbGkgdXJ1Y2hvbWlteVxuXHRcdGlmIChpZF9tYXAgPT0gJ25ld19tYXAnKSB7IFxuXHRcdFx0dGhpcy5jcmVhdGVfbWFwKCkgXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm1hcF9oYXNoID0gaWRfbWFwO1xuXHRcdFx0dGhpcy5nZXRfbWFwKCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0Ly9wb2JpZXJhbXkgZGFuZSB6IHBvcm9qZWt0dSBpIHphcGlzdWplbXkgamUgZG8ganNvbi1hXG5cdGdldF9kYXRhIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vcG9iaWVyYW15IGRhbmUgZG90eWN6xIVjZSBtYXB5IChjYW52YXNhKVxuXG5cdFx0Ly96ZXJ1amVteSBuYSBub3dvIGNhxYLEhSB0YWJsaWPEmSBwb2ludGVyw7N3XG5cdFx0dGhpcy5tYXBfanNvbiA9IEFycmF5KCk7XG5cblx0XHQvLyBkYXRhW3hdID0gem1pZW5uZSBwb2RzdGF3b3dlIGRvdHljesSFY2UgbWFweVxuXHRcdHRoaXMubWFwX2pzb25bMF0gPSBBcnJheSgpO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMF0gPSBjYW52YXMuaGVpZ2h0X2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzFdID0gY2FudmFzLndpZHRoX2NhbnZhcztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzJdID0gcG9pbnRlcnMucGFkZGluZ194O1xuXHRcdHRoaXMubWFwX2pzb25bMF1bM10gPSBwb2ludGVycy5wYWRkaW5nX3k7XG5cdFx0dGhpcy5tYXBfanNvblswXVs0XSA9IHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG87XG5cdFx0dGhpcy5tYXBfanNvblswXVs1XSA9IHBvaW50ZXJzLnNpemVfcG9pbnRlcjtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzZdID0gcG9pbnRlcnMubWFpbl9raW5kO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bN10gPSBjYW52YXMudGl0bGVfcHJvamVjdDtcblxuXHRcdC8vIGRhdGFbMV0gPSB0YWJsaWNhIHB1bmt0w7N3IChwb2ludGVycy5wb2ludGVycykgW3dpZXJzel1ba29sdW1uYV0gPSBcIm5vbmVcIiB8fCAobnVtZXIga2F0ZWdvcmlpKVxuXHRcdHRoaXMubWFwX2pzb25bMV0gPSBwb2ludGVycy5wb2ludGVycztcblxuXHRcdC8vIGRhdGFbMl0gPSB0YWJsaWNhIGthdGVnb3JpaVxuXHRcdHRoaXMubWFwX2pzb25bMl0gPSBjYXRlZ29yaWVzLmNhdGVnb3J5O1xuXG5cdFx0Ly9kYXRhWzNdID0gdGFibGljYSB3em9yY2EgKHpkasSZY2lhIHcgdGxlIGRvIG9kcnlzb3dhbmlhKVxuXHRcdHRoaXMubWFwX2pzb25bM10gPSBBcnJheSgpO1xuXG5cdFx0aWYoaW1hZ2Uub2JqKXtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMF0gPSBpbWFnZS5vYmouc3JjO1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVsxXSA9IGltYWdlLng7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzJdID0gaW1hZ2UueTtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bM10gPSBpbWFnZS53aWR0aDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bNF0gPSBpbWFnZS5oZWlnaHQ7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzVdID0gaW1hZ2UuYWxwaGE7XG5cdFx0fVxuXG5cdFx0Ly9wb2JpZXJhbXkgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3TDs3cgKGxheWVycylcblx0XHQvL3R3b3J6eW15IG9iaWVrdCB3YXJzdHd5IHphd2llcmFqxIVjeSB3c3p5c3RraWUgZGFuZSBkb3R5Y3rEhWNlIHByb2pla3R1XG5cdFx0dGhpcy5sYXllcnMgPSB7fTtcblx0XHR0aGlzLmxheWVycy5wYWxldHNfYWN0aXZlID0gbGF5ZXJzLnBhbGV0c19hY3RpdmU7XG5cdFx0dGhpcy5sYXllcnMuY2F0ZWdvcnkgPSBsYXllcnMuY2F0ZWdvcnk7XG5cdFx0dGhpcy5sYXllcnMudmFsdWUgPSBsYXllcnMudmFsdWU7XG5cdFx0dGhpcy5sYXllcnMuY29sb3JzX3BvcyA9IGxheWVycy5jb2xvcnNfcG9zO1xuXHRcdHRoaXMubGF5ZXJzLmNvbG9yc19hY3RpdmUgPSBsYXllcnMuY29sb3JzX2FjdGl2ZTtcblx0XHR0aGlzLmxheWVycy5taW5fdmFsaWUgPSBsYXllcnMubWluX3ZhbGllO1xuXHRcdHRoaXMubGF5ZXJzLm1heF92YWx1ZSA9IGxheWVycy5tYXhfdmFsdWU7XG5cdFx0dGhpcy5sYXllcnMuY2xvdWQgPSBsYXllcnMuY2xvdWQ7XG5cdFx0dGhpcy5sYXllcnMuY2xvdWRfcGFyc2VyID0gbGF5ZXJzLmNsb3VkX3BhcnNlcjtcblx0XHR0aGlzLmxheWVycy5sZWdlbmRzID0gbGF5ZXJzLmxlZ2VuZHM7XG5cdFx0dGhpcy5sYXllcnMubGFiZWxzID0gbGF5ZXJzLmxhYmVscztcblx0XHRcblx0XHQvL3R3b3J6eW15IG9iaWVrdCBleGNlbGFcblxuXHRcdHRoaXMuZXhjZWwgPSBleGNlbC5kYXRhO1xuXG5cblx0XHQvL2tvbndlcnR1amVteSBuYXN6YSB0YWJsaWNlIG5hIGpzb25cblxuXHR9LFxuXG5cdC8vcG9icmFuaWUgbWFweSB6IGJhenkgZGFueWNoXG5cdGdldF9tYXAgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuYWpheCh7XG5cdFx0XHQgIHVybDogJy9hcGkvbWFwcy8nICsgdGgubWFwX2hhc2gsXG5cdFx0ICBcdHR5cGU6IFwiR0VUXCIsXG5cdFx0ICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdFx0fSkuZG9uZShmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdFx0Y29uc29sZS5sb2coIGRhdGEuZGF0YVswXSApO1xuXG5cdFx0XHQvL3BvIHphcGlzYW5pdSBkYW55Y2ggZG8gYmF6eSBha3R1YWxpenVqZW15IGlkICh3IHByenlwYWRrdSBqZcWbbGkgaXN0bmllamUgbmFkcGlzdWplbXkgamUpXG5cdFx0XHR2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEuZGF0YVswXS5tYXBfanNvbik7XG5cdFx0XHR0aC5tYXBfanNvbiA9IHJlc3BvbnNlO1xuXG5cdFx0XHQvL3BvYmllcmFteSBpIHdjenl0dWplbXkgZGFuZSBvIGNhbnZhc2llIGRvIG9iaWVrdHVcblx0XHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcmVzcG9uc2VbMF1bMF07XG5cdFx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gcmVzcG9uc2VbMF1bMV07XG5cdFx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSByZXNwb25zZVswXVsyXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IHJlc3BvbnNlWzBdWzNdO1xuXHRcdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IHJlc3BvbnNlWzBdWzRdO1xuXHRcdFx0cG9pbnRlcnMuc2l6ZV9wb2ludGVyID0gcmVzcG9uc2VbMF1bNV07XG5cdFx0XHRwb2ludGVycy5tYWluX2tpbmQgPSByZXNwb25zZVswXVs2XTtcblx0XHRcdGNhbnZhcy50aXRsZV9wcm9qZWN0ID0gcmVzcG9uc2VbMF1bN107XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCByZXNwb25zZVswXVsyXSApO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzNdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVfcG9pbnRlclwiXScpLnZhbCggcmVzcG9uc2VbMF1bNV0gKTtcblx0XHRcdCQoJ2lucHV0W25hbWU9XCJ0aXRsZV9wcm9qZWN0XCJdJykudmFsKCByZXNwb25zZVswXVs3XSApO1xuXG5cdFx0XHRpZiggcmVzcG9uc2VbMF1bNF0gKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR9XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0XHRwb2ludGVycy5raW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGtpbmQpe1xuXG5cdFx0XHRcdGlmKGtpbmQgPT0gcmVzcG9uc2VbMF1bNl0pe1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBzZWxlY3RlZD1cInNlbGVjdGVkXCIgbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8gcG9pbnRlcmFjaFxuXHRcdFx0cG9pbnRlcnMucG9pbnRlcnMgPSByZXNwb25zZVsxXTtcblxuXHRcdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gcmVzcG9uc2VbMl07XG5cblx0XHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0XHRpZiggcmVzcG9uc2VbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0XHRpbWFnZS5vYmouc3JjID0gcmVzcG9uc2VbM11bMF07XG5cdFx0XHRcdGltYWdlLnggPSBwYXJzZUludCggcmVzcG9uc2VbM11bMV0gKTtcblx0XHRcdFx0aW1hZ2UueSA9IHBhcnNlSW50KCByZXNwb25zZVszXVsyXSApO1xuXHRcdFx0XHRpbWFnZS53aWR0aCA9IHBhcnNlSW50KCByZXNwb25zZVszXVszXSApO1xuXHRcdFx0XHRpbWFnZS5oZWlnaHQgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNF0gKTtcblx0XHRcdFx0aW1hZ2UuYWxwaGEgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNV0gKTtcblxuXHRcdFx0XHQvL3phem5hY3plbmllIG9kcG93aWVkbmllZ28gc2VsZWN0YSBhbHBoYSB3IG1lbnUgdG9wXG5cdFx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJywgY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0Y2F0ZWdvcmllcy5zaG93X2xpc3QoKTtcblx0XHRcdGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8vdHdvcnp5bXkgbm93xIUgcHJvamVrdFxuXHRjcmVhdGVfcHJvamVjdCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMuZ2V0X2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9qc29uIDogdGgubWFwX2pzb24sXG5cdFx0XHRsYXllcnMgOiB0aC5sYXllcnMsXG5cdFx0XHRleGNlbCA6IHRoLmV4Y2VsXG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0dXJsOiBcImFwaS9wcm9qZWN0c1wiLFxuXHRcdFx0ZGF0YTogSlNPTi5zcmluZ2lmeShkYXRhKSxcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0dGgubWFwX2hhc2ggPSByZXNwb25zZS5oYXNoX21hcDtcblx0XHRcdFx0YWxlcnQoJ3phcGlzYW5vIG5vd3kgcHJvamVrdCcpO1xuXHRcdFx0XHQvL21lbnVfdG9wLmdldF9tYXBzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL2FrdHVhbGl6dWplbXkgbWFwxJlcblx0dXBkYXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMuZ2V0X2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9jYW52YXMuZHJhd190aHVtbmFpbCgpO1xuXHRcdC8vbmV3X2ltYWdlID0gaW1hZ2UuZGF0YVVSSXRvQmxvYiggY2FudmFzLnRodW1ibmFpbC50b0RhdGFVUkwoKSApO1xuXHQvKlxuXHRcdHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9oYXNoXCIsIHRoLm1hcF9oYXNoICk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX25hbWVcIiwgY2FudmFzLnRpdGxlX3Byb2plY3QpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9qc29uXCIsIHRoLm1hcF9qc29uKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfaW1hZ2VcIiwgbmV3X2ltYWdlKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJfbWV0aG9kXCIsICdQVVQnKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJfdG9rZW5cIiwgY3NyZl90b2tlbik7XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IGJhc2ljX3VybCArIFwiL21hcC9cIit0aC5tYXBfaGFzaCxcblx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0Y2FjaGU6IGZhbHNlLFxuXHRcdFx0Y29udGVudFR5cGU6IGZhbHNlLFxuXHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGFsZXJ0KCd6YWt0dWFsaXpvd2FubyBtYXDEmScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHQqL1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfaGFzaDogdGgubWFwX2hhc2gsXG5cdFx0XHRtYXBfanNvbjogdGgubWFwX2pzb25cblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL21hcHNcIixcblx0XHRcdC8vZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0dHlwZTogJ1BVVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGFsZXJ0KCd6YWt0dWFsaXpvd2FubyBtYXDEmScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0Ly91c3V3YW15IG1hcMSZIHogYmF6eSBkYW55Y2hcblx0ZGVsZXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9zcHJhd2R6YW15IGN6eSBtYXBhIGRvIHVzdW5pxJljaWEgcG9zaWFkYSBzd29qZSBpZFxuXHRcdGlmKHRoaXMubWFwX2hhc2ggIT0gbnVsbCl7XG5cdFx0XHQkLnBvc3QoIGJhc2ljX3VybCArIFwiL21hcC9cIiArIHRoLm1hcF9oYXNoLCB7XG5cdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZV9tYXAnLFxuXHRcdFx0XHRfbWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdFx0X3Rva2VuOiBjc3JmX3Rva2VuLFxuXHRcdFx0XHRtYXBfaGFzaDogdGgubWFwX2hhc2hcblx0XHRcdH0pXG5cdFx0XHQuZG9uZShmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcdHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPSBcIk9LXCIpIHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZShiYXNpY191cmwgK1wiL21hcFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB1c3V3YW5pYSBtYXB5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWxlcnQoJ2JyYWsgaGFzaGEgLSBtYXBhIG5pZSBqZXN0IHphcGlzYW5hJyk7XG5cdFx0fVxuXHR9XG59XG4iLCJ2YXIgZXhjZWwgPSB7XG5cdFxuXHRhbHBoYSA6IFsnYScsJ2InLCdjJywnZCcsJ2UnLCdmJywnZycsJ2gnLCdpJywnaicsJ2snLCdsJywnbScsJ24nLCdvJywncCcsJ3EnLCdyJywncycsJ3QnLCd1JywndycsJ3gnLCd5JywneiddLFxuXHRkYXRhIDogW1tcIndvamV3b2R6dHdvXCIsXCJ3YXJ0b3NjMVwiLFwid2FydG9zYzJcIixcIndhcnRvc2MzXCIsXCJ3YXJ0b3NjMVwiLFwid2FydG9zYzJcIixcIndhcnRvc2MzXCJdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2LDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wia3Jvd29kcnphXCIsMS40LDIwLDZdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJrcm93b2RyemFcIiwxLjQsMjAsNl0sW1wic3JvZG1pZXNjaWVcIiwxLjYsNTAsNDNdLFtcIm5vd2FfaHV0YVwiLDIsMzQsM10sW1wicG9kZ29yemVcIiwxLDMyLDZdLFtcIm5vd2FfaHV0YTFcIiwyLDM0LDNdXSxcblx0bWluX3JvdyA6IDEwLFxuXHRtaW5fY29sIDogNixcblxuXHRpbml0IDogZnVuY3Rpb24oKXtcblxuXHRcdC8vZG9kYW5pZSBldmVudMOzdyBwcnp5IGtsaWtuacSZY2l1IGV4Y2VsYVxuXHRcdCQoJyNleGNlbF9ib3ggYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXsgJCgnI2V4Y2VsX2JveCBpbnB1dCcpLmNsaWNrKCk7IH0pO1xuXHRcdCQoJyNleGNlbF9ib3ggaW5wdXQnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgZXhjZWwuc2VuZF9maWxlKCk7IH0pO1xuXG5cdFx0Ly9mdW5rY2phIHR5bWN6YXNvd2EgZG8gbmFyeXNvd2FuaWEgdGFiZWxraSBleGNlbGFcblx0XHR0aGlzLmRyYXcoKTtcblx0fSxcblxuXHQvL2Z1bmtjamEgb2Rwb3dpZWR6aWFsYSB6YSBwb3ByYXduZSBwb2RwaXNhbmllIG9zaVxuXHRkcmF3IDogZnVuY3Rpb24oKXtcblxuXHRcdGFkZF9odG1sID0gJyc7XG5cblx0XHQvL2plxZtsaSBpbG/Fm2Mgd2llcnN6eSBqZXN0IHdpxJlrc3phIGFrdHVhbGl6dWplbXkgd2llbGtvxZvEhyB0YWJsaWN5XG5cdFx0aWYoZXhjZWwuZGF0YS5sZW5ndGggPiBleGNlbC5taW5fcm93KSBleGNlbC5taW5fcm93ID0gZXhjZWwuZGF0YS5sZW5ndGg7XG5cdFx0aWYoZXhjZWwuZGF0YVswXS5sZW5ndGggPiBleGNlbC5taW5fY29sKSBleGNlbC5taW5fY29sID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7XG5cblx0XHQvL3JlbmRlcnVqZW15IGNhxYLEhSB0YWJsaWPEmSBleGNlbFxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRoaXMubWluX3JvdzsgaSsrKXtcblx0XHRcdGFkZF9odG1sICs9ICc8ZGl2IGNsYXNzPVwidHJcIj4nO1xuXHRcdFx0Zm9yKHZhciBqID0gMDtqIDwgdGhpcy5taW5fY29sOyBqKyspe1xuXG5cdFx0XHRcdGlmKChqID09IDApICYmIChpID4gMCkpe1xuXHRcdFx0XHRcdGFkZF9odG1sICs9ICc8ZGl2IGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIiA+JysgaSArJzwvZGl2Pic7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRpZih0eXBlb2YoZXhjZWwuZGF0YVtpXVsoai0xKV0pICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPGRpdiBjbGFzcz1cInRkXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPicrZXhjZWwuZGF0YVtpXVsoai0xKV0rJzwvZGl2Pic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPGRpdiBjbGFzcz1cInRkXCIgIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPjwvZGl2Pic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGV4Y2VsLmRhdGFbaV1bKGorMSldKTtcblx0XHRcdFx0XHR9Y2F0Y2goZXJyb3Ipe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0ZFwiIHJvdz1cIicgKyBpICsgJ1wiIGNvbD1cIicgKyBqICsgJ1wiPjwvZGl2Pic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcdGFkZF9odG1sICs9ICc8L2Rpdj4nO1xuXHRcdH1cblxuXHRcdCQoJyNleGNlbF9ib3ggLnRhYmxlJykuaHRtbCggYWRkX2h0bWwgKTtcblxuXHRcdC8vZG9kYWplbXkgbW/FvGxpd2/Fm8SHIGVkeWNqaSBleGNlbGFcblx0XHQkKCcjZXhjZWxfYm94IC50YWJsZSAudGQnKS5ibHVyKGZ1bmN0aW9uKCl7IGV4Y2VsLmVkaXQodGhpcyk7IH0pO1xuXG5cdH0sXG5cblx0Ly9mdW5rY2phIHVtb8W8bGl3aWFqxIVjYSBlZHljamUgemF3YXJ0b8WbY2kga29tw7Nya2lcblx0ZWRpdCA6IGZ1bmN0aW9uKG9iail7XHRcblx0XHRleGNlbC5kYXRhWyQob2JqKS5hdHRyKCdyb3cnKV1bKCQob2JqKS5hdHRyKCdjb2wnKS0xKV0gPSAkKG9iaikuaHRtbCgpO1xuXHRcdHBhbGV0cy5wYXJzZV9jb2xvcigpO1xuXHR9LFxuXG5cdC8vcG9iaWVyYW15IHBsaWssIHogaW5wdXRhIGkgd3nFgmFteSBkbyBiYWNrZW5kdSB3IGNlbHUgc3BhcnNvd2FuaWEgYSBuYXN0xJlwbmllIHByenlwaXN1amVteSBkbyB0YWJsaWN5IGkgd3nFm3dpZXRsYW15dyBmb3JtaWUgdGFiZWxza2lcblx0c2VuZF9maWxlIDogZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHZhciBleGNlbF9mb3JtID0gbmV3IEZvcm1EYXRhKCk7IFxuXHRcdGV4Y2VsX2Zvcm0uYXBwZW5kKFwiZXhjZWxfZmlsZVwiLCAkKFwiI2V4Y2VsX2JveCBpbnB1dFwiKVswXS5maWxlc1swXSk7XG5cbiBcdFx0JC5hamF4KCB7XG4gICAgICBcbiAgICAgIHVybDogJy9hcGkvcHJvamVjdHMvZXhjZWxfcGFyc2UnLFxuICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgZGF0YTogZXhjZWxfZm9ybSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZVxuXG4gICAgfSkuZG9uZShmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cbiAgICBcdC8vcG8gd2N6eXRhbml1IHBsaWt1IGV4Y2VsIHByenlwaXN1amVteSBkYW5lIHJ5c3VqZW15IG5hIG5vd28gdGFiZWzEmSBvcmF6IHd5xZt3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5IGtvbG9yw7N3XG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKVxuICAgIFx0ZXhjZWwuZGF0YSA9IHJlc3BvbnNlLmV4Y2VsWzBdLmRhdGE7XG4gICAgXHRleGNlbC5kcmF3KCk7XG4gICAgXHRwYWxldHMuc2hvd19zZWxlY3QoKTtcbiAgICB9KTtcblx0fVxufVxuXG5leGNlbC5pbml0KCk7XG4iLCIvL2Z1bmtjamUgcnlzdWrEhWNlIHBvamVkecWEY3p5IHB1bmt0IChwb2ludGVyKVxudmFyIGZpZ3VyZXMgPSB7XG5cblx0c3F1YXJlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGxSZWN0KHgseSxzaXplLHNpemUpO1xuXHR9LFxuXG5cdGNpcmNsZSA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgc2l6ZSA9IHNpemUgLyAyO1xuXHRcdHZhciBjZW50ZXJfeCA9IHggKyBzaXplO1xuXHRcdHZhciBjZW50ZXJfeSA9IHkgKyBzaXplO1xuXHRcdGNhbnZhcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmFyYyhjZW50ZXJfeCwgY2VudGVyX3ksIHNpemUsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbiAgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgseSthMik7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyLWgpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2ErYTIseSthMi1oKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCtzaXplLHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUtYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EseSthMitoKTtcblx0XHRjYW52YXMuY29udGV4dC5saW5lVG8oeCx5K2EyKTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cdH0sXG5cblx0aGV4YWdvbjIgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0dmFyIGEgPSBzaXplLzQ7XG5cdFx0dmFyIGEyID0gc2l6ZS8yO1xuXHRcdHZhciBoID0gc2l6ZS8yKk1hdGguc3FydCgzKS8yO1xuXG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubW92ZVRvKHgrYTIseSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EpO1xuICBcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyK2gseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5K3NpemUpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthMithKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMi1oLHkrYSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIseSk7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbCgpO1xuXG5cdH1cbn1cbiIsIi8vZnVua2NqZSBnbG9iYWxuZSBrb250ZW5lciBuYSB3c3p5c3RrbyBpIG5pYyA7KVxudmFyIGdsb2JhbCA9IHtcblx0dG9vZ2xlX3BhbmVsICA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGthIGRsYSBtb3ppbGxpXG5cdFxuXHRcdC8vc3ByYXdkemFteSB6IGpha2ltIHBhbmVsZW0gbWFteSBkbyBjenluaWVuaWEgKGN6eSBwb2thenVqxIVjeW0gc2nEmSB6IGxld2VqIGN6eSB6IHByYXdlaiBzdHJvbnkpXG5cdFx0aWYoICBwYXJzZUludCgkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuY3NzKCdsZWZ0JykpID4gMCApe1xuXHRcdFx0Ly9wYW5lbCBqZXN0IHogcHJhd2VqIHN0cm9ueVxuXHRcdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5jc3MoJ3JpZ2h0JykgPT0gJzBweCcgKXtcblx0XHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbLSQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS53aWR0aCgpLTIwLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0ICAgIGVsc2V7XG5cdCAgICBcdCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7cmlnaHQ6IFtcIjBweFwiLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdC8vcGFuZWwgamVzdCB6IGxld2VqIHN0cm9ueVxuXHRcdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5jc3MoJ2xlZnQnKSA9PSAnMHB4JyApe1xuXHRcdFx0XHQkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuYW5pbWF0ZSh7bGVmdDogWy0kKGV2ZW50LnRhcmdldCkucGFyZW50KCkud2lkdGgoKS0yMCxcInN3aW5nXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG5cdCAgICB9XG5cdCAgICBlbHNle1xuXHQgICAgXHQgJChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe2xlZnQ6IFtcIjBweFwiLFwic3dpbmdcIl19LCAxMDAwLCBmdW5jdGlvbigpIHt9KTtcblx0ICAgIH1cblx0XHR9XG5cblx0fVxufVxuIiwiLy9nxYLDs3duZSB6ZGrEmWNpZSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxudmFyIGltYWdlID0ge1xuXHRvYmogOiB1bmRlZmluZWQsXG5cdHggOiBudWxsLFxuXHR5IDogbnVsbCxcblx0d2lkdGggOiBudWxsLFxuXHRoZWlnaHQgOiBudWxsLFxuXHRhbHBoYSA6IDEwLFxuXG5cdGRyYXcgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYS8xMDtcblx0XHRjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5vYmosdGhpcy54LHRoaXMueSx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTtcblxuXHRcdCQoJyNjYW52YXNfYm94ICNpbWFnZV9yZXNpemUnKS5jc3MoeydoZWlnaHQnOnRoaXMuaGVpZ2h0LCd0b3AnOnRoaXMueSsncHgnLCdsZWZ0JzoodGhpcy54K3RoaXMud2lkdGgpKydweCd9KTtcblx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDE7XG5cdH0sXG5cblx0Ly9mdW5rY2phIHBvbW9jbmljemEga29ud2VydHVqxIVjYSBkYXRhVVJJIG5hIHBsaWtcblx0ZGF0YVVSSXRvQmxvYiA6IGZ1bmN0aW9uKGRhdGFVUkkpIHtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihkYXRhVVJJLnNwbGl0KCcsJylbMV0pO1xuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXkucHVzaChiaW5hcnkuY2hhckNvZGVBdChpKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXSwge3R5cGU6ICdpbWFnZS9wbmcnfSk7XG5cdH1cblxufVxuIiwidmFyIGRhdGFfaW5wdXQgPSB7XG5cblx0Ly9wb2JpZXJhbmllIGluZm9ybWFjamkgeiBpbnB1dMOzdyBpIHphcGlzYW5pZSBkbyBvYmlla3R1IG1hcF9zdmdcblx0Z2V0IDogZnVuY3Rpb24oKXtcblx0XHRtYXAubmFtZSA9ICQoJyNtYXBfZm9ybSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbCgpO1xuXHRcdG1hcC5wYXRoID0gJCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCkucmVwbGFjZSgvXCIvZywgXCInXCIpO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH0sXG5cblx0Ly9wb2JyYW5pZSBpbmZvcm1hY2ppIHogb2JpZWt0dSBtYXBfc3ZnIGkgemFwaXNhbmllIGRvIGlucHV0w7N3XG5cdHNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCBtYXAubmFtZSApO1xuXHRcdCQoJyNtYXBfZm9ybSB0ZXh0YXJlYScpLnZhbCggbWFwLnBhdGggKTtcblx0XHQkKCcjbWFwX2NvbnRlbmVyJykuaHRtbCggJCgndGV4dGFyZWFbbmFtZT1tYXBfcGF0aF0nKS52YWwoKSApO1xuXHR9XG5cbn1cbiIsImxhYmVscyA9IHtcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbGF5ZXJzIC5sYWJlbF9sYXllcicpLnZhbCggbGF5ZXJzLmxhYmVsc1tsYXllcnMuYWN0aXZlXSApO1xuXHRcblx0fSxcblxuXHRlZGl0IDogZnVuY3Rpb24ob2JqKSB7XG5cdFx0XG5cdFx0IGxheWVycy5sYWJlbHNbbGF5ZXJzLmFjdGl2ZV0gPSAkKG9iaikudmFsKCk7XG5cdH1cbn1cblxuJCgnI2xheWVycyAubGFiZWxfbGF5ZXInKS5rZXl1cChmdW5jdGlvbigpe1xuXHRsYWJlbHMuZWRpdCh0aGlzKTtcbn0pOyBcbiIsInZhciBsYXllcnMgPSB7XG5cblx0bGlzdCA6IFsnd2Fyc3R3YTEnXSxcblx0YWN0aXZlIDogMCxcblxuXHQvL3RhYmxpY2EgeiBwb2RzdGF3b3d5d21pIGRhbnltaSB6YWdyZWdvd2FueW1pIGRsYSBrYcW8ZGVqIHdhcnN0d3lcblx0cGFsZXRzX2FjdGl2ZSA6IFswXSxcblx0Y2F0ZWdvcnkgOiBbLTFdLFxuXHR2YWx1ZSA6IFstMV0sXG5cdGNvbG9yc19wb3MgOiBbWzEsMSwxLDEsMSwxLDEsMSwxXV0sXG5cdGNvbG9yc19hY3RpdmUgOiBbW1wiI2Y3ZmNmZFwiLCBcIiNlNWY1ZjlcIiwgXCIjY2NlY2U2XCIsIFwiIzk5ZDhjOVwiLCBcIiM2NmMyYTRcIiwgXCIjNDFhZTc2XCIsIFwiIzIzOGI0NVwiLCBcIiMwMDZkMmNcIiwgXCIjMDA0NDFiXCJdXSxcblx0bWluX3ZhbHVlIDogWzBdLFxuXHRtYXhfdmFsdWUgOiBbMF0sXG5cdGNsb3VkIDogW1wiXCJdLFxuXHRjbG91ZF9wYXJzZXIgOiBbXCJcIl0sXG5cdGxlZ2VuZHMgOiBbW1syMCxcIiNmN2ZjZmRcIl0sWzUwLFwiI2U1ZjVmOVwiXSxbODAsXCIjY2NlY2U2XCJdLFsxMTAsXCIjOTlkOGM5XCJdLFsxNDAsXCIjNjZjMmE0XCJdLFsxNzAsXCIjNDFhZTc2XCJdLFsyMDAsXCIjMjM4YjQ1XCJdLFsyMzAsXCIjMDA2ZDJjXCJdLFsyNjAsXCIjMDA0NDFiXCJdXV0sXG5cdGxhYmVscyA6IFtcIlwiXSxcblx0bWFpbl9uYW1lIDogJycsXG5cblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xuXG5cdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmxpc3QubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRpZihpID09IHRoaXMuYWN0aXZlKXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4gY2xhc3M9XCJhY3RpdmVcIj4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aHRtbCArPSAnPHNwYW4+JyArIHRoaXMubGlzdFtpXSArICc8L3NwYW4+Jztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiYWRkXCI+ICsgPC9idXR0b24+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiPiAtIDwvYnV0dG9uPic7XG5cblx0XHQkKCcjbGF5ZXJzIGRpdicpLmh0bWwoaHRtbCk7XG5cblx0XHQkKCcjbGF5ZXJzIC5hZGQnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5hZGQoKTt9KTtcblx0XHQkKCcjbGF5ZXJzIC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5yZW1vdmUoKTt9KTtcblx0XHRcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBjb25zb2xlLmxvZygnY2xpY2wnKTtsYXllcnMuc2VsZWN0KHRoaXMpO30pO1xuXHRcdCQoJyNsYXllcnMgc3BhbicpLmRibGNsaWNrKGZ1bmN0aW9uKCl7IGxheWVycy5lZGl0KHRoaXMpOyB9KTtcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5mb2N1c291dChmdW5jdGlvbigpeyBsYXllcnMuZW5kX2VkaXQodGhpcyk7IH0pO1xuXG5cdH0sXG5cblx0c2VsZWN0IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRsYXllcnMuYWN0aXZlID0gJChvYmopLmluZGV4KCk7XG5cdFx0cGFsZXRzLnNob3coKTtcblx0XHRjbG91ZC5zZXRfdGV4dGFyZWEoKTtcblx0XHRjYXRlZ29yaWVzLmNvbG9yX2Zyb21fZXhjZWwoKTtcblx0XHRsYWJlbHMuc2hvdygpO1xuXHR9LFxuXG5cdGFkZCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR0aGlzLmxpc3QucHVzaCggJ3dhcnN0d2EnICsgcGFyc2VJbnQodGhpcy5saXN0Lmxlbmd0aCsxKSk7XG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2goLTEpO1xuXHRcdHRoaXMudmFsdWUucHVzaCgtMSk7XG5cdFx0dGhpcy5wYWxldHNfYWN0aXZlLnB1c2goMCk7XG5cdFx0dGhpcy5jb2xvcnNfYWN0aXZlLnB1c2goWycjZjdmY2ZkJywnI2U1ZjVmOScsJyNjY2VjZTYnLCcjOTlkOGM5JywnIzY2YzJhNCcsJyM0MWFlNzYnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSk7XG5cdFx0dGhpcy5jb2xvcnNfcG9zLnB1c2goWzEsMSwxLDEsMSwxLDEsMSwxXSk7XG5cdFx0dGhpcy5taW5fdmFsdWUucHVzaCgwKTtcblx0XHR0aGlzLm1heF92YWx1ZS5wdXNoKDApO1xuXHRcdHRoaXMuY2xvdWQucHVzaChcIlwiKTtcblx0XHR0aGlzLmNsb3VkX3BhcnNlci5wdXNoKFwiXCIpO1xuXHRcdHRoaXMubGVnZW5kcy5wdXNoKFtdKTtcblx0XHR0aGlzLmxhYmVscy5wdXNoKFwiXCIpO1xuXHRcdHRoaXMuc2hvdygpO1xuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cblx0XHRjb25zb2xlLmxvZyhcInJlbW92ZVwiLHRoaXMuYWN0aXZlLHRoaXMubGlzdC5sZW5ndGgtMSlcblxuXHRcdGlmKHRoaXMuYWN0aXZlID09ICh0aGlzLmxpc3QubGVuZ3RoLTEpKXtcblx0XHRcdHZhciBpX3RtcCA9IHRoaXMubGlzdC5sZW5ndGgtMTtcblx0XHRcdHRoaXMuc2VsZWN0KCAkKCcjbGF5ZXJzIHNwYW4nKS5lcSggaV90bXAgKSApO1xuXHRcdH0gXG5cdFxuXHRcdHRoaXMucGFsZXRzX2FjdGl2ZS5wb3AoKTtcblx0XHR0aGlzLmxpc3QucG9wKCk7XG5cdFx0dGhpcy5jb2xvcnNfcG9zLnBvcCgpO1xuXHRcdHRoaXMuY2F0ZWdvcnkucG9wKCk7XG5cdFx0dGhpcy52YWx1ZS5wb3AoKTtcblx0XHR0aGlzLmNvbG9yc19hY3RpdmUucG9wKCk7XG5cdFx0dGhpcy5taW5fdmFsdWUucG9wKCk7XG5cdFx0dGhpcy5tYXhfdmFsdWUucG9wKCk7XG5cdFx0dGhpcy5jbG91ZC5wb3AoKTtcblx0XHR0aGlzLmNsb3VkX3BhcnNlci5wb3AoKTtcblx0XHR0aGlzLmxlZ2VuZHMucG9wKCk7XG5cdFx0dGhpcy5sYWJlbHMucG9wKCk7XG5cdFx0dGhpcy5zaG93KCk7XG5cdH0sXG5cblx0ZWRpdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JChvYmopLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsJ3RydWUnKTtcblx0XHQkKG9iaikuY2xpY2soKTtcblx0fSxcblxuXG5cdGVuZF9lZGl0IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikuYXR0cignY29udGVudGVkaXRhYmxlJywnZmFsc2UnKTtcblx0XHRsYXllcnMubGlzdFsgJChvYmopLmluZGV4KCkgXSA9ICQob2JqKS5odG1sKCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IGRvdHljesSFc3kgd3lzd2lldGxhbmlhIGFrdXRhbGl6YWNqaSBpIGVkeWNqaSBwYW5lbHUgbGVnZW5kXG5sZWdlbmRzID0ge1xuXG5cdC8vd3nFm3dpZXRsYW15IHdzenlzdGtpZSBsZWdlbmR5IHcgcGFuZWx1IG1hcFxuXHRzaG93IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBodG1sID0gXCJcIjtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcblx0XHRcdGh0bWwgKz0gXCI8c3BhbiBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpcIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVsxXStcIicgY2xhc3M9J2NvbG9yJz48L3NwYW4+PHNwYW4gY29udGVudGVkaXRhYmxlPSd0cnVlJz5cIitsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXVtpXVswXStcIjwvc3Bhbj5cIjtcblxuXHRcdH1cblxuXHRcdCQoJyNsZWdlbmRzJykuaHRtbChodG1sKTtcblxuXHR9LFxuXG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNvbG9yX2NvdW50ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoIC8vaWxvc2Mga29sb3LDs3dcblx0XHR2YXIgZGlmZnJlbnQgPSBNYXRoLmFicyggbGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSAtIGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKTsgLy8gY29sb3JfY291bnQ7XG5cdFx0XG5cdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0gPSBbXTtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcblx0XHRcdHZhciBub3dfdG1wID0gTWF0aC5yb3VuZCggKGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0rZGlmZnJlbnQvY29sb3JfY291bnQqaSkqMTAwKSAvIDEwMFxuXHRcdFx0aWYoaSsxID09IGlfbWF4ICl7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHZhciBuZXh0X3RtcCA9IE1hdGgucm91bmQoICgobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXStkaWZmcmVudC9jb2xvcl9jb3VudCooaSsxKSkgLSAwLjAxKSAgKjEwMCkgLyAxMDAgXG5cdFx0XHR9XG5cdFx0XHRsYXllcnMubGVnZW5kc1tsYXllcnMuYWN0aXZlXS5wdXNoKFsgIG5vd190bXArJyAtICcrbmV4dF90bXAsIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2ldIF0pO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLnNob3coKTtcblxuXHR9XG59XG5cbmxlZ2VuZHMuc2hvdygpOyIsIi8qXG4gICAgX19fXyAgIF9fX18gX19fXyAgICBfXyAgX19fIF9fXyAgICAgX19fXyAgICAgX19fX18gICAgX19fXyBcbiAgIC8gX18gKSAvICBfLy8gX18gXFwgIC8gIHwvICAvLyAgIHwgICAvIF9fIFxcICAgfF9fICAvICAgLyBfXyBcXFxuICAvIF9fICB8IC8gLyAvIC8gLyAvIC8gL3xfLyAvLyAvfCB8ICAvIC9fLyAvICAgIC9fIDwgICAvIC8gLyAvXG4gLyAvXy8gL18vIC8gLyAvXy8gLyAvIC8gIC8gLy8gX19fIHwgLyBfX19fLyAgIF9fXy8gL18gLyAvXy8gLyBcbi9fX19fXy8vX19fLyBcXF9fX1xcX1xcL18vICAvXy8vXy8gIHxffC9fLyAgICAgICAvX19fXy8oXylcXF9fX18vICBcblxudmFyc2lvbiAzLjAgYnkgTWFyY2luIEfEmWJhbGFcblxubGlzdGEgb2JpZWt0w7N3OlxuXG4gY2FudmFzID0gY2FudmFzKCkgLSBvYmlla3QgY2FudmFzYVxuIGNydWQgPSBjcnVkKCkgLSBvYmlla3QgY2FudmFzYVxuIGltYWdlID0gaW1hZ2UoKSAtIG9iaWVrdCB6ZGrEmWNpYSBvZCBrdMOzcmVnbyBvZHJ5c293dWplbXkgbWFweVxuIG1vdXNlID0gbW91c2UoKVxuIG1vZGVscyA9IG1vZGVscygpXG4gZ2xvYmFsID0gZ2xvYmFsKCkgLSBmdW5rY2plIG5pZSBwcnp5cGlzYW55IGRvIGlubnljaCBvYmlla3TDs3dcbiBjYXRlZ29yaWVzID0gY2F0ZWdvcmllcygpXG4gcG9pbnRlcnMgPSBwb2ludGVycygpXG4gY29sb3JwaWNrZXIgPSBjb2xvcnBpY2tlcigpXG4gbWVudV90b3AgPSBtZW51X3RvcCgpXG4gZmlndXJlcyA9IGZpZ3VyZXMoKVxuXG4qL1xuXG4vL3BvIGtsaWtuacSZY2l1IHptaWVuaWF5IGFrdHVhbG55IHBhbmVsXG4kKCcuYm94ID4gdWwgPiBsaScpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9ib3godGhpcykgfSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG5cblx0bWVudV90b3AuZ2V0X21hcHMoKTtcbiAgbGF5ZXJzLnNob3coKTtcbiAgcGFsZXRzLnNob3coKTtcblxuXHQvL3phYmxva293YW5pZSBtb8W8bGl3b8WbY2kgemF6bmFjemFuaWEgYnV0dG9uw7N3IHBvZGN6YXMgZWR5Y2ppIHBvbGFcblx0JChkb2N1bWVudCkub24oXCJmb2N1c2luXCIsXCJpbnB1dFwiLGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRpc2FibGVfc2VsZWN0ID0gdHJ1ZTsgfSk7XG5cdCQoZG9jdW1lbnQpLm9uKFwiZm9jdXNvdXRcIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSBmYWxzZTsgfSk7XG5cblx0Ly96YXpuYWN6ZW5pZSBkeW1rYSBkbyBwdWJsaWthY2ppIHBvIGtsaWtuacSZY2l1XG5cdCQoJyNjbG91ZCAuZW1iZWQnKS5jbGljayhmdW5jdGlvbigpe1x0JCh0aGlzKS5zZWxlY3QoKTtcdH0pO1xuXG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IFxuXG5cdFx0Ly9qZcWbbGkgbmllIG1hbXkgemRlZmluaW93YW5lZ2EgaGFzaGEgdHdvcnp5bXkgbm93xIUgbWFwxJkgdyBwcnplY2l3bnltIHd5cGFka3UgYWt0dWFsaXp1amVteSBqdcW8IGlzdG5pZWrEhWPEhVxuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCdjcnVkJyxjcnVkLnByb2plY3RfaGFzaClcblxuXHRcdGlmKHR5cGVvZiBjcnVkLnByb2plY3RfaGFzaCA9PSAnc3RyaW5nJyl7XG5cdFx0XHRcblx0XHRcdGNydWQudXBkYXRlX3Byb2plY3QoKTtcblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0XG5cdFx0XHRjcnVkLmNyZWF0ZV9wcm9qZWN0KCk7XG5cdFx0XG5cdFx0fVxuXG5cdH0pO1xuXG5cblx0JCgnI3Rvb2xiYXJfdG9wIGJ1dHRvbi5kZWxldGUnKS5jbGljayhmdW5jdGlvbigpeyBhbGVydCgnZGVsZXRlJyk7IH0pO1xuXG5cblx0Ly9vZHpuYWN6ZW5pZSBzZWxlY3RhIHByenkgem1pYW5pZVxuXHQkKCcjY2hhbmdlX2NhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7ICQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5ibHVyKCk7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgcHVzY3plbmlhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBtb3VzZS5tb3VzZV9kb3duID0gZmFsc2U7IH0pO1xuXG5cdC8vcmVqZXN0cmFjamEgemRhcnplbmlhIHcgbW9tZW5jaWUgd2NpxZtuacSZY2lhIHByenljaXNrdSBteXN6a2lcblx0JChkb2N1bWVudCkubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblx0XG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy/FgmF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTtcblx0XG5cdH0pO1xuXG5cdC8vd3l3b8WCYW5pZSBmdW5rY2ppIHBvZGN6YXMgcG9ydXN6YW5pYSBteXN6a8SFXG5cdCQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRpZihtb3VzZS5tb3VzZV9kb3duKSBtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXHRcdGlmKG1lbnVfdG9wLmF1dG9fZHJhdyl7IG1vdXNlLmNsaWNrX29iaiA9IFwiY2FudmFzXCI7IG1vdXNlLm1vdXNlbW92ZShldmVudCk7fVxuXHRcblx0fSk7XG5cblx0JCgnI21haW5fY2FudmFzJykubW91c2Vkb3duKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9tb3VzZV9kb3duKGV2ZW50KTsvL3phcmVqZXN0cm93YW5pZSBvYmlla3R1dyAga3TDs3J5IGtsaWthbXlcblx0XHRtb3VzZS5zZXRfcG9zaXRpb24oZXZlbnQpOyAvL3phcmVqZXN0cm93YW5pZSBwb3p5Y2ppIG15c3praVxuXHRcdC8vamVzbGkgcHJ6eWNpc2sgamVzdCB3Y2nFm25pxJl0eSB3eWtvbnVqZW15IGRvZGF0a293ZSB6ZGFyemVuaWEgKHByenkgcnVzemFuaXUgbXlzemvEhSlcblx0XHRtb3VzZS5tb3VzZW1vdmUoZXZlbnQpO1xuXG5cdH0pO1xuXG5cdCQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oKXtcblxuXHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcdC8va29sdW1uYSBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblx0XHRwb2ludGVycy5sYXN0X3JvdyA9IG51bGw7XG5cdFx0Y2FudmFzLmNvbnRleHRfeCA9IGNhbnZhcy5jb250ZXh0X25ld194O1xuXHRcdGNhbnZhcy5jb250ZXh0X3kgPSBjYW52YXMuY29udGV4dF9uZXdfeTtcblxuXHR9KTtcblxuXHQvL2RvZGFuaWUgbm93ZWoga2F0ZWdvcmlpXG5cdCQoJyNhZGRfY2F0ZWdvcnknKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdGNhdGVnb3JpZXMuYWRkKCk7XG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWkgKHBvIHdjacWbbmnEmWNpdSBlbnRlcilcblx0JCgnaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHtcbiAgICBcdGlmKGUud2hpY2ggPT0gMTMpIHtcbiAgICBcdFx0Y2F0ZWdvcmllcy5hZGQoKTtcbiAgICBcdH1cblx0fSk7XG5cblx0Ly8kKGRvY3VtZW50KS5rZXlwcmVzcyhmdW5jdGlvbihlKSB7IG1lbnVfdG9wLnN3aXRjaF9tb2RlKCBlLndoaWNoICk7IH0pO1xuXG5cdC8vemFrdHVhbGl6b3dhbmllIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IGNhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9KTtcblx0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHsgaWYoZS53aGljaCA9PSAxMykge2NhdGVnb3JpZXMudXBkYXRlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSAsJCh0aGlzKS52YWwoKSApOyB9IH0pO1xuXG5cdC8vdXN1bmnEmWNpZSBrYXRlZ29yaWlcblx0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiYnV0dG9uLnJlbW92ZVwiLFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IGNhdGVnb3JpZXMucmVtb3ZlKCQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKSk7IH0pO1xuXG5cdC8vemFrdHVhbGl6b3dhbmllIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7IG1lbnVfdG9wLm1vZGVfa2V5ID0gZmFsc2U7ICB9KTtcblx0JChcIiNsaXN0XCIpLmRlbGVnYXRlKFwiaW5wdXRcIixcImZvY3Vzb3V0XCIsIGZ1bmN0aW9uKCkgeyBtZW51X3RvcC5tb2RlX2tleSA9IHRydWU7ICB9KTtcblxuXHQvL3Bva2F6YW5pZSAvIHVrcnljaWUgcGFuZWx1IGthdGVnb3JpaVxuXHQkKCcjZXhjZWxfYm94IGgyLCAjcG9pbnRlcl9ib3ggaDIsICNwYWxldHNfYm94IGgyJykuY2xpY2soZnVuY3Rpb24oZXZlbnQpeyBnbG9iYWwudG9vZ2xlX3BhbmVsKGV2ZW50KTsgfSk7XG5cblx0Ly9vYnPFgnVnYSBidXR0b27Ds3cgZG8gaW5rcmVtZW50YWNqaSBpIGRla3JlbWVudGFjamkgaW5wdXTDs3dcblx0JCgnYnV0dG9uLmluY3JlbWVudCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy5idXR0b25faW5jcmVtZW50KCAkKHRoaXMpICkgfSk7XG5cdCQoJ2J1dHRvbi5kZWNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2RlY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXG5cdC8vb2LFgnVnYSBpbnB1dMOzdyBwb2JyYW5pZSBkYW55Y2ggaSB6YXBpc2FuaWUgZG8gYmF6eVxuXHQkKCcuc3dpdGNoJykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3N3aXRjaCggJCh0aGlzKSApOyB9KTsgLy9wcnp5Y2lza2kgc3dpdGNoXG5cdCQoJy5pbnB1dF9iYXNlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuaW5wdXRfYmFzZV90ZXh0JykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9pbnB1dF90ZXh0KCAkKHRoaXMpICk7IH0pOyAvL3RyYWR5Y3lqbmUgaW5wdXR5XG5cdCQoJy5zZWxlY3RfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21fc2VsZWN0KCAkKHRoaXMpICk7IH0pOyAvL2xpc3R5IHJvendpamFuZSBzZWxlY3RcblxuXHQkKCcjbWVudV90b3AgI2luY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5pbmNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjZGVjcmVtZW50X2NhbnZhcycpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmRlY3JlbWVudF9zY2FsZSgpOyB9KTtcblx0JCgnI21lbnVfdG9wICNhZGRfaW1hZ2UnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5hZGRfaW1hZ2UoKTsgfSk7XG5cblx0JCgnI21lbnVfdG9wICNyZXNldF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBjYW52YXMuc2V0X2RlZmF1bHQoKTsgfSk7XG5cblx0Ly9wcnp5cGlzYW5pZSBwb2RzdGF3b3dvd3ljaCBkYW55Y2ggZG8gb2JpZWt0dSBjYW52YXNcblx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluX2NhbnZhcycpO1xuICBjYW52YXMuY29udGV4dCA9IGNhbnZhcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcpICk7XG4gIGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcpICk7XG4gIHZhciBvZmZzZXQgPSAkKCcjY2FudmFzX2JveCcpLm9mZnNldCgpO1xuICBjYW52YXMub2Zmc2V0X2xlZnQgPSBvZmZzZXQubGVmdDtcbiAgY2FudmFzLm9mZnNldF90b3AgPSBvZmZzZXQudG9wO1xuXG4gIC8vdHdvcnp5bXkgdGFibGljZSBwb2ludGVyw7N3XG5cdHBvaW50ZXJzLmNyZWF0ZV9hcnJheSgpO1xuXG4gICQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoY2FudmFzLmhlaWdodF9jYW52YXMrJ3B4Jyk7XG4gICQoJyNjYW52YXNfYm94LCAjY2FudmFzX3dyYXBwZXInKS5jc3Moeyd3aWR0aCc6IGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnLCdoZWlnaHQnOmNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4J30pO1xuXHQkKCcjY2FudmFzX2luZm8gI3dpZHRoLCNjYW52YXNfaW5mbyAjaGVpZ2h0LCNjYW52YXNfaW5mbyAjc2l6ZScpLmNoYW5nZShmdW5jdGlvbigpe21lbnVfdG9wLnVwZGF0ZV9jYW52YXNfaW5mbygpfSk7XG5cblx0JCgnI2FscGhhX2ltYWdlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLmNoYW5nZV9hbHBoYSgpIH0pO1xuXG5cdCQoJ2lucHV0JykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgfSk7XG5cdCQoJ2lucHV0JykuZm9jdXNvdXQoZnVuY3Rpb24oKXsgbWVudV90b3AubW9kZV9rZXkgPSB0cnVlOyB9KTtcblxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IGNhbnZhcy5kcmF3KCk7IH0pO1xuXHRjYW52YXMuZHJhdygpOyAvL3J5c293YW5pZSBjYW52YXNcblxuXHQvL3phcGlzdWplbXkgbHViIGFrdHVhbGl6dWplbXkgbWFwxJkgcG8ga2xpa25pxJljaXUgdyBidXR0b3cgdyB6YWxlxbxub8WbY2kgb2QgdGVnbyBjenkgbWFteSB6ZGVmaW5pb3dhbmUgaWQgbWFweVxuXHQkKCcubWVudV9yaWdodCAuc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFxuYWxlcnQoJ2tsaWsnKVxuXHQvL1x0aWYoY3J1ZC5tYXBfaGFzaCA9PSBudWxsKXsgY3J1ZC5jcmVhdGVfbWFwKCk7IH1cblx0Ly9cdGVsc2V7IGNydWQudXBkYXRlX21hcCgpOyB9XG5cdH0pO1xuXG5cdC8vdXN1d2FteSBtYXDEmSBwbyBrbGlrbmnEmWNpdSB3IGJ1dHRvblxuXHQkKCcubWVudV9yaWdodCAucmVtb3ZlJykuY2xpY2soZnVuY3Rpb24oKXtpZihjb25maXJtKFwiY3p5IG5hcGV3bm8gdXN1bsSFxIcgbWFwxJkgP1wiKSl7Y3J1ZC5kZWxldGVfbWFwKCk7fSB9KTtcblxufSk7XG4iLCIvL29iaWVrdCBtZW51X3RvcFxubWVudV90b3AgPSB7XG5cblx0bW92ZV9pbWFnZSA6IGZhbHNlLFxuXHRtb3ZlX2NhbnZhcyA6IGZhbHNlLFxuXHRhdXRvX2RyYXcgOiBmYWxzZSxcblx0bW9kZV9rZXkgOiB0cnVlLFxuXHRjYXRlZ29yeSA6IDAsXG5cdGRpc2FibGVfc2VsZWN0IDogZmFsc2UsXG5cblx0Ly96bWlhbmEgYWt0dWFsbmVqIHpha8WCYWRraVxuXHRjaGFuZ2VfYm94IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKG9iaikucGFyZW50KCkuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHR2YXIgY2F0ZWdvcnkgPSAkKG9iaikuaHRtbCgpO1xuXHRcdCQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5jaGlsZHJlbignZGl2JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKG9iaikucGFyZW50KCkucGFyZW50KCkuY2hpbGRyZW4oJyMnK2NhdGVnb3J5KS5kZWxheSgxMDApLmZhZGVJbig1MDApO1xuXHRcdH0pO1xuXHRcblx0XG5cdH0sXG5cblx0Ly9mdW5rY2phIHPFgnXFvMSFY2EgZG8gcG9iaWVyYW5pYSBkYW55Y2ggZG90eWN6xIVjeWNoIG1hcFxuXHRnZXRfbWFwcyA6IGZ1bmN0aW9uKCl7XG5cdFxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2FwaS9tYXBzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBtYXAgdyBwYW5lbHUgdSBnw7NyeVxuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09IFwib2tcIil7XG5cblx0XHRcdFx0dmFyIGFkZF9odG1sID0gJyc7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBpX21heCA9IHJlc3BvbnNlLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXggO2krKyl7XG5cblx0XHRcdFx0XHRpZihyZXNwb25zZS5kYXRhW2ldLl9pZCA9PSBjcnVkLm1hcF9oYXNoKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIHNlbGVjdGVkIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkKCcjdG9vbGJhcl90b3Agc2VsZWN0LnNlbGVjdF9tYXBzJykuYXBwZW5kKCBhZGRfaHRtbCApO1xuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0XHQvL2RvZGFqZW11IHpkYXJ6ZW5pZSBjaGFuZ2UgbWFwIFxuXHRcdCQoJy5zZWxlY3RfbWFwcycpLmNoYW5nZShmdW5jdGlvbigpe1xuXHRcdFx0aWYgKGNvbmZpcm0oJ0N6eSBjaGNlc3ogd2N6eXRhxIcgbm93xIUgbWFwxJkgPycpKSB7XG5cdFx0XHRcdGlmKCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgPT0gJ25ld19tYXAnICl7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRjcnVkLnNlbGVjdF9tYXAoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXG5cdC8vZnVua2NqYSBzxYJ1xbzEhWNhIGRvIHBvYmllcmFuaWEgZGFueWNoIGRvdHljesSFY3ljaCBtYXBcblx0Z2V0X3Byb2plY3RzIDogZnVuY3Rpb24oKXtcblx0XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL3Byb2plY3RzJyxcbiAgICBcdHR5cGU6IFwiR0VUXCIsXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKCBmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcblx0XHRcdC8vd3nFm3dpZXRsYW15IGxpc3TEmSBwcm9qZWt0w7N3IHcgcGFuZWx1IHUgZ8Ozcnlcblx0XHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcIm9rXCIpe1xuXG5cdFx0XHRcdHZhciBhZGRfaHRtbCA9ICcnO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgaV9tYXggPSByZXNwb25zZS5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4IDtpKyspe1xuXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UuZGF0YVtpXS5faWQgPT0gY3J1ZC5tYXBfaGFzaCl7XG5cdFx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPG9wdGlvbiBzZWxlY3RlZCBpZD1cIicgKyByZXNwb25zZS5kYXRhW2ldLl9pZCArICdcIj4nICsgSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhW2ldLm1hcF9qc29uKVswXVs3XSArICc8L29wdGlvbj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JCgnI3Rvb2xiYXJfdG9wIHNlbGVjdC5zZWxlY3RfcHJvamVjdHMnKS5hcHBlbmQoIGFkZF9odG1sICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBwcm9qZWN0IFxuXHRcdCQoJy5zZWxlY3RfcHJvamVjdHMnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcblx0XHRcdGlmIChjb25maXJtKCdDenkgY2hjZXN6IHdjenl0YcSHIG5vd3kgcHJvamVrdCA/JykpIHtcblx0XHRcdFx0aWYoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSA9PSAnbmV3X3Byb2plY3QnICl7XG5cdFx0XHRcdFx0bG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRjcnVkLnNlbGVjdF9wcm9qZWN0KCAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ2lkJykgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0dXBkYXRlX2NhbnZhc19pbmZvIDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuc2NhbGUgPSBwYXJzZUludCggJCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKCkgKTtcblx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoKSApO1xuXHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKCkgKTtcblxuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCggY2FudmFzLnNjYWxlICsgJyUnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCggY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcgKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCggY2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnICk7XG5cblx0XHQkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCd3aWR0aCcsY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfYm94ICNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsY2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdGNoYW5nZV9hbHBoYSA6IGZ1bmN0aW9uKCl7XG5cdFx0aW1hZ2UuYWxwaGEgPSAkKCcjYWxwaGFfaW1hZ2UnKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCduYW1lJyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRhZGRfaW1hZ2UgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9qZXNsaSBwb2RhbnkgcGFyYW1ldHIgbmllIGplc3QgcHVzdHlcblx0XHR2YXIgc3JjX2ltYWdlID0gcHJvbXB0KFwiUG9kYWogxZtjaWXFvGvEmSBkbyB6ZGrEmWNpYTogXCIpO1xuXG5cdFx0aWYoc3JjX2ltYWdlKXtcblx0XHRcdGlmKHNyY19pbWFnZS5sZW5ndGggPiAwKXtcblxuXHRcdFx0XHRpbWFnZS5vYmogPSBuZXcgSW1hZ2UoKTtcblxuXHRcdFx0XHQvL3djenl0YW5pZSB6ZGrEmWNpYTpcblx0XHRcdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0aW1hZ2Uud2lkdGggPSBpbWFnZS5vYmoud2lkdGg7XG5cdCAgICBcdFx0aW1hZ2UuaGVpZ2h0ID0gaW1hZ2Uub2JqLmhlaWdodDtcblx0ICAgIFx0XHRpbWFnZS5kcmF3KCk7XG5cdCAgXHRcdH07XG5cblx0XHRcdCAgaW1hZ2UueCA9IDA7XG5cdFx0XHQgIGltYWdlLnkgPSAwO1xuXHRcdFx0ICBpbWFnZS5vYmouc3JjID0gc3JjX2ltYWdlO1xuXHRcdFx0XHQvL3NpbWFnZS5vYmouc2V0QXR0cmlidXRlKCdjcm9zc09yaWdpbicsICdhbm9ueW1vdXMnKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0c2hvd19pbmZvIDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwocGFyc2VJbnQoY2FudmFzLnNjYWxlKSArICclJyk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbChwYXJzZUludChjYW52YXMud2lkdGhfY2FudmFzKSArICdweCcpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKHBhcnNlSW50KGNhbnZhcy5oZWlnaHRfY2FudmFzKSArICdweCcpO1xuXHR9XG5cbn1cbiIsIi8vIHBvYmllcmFuaWUgZGFueWNoIHogc2VsZWt0YSBpbnB1dGEgc3dpdGNoeSAoYWt0dWFsaXphY2phIG9iaWVrdMOzdykgYnV0dG9uIGlua3JlbWVudCBpIGRla3JlbWVudFxudmFyIG1vZGVscyA9IHtcblxuXHRidXR0b25faW5jcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgKyAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHRidXR0b25fZGVjcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgLSAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBwYXJzZUludCgkKG9iaikudmFsKCkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXRfdGV4dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikudmFsKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3N3aXRjaCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0aWYoICQob2JqKS5hdHRyKFwidmFsdWVcIikgPT0gJ2ZhbHNlJyApe1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCd0cnVlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZXsgLy93ecWCxIVjemFteSBwcnplxYLEhWN6bmlrXG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ2ZhbHNlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG15c3praSAoZG8gb2dhcm5pZWNpYSlcbnZhciBtb3VzZSA9IHtcblx0bW91c2VfZG93biA6IGZhbHNlLFxuXHRjbGlja19vYmogOiBudWxsLFxuXG5cdHRtcF9tb3VzZV94IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblx0dG1wX21vdXNlX3kgOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXG5cdGxlZnQgOiBudWxsLCAvL3BvenljamEgeCBteXN6a2lcblx0dG9wIDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpXG5cdHBhZGRpbmdfeCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRwYWRkaW5nX3kgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0b2Zmc2V0X3ggOiBudWxsLCAvL29mZnNldCB4IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cdG9mZnNldF95IDogbnVsbCwgLy9vZmZzZXQgeSBvYmlla3R1IGtsaWtuacSZdGVnb1xuXG5cdC8vZnVuY2tqYSB3eWtyeXdhasSFY2EgdyBjbyBrbGlrbmnEmXRvIHBvYmllcmFqxIVjYSBwYWRkaW5nIGtsaWtuacSZY2lhIG9yYXogemFwaXN1asSFY2Ega2xpa25pxJljaWVcblx0c2V0X21vdXNlX2Rvd24gOiBmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHR2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly9qZcWbbGkgZWxlbWVudCBuYSBrdMOzcnkga2xpa25pxJl0byBtYSBhdHJ5YnV0IG5hbWVjbGljayBwcnp5cGlzdWplbXkgZ28gZG8gb2JpZWt0dSBteXN6a2lcblx0XHRpZih0eXBlb2YoJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdHRoaXMuY2xpY2tfb2JqID0gJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpO1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSAkKG9iaikub2Zmc2V0KCk7XG5cdFx0XHR0aGlzLm9mZnNldF94ID0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMub2Zmc2V0X3kgPSBwb3NpdGlvbi50b3A7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeSA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wO1xuXHRcdFx0bW91c2UubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0c3dpdGNoKHRoaXMuY2xpY2tfb2JqKXtcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnY2FudmFzJzpcblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIHpkasSZY2llbSAobnAuIG1hcGEgLyB3em9yemVjKVxuXHRcdFx0XHRpZigobWVudV90b3AubW92ZV9pbWFnZSkgJiYgKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblxuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7IC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgeV9hY3R1YWwgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDsgLy8gYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblxuXHRcdFx0XHRcdHZhciB4X3RyYW5zbGF0ZSA9IHhfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3ggKyBtb3VzZS50bXBfbW91c2VfeDsgLy9wcnplc3VuacSZY2llIG9icmF6a2Egd3pnbMSZZGVtIGFrdHVhbG5laiBwb3p5Y2ppIG15c3praVxuXHRcdFx0XHRcdHZhciB5X3RyYW5zbGF0ZSA9IHlfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3kgKyBtb3VzZS50bXBfbW91c2VfeTsgLy9wcnplc3VuaWVjaWUgb2JyYXprYSB3emdsxJlkZW0gYWt0dWFsbmVqIHBvenljamkgbXlzemtpXG5cblx0XHRcdFx0XHR2YXIgeF9uZXcgPSB4X3RyYW5zbGF0ZSA7XG5cdFx0XHRcdFx0dmFyIHlfbmV3ID0geV90cmFuc2xhdGUgO1xuXG5cdFx0XHRcdFx0aW1hZ2UueCA9IHhfbmV3O1xuICAgICAgXHRcdFx0XHRpbWFnZS55ID0geV9uZXc7XG4gICAgICBcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3J5c293YW5pZVxuXHRcdFx0XHRlbHNlIGlmICgoIW1lbnVfdG9wLm1vdmVfaW1hZ2UpICYmICghbWVudV90b3AubW92ZV9jYW52YXMpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHJvd19jbGljayA9IHBhcnNlSW50KCAodGhpcy50b3AgLSBjYW52YXMub2Zmc2V0X3RvcCArIGNhbnZhcy5jb250ZXh0X3kqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ195KSooY2FudmFzLnNjYWxlIC8gMTAwKSAgKSApO1xuXHRcdFx0XHRcdHZhciBjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSApICk7XG5cblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCdrbGlrJyxyb3dfY2xpY2ssY29sdW1uX2NsaWNrLGNhbnZhcy5jb250ZXh0X3gsY2FudmFzLmNvbnRleHRfeSk7XG5cblx0XHRcdFx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvd19jbGljayUyID09MCkpe1xuXHRcdFx0XHRcdFx0Ly9jb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICgocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSkgICk7XG5cdFx0XHRcdFx0XHRjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCAocm93X2NsaWNrID49IDApICYmIChyb3dfY2xpY2sgPCBjYW52YXMuYWN0aXZlX3JvdykgJiYgKGNvbHVtbl9jbGljayA+PSAwKSAmJiAoY29sdW1uX2NsaWNrIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb2ludGVycy51cGRhdGVfcG9pbnQocm93X2NsaWNrLGNvbHVtbl9jbGljayxwb2ludGVycy5sYXN0X3Jvdyxwb2ludGVycy5sYXN0X2NvbHVtbik7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IGNvbHVtbl9jbGljaztcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gcm93X2NsaWNrO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIGNhxYJ5bSBjYW52YXNlbVxuXHRcdFx0XHRlbHNlIGlmKG1lbnVfdG9wLm1vdmVfY2FudmFzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0XHRcdFx0Y2FudmFzLmNsZWFyKCk7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeCA9IChtb3VzZS5sZWZ0IC0gbW91c2Uub2Zmc2V0X3gpIC0gbW91c2UucGFkZGluZ194ICsgY2FudmFzLmNvbnRleHRfeDtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeSA9IChtb3VzZS50b3AgLSBtb3VzZS5vZmZzZXRfeSkgLSBtb3VzZS5wYWRkaW5nX3kgKyBjYW52YXMuY29udGV4dF95O1xuXG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3ggPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeCA9IDA7XG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3kgPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeSA9IDA7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC50cmFuc2xhdGUoICggY2FudmFzLmNvbnRleHRfbmV3X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfbmV3X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9vYmlla3QgbcOzd2nEhWN5IG5hbSBuYWQgamFrxIUga2F0ZWdvcmlhIGplc3RlxZtteVxudmFyIG9uX2NhdGVnb3J5ID0ge1xuXHRcblx0Y2FudmFzX29mZnNldF90b3AgOiAxODcsXG5cdGNhbnZhc19vZmZzZXRfbGVmdCA6IDEwLFxuXG5cdC8vZnVua2NqYSB6d3JhY2FqxIVjYSBha3R1YWxuxIUga2F0ZWdvcmnEmSBuYWQga3TDs3LEhSB6bmFqZHVqZSBzacSZIGt1cnNvclxuXHRnZXRfbmFtZSA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIGxlZnQgPSBtb3VzZS5sZWZ0IC0gdGhpcy5jYW52YXNfb2Zmc2V0X2xlZnQ7XG5cdFx0dmFyIHRvcCA9IG1vdXNlLnRvcCAtIHRoaXMuY2FudmFzX29mZnNldF90b3A7XG5cdFx0dmFyIHJvdyA9IE1hdGguY2VpbCggdG9wIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Ly9jb25zb2xlLmxvZyhsZWZ0LHRvcCx0aGlzLmNhbnZhc19vZmZzZXRfbGVmdCx0aGlzLmNhbnZhc19vZmZzZXRfdG9wKTtcblx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvdyAlIDIgIT0gMCkpe1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggKGxlZnQgKyAocG9pbnRlcnMuc2l6ZS8yKSkvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApIC0gMTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIGxlZnQvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblxuXHRcdHRyeXtcblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdIFxuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5W2NhdGVnb3J5X251bV1bMF1cblx0XHR9XG5cdFx0Y2F0Y2goZSl7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH1cblx0XHRcblx0XHRpZiggY2F0ZWdvcnlfbmFtZSA9PSAncHVzdHknKXtcblx0XHRcdHJldHVybiAnbnVsbCc7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnlfbmFtZTtcdFx0XG5cdFx0fVxuXG5cdH1cblxufVxuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCl7ICQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTsgfSk7XG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQudXBkYXRlX3RleHQoIG9uX2NhdGVnb3J5LmdldF9uYW1lKCkgKTsgfSk7XG4kKFwiI2NhbnZhc19jbG91ZFwiKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQuc2V0X3Bvc2l0aW9uKCk7IH0pOyIsInBhbGV0cyA9IHtcbiAgdmFsX21heCA6IG51bGwsXG4gIHZhbF9taW4gOiBudWxsLFxuICB2YWxfaW50ZXJ2YWwgOiBudWxsLCAgIFxuICBwYWxldHNfYWN0aXZlIDogMCxcbiAgLy92YWx1ZSA6IC0xLFxuICAvL2NhdGVnb3J5IDogLTEsXG5cbiAgLy9wb2RzdGF3b3dlIHBhbGV0eSBrb2xvcsOzdyAoIG9zdGF0bmlhIHBhbGV0YSBqZXN0IG5hc3rEhSB3xYJhc27EhSBkbyB6ZGVmaW5pb3dhbmlhIClcbiAgY29sb3JfYXJyIDogW1xuICAgIFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10sXG4gICAgWycjZjdmY2ZkJywnI2UwZWNmNCcsJyNiZmQzZTYnLCcjOWViY2RhJywnIzhjOTZjNicsJyM4YzZiYjEnLCcjODg0MTlkJywnIzgxMGY3YycsJyM0ZDAwNGInXSxcbiAgICBbJyNmN2ZjZjAnLCcjZTBmM2RiJywnI2NjZWJjNScsJyNhOGRkYjUnLCcjN2JjY2M0JywnIzRlYjNkMycsJyMyYjhjYmUnLCcjMDg2OGFjJywnIzA4NDA4MSddLFxuICAgIFsnI2ZmZjdlYycsJyNmZWU4YzgnLCcjZmRkNDllJywnI2ZkYmI4NCcsJyNmYzhkNTknLCcjZWY2NTQ4JywnI2Q3MzAxZicsJyNiMzAwMDAnLCcjN2YwMDAwJ10sXG4gICAgWycjZmZmN2ZiJywnI2VjZTdmMicsJyNkMGQxZTYnLCcjYTZiZGRiJywnIzc0YTljZicsJyMzNjkwYzAnLCcjMDU3MGIwJywnIzA0NWE4ZCcsJyMwMjM4NTgnXSxcbiAgICBbJyNmZmY3ZmInLCcjZWNlMmYwJywnI2QwZDFlNicsJyNhNmJkZGInLCcjNjdhOWNmJywnIzM2OTBjMCcsJyMwMjgxOGEnLCcjMDE2YzU5JywnIzAxNDYzNiddLFxuICAgIFsnI2Y3ZjRmOScsJyNlN2UxZWYnLCcjZDRiOWRhJywnI2M5OTRjNycsJyNkZjY1YjAnLCcjZTcyOThhJywnI2NlMTI1NicsJyM5ODAwNDMnLCcjNjcwMDFmJ10sXG4gICAgWycjZmZmN2YzJywnI2ZkZTBkZCcsJyNmY2M1YzAnLCcjZmE5ZmI1JywnI2Y3NjhhMScsJyNkZDM0OTcnLCcjYWUwMTdlJywnIzdhMDE3NycsJyM0OTAwNmEnXSxcbiAgICBbJyNmZmZmZTUnLCcjZjdmY2I5JywnI2Q5ZjBhMycsJyNhZGRkOGUnLCcjNzhjNjc5JywnIzQxYWI1ZCcsJyMyMzg0NDMnLCcjMDA2ODM3JywnIzAwNDUyOSddLFxuICAgIFsnI2ZmZmZkOScsJyNlZGY4YjEnLCcjYzdlOWI0JywnIzdmY2RiYicsJyM0MWI2YzQnLCcjMWQ5MWMwJywnIzIyNWVhOCcsJyMyNTM0OTQnLCcjMDgxZDU4J10sXG4gICAgWycjZmZmZmU1JywnI2ZmZjdiYycsJyNmZWUzOTEnLCcjZmVjNDRmJywnI2ZlOTkyOScsJyNlYzcwMTQnLCcjY2M0YzAyJywnIzk5MzQwNCcsJyM2NjI1MDYnXSxcbiAgICBbJyNmZmZmY2MnLCcjZmZlZGEwJywnI2ZlZDk3NicsJyNmZWIyNGMnLCcjZmQ4ZDNjJywnI2ZjNGUyYScsJyNlMzFhMWMnLCcjYmQwMDI2JywnIzgwMDAyNiddLFxuICAgIFsnI2Y3ZmJmZicsJyNkZWViZjcnLCcjYzZkYmVmJywnIzllY2FlMScsJyM2YmFlZDYnLCcjNDI5MmM2JywnIzIxNzFiNScsJyMwODUxOWMnLCcjMDgzMDZiJ10sXG4gICAgWycjZjdmY2Y1JywnI2U1ZjVlMCcsJyNjN2U5YzAnLCcjYTFkOTliJywnIzc0YzQ3NicsJyM0MWFiNWQnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSxcbiAgICBbJyNmZmZmZmYnLCcjZjBmMGYwJywnI2Q5ZDlkOScsJyNiZGJkYmQnLCcjOTY5Njk2JywnIzczNzM3MycsJyM1MjUyNTInLCcjMjUyNTI1JywnIzAwMDAwMCddLFxuICAgIFsnI2ZmZjVlYicsJyNmZWU2Y2UnLCcjZmRkMGEyJywnI2ZkYWU2YicsJyNmZDhkM2MnLCcjZjE2OTEzJywnI2Q5NDgwMScsJyNhNjM2MDMnLCcjN2YyNzA0J10sXG4gICAgWycjZmNmYmZkJywnI2VmZWRmNScsJyNkYWRhZWInLCcjYmNiZGRjJywnIzllOWFjOCcsJyM4MDdkYmEnLCcjNmE1MWEzJywnIzU0Mjc4ZicsJyMzZjAwN2QnXSxcbiAgICBbJyNmZmY1ZjAnLCcjZmVlMGQyJywnI2ZjYmJhMScsJyNmYzkyNzInLCcjZmI2YTRhJywnI2VmM2IyYycsJyNjYjE4MWQnLCcjYTUwZjE1JywnIzY3MDAwZCddLFxuICAgIFsnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJ11cbiAgXSxcblxuICBzaG93IDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnNob3dfY29sb3IoKTtcbiAgICB0aGlzLnNob3dfcGFsZXRzKCk7XG4gICAgdGhpcy5zaG93X3NlbGVjdCgpO1xuICAgIC8vbGF5ZXJzLmRhdGEuY29sb3JfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV07XG4gIH0sXG5cbiAgc2hvd19zZWxlY3QgOiBmdW5jdGlvbigpe1xuXG4gICAgLy93ecWbd2lldGxhbXkgcGFuZWwgZG8gd3lib3J1IGtvbHVtbnkga2F0ZWdvcmlpXG4gICAgYWRkX2h0bWwgPSAnPG9wdGlvbiBjb2w9XCItMVwiPnd5Ymllcnoga29sdW1uxJk8L29wdGlvbj4nO1xuICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7ICBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZihpID09IGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgIH1cbiAgICB9XG4gICAgJCgnI2V4Y2VsX2JveCBzZWxlY3QuY2F0ZWdvcnknKS5odG1sKCBhZGRfaHRtbCApO1xuXG4gICAgLy93ecWbd2lldGxhbXkgcGFuZWwgZG8gd3lib3J1IGtvbHVtbnkgd2FydG/Fm2NpXG4gICAgYWRkX2h0bWwgPSAnPG9wdGlvbiBjb2w9XCItMVwiPnd5Ymllcnoga29sdW1uxJk8L29wdGlvbj4nO1xuICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7ICBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZihpID09IGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSl7XG4gICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCIgc2VsZWN0ZWQ+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGFkZF9odG1sICs9ICc8b3B0aW9uIGNvbD1cIicraSsnXCI+JyArZXhjZWwuZGF0YVswXVtpXSsgJzwvb3B0aW9uPic7ICBcbiAgICAgIH1cbiAgICB9XG4gICAgJCgnI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUnKS5odG1sKCBhZGRfaHRtbCApO1xuXG4gICAgLy9rb2xvcnVqZW15IG9kcG93aWVkbmlvIGV4Y2VsYVxuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICBcbiAgICBpZiggbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwidmFsdWVcIik7XG4gICAgfVxuXG4gICAgaWYoIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSAhPSAtMSl7XG4gICAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIH1cbiAgfSxcblxuICBzZXRfY2F0ZWdvcnkgOiBmdW5jdGlvbihvYmope1xuICAgIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG4gICAgJCgnI2V4Y2VsX3dyYXBwZXIgLnRkJykucmVtb3ZlQ2xhc3MoXCJjYXRlZ29yeVwiKTtcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICB9LCBcblxuICBzZXRfdmFsdWUgOiBmdW5jdGlvbihvYmope1xuXG4gICAgdmFyIHZhbHVlX3RtcCA9IHBhcnNlRmxvYXQoJChcIiNleGNlbF9ib3ggc2VsZWN0LnZhbHVlIG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG5cbiAgICBpZigkLmlzTnVtZXJpYyggZXhjZWwuZGF0YVsxXVt2YWx1ZV90bXBdICkpe1xuICAgICAgbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdID0gdmFsdWVfdG1wO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgYWxlcnQoJ3d5YnJhbmEga29sdW1uYSBuaWUgemF3aWVyYSBsaWN6YicpXG4gICAgfVxuICBcbiAgICAkKCcjZXhjZWxfd3JhcHBlciAudGQnKS5yZW1vdmVDbGFzcyhcInZhbHVlXCIpO1xuICAgICQoJyNleGNlbF93cmFwcGVyIC50ZFtjb2w9XCInKyhsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwidmFsdWVcIik7XG4gIFxuICAgIHZhciB0bXBfdmFsdWUgPSBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV07XG4gICAgXG4gICAgLy93eXN6dWt1amVteSBuYWptbmllanN6YSBpIG5handpxJlrc3rEhSB3YXJ0b8WbxIcgdyBrb2x1bW5pZSB3YXJ0b8WbY2lcbiAgICBpZiggbGF5ZXJzLnZhbHVlW3RtcF92YWx1ZV0gIT0gLTEgKXtcbiAgICAgIFxuICAgICAgdmFyIHRtcF9taW4gPSBleGNlbC5kYXRhWzFdW3RtcF92YWx1ZV1cbiAgICAgIHZhciB0bXBfbWF4ID0gZXhjZWwuZGF0YVsxXVt0bXBfdmFsdWVdO1xuICAgICAgZm9yKHZhciBpID0gMSwgaV9tYXggPSBleGNlbC5kYXRhLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuICAgICAgICBpZih0bXBfbWluID4gZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdKSB0bXBfbWluID0gZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdO1xuICAgICAgICBpZih0bXBfbWF4IDwgZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdKSB0bXBfbWF4ID0gZXhjZWwuZGF0YVtpXVt0bXBfdmFsdWVdO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coXCJtaW4gbWF4IHZhbHVlOiBcIix0bXBfbWluLCB0bXBfbWF4KTtcbiAgICB9XG5cbiAgICBsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21pblxuICAgIGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB0bXBfbWF4O1xuICAgIGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICB9LFxuXG4gIHNob3dfY29sb3IgOiBmdW5jdGlvbigpe1xuICAgIC8vd3nFm3dpZXRsYW15IHBpZXJ3c3phbGlzdMSZIGtvbG9yw7N3XG4gICAgdmFyIGh0bWwgPSAnJztcblxuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyWzBdLmxlbmd0aDsgaTxpX21heDsgaSsrKXtcbiAgICAgIFxuICAgICAgaWYobGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1baV0gPT0gMSl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwiYWN0aXZlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcl9hcnJbbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV1dW2ldKydcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGVsc2V7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZDonK3RoaXMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSsnXCI+PC9zcGFuPic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCgnI3BhbGV0cyAjc2VsZWN0JykuaHRtbCggaHRtbCApO1xuICAgIFxuICAgICQoJyNwYWxldHMgI3NlbGVjdCA+IHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBwYWxldHMuc2VsZWN0X2NvbG9yKHRoaXMpOyB9KTtcblxuICB9LFxuXG4gIHNob3dfcGFsZXRzIDogZnVuY3Rpb24oKXtcbiAgICBcbiAgICAvL3d5c3dpZXRsYW15IHdzenlzdGtpZSBwYWxldHlcbiAgICB2YXIgaHRtbCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBpX21heCA9IHRoaXMuY29sb3JfYXJyLmxlbmd0aDtpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0pe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiPic7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBodG1sICs9ICc8c3Bhbj4nO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMCwgal9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGogPCBqX21heDsgaisrKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9yX2FycltpXVtqXSArICdcIj48L3NwYW4+JztcbiAgICAgIH1cbiAgICAgIGh0bWwgKz0gJzwvc3Bhbj4nO1xuXG4gICAgfVxuICAgICQoJyNwYWxldHMgI2FsbCcpLmh0bWwoIGh0bWwgKTtcbiAgICAkKCcjcGFsZXRzICNhbGwgPiBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgcGFsZXRzLnNlbGVjdF9wYWxldHModGhpcyk7fSk7XG4gXG4gIH0sXG5cbiAgLy96YXpuYWN6YW15IGtvbmtyZXRuZSBrb2xvcnkgZG8gd3nFm3dpZXRsZW5pYVxuICBzZWxlY3RfY29sb3IgOiBmdW5jdGlvbihvYmope1xuICAgIGlmKCAkKG9iaikuaGFzQ2xhc3MoJ2FjdGl2ZScpICl7XG4gICAgICBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVskKG9iaikuaW5kZXgoKV0gPSAwO1xuICAgICAgJChvYmopLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdWyQob2JqKS5pbmRleCgpXSA9IDE7XG4gICAgICAkKG9iaikuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIH1cbiAgICB0aGlzLnBhcnNlX2NvbG9yKCk7XG5cbiAgfSxcblxuICBwYXJzZV9jb2xvciA6IGZ1bmN0aW9uKCl7XG4gICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBbXTtcbiAgICAgZm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gdGhpcy5jb2xvcl9hcnJbMF0ubGVuZ3RoOyBpPGlfbWF4OyBpKyspe1xuXG4gICAgICBpZiggJCgnI3BhbGV0cyAjc2VsZWN0IHNwYW4nKS5lcShpKS5oYXNDbGFzcygnYWN0aXZlJykgKXtcbiAgICAgICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ucHVzaCggcmdiMmhleCgkKCcjcGFsZXRzICNzZWxlY3Qgc3BhbicpLmVxKGkpLmNzcygnYmFja2dyb3VuZC1jb2xvcicpKSApO1xuICAgICAgfVxuICAgICB9XG4gICAgY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gICAgLy9mdW5rY2phIHBvbW9jbmljemFcbiAgICBmdW5jdGlvbiByZ2IyaGV4KHJnYikge1xuICAgICAgcmdiID0gcmdiLm1hdGNoKC9ecmdiXFwoKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxcKSQvKTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gaGV4KHgpIHtcbiAgICAgICAgcmV0dXJuIChcIjBcIiArIHBhcnNlSW50KHgpLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiI1wiICsgaGV4KHJnYlsxXSkgKyBoZXgocmdiWzJdKSArIGhleChyZ2JbM10pO1xuICAgIH1cbiAgfSxcblxuICAvL3phem5hY3phbXkgcGFsZXRlIGtvbG9yw7N3XG4gIHNlbGVjdF9wYWxldHMgOiBmdW5jdGlvbihvYmope1xuICAgICQoJyNwYWxldHMgI2FsbCA+IHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgJChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICBsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9ICQob2JqKS5pbmRleCgpO1xuICAgIFxuICAgIC8vYWt0dWFsaXp1amVteSBwYWxldMSZIGFrdHl3bnljaCBrb2xvcsOzd1xuICAgIGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdID0gW107XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdW2ldID09IDEpe1xuICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCBwYWxldHMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2hvd19jb2xvcigpO1xuICAgIGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICB9XG59XG5cbi8vemRhcnplbmlhIGRvdHljesSFY2UgcGFsZXRcbiQoJyNleGNlbF9ib3ggc2VsZWN0LmNhdGVnb3J5JykuY2hhbmdlKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZXRfY2F0ZWdvcnkodGhpcyk7IH0pO1xuJCgnI2V4Y2VsX2JveCBzZWxlY3QudmFsdWUnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgcGFsZXRzLnNldF92YWx1ZSh0aGlzKTsgfSk7IiwiLy9tZW51IHBvaW50ZXJcbnZhciBwb2ludGVycyA9IHtcblx0c2hvd19hbGxfcG9pbnQgOiB0cnVlLFxuXHRwYWRkaW5nX3ggOiAxLFxuXHRwYWRkaW5nX3kgOiAxLFxuXHR0cmFuc2xhdGVfbW9kdWxvIDogZmFsc2UsXG5cdHNpemUgOiAxMCxcblx0bWFpbl9raW5kIDogJ3NxdWFyZScsXG5cdGtpbmRzIDogQXJyYXkoJ3NxdWFyZScsJ2NpcmNsZScsJ2hleGFnb24nLCdoZXhhZ29uMicpLFxuXG5cdHBvaW50ZXJzIDogQXJyYXkoKSwgLy9wb2ludGVycy5wb2ludGVyc1tyemFkXVtrb2x1bW5hXSA6IGthdGVnb3JpYVtudW1lcl1cblxuXHRsYXN0X2NvbHVtbiA6IG51bGwsXHQvL2tvbHVtbmEgcG9pbnRlcmEga3TDs3J5IHpvc3RhxYIgb3N0YXRuaW8gem1pZW5pb255XG5cdGxhc3Rfcm93IDogbnVsbCxcdC8vd2llcnN6IHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXG5cblx0Ly9yeXNvd2FuaWUgd3N6eXN0a2ljaCBwdW5rdMOzd1xuXHRkcmF3IDogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2lkdGhfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ194O1xuXHRcdHZhciBoZWlnaHRfcG9pbnRlciA9IHRoaXMuc2l6ZSArIHRoaXMucGFkZGluZ195O1xuXHRcdHZhciBub25lX2NvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCJcblxuXHRcdGlmKHRoaXMuc2hvd19hbGxfcG9pbnQpIG5vbmVfY29sb3IgPSBcInJnYmEoMTI4LDEyOCwxMjgsMSlcIjtcblxuXHRcdGZvcih2YXIgcm93ID0gMDsgcm93IDwgY2FudmFzLmFjdGl2ZV9yb3c7IHJvdysrKXtcblx0XHRcdGZvcih2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKXtcblxuXHRcdFx0XHRpZih0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9PSAwKXtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBub25lX2NvbG9yO1xuXHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMC41O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0aWYoICh0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSAhPSBtZW51X3RvcC5jYXRlZ29yeSkgJiYgKG1lbnVfdG9wLmNhdGVnb3J5ICE9IDApICl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuMlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnlbIHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dIF1bMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoKGUpe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ0VSUk9SIDM5IExJTkUgISAnLHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dLHJvdyxjb2x1bW4pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCAocm93ICUgMiA9PSAwKSAmJiAocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgKXtcblx0XHRcdFx0XHR3aW5kb3dbJ2ZpZ3VyZXMnXVt0aGlzLm1haW5fa2luZF0oIGNvbHVtbip3aWR0aF9wb2ludGVyICsgd2lkdGhfcG9pbnRlci8yICwgcm93KmhlaWdodF9wb2ludGVyICwgdGhpcy5zaXplKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHdpbmRvd1snZmlndXJlcyddW3RoaXMubWFpbl9raW5kXSggY29sdW1uKndpZHRoX3BvaW50ZXIgLCByb3cqaGVpZ2h0X3BvaW50ZXIgLCB0aGlzLnNpemUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Ly90d29yenlteSB0YWJsaWNlIHBvbnRlcsOzdyAoamXFm2xpIGpha2nFmyBwb250ZXIgaXN0bmllamUgem9zdGF3aWFteSBnbywgdyBwcnp5cGFka3UgZ2R5IHBvaW50ZXJhIG5pZSBtYSB0d29yenlteSBnbyBuYSBub3dvKVxuXHRjcmVhdGVfYXJyYXkgOiBmdW5jdGlvbigpe1xuXHRcdGNhbnZhcy5hY3RpdmVfcm93ID0gcGFyc2VJbnQoIGNhbnZhcy5oZWlnaHRfY2FudmFzIC8gKHBvaW50ZXJzLnNpemUgKyBwb2ludGVycy5wYWRkaW5nX3kpICk7XG5cdFx0Y2FudmFzLmFjdGl2ZV9jb2x1bW4gPSBwYXJzZUludCggY2FudmFzLndpZHRoX2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXG5cdFx0aWYoICh0aGlzLnBvaW50ZXJzLmxlbmd0aCA8IGNhbnZhcy5hY3RpdmVfcm93KSB8fCAodGhpcy5wb2ludGVyc1swXS5sZW5ndGggPCBjYW52YXMuYWN0aXZlX2NvbHVtbikgKVxuXHRcdHtcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKylcblx0XHRcdHtcblx0XHRcdFx0Zm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW47IGNvbHVtbisrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddID09IHVuZGVmaW5lZCkgdGhpcy5wb2ludGVyc1tyb3ddID0gbmV3IEFycmF5KCk7XG5cdFx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gdW5kZWZpbmVkKVx0dGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZV9wb2ludCA6IGZ1bmN0aW9uKHkseCx5X2xhc3QseF9sYXN0KXtcblxuXHRcdHRoaXMucG9pbnRlcnNbeV1beF0gPSBwYXJzZUludCggbWVudV90b3AuY2F0ZWdvcnkgKTtcblxuXHRcdC8vd3l6bmFjemVuaWUgcsOzd25hbmlhIHByb3N0ZWpcblx0XHRpZiggKCh5X2xhc3QgIT0geSkgfHwgKHhfbGFzdCAhPSB4KSkgJiYgKHlfbGFzdCAhPSBudWxsKSAmJiAoeF9sYXN0ICE9IG51bGwpICl7XG5cdFx0XHR2YXIgYSA9ICh5X2xhc3QgLSB5KSAvICh4X2xhc3QgLSB4KTtcblx0XHRcdHZhciBiID0geSAtIGEqeDtcblxuXHRcdFx0aWYoeF9sYXN0ID4geCl7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHg7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIGNvbF90byA9IHg7XG5cdFx0XHRcdHZhciBjb2xfZnJvbSA9IHhfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0aWYoeV9sYXN0ID4geSl7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHk7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5X2xhc3Q7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHJvd190byA9IHk7XG5cdFx0XHRcdHZhciByb3dfZnJvbSA9IHlfbGFzdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJvdyA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGNvbCA9IGNvbF9mcm9tOyBjb2wgPD0gY29sX3RvOyBjb2wrKylcblx0XHRcdHtcblx0XHRcdFx0cm93ID0gcGFyc2VJbnQoIGEqY29sK2IgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKHJvdykpIHJvdyA9IHk7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjb2wgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciByb3cgPSByb3dfZnJvbTsgcm93IDw9IHJvd190bzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGNvbCA9IHBhcnNlSW50KCAocm93LWIpL2EgKTtcblx0XHRcdFx0aWYoISQuaXNOdW1lcmljKGNvbCkpIGNvbCA9IHg7XG5cdFx0XHRcdHRoaXMucG9pbnRlcnNbcm93XVtjb2xdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cdFx0fVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=