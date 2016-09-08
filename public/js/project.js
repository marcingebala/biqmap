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

		//konwertujemy nasza tablice na json
		console.log('MAP _ JSON', this.map_json, JSON.stringify( this.map_json ));
		this.map_json = JSON.stringify(this.map_json);

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
	data : [["wojewodztwo","wartosc1","wartosc2","wartosc3"],["krowodrza",1.4,20,6],["srodmiescie",1.6,50,43],["nowa_huta",2,34,3],["wielkopolska",1,32,6]],
	min_row : 10,
	min_col : 6,
  //column : ,
  //my_category : ['wybierz kategorię'],
  //my_value : ['wybierz wartość'],

	init : function(){

		//dodanie eventów przy kliknięciu excela
		$('#excel button').click(function(){
			$('#excel input').click();
			$('#excel input').change(function(){
				excel.send_file();
			})
		});

		$("#excel .table").scroll(function(e){
			console.log('test');
      e.stopPropagation();
      e.preventDefault();
    });

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

		$('#excel .table').html( add_html );

		//dodajemy możliwość edycji excela
		$('#excel .table .td').blur(function(){
			excel.data[$(this).attr('row')][$(this).attr('col')] = $(this).html();
		});



	/*
		$("#excel .tr").each(function(index, obj){
			
			$(obj).children('.td').eq(0).html( index-1 );
			//console.log(index, obj);
		});

		$("#excel .tr").eq(0).find(".td").each(function(index, obj){
			
			$(obj).html( excel.alpha[index] );
			//console.log(index, obj);
		});
	*/

	},

	send_file : function() {

var excel_form = new FormData(); 
excel_form.append("excel_file", $("#excel input")[0].files[0]);

 $.ajax( {
      url: '/api/projects/excel_parse',
      type: 'POST',
      data: excel_form,
      processData: false,
      contentType: false
    } ).done(function( response ) {
			console.log( response )
    	excel.data = response.excel[0].data;
    	//excel.parser();
    	excel.draw();

    });



//console.log( typeof $("#excel input")[0].files[0] );

/*


		console.log( excel_form )
	}

*/

},
/*
parser : function(){

	for(var i = 0, i_max = this.data.length; i < i_max; i++){
			
			[this.data_parser[this.data[i][0]]] = [];
			console.log( this.data_parser[this.data[i][0]] );

			for(var j = 0, j_max = this.data[i].length; j < j_max; j++){
				alert('ho!');
				console.log( this.data[i][j] );
				[this.data_parser[this.data[i][0]]].push(this.data[i][j]); 
			}
	}

}*/

}

excel.init();
//excel.parser();
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
		if( $(event.target).parent().css('right') == '0px' ){
			$(event.target).parent().animate({right: [-$(event.target).parent().width()-20,"easeOutBounce"]}, 1000, function() {});
    }
    else{
    	 $(event.target).parent().animate({right: ["0px","easeOutBounce"]}, 1000, function() {});
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

		html += '<button class="add">+</button><button class="remove">-</button>';

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
			layers.legends[layers.active].push([  Math.round( (layers.min_value[layers.active]+diffrent*i)*100) / 100, layers.colors_active[layers.active][i] ]);
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
	$('#category_box h2, #pointer_box h2').click(function(event){ global.toogle_panel(event); });

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
    $('#palets .category').html( add_html );

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
    $('#palets .value').html( add_html );

    //kolorujemy odpowiednio excela
    $('#excel .td').removeClass("value");
    $('#excel .td').removeClass("category");
    
    if( layers.value[layers.active] != -1){
      $('#excel .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
    }

    if( layers.category[layers.active] != -1){
      $('#excel .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    }
  },

  set_category : function(obj){
    layers.category[layers.active] = parseFloat($("#palets select.category option:selected").attr('col'));
    $('#excel .td').removeClass("category");
    $('#excel .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    categories.color_from_excel();
  }, 

  set_value : function(obj){

    var value_tmp = parseFloat($("#palets select.value option:selected").attr('col'));

    if($.isNumeric( excel.data[1][value_tmp] )){
      layers.value[layers.active] = value_tmp;
    }
    else{
      alert('wybrana kolumna nie zawiera liczb')
    }
  
    $('#excel .td').removeClass("value");
    $('#excel .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
  
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
    categories.color_from_excel();
  },

  parse_color : function(){
    layers.colors_active[layers.active] = [];
     for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){

      if( $('#palets #select span').eq(i).hasClass('active') ){
        layers.colors_active[layers.active].push( rgb2hex($('#palets #select span').eq(i).css('background-color')) );
      }
     }

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
$('#palets select.category').change(function(){ palets.set_category(this); });
$('#palets select.value').change(function(){ palets.set_value(this); });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbnZhcy5qcyIsImNhdGVnb3JpZXMuanMiLCJjbG91ZC5qcyIsImNvbG9yX3BpY2tlci5qcyIsImNydWQuanMiLCJleGNlbC5qcyIsImZpZ3VyZXMuanMiLCJnbG9iYWwuanMiLCJpbWFnZS5qcyIsImlucHV0LmpzIiwibGF5ZXJzLmpzIiwibGVnZW5kcy5qcyIsIm1haW4uanMiLCJtZW51X3RvcC5qcyIsIm1vZGVscy5qcyIsIm1vdXNlLmpzIiwib25fY2F0ZWdvcnkuanMiLCJwYWxldHMuanMiLCJwb2ludGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vY3p5c3pjemVuaWUgaSByeXNvd2FuaWUgcG8gY2FudmFzaWVcbnZhciBjYW52YXMgPSB7XG5cdFxuXHRzY2FsZSA6IDEwMCxcblx0d2lkdGhfY2FudmFzIDogNzAwLFxuXHRoZWlnaHRfY2FudmFzIDogNDAwLFxuXHRjYW52YXMgOiBudWxsLFxuXHRjb250ZXh0IDogbnVsbCxcblx0dGh1bWJuYWlsIDogbnVsbCxcblx0dGl0bGVfcHJvamVjdCA6ICdub3d5IHByb2pla3QnLFxuXG5cdGNvbnRleHRfeCA6IDAsIC8vb2JlY25hIHBvenljamEgY29udGV4dHUgeFxuXHRjb250ZXh0X3kgOiAwLCAvL29iZWNuYSBwb3p5Y2phIGNvbnRleHR1IHlcblx0Y29udGV4dF9uZXdfeCA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHhcblx0Y29udGV4dF9uZXdfeSA6IDAsIC8vbm93YSBwb3p5Y2phIGNvbnRleHR1IHlcblxuXHRvZmZzZXRfbGVmdCA6IG51bGwsXG5cdG9mZnNldF90b3AgOiBudWxsLFxuXHRhY3RpdmVfcm93IDogbnVsbCwgLy9saWN6YmEgYWt0eXdueWNoIHdpZXJzenkgaSBrb2x1bW5cblx0YWN0aXZlX2NvbHVtbiA6IG51bGwsIC8vbGljemJhIGFrdHl3bnljaCB3aWVyc3p5IGkga29sdW1uXG5cblx0dGh1bWJuYWlsIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluX2NhbnZhc1wiKTtcblx0XHR2YXIgZGF0YVVSTCA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblx0XHRjb25zb2xlLmxvZyhkYXRhVVJMKTtcblx0fSxcblxuXHQvL3J5c3VqZW15IGNhbnZhcyB6ZSB6ZGrEmWNpZW1cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0cG9pbnRlcnMuY3JlYXRlX2FycmF5KCk7XG5cdFx0cG9pbnRlcnMuZHJhdygpO1xuXG5cdFx0aWYgKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKSAgaW1hZ2UuZHJhdygpO1xuXHR9LFxuXG5cdGRyYXdfdGh1bW5haWwgOiBmdW5jdGlvbigpe1xuXG5cdFx0Y2FudmFzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHVtYm5haWxfY2FudmFzJyk7XG5cdFx0Y2FudmFzLnRodW1ibmFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHVtYm5haWxfY2FudmFzJyk7XG5cdFx0Y2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0XHR0aGlzLmNsZWFyKCk7XG5cblx0XHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblx0XHRwb2ludGVycy5kcmF3KCk7XG5cblx0XHRjYW52YXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5fY2FudmFzJyk7XG5cdFx0Y2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0fSxcblxuXHQvL3Jlc2V0dWplbXkgdMWCbyB6ZGrEmWNpYVxuXHRyZXNldCA6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb250ZXh0LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcblx0XHRjYW52YXMuY29udGV4dC5zY2FsZSggY2FudmFzLnNjYWxlIC8gMTAwICwgY2FudmFzLnNjYWxlIC8gMTAwICk7XG5cdH0sXG5cblx0Ly8gY3p5xZtjaW15IGNhxYJlIHpkasSZY2llIG5hIGNhbnZhc2llXG5cdGNsZWFyIDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbnRleHQuY2xlYXJSZWN0ICggMCwgMCwgdGhpcy53aWR0aF9jYW52YXMsIHRoaXMuaGVpZ2h0X2NhbnZhcyApO1xuXHRcdC8vdGhpcy5jb250ZXh0LmZpbGxSZWN0ICggMCwgMCwgdGhpcy53aWR0aF9jYW52YXMsIHRoaXMuaGVpZ2h0X2NhbnZhcyApO1xuXHR9LFxuXG5cdHJlc2l6ZV93aWR0aCA6IGZ1bmN0aW9uKG5ld193aWR0aCl7XG5cdFx0dGhpcy53aWR0aF9jYW52YXMgPSBuZXdfd2lkdGg7XG5cdFx0JCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLHRoaXMud2lkdGhfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogdGhpcy53aWR0aF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCcpLnZhbCh0aGlzLndpZHRoX2NhbnZhcyArICdweCcpO1xuXHRcdHRoaXMuc2NhbGUgPSAxMDA7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHRoaXMuc2NhbGUgKyAnJScpO1xuXHRcdG1lbnVfdG9wLnNob3dfaW5mbygpO1xuXHR9LFxuXG5cdHJlc2l6ZV9oZWlnaHQgOiBmdW5jdGlvbihuZXdfaGVpZ2h0KXtcblx0XHR0aGlzLmhlaWdodF9jYW52YXMgPSBuZXdfaGVpZ2h0O1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsdGhpcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J2hlaWdodCc6IHRoaXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCh0aGlzLmhlaWdodF9jYW52YXMgKyAncHgnKTtcblx0XHR0aGlzLnNjYWxlID0gMTAwO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCh0aGlzLnNjYWxlKyclJyk7XG5cdFx0bWVudV90b3Auc2hvd19pbmZvKCk7IC8vIGFrdHVhbGl6dWplbXkgZGFuZSBvZG5vxZtuaWUgcm96bWlhcsOzdyBjYW52YXNhIHcgbWVudSB1IGfDs3J5XG5cdFx0Ly90aGlzLmRyYXcoKTsgLy9yeXN1amVteSBuYSBub3dvIGNhbnZhc1xuXHR9LFxuXG5cdHNldF9kZWZhdWx0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2FudmFzX2JveCAjcmlnaHRfcmVzaXplLCAjY2FudmFzX2JveCAjYm90dG9tX3Jlc2l6ZScpLmZhZGVJbig1MDApO1xuXHRcdGlmKHRoaXMubW92ZV9pbWFnZSkgJCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmZhZGVJbigwKTtcblxuXHRcdGNhbnZhcy5zY2FsZSA9IDEwMDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gMDtcblx0XHRjYW52YXMuY29udGV4dF95ID0gMDtcblx0XHRjYW52YXMuY29udGV4dC5zY2FsZSggY2FudmFzLnNjYWxlIC8gMTAwICwgY2FudmFzLnNjYWxlIC8gMTAwICk7XG5cblx0XHR2YXIgbmV3X3dpZHRoID0gY2FudmFzLndpZHRoX2NhbnZhcyAqIChjYW52YXMuc2NhbGUvMTAwKTtcblx0XHR2YXIgbmV3X2hlaWdodCA9IGNhbnZhcy5oZWlnaHRfY2FudmFzICogKGNhbnZhcy5zY2FsZS8xMDApO1xuXHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoeyd3aWR0aCc6IG5ld193aWR0aCArICdweCcsJ2hlaWdodCc6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogbmV3X3dpZHRoICsgJ3B4JywnaGVpZ2h0JyA6IG5ld19oZWlnaHQgKyAncHgnfSk7XG5cblx0XHRjYW52YXMucmVzZXQoKTtcblx0XHRjYW52YXMuY29udGV4dC50cmFuc2xhdGUoICggY2FudmFzLmNvbnRleHRfeCAvIChjYW52YXMuc2NhbGUgLyAxMDApICksKCBjYW52YXMuY29udGV4dF95IC8gKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRtZW51X3RvcC5zaG93X2luZm8oKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBrYXRlZ29yaWkgZG9kYW5pZSAvIGFrdHVhbGl6YWNqYSAvIHVzdW5pxJljaWUgLyBwb2themFuaWUga2F0ZWdvcmlpXG52YXIgY2F0ZWdvcmllcyA9IHtcblx0Y2F0ZWdvcnkgOiBuZXcgQXJyYXkoWydwdXN0eScsJyM4MDgwODAnXSksXG5cblx0YWRkIDogZnVuY3Rpb24oKXtcblx0XHR2YXIgbmFtZSA9IEFycmF5KCQoJyNjYXRlZ29yeV9ib3ggaW5wdXRbbmFtZT1cImFkZF9jYXRlZ29yeVwiXScpLnZhbCgpLCcjZmYwMDAwJyk7XG5cdFx0JCgnI2NhdGVnb3J5X2JveCBpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykudmFsKCcnKTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkucHVzaChuYW1lKTtcblx0XHRtZW51X3RvcC5jYXRlZ29yeSA9ICh0aGlzLmNhdGVnb3J5Lmxlbmd0aC0xKTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXHR9LFxuXG5cdHVwZGF0ZSA6IGZ1bmN0aW9uKGluZGV4LG5hbWUpe1xuXHRcdHRoaXMuY2F0ZWdvcnlbaW5kZXhdWzBdID0gbmFtZTtcblx0XHR0aGlzLnNob3dfbGlzdCgpO1xuXHR9LFxuXG5cdC8vcG8gd3licmFuaXUgb2Rwb3dpZWRuaWVqIGtvbHVtbnkga2F0ZXJvZ2lpIGkgd2FydG/Fm2NpIGFrdHVhbGl6dWplbXkga29sb3Iga2F0ZWdvcmlpIG5hIHBvZHN0YXdpZSBleGNlbGFcblx0Y29sb3JfZnJvbV9leGNlbCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL21vxbxsaXdhIGFrdHVhbGl6YWNqYSBqZWR5bmllIHcgcHJ6eXBhZGt1IHd5YnJhbmlhIGtvbmtyZXRuZWoga29sdW1ueSB3YXJ0b8WbY2kgaSBrYXRlZ29yaWkgdyBleGNlbHVcblx0XHRpZigoY3J1ZC5tYXBfanNvbi5sZW5ndGggPiAwKSAmJiAoZXhjZWwuZGF0YS5sZW5ndGggPiAwKSAmJiAobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKSAmJiAobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdICE9IC0xKSl7XG5cblx0XHRcdC8vdXN0YWxhbXkgY28gaWxlIHptaWVuaWFteSBrb2xvciBuYSBrb2xlam55IFxuXHRcdFx0dmFyIGNvbG9yX2NvdW50ID0gbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoIC0gMSAvL2lsb3NjIGtvbG9yw7N3XG5cdFx0XHR2YXIgZGlmZnJlbnQgPSBNYXRoLmFicyggbGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSAtIGxheWVycy5tYXhfdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gKSAvIGNvbG9yX2NvdW50O1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMSwgaV9tYXggPSB0aGlzLmNhdGVnb3J5Lmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRcblx0XHRcdFx0Zm9yICh2YXIgaV9leCA9IDAsIGlfZXhfbWF4ID0gZXhjZWwuZGF0YVtsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV1dLmxlbmd0aDsgaV9leCA8IGlfZXhfbWF4OyBpX2V4Kyspe1xuXHRcdFxuXHRcdFx0XHRcdGlmKCB0aGlzLmNhdGVnb3J5W2ldWzBdID09IGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdXSl7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdFx0dmFyIGNvbG9yX2kgPSBNYXRoLmZsb29yKChwYXJzZUZsb2F0KGV4Y2VsLmRhdGFbaV9leF1bbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdXSktcGFyc2VGbG9hdChsYXllcnMubWluX3ZhbHVlW2xheWVycy5hY3RpdmVdKSkgLyBkaWZmcmVudCk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhjb2xvcl9pLCAocGFyc2VGbG9hdChleGNlbC5kYXRhW2lfZXhdW2xheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXV0pLXBhcnNlRmxvYXQobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSkpLCBkaWZmcmVudCApO1xuXHRcdFx0XHRcdFx0dGhpcy5jYXRlZ29yeVtpXVsxXSA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdW2NvbG9yX2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9wbyB6YWt0dWFsaXpvd2FuaXUga29sb3LDs3cgdyBrYXRlZ29yaWFjaCByeXN1amVteSBuYSBub3dvIGNhbnZhc1xuXHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdGxlZ2VuZHMudXBkYXRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbW92ZSA6IGZ1bmN0aW9uKGlkKXtcblx0XHR2YXIgdGggPSB0aGlzO1xuXG5cdFx0JC5lYWNoKHRoaXMuY2F0ZWdvcnksZnVuY3Rpb24oaW5kZXgsdmFsdWUpe1xuXHRcdFx0aWYoaW5kZXggPj0gaWQpe1xuXHRcdFx0XHR0aC5jYXRlZ29yeVtpbmRleF0gPSB0aC5jYXRlZ29yeVtpbmRleCsxXTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGZvcih2YXIgcm93ID0gMDsgcm93IDwgcG9pbnRlcnMucG9pbnRlcnMubGVuZ3RoOyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IHBvaW50ZXJzLnBvaW50ZXJzW3Jvd10ubGVuZ3RoOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IGlkKXtcblx0XHRcdFx0XHRwb2ludGVycy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPSAwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYocG9pbnRlcnMucG9pbnRlcnNbcm93XVtjb2x1bW5dID4gaWQpe1xuXHRcdFx0XHRcdHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSA9IHBhcnNlSW50KHBvaW50ZXJzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSkgLSAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmNhdGVnb3J5LnBvcCgpO1xuXHRcdHRoaXMuc2hvd19saXN0KCk7XG5cblx0XHQvL3J5c3VqZW15IG5hIG5vd8SFIGNhbnZhc1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0c2hvd19saXN0IDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBhZGRfY2F0ZWdvcnkgPSBcIjx0YWJsZT5cIjtcblx0XHQvL3ZhciBhZGRfc2VsZWN0ID0nPG9wdGlvbiBuYW1lPVwiMFwiPnB1c3R5PC9vcHRpb24+Jztcblx0XHR2YXIgYWRkX3NlbGVjdCA9ICcnO1xuXG5cdFx0Zm9yKHZhciBpID0gdGhpcy5jYXRlZ29yeS5sZW5ndGg7IGkgPiAxOyBpLS0pe1xuXHRcdFx0YWRkX2NhdGVnb3J5ICs9ICc8dHI+PHRkPjxzcGFuPicrKGktMSkrJzwvc3Bhbj48L3RkPjx0ZD48aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiY2F0ZWdvcnlfbmFtZVwiIGlkX2NhdGVnb3J5PVwiJysoaS0xKSsnXCIgdmFsdWU9XCInK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKydcIiAvPjwvdGQ+PHRkPjxkaXYgY2xhc3M9XCJjb2xvcnBpY2tlcl9ib3hcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6Jyt0aGlzLmNhdGVnb3J5WyhpLTEpXVsxXSsnXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj48L2Rpdj48L3RkPjx0ZD48YnV0dG9uIGNsYXNzPVwicmVtb3ZlXCIgaWRfY2F0ZWdvcnk9XCInKyhpLTEpKydcIj51c3VuPC9idXR0b24+PC90ZD48L3RyPic7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCInKyhpLTEpKydcIj4nK3RoaXMuY2F0ZWdvcnlbKGktMSldWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblx0XHRpZihtZW51X3RvcC5jYXRlZ29yeSA9PSAwKXtcblx0XHRcdGFkZF9zZWxlY3QgKz0gJzxvcHRpb24gc2VsZWN0ZWQgbmFtZT1cIjBcIj4nK3RoaXMuY2F0ZWdvcnlbMF1bMF0rJzwvb3B0aW9uPic7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRhZGRfc2VsZWN0ICs9ICc8b3B0aW9uIG5hbWU9XCIwXCI+Jyt0aGlzLmNhdGVnb3J5WzBdWzBdKyc8L29wdGlvbj4nO1xuXHRcdH1cblxuXG5cdFx0YWRkX2NhdGVnb3J5ICs9IFwiPC90YWJsZT5cIjtcblxuXHRcdCQoJyNjYXRlZ29yeV9ib3ggI2xpc3QnKS5odG1sKGFkZF9jYXRlZ29yeSk7XG5cdFx0JCgnc2VsZWN0I2NoYW5nZV9jYXRlZ29yeScpLmh0bWwoYWRkX3NlbGVjdCk7XG5cblx0XHRjb2xvcnBpY2tlci5hZGQoKTtcblx0fVxufVxuIiwiY2xvdWQgPSB7XG5cblx0c2V0X3RleHRhcmVhIDogZnVuY3Rpb24oKXtcblx0XHQkKCcjY2xvdWQgdGV4dGFyZWEnKS52YWwoIGxheWVycy5jbG91ZFtsYXllcnMuYWN0aXZlXSApO1xuXHR9LFxuXG5cdGdldF90ZXh0YXJlYSA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgdGV4dF90bXAgPSAkKG9iaikudmFsKCk7XG5cblx0XHRsYXllcnMuY2xvdWRbbGF5ZXJzLmFjdGl2ZV0gPSB0ZXh0X3RtcDtcblxuXHRcdGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gZXhjZWwuZGF0YVswXS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdHRleHRfdG1wID0gdGV4dF90bXAucmVwbGFjZSgnJCcrZXhjZWwuZGF0YVswXVtpXSwnXCIrZXhjZWwuZGF0YVt0bXBfcm93XVsnK2krJ11cIisnKTtcblx0XHR9XG5cblx0XHRsYXllcnMuY2xvdWRfcGFyc2VyW2xheWVycy5hY3RpdmVdID0gJ1wiJyt0ZXh0X3RtcCsnXCInO1xuXHR9LFxuXG5cdC8vdXN0YXdpYW15IHBvcHJhd27EhSBwb3p5Y2rEmSBkeW1rYVxuXHRzZXRfcG9zaXRpb24gOiBmdW5jdGlvbigpe1xuXHRcdHZhciBsZWZ0ID0gbW91c2UubGVmdCAtIG9uX2NhdGVnb3J5LmNhbnZhc19vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gb25fY2F0ZWdvcnkuY2FudmFzX29mZnNldF90b3A7XG5cblx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5jc3Moe3RvcDpwYXJzZUludCh0b3AgLSAkKFwiI2NhbnZhc19jbG91ZFwiKS5oZWlnaHQoKS0zMCkrJ3B4JyxsZWZ0OmxlZnQrJ3B4J30pO1xuXHR9LFxuXG5cdC8vZnVua2NqYSBvZHBvd2llZHppYWxuYSB6YSB3ecWbd2lldGxlbmllIGR5bWthIHogb2Rwb3dpZWRuacSFIHphd2FydG/Fm2NpxIVcblx0dXBkYXRlX3RleHQgOiBmdW5jdGlvbihuYW1lKXtcblxuXHRcdGlmKG5hbWUgIT0gXCJudWxsXCIpe1xuXG5cdFx0XHR2YXIgdG1wX3JvdyA9IG51bGw7XG5cdFx0XHR2YXIgZmluZCA9IDA7XG5cdFx0XHRmb3IoIHZhciBpX3JvdyA9IDAsIGlfcm93X21heCA9IGV4Y2VsLmRhdGEubGVuZ3RoOyBpX3JvdyA8IGlfcm93X21heDsgaV9yb3crKyApe1xuXHRcdFx0XHRpZihuYW1lID09IGV4Y2VsLmRhdGFbaV9yb3ddW2xheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXV0pe1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRoaXMuc2V0X3Bvc2l0aW9uKCk7XG5cdFx0XHRcdFx0dmFyIHRleHRfdG1wID0gbGF5ZXJzLmNsb3VkW2xheWVycy5hY3RpdmVdO1xuXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XHRcdFx0dGV4dF90bXAgPSB0ZXh0X3RtcC5yZXBsYWNlKCckJytleGNlbC5kYXRhWzBdW2ldLGV4Y2VsLmRhdGFbaV9yb3ddW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly9kb3BpZXJvIGplxZtsaSBkeW1layBtYSBtaWXEhyBqYWthxZsga29ua3JldG7EhSB6YXdhcnRvxZvEhyB3ecWbd2lldGxhbXkgZ29cblx0XHRcdFx0XHRpZih0ZXh0X3RtcCE9XCJcIil7XG5cdFx0XHRcdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlSW4oMjAwKTtcblx0XHRcdFx0XHRcdCQoXCIjY2FudmFzX2Nsb3VkXCIpLmh0bWwodGV4dF90bXApO1xuXHRcdFx0XHRcdFx0ZmluZCA9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vamXFm2xpIG5pZSB6bmFsZXppb25vIG9kcG93aWVkbmllaiBrYXRlZ29yaWlcblx0XHRcdGlmICghZmluZCkgeyBcblx0XHRcdFx0JChcIiNjYW52YXNfY2xvdWRcIikuZmFkZU91dCgyMDApO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQkKFwiI2NhbnZhc19jbG91ZFwiKS5mYWRlT3V0KDIwMCk7XG5cdFx0fVxuXHR9XG5cbn1cblxuXG4kKCcjY2xvdWQgdGV4dGFyZWEnKS5rZXl1cChmdW5jdGlvbigpe1xuXG5jbG91ZC5nZXRfdGV4dGFyZWEodGhpcyk7XG5cbn0pIDsiLCIvL3NhbWEgbmF6d2Egd2llbGUgdMWCdW1hY3p5IHBvIHByb3N0dSBjb2xvcnBpY2tlclxudmFyIGNvbG9ycGlja2VyID0ge1xuXG5cdGNsaWNrX2lkIDogbnVsbCxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMucmVtb3ZlKCk7XG5cdFx0JCgnLmNvbG9ycGlja2VyX2JveCcpLkNvbG9yUGlja2VyKHtcblx0XHRcdGNvbG9yOiAnI2ZmMDAwMCcsXG5cdFx0XHRvblNob3c6IGZ1bmN0aW9uIChjb2xwa3IpIHtcblx0XHRcdFx0aWYoJChjb2xwa3IpLmNzcygnZGlzcGxheScpPT0nbm9uZScpe1xuXHRcdFx0XHRcdCQoY29scGtyKS5mYWRlSW4oMjAwKTtcblx0XHRcdFx0XHRjb2xvcnBpY2tlci5jbGlja19pZCA9ICQodGhpcykuYXR0cignaWRfY2F0ZWdvcnknKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25IaWRlOiBmdW5jdGlvbiAoY29scGtyKSB7XG5cdFx0XHRcdCQoY29scGtyKS5mYWRlT3V0KDIwMCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRvbkNoYW5nZTogZnVuY3Rpb24gKGhzYiwgaGV4LCByZ2IpIHtcblx0XHRcdFx0JCgnLmNvbG9ycGlja2VyX2JveFtpZF9jYXRlZ29yeT1cIicrY29sb3JwaWNrZXIuY2xpY2tfaWQrJ1wiXScpLmNzcygnYmFja2dyb3VuZENvbG9yJywgJyMnICsgaGV4KTtcblx0XHRcdFx0Y2F0ZWdvcmllcy5jYXRlZ29yeVtjb2xvcnBpY2tlci5jbGlja19pZF1bMV0gPSAnIycgKyBoZXg7XG5cdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0cmVtb3ZlIDogZnVuY3Rpb24oKXtcblx0XHQkKCcuY29sb3JwaWNrZXInKS5yZW1vdmUoKTtcblx0fVxufVxuIiwiLy9mdW5rY2phIG9kcG93aWVkemlhbG5hIHphIHR3b3J6ZW5pZSB6YXBpc3l3YW5pZSBpIGFrdHVhbGl6YWNqZSBkYW55Y2ggZG90eWN6xIXEh2N5aCBtYXB5XG52YXIgY3J1ZCA9IHtcblxuXHRtYXBfanNvbiA6IEFycmF5KCksIC8vZ8WCw7N3bmEgem1pZW5uYSBwcnplY2hvd3VqxIVjYSB3c3p5c3RraWUgZGFuZVxuXHRtYXBfaGFzaCA6IG51bGwsXG5cblx0c2VsZWN0X21hcCA6IGZ1bmN0aW9uKCBpZF9tYXAgKXtcblxuXHRcdC8vamXFm2xpIHVydWNob21pbXlcblx0XHRpZiAoaWRfbWFwID09ICduZXdfbWFwJykgeyBcblx0XHRcdHRoaXMuY3JlYXRlX21hcCgpIFxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5tYXBfaGFzaCA9IGlkX21hcDtcblx0XHRcdHRoaXMuZ2V0X21hcCgpO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8vcG9iaWVyYW15IGRhbmUgeiBwb3JvamVrdHUgaSB6YXBpc3VqZW15IGplIGRvIGpzb24tYVxuXHRnZXRfZGF0YSA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL3plcnVqZW15IG5hIG5vd28gY2HFgsSFIHRhYmxpY8SZIHBvaW50ZXLDs3dcblx0XHR0aGlzLm1hcF9qc29uID0gQXJyYXkoKTtcblxuXHRcdC8vIGRhdGFbeF0gPSB6bWllbm5lIHBvZHN0YXdvd2UgZG90eWN6xIVjZSBtYXB5XG5cdFx0dGhpcy5tYXBfanNvblswXSA9IEFycmF5KCk7XG5cdFx0dGhpcy5tYXBfanNvblswXVswXSA9IGNhbnZhcy5oZWlnaHRfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMV0gPSBjYW52YXMud2lkdGhfY2FudmFzO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bMl0gPSBwb2ludGVycy5wYWRkaW5nX3g7XG5cdFx0dGhpcy5tYXBfanNvblswXVszXSA9IHBvaW50ZXJzLnBhZGRpbmdfeTtcblx0XHR0aGlzLm1hcF9qc29uWzBdWzRdID0gcG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbztcblx0XHR0aGlzLm1hcF9qc29uWzBdWzVdID0gcG9pbnRlcnMuc2l6ZV9wb2ludGVyO1xuXHRcdHRoaXMubWFwX2pzb25bMF1bNl0gPSBwb2ludGVycy5tYWluX2tpbmQ7XG5cdFx0dGhpcy5tYXBfanNvblswXVs3XSA9IGNhbnZhcy50aXRsZV9wcm9qZWN0O1xuXG5cdFx0Ly8gZGF0YVsxXSA9IHRhYmxpY2EgcHVua3TDs3cgKHBvaW50ZXJzLnBvaW50ZXJzKSBbd2llcnN6XVtrb2x1bW5hXSA9IFwibm9uZVwiIHx8IChudW1lciBrYXRlZ29yaWkpXG5cdFx0dGhpcy5tYXBfanNvblsxXSA9IHBvaW50ZXJzLnBvaW50ZXJzO1xuXG5cdFx0Ly8gZGF0YVsyXSA9IHRhYmxpY2Ega2F0ZWdvcmlpXG5cdFx0dGhpcy5tYXBfanNvblsyXSA9IGNhdGVnb3JpZXMuY2F0ZWdvcnk7XG5cblx0XHQvL2RhdGFbM10gPSB0YWJsaWNhIHd6b3JjYSAoemRqxJljaWEgdyB0bGUgZG8gb2RyeXNvd2FuaWEpXG5cdFx0dGhpcy5tYXBfanNvblszXSA9IEFycmF5KCk7XG5cblx0XHRpZihpbWFnZS5vYmope1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVswXSA9IGltYWdlLm9iai5zcmM7XG5cdFx0XHR0aGlzLm1hcF9qc29uWzNdWzFdID0gaW1hZ2UueDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bMl0gPSBpbWFnZS55O1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVszXSA9IGltYWdlLndpZHRoO1xuXHRcdFx0dGhpcy5tYXBfanNvblszXVs0XSA9IGltYWdlLmhlaWdodDtcblx0XHRcdHRoaXMubWFwX2pzb25bM11bNV0gPSBpbWFnZS5hbHBoYTtcblx0XHR9XG5cblx0XHQvL2tvbndlcnR1amVteSBuYXN6YSB0YWJsaWNlIG5hIGpzb25cblx0XHRjb25zb2xlLmxvZygnTUFQIF8gSlNPTicsIHRoaXMubWFwX2pzb24sIEpTT04uc3RyaW5naWZ5KCB0aGlzLm1hcF9qc29uICkpO1xuXHRcdHRoaXMubWFwX2pzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1hcF9qc29uKTtcblxuXHR9LFxuXG5cdC8vcG9icmFuaWUgbWFweSB6IGJhenkgZGFueWNoXG5cdGdldF9tYXAgOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIHRoID0gdGhpcztcblxuXHRcdCQuYWpheCh7XG5cdFx0XHQgIHVybDogJy9hcGkvbWFwcy8nICsgdGgubWFwX2hhc2gsXG5cdFx0ICBcdHR5cGU6IFwiR0VUXCIsXG5cdFx0ICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdFx0fSkuZG9uZShmdW5jdGlvbiggZGF0YSApIHtcblxuXHRcdFx0Y29uc29sZS5sb2coIGRhdGEuZGF0YVswXSApO1xuXG5cdFx0XHQvL3BvIHphcGlzYW5pdSBkYW55Y2ggZG8gYmF6eSBha3R1YWxpenVqZW15IGlkICh3IHByenlwYWRrdSBqZcWbbGkgaXN0bmllamUgbmFkcGlzdWplbXkgamUpXG5cdFx0XHR2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEuZGF0YVswXS5tYXBfanNvbik7XG5cdFx0XHR0aC5tYXBfanNvbiA9IHJlc3BvbnNlO1xuXG5cdFx0XHQvL3BvYmllcmFteSBpIHdjenl0dWplbXkgZGFuZSBvIGNhbnZhc2llIGRvIG9iaWVrdHVcblx0XHRcdGNhbnZhcy5oZWlnaHRfY2FudmFzID0gcmVzcG9uc2VbMF1bMF07XG5cdFx0XHRjYW52YXMud2lkdGhfY2FudmFzID0gcmVzcG9uc2VbMF1bMV07XG5cdFx0XHRwb2ludGVycy5wYWRkaW5nX3ggPSByZXNwb25zZVswXVsyXTtcblx0XHRcdHBvaW50ZXJzLnBhZGRpbmdfeSA9IHJlc3BvbnNlWzBdWzNdO1xuXHRcdFx0cG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbyA9IHJlc3BvbnNlWzBdWzRdO1xuXHRcdFx0cG9pbnRlcnMuc2l6ZV9wb2ludGVyID0gcmVzcG9uc2VbMF1bNV07XG5cdFx0XHRwb2ludGVycy5tYWluX2tpbmQgPSByZXNwb25zZVswXVs2XTtcblx0XHRcdGNhbnZhcy50aXRsZV9wcm9qZWN0ID0gcmVzcG9uc2VbMF1bN107XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBpbnB1dFtuYW1lPVwicGFkZGluZ194XCJdJykudmFsKCByZXNwb25zZVswXVsyXSApO1xuXHRcdFx0JCgnI3BvaW50ZXJfYm94IGlucHV0W25hbWU9XCJwYWRkaW5nX3lcIl0nKS52YWwoIHJlc3BvbnNlWzBdWzNdICk7XG5cdFx0XHQkKCcjcG9pbnRlcl9ib3ggaW5wdXRbbmFtZT1cInNpemVfcG9pbnRlclwiXScpLnZhbCggcmVzcG9uc2VbMF1bNV0gKTtcblx0XHRcdCQoJ2lucHV0W25hbWU9XCJ0aXRsZV9wcm9qZWN0XCJdJykudmFsKCByZXNwb25zZVswXVs3XSApO1xuXG5cdFx0XHRpZiggcmVzcG9uc2VbMF1bNF0gKXtcblx0XHRcdFx0JCgnI3BvaW50ZXJfYm94IGRpdltuYW1lPVwidHJhbnNsYXRlX21vZHVsb1wiXScpLnJlbW92ZUNsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHRcdCQoJyNwb2ludGVyX2JveCBkaXZbbmFtZT1cInRyYW5zbGF0ZV9tb2R1bG9cIl0nKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR9XG5cblx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmh0bWwoJycpO1xuXG5cdFx0XHRwb2ludGVycy5raW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGtpbmQpe1xuXG5cdFx0XHRcdGlmKGtpbmQgPT0gcmVzcG9uc2VbMF1bNl0pe1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBzZWxlY3RlZD1cInNlbGVjdGVkXCIgbmFtZT1cIicra2luZCsnXCI+JytraW5kKyc8L29wdGlvbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdCQoJyNwb2ludGVyX2JveCBzZWxlY3RbbmFtZT1cIm1haW5fa2luZFwiXScpLmFwcGVuZCgnPG9wdGlvbiBuYW1lPVwiJytraW5kKydcIj4nK2tpbmQrJzwvb3B0aW9uPicpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0XHQvL3BvYmllcmFteSBkYW5lIG8gcG9pbnRlcmFjaFxuXHRcdFx0cG9pbnRlcnMucG9pbnRlcnMgPSByZXNwb25zZVsxXTtcblxuXHRcdFx0Ly9wb2JpZXJhbXkgZGFuZSBvIGthdGVnb3JpYWNoXG5cdFx0XHRjYXRlZ29yaWVzLmNhdGVnb3J5ID0gcmVzcG9uc2VbMl07XG5cblx0XHRcdC8vcG9iaWVyYW5pZSBkYW55Y2ggbyB6ZGrEmWNpdSBqZcW8ZWxpIGlzdG5pZWplXG5cdFx0XHRpZiggcmVzcG9uc2VbM10ubGVuZ3RoID4gMil7XG5cdFx0XHRcdGltYWdlLm9iaiA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0XHRpbWFnZS5vYmouc3JjID0gcmVzcG9uc2VbM11bMF07XG5cdFx0XHRcdGltYWdlLnggPSBwYXJzZUludCggcmVzcG9uc2VbM11bMV0gKTtcblx0XHRcdFx0aW1hZ2UueSA9IHBhcnNlSW50KCByZXNwb25zZVszXVsyXSApO1xuXHRcdFx0XHRpbWFnZS53aWR0aCA9IHBhcnNlSW50KCByZXNwb25zZVszXVszXSApO1xuXHRcdFx0XHRpbWFnZS5oZWlnaHQgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNF0gKTtcblx0XHRcdFx0aW1hZ2UuYWxwaGEgPSBwYXJzZUludCggcmVzcG9uc2VbM11bNV0gKTtcblxuXHRcdFx0XHQvL3phem5hY3plbmllIG9kcG93aWVkbmllZ28gc2VsZWN0YSBhbHBoYSB3IG1lbnUgdG9wXG5cdFx0XHRcdCQoJyNhbHBoYV9pbWFnZSBvcHRpb25bbmFtZT1cIicrXHRpbWFnZS5hbHBoYSArJ1wiXScpLmF0dHIoJ3NlbGVjdGVkJyx0cnVlKTtcblxuXHRcdFx0XHRpbWFnZS5vYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0Ly96YWt0dWFsaXpvd2FuaWUgZGFueWNoIHcgaW5wdXRhY2hcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ3dpZHRoJywgY2FudmFzLndpZHRoX2NhbnZhcysncHgnKTtcblx0XHRcdCQoJyNtYWluX2NhbnZhcycpLmF0dHIoJ2hlaWdodCcsIGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuXHRcdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzpjYW52YXMud2lkdGhfY2FudmFzKydweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMrJ3B4J30pO1xuXG5cdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0Y2F0ZWdvcmllcy5zaG93X2xpc3QoKTtcblx0XHRcdGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8vdHdvcnp5bXkgbm93xIUgbWFwxJkgZGFueWNoXG5cdGNyZWF0ZV9tYXAgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9ha3R1YWxpenVqZW15IGpzb25hIGRvIHd5c8WCYW5pYSBhamF4ZW1cblx0XHR0aGlzLmdldF9kYXRhKCk7XG5cdFx0dmFyIHRoID0gdGhpczsgLy96bWllbm5hIHBvbW9jbmljemFcblx0XHRjb25zb2xlLmxvZygnY3JlYXRlJyx0aC5tYXBfanNvbik7XG5cblx0XHQvL3d5c3lzxYJhbXkgZGFuZSBhamF4ZW0gZG8gYmF6eSBkYW55Y2hcblx0XHQvL2NhbnZhcy5kcmF3X3RodW1uYWlsKCk7XG5cdFx0Ly9uZXdfaW1hZ2UgPSBpbWFnZS5kYXRhVVJJdG9CbG9iKCBjYW52YXMudGh1bWJuYWlsLnRvRGF0YVVSTCgpICk7XG5cdFx0Ly9jYW52YXMuZHJhdygpO1xuXG5cdFx0Ly92YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcImFjdGlvblwiLFx0J2NyZWF0ZV9tYXAnICk7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJtYXBfbmFtZVwiLCBjYW52YXMudGl0bGVfcHJvamVjdCk7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJtYXBfanNvblwiLCB0aC5tYXBfanNvbik7XG5cdFx0Ly9mb3JtRGF0YS5hcHBlbmQoXCJtYXBfaW1hZ2VcIiwgbmV3X2ltYWdlKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIl9tZXRob2RcIiwgJ1BPU1QnKTtcblx0XHQvL2Zvcm1EYXRhLmFwcGVuZChcIl90b2tlblwiLCBjc3JmX3Rva2VuKTtcblx0XHRcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdG1hcF9qc29uOiB0aC5tYXBfanNvblxuXHRcdH1cblxuXHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdHVybDogXCJhcGkvbWFwc1wiLFxuXHRcdFx0ZGF0YTogeyBtYXBfanNvbjogdGgubWFwX2pzb24gfSxcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0dGgubWFwX2hhc2ggPSByZXNwb25zZS5oYXNoX21hcDtcblx0XHRcdFx0YWxlcnQoJ3phcGlzYW5vIG5vd8SFIG1hcMSZJyk7XG5cdFx0XHRcdG1lbnVfdG9wLmdldF9tYXBzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvL2FrdHVhbGl6dWplbXkgbWFwxJlcblx0dXBkYXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHQvL2FrdHVhbGl6dWplbXkganNvbmEgZG8gd3lzxYJhbmlhIGFqYXhlbVxuXHRcdHRoaXMuZ2V0X2RhdGEoKTtcblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9jYW52YXMuZHJhd190aHVtbmFpbCgpO1xuXHRcdC8vbmV3X2ltYWdlID0gaW1hZ2UuZGF0YVVSSXRvQmxvYiggY2FudmFzLnRodW1ibmFpbC50b0RhdGFVUkwoKSApO1xuXHQvKlxuXHRcdHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9oYXNoXCIsIHRoLm1hcF9oYXNoICk7XG5cdFx0Zm9ybURhdGEuYXBwZW5kKFwibWFwX25hbWVcIiwgY2FudmFzLnRpdGxlX3Byb2plY3QpO1xuXHRcdGZvcm1EYXRhLmFwcGVuZChcIm1hcF9qc29uXCIsIHRoLm1hcF9qc29uKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJtYXBfaW1hZ2VcIiwgbmV3X2ltYWdlKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJfbWV0aG9kXCIsICdQVVQnKTtcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJfdG9rZW5cIiwgY3NyZl90b2tlbik7XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IGJhc2ljX3VybCArIFwiL21hcC9cIit0aC5tYXBfaGFzaCxcblx0XHRcdGRhdGE6IGZvcm1EYXRhLFxuXHRcdFx0Y2FjaGU6IGZhbHNlLFxuXHRcdFx0Y29udGVudFR5cGU6IGZhbHNlLFxuXHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGFsZXJ0KCd6YWt0dWFsaXpvd2FubyBtYXDEmScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHQqL1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRtYXBfaGFzaDogdGgubWFwX2hhc2gsXG5cdFx0XHRtYXBfanNvbjogdGgubWFwX2pzb25cblx0XHR9XG5cblx0XHRqUXVlcnkuYWpheCh7XG5cdFx0XHR1cmw6IFwiYXBpL21hcHNcIixcblx0XHRcdC8vZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0dHlwZTogJ1BVVCcsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdGFsZXJ0KCd6YWt0dWFsaXpvd2FubyBtYXDEmScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdH0sXG5cblx0Ly91c3V3YW15IG1hcMSZIHogYmF6eSBkYW55Y2hcblx0ZGVsZXRlX21hcCA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgdGggPSB0aGlzOyAvL3ptaWVubmEgcG9tb2NuaWN6YVxuXG5cdFx0Ly9zcHJhd2R6YW15IGN6eSBtYXBhIGRvIHVzdW5pxJljaWEgcG9zaWFkYSBzd29qZSBpZFxuXHRcdGlmKHRoaXMubWFwX2hhc2ggIT0gbnVsbCl7XG5cdFx0XHQkLnBvc3QoIGJhc2ljX3VybCArIFwiL21hcC9cIiArIHRoLm1hcF9oYXNoLCB7XG5cdFx0XHRcdGFjdGlvbjogJ2RlbGV0ZV9tYXAnLFxuXHRcdFx0XHRfbWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdFx0X3Rva2VuOiBjc3JmX3Rva2VuLFxuXHRcdFx0XHRtYXBfaGFzaDogdGgubWFwX2hhc2hcblx0XHRcdH0pXG5cdFx0XHQuZG9uZShmdW5jdGlvbiggcmVzcG9uc2UgKSB7XG5cdFx0XHRcdHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPSBcIk9LXCIpIHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVwbGFjZShiYXNpY191cmwgK1wiL21hcFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGFsZXJ0KCdixYLEhWQgcG9kY3phcyB1c3V3YW5pYSBtYXB5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0YWxlcnQoJ2JyYWsgaGFzaGEgLSBtYXBhIG5pZSBqZXN0IHphcGlzYW5hJyk7XG5cdFx0fVxuXHR9XG59XG4iLCJ2YXIgZXhjZWwgPSB7XG5cdFxuXHRhbHBoYSA6IFsnYScsJ2InLCdjJywnZCcsJ2UnLCdmJywnZycsJ2gnLCdpJywnaicsJ2snLCdsJywnbScsJ24nLCdvJywncCcsJ3EnLCdyJywncycsJ3QnLCd1JywndycsJ3gnLCd5JywneiddLFxuXHRkYXRhIDogW1tcIndvamV3b2R6dHdvXCIsXCJ3YXJ0b3NjMVwiLFwid2FydG9zYzJcIixcIndhcnRvc2MzXCJdLFtcImtyb3dvZHJ6YVwiLDEuNCwyMCw2XSxbXCJzcm9kbWllc2NpZVwiLDEuNiw1MCw0M10sW1wibm93YV9odXRhXCIsMiwzNCwzXSxbXCJ3aWVsa29wb2xza2FcIiwxLDMyLDZdXSxcblx0bWluX3JvdyA6IDEwLFxuXHRtaW5fY29sIDogNixcbiAgLy9jb2x1bW4gOiAsXG4gIC8vbXlfY2F0ZWdvcnkgOiBbJ3d5Ymllcnoga2F0ZWdvcmnEmSddLFxuICAvL215X3ZhbHVlIDogWyd3eWJpZXJ6IHdhcnRvxZvEhyddLFxuXG5cdGluaXQgOiBmdW5jdGlvbigpe1xuXG5cdFx0Ly9kb2RhbmllIGV2ZW50w7N3IHByenkga2xpa25pxJljaXUgZXhjZWxhXG5cdFx0JCgnI2V4Y2VsIGJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0XHQkKCcjZXhjZWwgaW5wdXQnKS5jbGljaygpO1xuXHRcdFx0JCgnI2V4Y2VsIGlucHV0JykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGV4Y2VsLnNlbmRfZmlsZSgpO1xuXHRcdFx0fSlcblx0XHR9KTtcblxuXHRcdCQoXCIjZXhjZWwgLnRhYmxlXCIpLnNjcm9sbChmdW5jdGlvbihlKXtcblx0XHRcdGNvbnNvbGUubG9nKCd0ZXN0Jyk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG5cdFx0dGhpcy5kcmF3KCk7XG5cdH0sXG5cblx0Ly9mdW5rY2phIG9kcG93aWVkemlhbGEgemEgcG9wcmF3bmUgcG9kcGlzYW5pZSBvc2lcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHRhZGRfaHRtbCA9ICcnO1xuXG5cdFx0Ly9qZcWbbGkgaWxvxZtjIHdpZXJzenkgamVzdCB3acSZa3N6YSBha3R1YWxpenVqZW15IHdpZWxrb8WbxIcgdGFibGljeVxuXHRcdGlmKGV4Y2VsLmRhdGEubGVuZ3RoID4gZXhjZWwubWluX3JvdykgZXhjZWwubWluX3JvdyA9IGV4Y2VsLmRhdGEubGVuZ3RoO1xuXHRcdGlmKGV4Y2VsLmRhdGFbMF0ubGVuZ3RoID4gZXhjZWwubWluX2NvbCkgZXhjZWwubWluX2NvbCA9IGV4Y2VsLmRhdGFbMF0ubGVuZ3RoO1xuXG5cdFx0Ly9yZW5kZXJ1amVteSBjYcWCxIUgdGFibGljxJkgZXhjZWxcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0aGlzLm1pbl9yb3c7IGkrKyl7XG5cdFx0XHRhZGRfaHRtbCArPSAnPGRpdiBjbGFzcz1cInRyXCI+Jztcblx0XHRcdGZvcih2YXIgaiA9IDA7aiA8IHRoaXMubWluX2NvbDsgaisrKXtcblxuXHRcdFx0XHRpZigoaiA9PSAwKSAmJiAoaSA+IDApKXtcblx0XHRcdFx0XHRhZGRfaHRtbCArPSAnPGRpdiBjbGFzcz1cInRkXCIgcm93PVwiJyArIGkgKyAnXCIgY29sPVwiJyArIGogKyAnXCIgPicrIGkgKyc8L2Rpdj4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0aWYodHlwZW9mKGV4Y2VsLmRhdGFbaV1bKGotMSldKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0ZFwiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj4nK2V4Y2VsLmRhdGFbaV1bKGotMSldKyc8L2Rpdj4nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0ZFwiICByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj48L2Rpdj4nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhleGNlbC5kYXRhW2ldWyhqKzEpXSk7XG5cdFx0XHRcdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8ZGl2IGNsYXNzPVwidGRcIiByb3c9XCInICsgaSArICdcIiBjb2w9XCInICsgaiArICdcIj48L2Rpdj4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0XHRhZGRfaHRtbCArPSAnPC9kaXY+Jztcblx0XHR9XG5cblx0XHQkKCcjZXhjZWwgLnRhYmxlJykuaHRtbCggYWRkX2h0bWwgKTtcblxuXHRcdC8vZG9kYWplbXkgbW/FvGxpd2/Fm8SHIGVkeWNqaSBleGNlbGFcblx0XHQkKCcjZXhjZWwgLnRhYmxlIC50ZCcpLmJsdXIoZnVuY3Rpb24oKXtcblx0XHRcdGV4Y2VsLmRhdGFbJCh0aGlzKS5hdHRyKCdyb3cnKV1bJCh0aGlzKS5hdHRyKCdjb2wnKV0gPSAkKHRoaXMpLmh0bWwoKTtcblx0XHR9KTtcblxuXG5cblx0Lypcblx0XHQkKFwiI2V4Y2VsIC50clwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBvYmope1xuXHRcdFx0XG5cdFx0XHQkKG9iaikuY2hpbGRyZW4oJy50ZCcpLmVxKDApLmh0bWwoIGluZGV4LTEgKTtcblx0XHRcdC8vY29uc29sZS5sb2coaW5kZXgsIG9iaik7XG5cdFx0fSk7XG5cblx0XHQkKFwiI2V4Y2VsIC50clwiKS5lcSgwKS5maW5kKFwiLnRkXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIG9iail7XG5cdFx0XHRcblx0XHRcdCQob2JqKS5odG1sKCBleGNlbC5hbHBoYVtpbmRleF0gKTtcblx0XHRcdC8vY29uc29sZS5sb2coaW5kZXgsIG9iaik7XG5cdFx0fSk7XG5cdCovXG5cblx0fSxcblxuXHRzZW5kX2ZpbGUgOiBmdW5jdGlvbigpIHtcblxudmFyIGV4Y2VsX2Zvcm0gPSBuZXcgRm9ybURhdGEoKTsgXG5leGNlbF9mb3JtLmFwcGVuZChcImV4Y2VsX2ZpbGVcIiwgJChcIiNleGNlbCBpbnB1dFwiKVswXS5maWxlc1swXSk7XG5cbiAkLmFqYXgoIHtcbiAgICAgIHVybDogJy9hcGkvcHJvamVjdHMvZXhjZWxfcGFyc2UnLFxuICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgZGF0YTogZXhjZWxfZm9ybSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZVxuICAgIH0gKS5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdGNvbnNvbGUubG9nKCByZXNwb25zZSApXG4gICAgXHRleGNlbC5kYXRhID0gcmVzcG9uc2UuZXhjZWxbMF0uZGF0YTtcbiAgICBcdC8vZXhjZWwucGFyc2VyKCk7XG4gICAgXHRleGNlbC5kcmF3KCk7XG5cbiAgICB9KTtcblxuXG5cbi8vY29uc29sZS5sb2coIHR5cGVvZiAkKFwiI2V4Y2VsIGlucHV0XCIpWzBdLmZpbGVzWzBdICk7XG5cbi8qXG5cblxuXHRcdGNvbnNvbGUubG9nKCBleGNlbF9mb3JtIClcblx0fVxuXG4qL1xuXG59LFxuLypcbnBhcnNlciA6IGZ1bmN0aW9uKCl7XG5cblx0Zm9yKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmRhdGEubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG5cdFx0XHRcblx0XHRcdFt0aGlzLmRhdGFfcGFyc2VyW3RoaXMuZGF0YVtpXVswXV1dID0gW107XG5cdFx0XHRjb25zb2xlLmxvZyggdGhpcy5kYXRhX3BhcnNlclt0aGlzLmRhdGFbaV1bMF1dICk7XG5cblx0XHRcdGZvcih2YXIgaiA9IDAsIGpfbWF4ID0gdGhpcy5kYXRhW2ldLmxlbmd0aDsgaiA8IGpfbWF4OyBqKyspe1xuXHRcdFx0XHRhbGVydCgnaG8hJyk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCB0aGlzLmRhdGFbaV1bal0gKTtcblx0XHRcdFx0W3RoaXMuZGF0YV9wYXJzZXJbdGhpcy5kYXRhW2ldWzBdXV0ucHVzaCh0aGlzLmRhdGFbaV1bal0pOyBcblx0XHRcdH1cblx0fVxuXG59Ki9cblxufVxuXG5leGNlbC5pbml0KCk7XG4vL2V4Y2VsLnBhcnNlcigpOyIsIi8vZnVua2NqZSByeXN1asSFY2UgcG9qZWR5xYRjenkgcHVua3QgKHBvaW50ZXIpXG52YXIgZmlndXJlcyA9IHtcblxuXHRzcXVhcmUgOiBmdW5jdGlvbih4LHksc2l6ZSl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZmlsbFJlY3QoeCx5LHNpemUsc2l6ZSk7XG5cdH0sXG5cblx0Y2lyY2xlIDogZnVuY3Rpb24oeCx5LHNpemUpe1xuXHRcdHZhciBzaXplID0gc2l6ZSAvIDI7XG5cdFx0dmFyIGNlbnRlcl94ID0geCArIHNpemU7XG5cdFx0dmFyIGNlbnRlcl95ID0geSArIHNpemU7XG5cdFx0Y2FudmFzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0Y2FudmFzLmNvbnRleHQuYXJjKGNlbnRlcl94LCBjZW50ZXJfeSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uICA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCx5K2EyKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthLHkrYTItaCk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSthMix5K2EyLWgpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K3NpemUseSthMik7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrc2l6ZS1hLHkrYTIraCk7XG5cdFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYSx5K2EyK2gpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4LHkrYTIpO1xuXHRcdGNhbnZhcy5jb250ZXh0LmZpbGwoKTtcblx0fSxcblxuXHRoZXhhZ29uMiA6IGZ1bmN0aW9uKHgseSxzaXplKXtcblx0XHR2YXIgYSA9IHNpemUvNDtcblx0XHR2YXIgYTIgPSBzaXplLzI7XG5cdFx0dmFyIGggPSBzaXplLzIqTWF0aC5zcXJ0KDMpLzI7XG5cblx0XHRjYW52YXMuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRjYW52YXMuY29udGV4dC5tb3ZlVG8oeCthMix5KTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMitoLHkrYSk7XG4gIFx0Y2FudmFzLmNvbnRleHQubGluZVRvKHgrYTIraCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLHkrc2l6ZSk7XG4gICAgY2FudmFzLmNvbnRleHQubGluZVRvKHgrYTItaCx5K2EyK2EpO1xuICAgIGNhbnZhcy5jb250ZXh0LmxpbmVUbyh4K2EyLWgseSthKTtcbiAgICBjYW52YXMuY29udGV4dC5saW5lVG8oeCthMix5KTtcblx0XHRjYW52YXMuY29udGV4dC5maWxsKCk7XG5cblx0fVxufVxuIiwiLy9mdW5rY2plIGdsb2JhbG5lIGtvbnRlbmVyIG5hIHdzenlzdGtvIGkgbmljIDspXG52YXIgZ2xvYmFsID0ge1xuXHR0b29nbGVfcGFuZWwgIDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0a2EgZGxhIG1vemlsbGlcblx0XHRpZiggJChldmVudC50YXJnZXQpLnBhcmVudCgpLmNzcygncmlnaHQnKSA9PSAnMHB4JyApe1xuXHRcdFx0JChldmVudC50YXJnZXQpLnBhcmVudCgpLmFuaW1hdGUoe3JpZ2h0OiBbLSQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS53aWR0aCgpLTIwLFwiZWFzZU91dEJvdW5jZVwiXX0sIDEwMDAsIGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBlbHNle1xuICAgIFx0ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5hbmltYXRlKHtyaWdodDogW1wiMHB4XCIsXCJlYXNlT3V0Qm91bmNlXCJdfSwgMTAwMCwgZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXHR9XG59XG4iLCIvL2fFgsOzd25lIHpkasSZY2llIG9kIGt0w7NyZWdvIG9kcnlzb3d1amVteSBtYXB5XG52YXIgaW1hZ2UgPSB7XG5cdG9iaiA6IHVuZGVmaW5lZCxcblx0eCA6IG51bGwsXG5cdHkgOiBudWxsLFxuXHR3aWR0aCA6IG51bGwsXG5cdGhlaWdodCA6IG51bGwsXG5cdGFscGhhIDogMTAsXG5cblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhLzEwO1xuXHRcdGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9iaix0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpO1xuXG5cdFx0JCgnI2NhbnZhc19ib3ggI2ltYWdlX3Jlc2l6ZScpLmNzcyh7J2hlaWdodCc6dGhpcy5oZWlnaHQsJ3RvcCc6dGhpcy55KydweCcsJ2xlZnQnOih0aGlzLngrdGhpcy53aWR0aCkrJ3B4J30pO1xuXHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMTtcblx0fSxcblxuXHQvL2Z1bmtjamEgcG9tb2NuaWN6YSBrb253ZXJ0dWrEhWNhIGRhdGFVUkkgbmEgcGxpa1xuXHRkYXRhVVJJdG9CbG9iIDogZnVuY3Rpb24oZGF0YVVSSSkge1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGRhdGFVUkkuc3BsaXQoJywnKVsxXSk7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheS5wdXNoKGJpbmFyeS5jaGFyQ29kZUF0KGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShhcnJheSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcblx0fVxuXG59XG4iLCJ2YXIgZGF0YV9pbnB1dCA9IHtcblxuXHQvL3BvYmllcmFuaWUgaW5mb3JtYWNqaSB6IGlucHV0w7N3IGkgemFwaXNhbmllIGRvIG9iaWVrdHUgbWFwX3N2Z1xuXHRnZXQgOiBmdW5jdGlvbigpe1xuXHRcdG1hcC5uYW1lID0gJCgnI21hcF9mb3JtIGlucHV0W25hbWU9XCJuYW1lXCJdJykudmFsKCk7XG5cdFx0bWFwLnBhdGggPSAkKCcjbWFwX2Zvcm0gdGV4dGFyZWEnKS52YWwoKS5yZXBsYWNlKC9cIi9nLCBcIidcIik7XG5cdFx0JCgnI21hcF9jb250ZW5lcicpLmh0bWwoICQoJ3RleHRhcmVhW25hbWU9bWFwX3BhdGhdJykudmFsKCkgKTtcblx0fSxcblxuXHQvL3BvYnJhbmllIGluZm9ybWFjamkgeiBvYmlla3R1IG1hcF9zdmcgaSB6YXBpc2FuaWUgZG8gaW5wdXTDs3dcblx0c2V0IDogZnVuY3Rpb24oKXtcblx0XHQkKCcjbWFwX2Zvcm0gaW5wdXRbbmFtZT1cIm5hbWVcIl0nKS52YWwoIG1hcC5uYW1lICk7XG5cdFx0JCgnI21hcF9mb3JtIHRleHRhcmVhJykudmFsKCBtYXAucGF0aCApO1xuXHRcdCQoJyNtYXBfY29udGVuZXInKS5odG1sKCAkKCd0ZXh0YXJlYVtuYW1lPW1hcF9wYXRoXScpLnZhbCgpICk7XG5cdH1cblxufVxuIiwidmFyIGxheWVycyA9IHtcblxuXHRsaXN0IDogWyd3YXJzdHdhMSddLFxuXHRhY3RpdmUgOiAwLFxuXG5cdC8vdGFibGljYSB6IHBvZHN0YXdvd3l3bWkgZGFueW1pIHphZ3JlZ293YW55bWkgZGxhIGthxbxkZWogd2Fyc3R3eVxuXHRwYWxldHNfYWN0aXZlIDogWzBdLFxuXHRjYXRlZ29yeSA6IFstMV0sXG5cdHZhbHVlIDogWy0xXSxcblx0Y29sb3JzX3BvcyA6IFtbMSwxLDEsMSwxLDEsMSwxLDFdXSxcblx0Y29sb3JzX2FjdGl2ZSA6IFtbXCIjZjdmY2ZkXCIsIFwiI2U1ZjVmOVwiLCBcIiNjY2VjZTZcIiwgXCIjOTlkOGM5XCIsIFwiIzY2YzJhNFwiLCBcIiM0MWFlNzZcIiwgXCIjMjM4YjQ1XCIsIFwiIzAwNmQyY1wiLCBcIiMwMDQ0MWJcIl1dLFxuXHRtaW5fdmFsdWUgOiBbMF0sXG5cdG1heF92YWx1ZSA6IFswXSxcblx0Y2xvdWQgOiBbXCJcIl0sXG5cdGNsb3VkX3BhcnNlciA6IFtcIlwiXSxcblx0bGVnZW5kcyA6IFtbWzIwLFwiI2Y3ZmNmZFwiXSxbNTAsXCIjZTVmNWY5XCJdLFs4MCxcIiNjY2VjZTZcIl0sWzExMCxcIiM5OWQ4YzlcIl0sWzE0MCxcIiM2NmMyYTRcIl0sWzE3MCxcIiM0MWFlNzZcIl0sWzIwMCxcIiMyMzhiNDVcIl0sWzIzMCxcIiMwMDZkMmNcIl0sWzI2MCxcIiMwMDQ0MWJcIl1dXSxcblxuXHRzaG93IDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IHRoaXMubGlzdC5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcblx0XHRcdGlmKGkgPT0gdGhpcy5hY3RpdmUpe1xuXHRcdFx0XHRodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiPicgKyB0aGlzLmxpc3RbaV0gKyAnPC9zcGFuPic7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRodG1sICs9ICc8c3Bhbj4nICsgdGhpcy5saXN0W2ldICsgJzwvc3Bhbj4nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJhZGRcIj4rPC9idXR0b24+PGJ1dHRvbiBjbGFzcz1cInJlbW92ZVwiPi08L2J1dHRvbj4nO1xuXG5cdFx0JCgnI2xheWVycycpLmh0bWwoaHRtbCk7XG5cblx0XHQkKCcjbGF5ZXJzIC5hZGQnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5hZGQoKTt9KTtcblx0XHQkKCcjbGF5ZXJzIC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe2xheWVycy5yZW1vdmUoKTt9KTtcblx0XHRcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5jbGljayhmdW5jdGlvbigpeyBjb25zb2xlLmxvZygnY2xpY2wnKTtsYXllcnMuc2VsZWN0KHRoaXMpO30pO1xuXHRcdCQoJyNsYXllcnMgc3BhbicpLmRibGNsaWNrKGZ1bmN0aW9uKCl7IGxheWVycy5lZGl0KHRoaXMpOyB9KTtcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5mb2N1c291dChmdW5jdGlvbigpeyBsYXllcnMuZW5kX2VkaXQodGhpcyk7IH0pO1xuXG5cdH0sXG5cblx0c2VsZWN0IDogZnVuY3Rpb24ob2JqKXtcblx0XHQkKCcjbGF5ZXJzIHNwYW4nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRsYXllcnMuYWN0aXZlID0gJChvYmopLmluZGV4KCk7XG5cdFx0cGFsZXRzLnNob3coKTtcblx0XHRjbG91ZC5zZXRfdGV4dGFyZWEoKTtcblx0XHRjYXRlZ29yaWVzLmNvbG9yX2Zyb21fZXhjZWwoKTtcblx0fSxcblxuXHRhZGQgOiBmdW5jdGlvbigpe1xuXG5cdFx0dGhpcy5saXN0LnB1c2goICd3YXJzdHdhJyArIHBhcnNlSW50KHRoaXMubGlzdC5sZW5ndGgrMSkpO1xuXG5cblx0XHR0aGlzLmNhdGVnb3J5LnB1c2goLTEpO1xuXHRcdHRoaXMudmFsdWUucHVzaCgtMSk7XG5cdFx0dGhpcy5wYWxldHNfYWN0aXZlLnB1c2goMCk7XG5cdFx0dGhpcy5jb2xvcnNfYWN0aXZlLnB1c2goWycjZjdmY2ZkJywnI2U1ZjVmOScsJyNjY2VjZTYnLCcjOTlkOGM5JywnIzY2YzJhNCcsJyM0MWFlNzYnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSk7XG5cdFx0dGhpcy5jb2xvcnNfcG9zLnB1c2goWzEsMSwxLDEsMSwxLDEsMSwxXSk7XG5cdFx0dGhpcy5taW5fdmFsdWUucHVzaCgwKTtcblx0XHR0aGlzLm1heF92YWx1ZS5wdXNoKDApO1xuXHRcdHRoaXMuY2xvdWQucHVzaChcIlwiKTtcblx0XHR0aGlzLmNsb3VkX3BhcnNlci5wdXNoKFwiXCIpO1xuXHRcdHRoaXMubGVnZW5kcy5wdXNoKFtdKTtcblx0XHR0aGlzLnNob3coKTtcblx0fSxcblxuXHRyZW1vdmUgOiBmdW5jdGlvbigpe1xuXG5cdFx0Y29uc29sZS5sb2coXCJyZW1vdmVcIix0aGlzLmFjdGl2ZSx0aGlzLmxpc3QubGVuZ3RoLTEpXG5cblx0XHRpZih0aGlzLmFjdGl2ZSA9PSAodGhpcy5saXN0Lmxlbmd0aC0xKSl7XG5cdFx0XHR2YXIgaV90bXAgPSB0aGlzLmxpc3QubGVuZ3RoLTE7XG5cdFx0XHR0aGlzLnNlbGVjdCggJCgnI2xheWVycyBzcGFuJykuZXEoIGlfdG1wICkgKTtcblx0XHR9IFxuXHRcblx0XHR0aGlzLnBhbGV0c19hY3RpdmUucG9wKCk7XG5cdFx0dGhpcy5saXN0LnBvcCgpO1xuXHRcdHRoaXMuY29sb3JzX3Bvcy5wb3AoKTtcblx0XHR0aGlzLmNhdGVnb3J5LnBvcCgpO1xuXHRcdHRoaXMudmFsdWUucG9wKCk7XG5cdFx0dGhpcy5jb2xvcnNfYWN0aXZlLnBvcCgpO1xuXHRcdHRoaXMubWluX3ZhbHVlLnBvcCgpO1xuXHRcdHRoaXMubWF4X3ZhbHVlLnBvcCgpO1xuXHRcdHRoaXMuY2xvdWQucG9wKCk7XG5cdFx0dGhpcy5jbG91ZF9wYXJzZXIucG9wKCk7XG5cdFx0dGhpcy5sZWdlbmRzLnBvcCgpO1xuXHRcdHRoaXMuc2hvdygpO1xuXHR9LFxuXG5cdGVkaXQgOiBmdW5jdGlvbihvYmope1xuXHRcdCQob2JqKS5hdHRyKCdjb250ZW50ZWRpdGFibGUnLCd0cnVlJyk7XG5cdFx0JChvYmopLmNsaWNrKCk7XG5cdH0sXG5cblxuXHRlbmRfZWRpdCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0JChvYmopLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsJ2ZhbHNlJyk7XG5cdFx0bGF5ZXJzLmxpc3RbICQob2JqKS5pbmRleCgpIF0gPSAkKG9iaikuaHRtbCgpO1xuXHR9XG59XG4iLCIvL29iaWVrdCBkb3R5Y3rEhXN5IHd5c3dpZXRsYW5pYSBha3V0YWxpemFjamkgaSBlZHljamkgcGFuZWx1IGxlZ2VuZFxubGVnZW5kcyA9IHtcblxuXHQvL3d5xZt3aWV0bGFteSB3c3p5c3RraWUgbGVnZW5keSB3IHBhbmVsdSBtYXBcblx0c2hvdyA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgaHRtbCA9IFwiXCI7XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0XG5cdFx0XHRodG1sICs9IFwiPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMV0rXCInIGNsYXNzPSdjb2xvcic+PC9zcGFuPjxzcGFuIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+XCIrbGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV1baV1bMF0rXCI8L3NwYW4+XCI7XG5cblx0XHR9XG5cblx0XHQkKCcjbGVnZW5kcycpLmh0bWwoaHRtbCk7XG5cblx0fSxcblxuXHR1cGRhdGUgOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjb2xvcl9jb3VudCA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLmxlbmd0aCAvL2lsb3NjIGtvbG9yw7N3XG5cdFx0dmFyIGRpZmZyZW50ID0gTWF0aC5hYnMoIGxheWVycy5taW5fdmFsdWVbbGF5ZXJzLmFjdGl2ZV0gLSBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdICk7IC8vIGNvbG9yX2NvdW50O1xuXHRcdFxuXHRcdGxheWVycy5sZWdlbmRzW2xheWVycy5hY3RpdmVdID0gW107XG5cblx0XHRmb3IodmFyIGkgPSAwLCBpX21heCA9IGxheWVycy5jb2xvcnNfYWN0aXZlW2xheWVycy5hY3RpdmVdLmxlbmd0aDsgaSA8IGlfbWF4OyBpKyspe1xuXHRcdFx0bGF5ZXJzLmxlZ2VuZHNbbGF5ZXJzLmFjdGl2ZV0ucHVzaChbICBNYXRoLnJvdW5kKCAobGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXStkaWZmcmVudCppKSoxMDApIC8gMTAwLCBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXVtpXSBdKTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5zaG93KCk7XG5cblx0fVxufVxuXG5sZWdlbmRzLnNob3coKTsiLCIvKlxuICAgIF9fX18gICBfX19fIF9fX18gICAgX18gIF9fXyBfX18gICAgIF9fX18gICAgIF9fX19fICAgIF9fX18gXG4gICAvIF9fICkgLyAgXy8vIF9fIFxcICAvICB8LyAgLy8gICB8ICAgLyBfXyBcXCAgIHxfXyAgLyAgIC8gX18gXFxcbiAgLyBfXyAgfCAvIC8gLyAvIC8gLyAvIC98Xy8gLy8gL3wgfCAgLyAvXy8gLyAgICAvXyA8ICAgLyAvIC8gL1xuIC8gL18vIC9fLyAvIC8gL18vIC8gLyAvICAvIC8vIF9fXyB8IC8gX19fXy8gICBfX18vIC9fIC8gL18vIC8gXG4vX19fX18vL19fXy8gXFxfX19cXF9cXC9fLyAgL18vL18vICB8X3wvXy8gICAgICAgL19fX18vKF8pXFxfX19fLyAgXG5cbnZhcnNpb24gMy4wIGJ5IE1hcmNpbiBHxJliYWxhXG5cbmxpc3RhIG9iaWVrdMOzdzpcblxuIGNhbnZhcyA9IGNhbnZhcygpIC0gb2JpZWt0IGNhbnZhc2FcbiBjcnVkID0gY3J1ZCgpIC0gb2JpZWt0IGNhbnZhc2FcbiBpbWFnZSA9IGltYWdlKCkgLSBvYmlla3QgemRqxJljaWEgb2Qga3TDs3JlZ28gb2RyeXNvd3VqZW15IG1hcHlcbiBtb3VzZSA9IG1vdXNlKClcbiBtb2RlbHMgPSBtb2RlbHMoKVxuIGdsb2JhbCA9IGdsb2JhbCgpIC0gZnVua2NqZSBuaWUgcHJ6eXBpc2FueSBkbyBpbm55Y2ggb2JpZWt0w7N3XG4gY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMoKVxuIHBvaW50ZXJzID0gcG9pbnRlcnMoKVxuIGNvbG9ycGlja2VyID0gY29sb3JwaWNrZXIoKVxuIG1lbnVfdG9wID0gbWVudV90b3AoKVxuIGZpZ3VyZXMgPSBmaWd1cmVzKClcblxuKi9cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHRtZW51X3RvcC5nZXRfbWFwcygpO1xuICBsYXllcnMuc2hvdygpO1xuICBwYWxldHMuc2hvdygpO1xuXG5cdC8vemFibG9rb3dhbmllIG1vxbxsaXdvxZtjaSB6YXpuYWN6YW5pYSBidXR0b27Ds3cgcG9kY3phcyBlZHljamkgcG9sYVxuXHQkKGRvY3VtZW50KS5vbihcImZvY3VzaW5cIixcImlucHV0XCIsZnVuY3Rpb24oKXsgbWVudV90b3AuZGlzYWJsZV9zZWxlY3QgPSB0cnVlOyB9KTtcblx0JChkb2N1bWVudCkub24oXCJmb2N1c291dFwiLFwiaW5wdXRcIixmdW5jdGlvbigpeyBtZW51X3RvcC5kaXNhYmxlX3NlbGVjdCA9IGZhbHNlOyB9KTtcblxuXG5cdCQoJyN0b29sYmFyX3RvcCBidXR0b24uc2F2ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IFxuXG5cdFx0Ly9qZcWbbGkgbmllIG1hbXkgemRlZmluaW93YW5lZ2EgaGFzaGEgdHdvcnp5bXkgbm93xIUgbWFwxJkgdyBwcnplY2l3bnltIHd5cGFka3UgYWt0dWFsaXp1amVteSBqdcW8IGlzdG5pZWrEhWPEhVxuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCdjcnVkJyxjcnVkLm1hcF9oYXNoKVxuXG5cdFx0aWYodHlwZW9mIGNydWQubWFwX2hhc2ggPT0gJ3N0cmluZycpe1xuXHRcdFx0XG5cdFx0XHRjcnVkLnVwZGF0ZV9tYXAoKTtcblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0XG5cdFx0XHRjcnVkLmNyZWF0ZV9tYXAoKTtcblx0XHRcblx0XHR9XG5cblx0fSk7XG5cblxuXHQkKCcjdG9vbGJhcl90b3AgYnV0dG9uLmRlbGV0ZScpLmNsaWNrKGZ1bmN0aW9uKCl7IGFsZXJ0KCdkZWxldGUnKTsgfSk7XG5cblxuXHQvL29kem5hY3plbmllIHNlbGVjdGEgcHJ6eSB6bWlhbmllXG5cdCQoJyNjaGFuZ2VfY2F0ZWdvcnknKS5jaGFuZ2UoZnVuY3Rpb24oKXsgJCgnI2NoYW5nZV9jYXRlZ29yeScpLmJsdXIoKTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSBwdXNjemVuaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZXVwKGZ1bmN0aW9uKCl7IG1vdXNlLm1vdXNlX2Rvd24gPSBmYWxzZTsgfSk7XG5cblx0Ly9yZWplc3RyYWNqYSB6ZGFyemVuaWEgdyBtb21lbmNpZSB3Y2nFm25pxJljaWEgcHJ6eWNpc2t1IG15c3praVxuXHQkKGRvY3VtZW50KS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXHRcblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL8WCYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpO1xuXHRcblx0fSk7XG5cblx0Ly93eXdvxYJhbmllIGZ1bmtjamkgcG9kY3phcyBwb3J1c3phbmlhIG15c3prxIVcblx0JChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGV2ZW50KXtcblxuXHRcdGlmICghZXZlbnQpIHtldmVudCA9IHdpbmRvdy5ldmVudDt9IC8vbGF0YSBkbGEgbW96aWxsaVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdGlmKG1vdXNlLm1vdXNlX2Rvd24pIG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cdFx0aWYobWVudV90b3AuYXV0b19kcmF3KXsgbW91c2UuY2xpY2tfb2JqID0gXCJjYW52YXNcIjsgbW91c2UubW91c2Vtb3ZlKGV2ZW50KTt9XG5cdFxuXHR9KTtcblxuXHQkKCcjbWFpbl9jYW52YXMnKS5tb3VzZWRvd24oZnVuY3Rpb24oZXZlbnQpe1xuXG5cdFx0aWYgKCFldmVudCkge2V2ZW50ID0gd2luZG93LmV2ZW50O30gLy9sYXRhIGRsYSBtb3ppbGxpXG5cdFx0bW91c2Uuc2V0X21vdXNlX2Rvd24oZXZlbnQpOy8vemFyZWplc3Ryb3dhbmllIG9iaWVrdHV3ICBrdMOzcnkga2xpa2FteVxuXHRcdG1vdXNlLnNldF9wb3NpdGlvbihldmVudCk7IC8vemFyZWplc3Ryb3dhbmllIHBvenljamkgbXlzemtpXG5cdFx0Ly9qZXNsaSBwcnp5Y2lzayBqZXN0IHdjacWbbmnEmXR5IHd5a29udWplbXkgZG9kYXRrb3dlIHpkYXJ6ZW5pYSAocHJ6eSBydXN6YW5pdSBteXN6a8SFKVxuXHRcdG1vdXNlLm1vdXNlbW92ZShldmVudCk7XG5cblx0fSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpe1xuXG5cdFx0cG9pbnRlcnMubGFzdF9jb2x1bW4gPSBudWxsO1x0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRjYW52YXMuY29udGV4dF94ID0gY2FudmFzLmNvbnRleHRfbmV3X3g7XG5cdFx0Y2FudmFzLmNvbnRleHRfeSA9IGNhbnZhcy5jb250ZXh0X25ld195O1xuXG5cdH0pO1xuXG5cdC8vZG9kYW5pZSBub3dlaiBrYXRlZ29yaWlcblx0JCgnI2FkZF9jYXRlZ29yeScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0Y2F0ZWdvcmllcy5hZGQoKTtcblx0fSk7XG5cblx0Ly9kb2RhbmllIG5vd2VqIGthdGVnb3JpaSAocG8gd2NpxZtuacSZY2l1IGVudGVyKVxuXHQkKCdpbnB1dFtuYW1lPVwiYWRkX2NhdGVnb3J5XCJdJykua2V5cHJlc3MoZnVuY3Rpb24oZSkge1xuICAgIFx0aWYoZS53aGljaCA9PSAxMykge1xuICAgIFx0XHRjYXRlZ29yaWVzLmFkZCgpO1xuICAgIFx0fVxuXHR9KTtcblxuXHQvLyQoZG9jdW1lbnQpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHsgbWVudV90b3Auc3dpdGNoX21vZGUoIGUud2hpY2ggKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJmb2N1c291dFwiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkgeyBpZihlLndoaWNoID09IDEzKSB7Y2F0ZWdvcmllcy51cGRhdGUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpICwkKHRoaXMpLnZhbCgpICk7IH0gfSk7XG5cblx0Ly91c3VuacSZY2llIGthdGVnb3JpaVxuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJidXR0b24ucmVtb3ZlXCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgY2F0ZWdvcmllcy5yZW1vdmUoJCh0aGlzKS5hdHRyKCdpZF9jYXRlZ29yeScpKTsgfSk7XG5cblx0Ly96YWt0dWFsaXpvd2FuaWUga2F0ZWdvcmlpXG5cdCQoXCIjbGlzdFwiKS5kZWxlZ2F0ZShcImlucHV0XCIsXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgbWVudV90b3AubW9kZV9rZXkgPSBmYWxzZTsgIH0pO1xuXHQkKFwiI2xpc3RcIikuZGVsZWdhdGUoXCJpbnB1dFwiLFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKSB7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgIH0pO1xuXG5cdC8vcG9rYXphbmllIC8gdWtyeWNpZSBwYW5lbHUga2F0ZWdvcmlpXG5cdCQoJyNjYXRlZ29yeV9ib3ggaDIsICNwb2ludGVyX2JveCBoMicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KXsgZ2xvYmFsLnRvb2dsZV9wYW5lbChldmVudCk7IH0pO1xuXG5cdC8vb2JzxYJ1Z2EgYnV0dG9uw7N3IGRvIGlua3JlbWVudGFjamkgaSBkZWtyZW1lbnRhY2ppIGlucHV0w7N3XG5cdCQoJ2J1dHRvbi5pbmNyZW1lbnQnKS5jbGljayhmdW5jdGlvbigpeyBtb2RlbHMuYnV0dG9uX2luY3JlbWVudCggJCh0aGlzKSApIH0pO1xuXHQkKCdidXR0b24uZGVjcmVtZW50JykuY2xpY2soZnVuY3Rpb24oKXsgbW9kZWxzLmJ1dHRvbl9kZWNyZW1lbnQoICQodGhpcykgKSB9KTtcblxuXHQvL29ixYJ1Z2EgaW5wdXTDs3cgcG9icmFuaWUgZGFueWNoIGkgemFwaXNhbmllIGRvIGJhenlcblx0JCgnLnN3aXRjaCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1vZGVscy51cGRhdGVfZnJvbV9zd2l0Y2goICQodGhpcykgKTsgfSk7IC8vcHJ6eWNpc2tpIHN3aXRjaFxuXHQkKCcuaW5wdXRfYmFzZScpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXQoICQodGhpcykgKTsgfSk7IC8vdHJhZHljeWpuZSBpbnB1dHlcblx0JCgnLmlucHV0X2Jhc2VfdGV4dCcpLmNoYW5nZShmdW5jdGlvbigpeyBtb2RlbHMudXBkYXRlX2Zyb21faW5wdXRfdGV4dCggJCh0aGlzKSApOyB9KTsgLy90cmFkeWN5am5lIGlucHV0eVxuXHQkKCcuc2VsZWN0X2Jhc2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXsgbW9kZWxzLnVwZGF0ZV9mcm9tX3NlbGVjdCggJCh0aGlzKSApOyB9KTsgLy9saXN0eSByb3p3aWphbmUgc2VsZWN0XG5cblx0JCgnI21lbnVfdG9wICNpbmNyZW1lbnRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuaW5jcmVtZW50X3NjYWxlKCk7IH0pO1xuXHQkKCcjbWVudV90b3AgI2RlY3JlbWVudF9jYW52YXMnKS5jbGljayhmdW5jdGlvbigpeyBtZW51X3RvcC5kZWNyZW1lbnRfc2NhbGUoKTsgfSk7XG5cdCQoJyNtZW51X3RvcCAjYWRkX2ltYWdlJykuY2xpY2soZnVuY3Rpb24oKXsgbWVudV90b3AuYWRkX2ltYWdlKCk7IH0pO1xuXG5cdCQoJyNtZW51X3RvcCAjcmVzZXRfY2FudmFzJykuY2xpY2soZnVuY3Rpb24oKXsgY2FudmFzLnNldF9kZWZhdWx0KCk7IH0pO1xuXG5cdC8vcHJ6eXBpc2FuaWUgcG9kc3Rhd293b3d5Y2ggZGFueWNoIGRvIG9iaWVrdHUgY2FudmFzXG5cdGNhbnZhcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbl9jYW52YXMnKTtcbiAgY2FudmFzLmNvbnRleHQgPSBjYW52YXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aF9jYW52YXMgPSBwYXJzZUludCggJCgnI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnKSApO1xuICBjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnKSApO1xuICB2YXIgb2Zmc2V0ID0gJCgnI2NhbnZhc19ib3gnKS5vZmZzZXQoKTtcbiAgY2FudmFzLm9mZnNldF9sZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gIGNhbnZhcy5vZmZzZXRfdG9wID0gb2Zmc2V0LnRvcDtcblxuICAvL3R3b3J6eW15IHRhYmxpY2UgcG9pbnRlcsOzd1xuXHRwb2ludGVycy5jcmVhdGVfYXJyYXkoKTtcblxuICAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKGNhbnZhcy53aWR0aF9jYW52YXMrJ3B4Jyk7XG5cdCQoJyNjYW52YXNfaW5mbyAjaGVpZ2h0JykudmFsKGNhbnZhcy5oZWlnaHRfY2FudmFzKydweCcpO1xuICAkKCcjY2FudmFzX2JveCwgI2NhbnZhc193cmFwcGVyJykuY3NzKHsnd2lkdGgnOiBjYW52YXMud2lkdGhfY2FudmFzICsgJ3B4JywnaGVpZ2h0JzpjYW52YXMuaGVpZ2h0X2NhbnZhcyArICdweCd9KTtcblx0JCgnI2NhbnZhc19pbmZvICN3aWR0aCwjY2FudmFzX2luZm8gI2hlaWdodCwjY2FudmFzX2luZm8gI3NpemUnKS5jaGFuZ2UoZnVuY3Rpb24oKXttZW51X3RvcC51cGRhdGVfY2FudmFzX2luZm8oKX0pO1xuXG5cdCQoJyNhbHBoYV9pbWFnZScpLmNoYW5nZShmdW5jdGlvbigpeyBtZW51X3RvcC5jaGFuZ2VfYWxwaGEoKSB9KTtcblxuXHQkKCdpbnB1dCcpLmNsaWNrKGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gZmFsc2U7IH0pO1xuXHQkKCdpbnB1dCcpLmZvY3Vzb3V0KGZ1bmN0aW9uKCl7IG1lbnVfdG9wLm1vZGVfa2V5ID0gdHJ1ZTsgfSk7XG5cblx0JChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbigpeyBjYW52YXMuZHJhdygpOyB9KTtcblx0Y2FudmFzLmRyYXcoKTsgLy9yeXNvd2FuaWUgY2FudmFzXG5cblx0Ly96YXBpc3VqZW15IGx1YiBha3R1YWxpenVqZW15IG1hcMSZIHBvIGtsaWtuacSZY2l1IHcgYnV0dG93IHcgemFsZcW8bm/Fm2NpIG9kIHRlZ28gY3p5IG1hbXkgemRlZmluaW93YW5lIGlkIG1hcHlcblx0JCgnLm1lbnVfcmlnaHQgLnNhdmUnKS5jbGljayhmdW5jdGlvbigpe1xuXHRcdGlmKGNydWQubWFwX2hhc2ggPT0gbnVsbCl7IGNydWQuY3JlYXRlX21hcCgpOyB9XG5cdFx0ZWxzZXsgY3J1ZC51cGRhdGVfbWFwKCk7IH1cblx0fSk7XG5cblx0Ly91c3V3YW15IG1hcMSZIHBvIGtsaWtuacSZY2l1IHcgYnV0dG9uXG5cdCQoJy5tZW51X3JpZ2h0IC5yZW1vdmUnKS5jbGljayhmdW5jdGlvbigpe2lmKGNvbmZpcm0oXCJjenkgbmFwZXdubyB1c3VuxIXEhyBtYXDEmSA/XCIpKXtjcnVkLmRlbGV0ZV9tYXAoKTt9IH0pO1xuXG59KTtcbiIsIi8vb2JpZWt0IG1lbnVfdG9wXG5tZW51X3RvcCA9IHtcblxuXHRtb3ZlX2ltYWdlIDogZmFsc2UsXG5cdG1vdmVfY2FudmFzIDogZmFsc2UsXG5cdGF1dG9fZHJhdyA6IGZhbHNlLFxuXHRtb2RlX2tleSA6IHRydWUsXG5cdGNhdGVnb3J5IDogMCxcblx0ZGlzYWJsZV9zZWxlY3QgOiBmYWxzZSxcblxuXHQvL2Z1bmtjamEgc8WCdcW8xIVjYSBkbyBwb2JpZXJhbmlhIGRhbnljaCBkb3R5Y3rEhWN5Y2ggbWFwXG5cdGdldF9tYXBzIDogZnVuY3Rpb24oKXtcblx0XG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvYXBpL21hcHMnLFxuICAgIFx0dHlwZTogXCJHRVRcIixcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoIGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHRcdFxuXHRcdFx0Ly93ecWbd2lldGxhbXkgbGlzdMSZIG1hcCB3IHBhbmVsdSB1IGfDs3J5XG5cdFx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJva1wiKXtcblxuXHRcdFx0XHR2YXIgYWRkX2h0bWwgPSAnJztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGlfbWF4ID0gcmVzcG9uc2UuZGF0YS5sZW5ndGg7IGkgPCBpX21heCA7aSsrKXtcblxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlLmRhdGFbaV0uX2lkID09IGNydWQubWFwX2hhc2gpe1xuXHRcdFx0XHRcdFx0YWRkX2h0bWwgKz0gJzxvcHRpb24gc2VsZWN0ZWQgaWQ9XCInICsgcmVzcG9uc2UuZGF0YVtpXS5faWQgKyAnXCI+JyArIEpTT04ucGFyc2UocmVzcG9uc2UuZGF0YVtpXS5tYXBfanNvbilbMF1bN10gKyAnPC9vcHRpb24+Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGFkZF9odG1sICs9ICc8b3B0aW9uIGlkPVwiJyArIHJlc3BvbnNlLmRhdGFbaV0uX2lkICsgJ1wiPicgKyBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGFbaV0ubWFwX2pzb24pWzBdWzddICsgJzwvb3B0aW9uPic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoJyN0b29sYmFyX3RvcCBzZWxlY3Quc2VsZWN0X21hcHMnKS5hcHBlbmQoIGFkZF9odG1sICk7XG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHRcdC8vZG9kYWplbXUgemRhcnplbmllIGNoYW5nZSBtYXAgXG5cdFx0JCgnLnNlbGVjdF9tYXBzJykuY2hhbmdlKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZiAoY29uZmlybSgnQ3p5IGNoY2VzeiB3Y3p5dGHEhyBub3fEhSBtYXDEmSA/JykpIHtcblx0XHRcdFx0aWYoICQodGhpcykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignaWQnKSA9PSAnbmV3X21hcCcgKXtcblx0XHRcdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGNydWQuc2VsZWN0X21hcCggJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5hdHRyKCdpZCcpICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHR9LFxuXG5cdHVwZGF0ZV9jYW52YXNfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0Y2FudmFzLnNjYWxlID0gcGFyc2VJbnQoICQoJyNjYW52YXNfaW5mbyAjc2l6ZScpLnZhbCgpICk7XG5cdFx0Y2FudmFzLndpZHRoX2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI3dpZHRoJykudmFsKCkgKTtcblx0XHRjYW52YXMuaGVpZ2h0X2NhbnZhcyA9IHBhcnNlSW50KCAkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbCgpICk7XG5cblx0XHQkKCcjY2FudmFzX2luZm8gI3NpemUnKS52YWwoIGNhbnZhcy5zY2FsZSArICclJyApO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwoIGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnICk7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNoZWlnaHQnKS52YWwoIGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4JyApO1xuXG5cdFx0JCgnI2NhbnZhc19ib3gsICNjYW52YXNfd3JhcHBlcicpLmNzcyh7J3dpZHRoJzogY2FudmFzLndpZHRoX2NhbnZhcyArICdweCcsJ2hlaWdodCc6Y2FudmFzLmhlaWdodF9jYW52YXMgKyAncHgnfSk7XG5cdFx0JCgnI2NhbnZhc19ib3ggI21haW5fY2FudmFzJykuYXR0cignd2lkdGgnLGNhbnZhcy53aWR0aF9jYW52YXMgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2JveCAjbWFpbl9jYW52YXMnKS5hdHRyKCdoZWlnaHQnLGNhbnZhcy5oZWlnaHRfY2FudmFzICsgJ3B4Jyk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHRjaGFuZ2VfYWxwaGEgOiBmdW5jdGlvbigpe1xuXHRcdGltYWdlLmFscGhhID0gJCgnI2FscGhhX2ltYWdlJykuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuYXR0cignbmFtZScpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0YWRkX2ltYWdlIDogZnVuY3Rpb24oKXtcblxuXHRcdC8vamVzbGkgcG9kYW55IHBhcmFtZXRyIG5pZSBqZXN0IHB1c3R5XG5cdFx0dmFyIHNyY19pbWFnZSA9IHByb21wdChcIlBvZGFqIMWbY2llxbxrxJkgZG8gemRqxJljaWE6IFwiKTtcblxuXHRcdGlmKHNyY19pbWFnZSl7XG5cdFx0XHRpZihzcmNfaW1hZ2UubGVuZ3RoID4gMCl7XG5cblx0XHRcdFx0aW1hZ2Uub2JqID0gbmV3IEltYWdlKCk7XG5cblx0XHRcdFx0Ly93Y3p5dGFuaWUgemRqxJljaWE6XG5cdFx0XHRcdFx0aW1hZ2Uub2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdGltYWdlLndpZHRoID0gaW1hZ2Uub2JqLndpZHRoO1xuXHQgICAgXHRcdGltYWdlLmhlaWdodCA9IGltYWdlLm9iai5oZWlnaHQ7XG5cdCAgICBcdFx0aW1hZ2UuZHJhdygpO1xuXHQgIFx0XHR9O1xuXG5cdFx0XHQgIGltYWdlLnggPSAwO1xuXHRcdFx0ICBpbWFnZS55ID0gMDtcblx0XHRcdCAgaW1hZ2Uub2JqLnNyYyA9IHNyY19pbWFnZTtcblx0XHRcdFx0Ly9zaW1hZ2Uub2JqLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHNob3dfaW5mbyA6IGZ1bmN0aW9uKCl7XG5cdFx0JCgnI2NhbnZhc19pbmZvICNzaXplJykudmFsKHBhcnNlSW50KGNhbnZhcy5zY2FsZSkgKyAnJScpO1xuXHRcdCQoJyNjYW52YXNfaW5mbyAjd2lkdGgnKS52YWwocGFyc2VJbnQoY2FudmFzLndpZHRoX2NhbnZhcykgKyAncHgnKTtcblx0XHQkKCcjY2FudmFzX2luZm8gI2hlaWdodCcpLnZhbChwYXJzZUludChjYW52YXMuaGVpZ2h0X2NhbnZhcykgKyAncHgnKTtcblx0fVxuXHRcbn1cbiIsIi8vIHBvYmllcmFuaWUgZGFueWNoIHogc2VsZWt0YSBpbnB1dGEgc3dpdGNoeSAoYWt0dWFsaXphY2phIG9iaWVrdMOzdykgYnV0dG9uIGlua3JlbWVudCBpIGRla3JlbWVudFxudmFyIG1vZGVscyA9IHtcblxuXHRidXR0b25faW5jcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgKyAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHRidXR0b25fZGVjcmVtZW50IDogZnVuY3Rpb24ob2JqKXtcblxuXHRcdHZhciBpbnB1dF90b191cGRhdGUgPSAkKG9iaikuYXR0cignbmFtZWlucHV0Jyk7XG5cdFx0dmFyIHZhbHVlID0gcGFyc2VJbnQoJCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwoKSkgLSAxO1xuXG5cdFx0JCgnaW5wdXRbbmFtZT1cIicraW5wdXRfdG9fdXBkYXRlKydcIl0nKS52YWwodmFsdWUpO1xuXHRcdHRoaXMudXBkYXRlX2Zyb21faW5wdXQoICQoJ2lucHV0W25hbWU9XCInK2lucHV0X3RvX3VwZGF0ZSsnXCJdJykgKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9pbnB1dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSBwYXJzZUludCgkKG9iaikudmFsKCkpO1xuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH0sXG5cblx0dXBkYXRlX2Zyb21faW5wdXRfdGV4dCA6IGZ1bmN0aW9uKG9iail7XG5cdFx0dmFyIG5hbWVfY2xhc3MgPSAkKG9iaikuYXR0cignb2JqJyk7XG5cdFx0dmFyIG5hbWVfbWV0aG9kID0gJChvYmopLmF0dHIoJ25hbWUnKTtcblxuXHRcdHdpbmRvd1tuYW1lX2NsYXNzXVtuYW1lX21ldGhvZF0gPSAkKG9iaikudmFsKCk7XG5cdFx0Y2FudmFzLmRyYXcoKTtcblx0fSxcblxuXHR1cGRhdGVfZnJvbV9zZWxlY3QgOiBmdW5jdGlvbihvYmope1xuXHRcdHZhciBuYW1lX2NsYXNzID0gJChvYmopLmF0dHIoJ29iaicpO1xuXHRcdHZhciBuYW1lX21ldGhvZCA9ICQob2JqKS5hdHRyKCduYW1lJyk7XG5cblx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gJChvYmopLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmF0dHIoJ25hbWUnKTtcblx0XHRjYW52YXMuZHJhdygpO1xuXHR9LFxuXG5cdHVwZGF0ZV9mcm9tX3N3aXRjaCA6IGZ1bmN0aW9uKG9iail7XG5cblx0XHR2YXIgbmFtZV9jbGFzcyA9ICQob2JqKS5hdHRyKCdvYmonKTtcblx0XHR2YXIgbmFtZV9tZXRob2QgPSAkKG9iaikuYXR0cignbmFtZScpO1xuXG5cdFx0aWYoICQob2JqKS5hdHRyKFwidmFsdWVcIikgPT0gJ2ZhbHNlJyApe1xuXHRcdFx0JChvYmopLmF0dHIoXCJ2YWx1ZVwiLCd0cnVlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vZmYnKTtcblx0XHRcdCQob2JqKS5hZGRDbGFzcygnc3dpdGNoLW9uJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZXsgLy93ecWCxIVjemFteSBwcnplxYLEhWN6bmlrXG5cdFx0XHQkKG9iaikuYXR0cihcInZhbHVlXCIsJ2ZhbHNlJyk7XG5cdFx0XHQkKG9iaikucmVtb3ZlQ2xhc3MoJ3N3aXRjaC1vbicpO1xuXHRcdFx0JChvYmopLmFkZENsYXNzKCdzd2l0Y2gtb2ZmJyk7XG5cdFx0XHR3aW5kb3dbbmFtZV9jbGFzc11bbmFtZV9tZXRob2RdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNhbnZhcy5kcmF3KCk7XG5cdH1cbn1cbiIsIi8vb2JpZWt0IG15c3praSAoZG8gb2dhcm5pZWNpYSlcbnZhciBtb3VzZSA9IHtcblx0bW91c2VfZG93biA6IGZhbHNlLFxuXHRjbGlja19vYmogOiBudWxsLFxuXG5cdHRtcF9tb3VzZV94IDogbnVsbCwgLy96bWllbm5lIHR5bWN6YXNvd2UgdW1vxbxsaXdpYWrEhWNlIHByemVzdXdhbmllIHTFgmFcblx0dG1wX21vdXNlX3kgOiBudWxsLCAvL3ptaWVubmUgdHltY3phc293ZSB1bW/FvGxpd2lhasSFY2UgcHJ6ZXN1d2FuaWUgdMWCYVxuXG5cdGxlZnQgOiBudWxsLCAvL3BvenljamEgeCBteXN6a2lcblx0dG9wIDogbnVsbCwgLy9wb3p5Y2phIHkgbXlzemtpXG5cdHBhZGRpbmdfeCA6IG51bGwsIC8vcG96eWNqYSB4IG15c3praSBvZCBnw7NybmVqIGtyYXfEmWR6aVxuXHRwYWRkaW5nX3kgOiBudWxsLCAvL3BvenljamEgeSBteXN6a2kgb2QgZ8Ozcm5laiBrcmF3xJlkemlcblx0b2Zmc2V0X3ggOiBudWxsLCAvL29mZnNldCB4IG9iaWVrdHUga2xpa25pxJl0ZWdvXG5cdG9mZnNldF95IDogbnVsbCwgLy9vZmZzZXQgeSBvYmlla3R1IGtsaWtuacSZdGVnb1xuXG5cdC8vZnVuY2tqYSB3eWtyeXdhasSFY2EgdyBjbyBrbGlrbmnEmXRvIHBvYmllcmFqxIVjYSBwYWRkaW5nIGtsaWtuacSZY2lhIG9yYXogemFwaXN1asSFY2Ega2xpa25pxJljaWVcblx0c2V0X21vdXNlX2Rvd24gOiBmdW5jdGlvbihldmVudCl7XG5cblx0XHRpZiAoIWV2ZW50KSB7ZXZlbnQgPSB3aW5kb3cuZXZlbnQ7fSAvL2xhdGEgZGxhIG1vemlsbGlcblx0XHR2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuXG5cdFx0Ly9qZcWbbGkgZWxlbWVudCBuYSBrdMOzcnkga2xpa25pxJl0byBtYSBhdHJ5YnV0IG5hbWVjbGljayBwcnp5cGlzdWplbXkgZ28gZG8gb2JpZWt0dSBteXN6a2lcblx0XHRpZih0eXBlb2YoJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdHRoaXMuY2xpY2tfb2JqID0gJChldmVudC50YXJnZXQpLmF0dHIoJ25hbWVjbGljaycpO1xuXG5cdFx0XHR2YXIgcG9zaXRpb24gPSAkKG9iaikub2Zmc2V0KCk7XG5cdFx0XHR0aGlzLm9mZnNldF94ID0gcG9zaXRpb24ubGVmdDtcblx0XHRcdHRoaXMub2Zmc2V0X3kgPSBwb3NpdGlvbi50b3A7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XG5cdFx0XHR0aGlzLnBhZGRpbmdfeSA9IHRoaXMudG9wIC0gcG9zaXRpb24udG9wO1xuXHRcdFx0bW91c2UubW91c2VfZG93biA9IHRydWU7XG5cblx0XHRcdHRoaXMudG1wX21vdXNlX3ggPSBpbWFnZS54O1xuXHRcdFx0dGhpcy50bXBfbW91c2VfeSA9IGltYWdlLnk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldF9wb3NpdGlvbiA6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHR0aGlzLmxlZnQgPSBldmVudC5wYWdlWCxcblx0XHR0aGlzLnRvcCA9IGV2ZW50LnBhZ2VZXG5cdH0sXG5cblx0Ly9mdW5rY2phIHd5a29ueXdhbmEgcG9kY3phcyB3Y2nFm25pZWNpYSBwcnp5Y2lrc2t1IG15c3praSAodyB6YWxlxbxub8WbY2kgb2Qga2xpa25pxJl0ZWdvIGVsZW1lbnR1IHd5a29udWplbXkgcsOzxbxuZSByemVjenkpXG5cdG1vdXNlbW92ZSA6IGZ1bmN0aW9uKCl7XG5cdFx0c3dpdGNoKHRoaXMuY2xpY2tfb2JqKXtcblx0XHRcdGNhc2UgJ3JpZ2h0X3Jlc2l6ZSc6XG5cdFx0XHRcdC8vcm96c3plcnphbmllIGNhbnZhc2EgdyBwcmF3b1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdHZhciBuZXdfd2lkdGggPSB0aGlzLmxlZnQgLSB0aGlzLnBhZGRpbmdfeCAtIHBvc2l0aW9uLmxlZnRcblx0XHRcdFx0aWYobmV3X3dpZHRoIDwgc2NyZWVuLndpZHRoIC0gMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2l6ZV93aWR0aChuZXdfd2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYm90dG9tX3Jlc2l6ZSc6XG5cdFx0XHRcdC8vem1pZW5pYW15IHd5c29rb8WbxIcgY2FudmFzYVxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSAkKCcjY2FudmFzX2JveCAjY2FudmFzX3dyYXBwZXInKS5jaGlsZHJlbignY2FudmFzJykub2Zmc2V0KCk7XG5cdFx0XHRcdGNhbnZhcy5yZXNpemVfaGVpZ2h0KHRoaXMudG9wIC0gdGhpcy5wYWRkaW5nX3kgLSBwb3NpdGlvbi50b3ApO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2ltYWdlX3Jlc2l6ZSc6XG5cblx0XHRcdFx0aWYoaW1hZ2Uub2JqICE9PSB1bmRlZmluZWQpe1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gJCgnI2NhbnZhc19ib3ggI2NhbnZhc193cmFwcGVyJykuY2hpbGRyZW4oJ2NhbnZhcycpLm9mZnNldCgpO1xuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7XHQvL2FrdHVhbG5hIHBvenljamEgbXlzemtpXG5cdFx0XHRcdFx0dmFyIHN1YnN0cmFjdCA9IGltYWdlLnggKyBpbWFnZS53aWR0aCAtIHhfYWN0dWFsICsgdGhpcy5wYWRkaW5nX3g7XG5cdFx0XHRcdFx0dmFyIGZhY29yID0gaW1hZ2Uud2lkdGggLyBpbWFnZS5oZWlnaHQ7XG5cblx0XHRcdFx0XHRpZiAoaW1hZ2Uud2lkdGggLSBzdWJzdHJhY3QgPiAxMDApe1xuXHRcdFx0XHRcdFx0aW1hZ2Uud2lkdGggLT0gc3Vic3RyYWN0O1xuXHRcdFx0XHRcdFx0aW1hZ2UuaGVpZ2h0IC09IHN1YnN0cmFjdC9mYWNvcjtcblx0XHRcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnY2FudmFzJzpcblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIHpkasSZY2llbSAobnAuIG1hcGEgLyB3em9yemVjKVxuXHRcdFx0XHRpZigobWVudV90b3AubW92ZV9pbWFnZSkgJiYgKGltYWdlLm9iaiAhPT0gdW5kZWZpbmVkKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9ICQoJyNjYW52YXNfYm94ICNjYW52YXNfd3JhcHBlcicpLmNoaWxkcmVuKCdjYW52YXMnKS5vZmZzZXQoKTtcblxuXHRcdFx0XHRcdHZhciB4X2FjdHVhbCA9IHRoaXMubGVmdCAtIHBvc2l0aW9uLmxlZnQ7IC8vYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblx0XHRcdFx0XHR2YXIgeV9hY3R1YWwgPSB0aGlzLnRvcCAtIHBvc2l0aW9uLnRvcDsgLy8gYWt0dWFsbmEgcG96eWNqYSBteXN6a2lcblxuXHRcdFx0XHRcdHZhciB4X3RyYW5zbGF0ZSA9IHhfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3ggKyBtb3VzZS50bXBfbW91c2VfeDsgLy9wcnplc3VuacSZY2llIG9icmF6a2Egd3pnbMSZZGVtIGFrdHVhbG5laiBwb3p5Y2ppIG15c3praVxuXHRcdFx0XHRcdHZhciB5X3RyYW5zbGF0ZSA9IHlfYWN0dWFsIC0gdGhpcy5wYWRkaW5nX3kgKyBtb3VzZS50bXBfbW91c2VfeTsgLy9wcnplc3VuaWVjaWUgb2JyYXprYSB3emdsxJlkZW0gYWt0dWFsbmVqIHBvenljamkgbXlzemtpXG5cblx0XHRcdFx0XHR2YXIgeF9uZXcgPSB4X3RyYW5zbGF0ZSA7XG5cdFx0XHRcdFx0dmFyIHlfbmV3ID0geV90cmFuc2xhdGUgO1xuXG5cdFx0XHRcdFx0aW1hZ2UueCA9IHhfbmV3O1xuICAgICAgXHRcdFx0XHRpbWFnZS55ID0geV9uZXc7XG4gICAgICBcdFx0XHRcdGNhbnZhcy5kcmF3KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3J5c293YW5pZVxuXHRcdFx0XHRlbHNlIGlmICgoIW1lbnVfdG9wLm1vdmVfaW1hZ2UpICYmICghbWVudV90b3AubW92ZV9jYW52YXMpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHJvd19jbGljayA9IHBhcnNlSW50KCAodGhpcy50b3AgLSBjYW52YXMub2Zmc2V0X3RvcCArIGNhbnZhcy5jb250ZXh0X3kqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ195KSooY2FudmFzLnNjYWxlIC8gMTAwKSAgKSApO1xuXHRcdFx0XHRcdHZhciBjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSApIC8gKCAocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSApICk7XG5cblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKCdrbGlrJyxyb3dfY2xpY2ssY29sdW1uX2NsaWNrLGNhbnZhcy5jb250ZXh0X3gsY2FudmFzLmNvbnRleHRfeSk7XG5cblx0XHRcdFx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvd19jbGljayUyID09MCkpe1xuXHRcdFx0XHRcdFx0Ly9jb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICgocG9pbnRlcnMuc2l6ZV9wb2ludGVyICsgcG9pbnRlcnMucGFkZGluZ194KSooY2FudmFzLnNjYWxlIC8gMTAwKSkgICk7XG5cdFx0XHRcdFx0XHRjb2x1bW5fY2xpY2sgPSBwYXJzZUludCggKHRoaXMubGVmdCAtIGNhbnZhcy5vZmZzZXRfbGVmdCArIGNhbnZhcy5jb250ZXh0X3gqKC0xKSAtIHBvaW50ZXJzLnNpemVfcG9pbnRlci8yKSAvICggKHBvaW50ZXJzLnNpemVfcG9pbnRlciArIHBvaW50ZXJzLnBhZGRpbmdfeCkqKGNhbnZhcy5zY2FsZSAvIDEwMCkgKSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCAocm93X2NsaWNrID49IDApICYmIChyb3dfY2xpY2sgPCBjYW52YXMuYWN0aXZlX3JvdykgJiYgKGNvbHVtbl9jbGljayA+PSAwKSAmJiAoY29sdW1uX2NsaWNrIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb2ludGVycy51cGRhdGVfcG9pbnQocm93X2NsaWNrLGNvbHVtbl9jbGljayxwb2ludGVycy5sYXN0X3Jvdyxwb2ludGVycy5sYXN0X2NvbHVtbik7XG5cdFx0XHRcdFx0XHRwb2ludGVycy5sYXN0X2NvbHVtbiA9IGNvbHVtbl9jbGljaztcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gcm93X2NsaWNrO1xuXHRcdFx0XHRcdFx0Y2FudmFzLmRyYXcoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3Rfcm93ID0gbnVsbDtcblx0XHRcdFx0XHRcdHBvaW50ZXJzLmxhc3RfY29sdW1uID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3ByemVzdXdhbmllIGNhxYJ5bSBjYW52YXNlbVxuXHRcdFx0XHRlbHNlIGlmKG1lbnVfdG9wLm1vdmVfY2FudmFzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FudmFzLnJlc2V0KCk7XG5cdFx0XHRcdFx0Y2FudmFzLmNsZWFyKCk7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeCA9IChtb3VzZS5sZWZ0IC0gbW91c2Uub2Zmc2V0X3gpIC0gbW91c2UucGFkZGluZ194ICsgY2FudmFzLmNvbnRleHRfeDtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dF9uZXdfeSA9IChtb3VzZS50b3AgLSBtb3VzZS5vZmZzZXRfeSkgLSBtb3VzZS5wYWRkaW5nX3kgKyBjYW52YXMuY29udGV4dF95O1xuXG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3ggPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeCA9IDA7XG5cdFx0XHRcdFx0aWYoY2FudmFzLmNvbnRleHRfbmV3X3kgPiAwKSBjYW52YXMuY29udGV4dF9uZXdfeSA9IDA7XG5cblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC50cmFuc2xhdGUoICggY2FudmFzLmNvbnRleHRfbmV3X3ggLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApLCggY2FudmFzLmNvbnRleHRfbmV3X3kgLyAoY2FudmFzLnNjYWxlIC8gMTAwKSApKTtcblx0XHRcdFx0XHRjYW52YXMuZHJhdygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuIiwiLy9vYmlla3QgbcOzd2nEhWN5IG5hbSBuYWQgamFrxIUga2F0ZWdvcmlhIGplc3RlxZtteVxudmFyIG9uX2NhdGVnb3J5ID0ge1xuXHRcblx0Y2FudmFzX29mZnNldF90b3AgOiAkKCcjY2FudmFzX3dyYXBwZXInKS5vZmZzZXQoKS50b3AsXG5cdGNhbnZhc19vZmZzZXRfbGVmdCA6ICQoJyNjYW52YXNfd3JhcHBlcicpLm9mZnNldCgpLmxlZnQsXG5cblx0Ly9mdW5rY2phIHp3cmFjYWrEhWNhIGFrdHVhbG7EhSBrYXRlZ29yacSZIG5hZCBrdMOzcsSFIHpuYWpkdWplIHNpxJkga3Vyc29yXG5cdGdldF9uYW1lIDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgbGVmdCA9IG1vdXNlLmxlZnQgLSB0aGlzLmNhbnZhc19vZmZzZXRfbGVmdDtcblx0XHR2YXIgdG9wID0gbW91c2UudG9wIC0gdGhpcy5jYW52YXNfb2Zmc2V0X3RvcDtcblx0XHR2YXIgcm93ID0gTWF0aC5jZWlsKCB0b3AgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeSkgKTtcblx0XHRcblx0XHRpZigocG9pbnRlcnMudHJhbnNsYXRlX21vZHVsbykgJiYgKHJvdyAlIDIgIT0gMCkpe1xuXHRcdFx0dmFyIGNvbHVtbiA9IE1hdGguY2VpbCggKGxlZnQgKyAocG9pbnRlcnMuc2l6ZS8yKSkvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApIC0gMTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHZhciBjb2x1bW4gPSBNYXRoLmNlaWwoIGxlZnQvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ194KSApO1xuXHRcdH1cblxuXHRcdHRyeXtcblx0XHRcdHZhciBjYXRlZ29yeV9udW0gPSBwb2ludGVycy5wb2ludGVyc1tyb3ctMV1bY29sdW1uLTFdIFxuXHRcdFx0dmFyIGNhdGVnb3J5X25hbWUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5W2NhdGVnb3J5X251bV1bMF1cblx0XHR9XG5cdFx0Y2F0Y2goZSl7XG5cdFx0XHRyZXR1cm4gJ251bGwnO1xuXHRcdH1cblx0XHRcblx0XHRpZiggY2F0ZWdvcnlfbmFtZSA9PSAncHVzdHknKXtcblx0XHRcdHJldHVybiAnbnVsbCc7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnlfbmFtZTtcdFx0XG5cdFx0fVxuXG5cdH1cblxufVxuXG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZWxlYXZlKGZ1bmN0aW9uKCl7ICQoXCIjY2FudmFzX2Nsb3VkXCIpLmZhZGVPdXQoMjAwKTsgfSk7XG4kKCcjY2FudmFzX3dyYXBwZXInKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQudXBkYXRlX3RleHQoIG9uX2NhdGVnb3J5LmdldF9uYW1lKCkgKTsgfSk7XG4kKFwiI2NhbnZhc19jbG91ZFwiKS5tb3VzZW1vdmUoZnVuY3Rpb24oKXsgY2xvdWQuc2V0X3Bvc2l0aW9uKCk7IH0pOyIsInBhbGV0cyA9IHtcbiAgdmFsX21heCA6IG51bGwsXG4gIHZhbF9taW4gOiBudWxsLFxuICB2YWxfaW50ZXJ2YWwgOiBudWxsLCAgIFxuICBwYWxldHNfYWN0aXZlIDogMCxcbiAgLy92YWx1ZSA6IC0xLFxuICAvL2NhdGVnb3J5IDogLTEsXG5cbiAgLy9wb2RzdGF3b3dlIHBhbGV0eSBrb2xvcsOzdyAoIG9zdGF0bmlhIHBhbGV0YSBqZXN0IG5hc3rEhSB3xYJhc27EhSBkbyB6ZGVmaW5pb3dhbmlhIClcbiAgY29sb3JfYXJyIDogW1xuICAgIFsnI2Y3ZmNmZCcsJyNlNWY1ZjknLCcjY2NlY2U2JywnIzk5ZDhjOScsJyM2NmMyYTQnLCcjNDFhZTc2JywnIzIzOGI0NScsJyMwMDZkMmMnLCcjMDA0NDFiJ10sXG4gICAgWycjZjdmY2ZkJywnI2UwZWNmNCcsJyNiZmQzZTYnLCcjOWViY2RhJywnIzhjOTZjNicsJyM4YzZiYjEnLCcjODg0MTlkJywnIzgxMGY3YycsJyM0ZDAwNGInXSxcbiAgICBbJyNmN2ZjZjAnLCcjZTBmM2RiJywnI2NjZWJjNScsJyNhOGRkYjUnLCcjN2JjY2M0JywnIzRlYjNkMycsJyMyYjhjYmUnLCcjMDg2OGFjJywnIzA4NDA4MSddLFxuICAgIFsnI2ZmZjdlYycsJyNmZWU4YzgnLCcjZmRkNDllJywnI2ZkYmI4NCcsJyNmYzhkNTknLCcjZWY2NTQ4JywnI2Q3MzAxZicsJyNiMzAwMDAnLCcjN2YwMDAwJ10sXG4gICAgWycjZmZmN2ZiJywnI2VjZTdmMicsJyNkMGQxZTYnLCcjYTZiZGRiJywnIzc0YTljZicsJyMzNjkwYzAnLCcjMDU3MGIwJywnIzA0NWE4ZCcsJyMwMjM4NTgnXSxcbiAgICBbJyNmZmY3ZmInLCcjZWNlMmYwJywnI2QwZDFlNicsJyNhNmJkZGInLCcjNjdhOWNmJywnIzM2OTBjMCcsJyMwMjgxOGEnLCcjMDE2YzU5JywnIzAxNDYzNiddLFxuICAgIFsnI2Y3ZjRmOScsJyNlN2UxZWYnLCcjZDRiOWRhJywnI2M5OTRjNycsJyNkZjY1YjAnLCcjZTcyOThhJywnI2NlMTI1NicsJyM5ODAwNDMnLCcjNjcwMDFmJ10sXG4gICAgWycjZmZmN2YzJywnI2ZkZTBkZCcsJyNmY2M1YzAnLCcjZmE5ZmI1JywnI2Y3NjhhMScsJyNkZDM0OTcnLCcjYWUwMTdlJywnIzdhMDE3NycsJyM0OTAwNmEnXSxcbiAgICBbJyNmZmZmZTUnLCcjZjdmY2I5JywnI2Q5ZjBhMycsJyNhZGRkOGUnLCcjNzhjNjc5JywnIzQxYWI1ZCcsJyMyMzg0NDMnLCcjMDA2ODM3JywnIzAwNDUyOSddLFxuICAgIFsnI2ZmZmZkOScsJyNlZGY4YjEnLCcjYzdlOWI0JywnIzdmY2RiYicsJyM0MWI2YzQnLCcjMWQ5MWMwJywnIzIyNWVhOCcsJyMyNTM0OTQnLCcjMDgxZDU4J10sXG4gICAgWycjZmZmZmU1JywnI2ZmZjdiYycsJyNmZWUzOTEnLCcjZmVjNDRmJywnI2ZlOTkyOScsJyNlYzcwMTQnLCcjY2M0YzAyJywnIzk5MzQwNCcsJyM2NjI1MDYnXSxcbiAgICBbJyNmZmZmY2MnLCcjZmZlZGEwJywnI2ZlZDk3NicsJyNmZWIyNGMnLCcjZmQ4ZDNjJywnI2ZjNGUyYScsJyNlMzFhMWMnLCcjYmQwMDI2JywnIzgwMDAyNiddLFxuICAgIFsnI2Y3ZmJmZicsJyNkZWViZjcnLCcjYzZkYmVmJywnIzllY2FlMScsJyM2YmFlZDYnLCcjNDI5MmM2JywnIzIxNzFiNScsJyMwODUxOWMnLCcjMDgzMDZiJ10sXG4gICAgWycjZjdmY2Y1JywnI2U1ZjVlMCcsJyNjN2U5YzAnLCcjYTFkOTliJywnIzc0YzQ3NicsJyM0MWFiNWQnLCcjMjM4YjQ1JywnIzAwNmQyYycsJyMwMDQ0MWInXSxcbiAgICBbJyNmZmZmZmYnLCcjZjBmMGYwJywnI2Q5ZDlkOScsJyNiZGJkYmQnLCcjOTY5Njk2JywnIzczNzM3MycsJyM1MjUyNTInLCcjMjUyNTI1JywnIzAwMDAwMCddLFxuICAgIFsnI2ZmZjVlYicsJyNmZWU2Y2UnLCcjZmRkMGEyJywnI2ZkYWU2YicsJyNmZDhkM2MnLCcjZjE2OTEzJywnI2Q5NDgwMScsJyNhNjM2MDMnLCcjN2YyNzA0J10sXG4gICAgWycjZmNmYmZkJywnI2VmZWRmNScsJyNkYWRhZWInLCcjYmNiZGRjJywnIzllOWFjOCcsJyM4MDdkYmEnLCcjNmE1MWEzJywnIzU0Mjc4ZicsJyMzZjAwN2QnXSxcbiAgICBbJyNmZmY1ZjAnLCcjZmVlMGQyJywnI2ZjYmJhMScsJyNmYzkyNzInLCcjZmI2YTRhJywnI2VmM2IyYycsJyNjYjE4MWQnLCcjYTUwZjE1JywnIzY3MDAwZCddLFxuICAgIFsnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJywnI2ZmZmZmZicsJyNmZmZmZmYnLCcjZmZmZmZmJ11cbiAgXSxcblxuICBzaG93IDogZnVuY3Rpb24oKXtcblxuICAgIHRoaXMuc2hvd19jb2xvcigpO1xuICAgIHRoaXMuc2hvd19wYWxldHMoKTtcbiAgICB0aGlzLnNob3dfc2VsZWN0KCk7XG4gICAgLy9sYXllcnMuZGF0YS5jb2xvcl9hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXTtcbiAgfSxcblxuICBzaG93X3NlbGVjdCA6IGZ1bmN0aW9uKCl7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSBrYXRlZ29yaWlcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyeiBrb2x1bW7EmTwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjcGFsZXRzIC5jYXRlZ29yeScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL3d5xZt3aWV0bGFteSBwYW5lbCBkbyB3eWJvcnUga29sdW1ueSB3YXJ0b8WbY2lcbiAgICBhZGRfaHRtbCA9ICc8b3B0aW9uIGNvbD1cIi0xXCI+d3liaWVyeiBrb2x1bW7EmTwvb3B0aW9uPic7XG4gICAgZm9yKHZhciBpID0gMCwgaV9tYXggPSBleGNlbC5kYXRhWzBdLmxlbmd0aDsgIGkgPCBpX21heDsgaSsrKXtcbiAgICAgIGlmKGkgPT0gbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIiBzZWxlY3RlZD4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgYWRkX2h0bWwgKz0gJzxvcHRpb24gY29sPVwiJytpKydcIj4nICtleGNlbC5kYXRhWzBdW2ldKyAnPC9vcHRpb24+JzsgIFxuICAgICAgfVxuICAgIH1cbiAgICAkKCcjcGFsZXRzIC52YWx1ZScpLmh0bWwoIGFkZF9odG1sICk7XG5cbiAgICAvL2tvbG9ydWplbXkgb2Rwb3dpZWRuaW8gZXhjZWxhXG4gICAgJCgnI2V4Y2VsIC50ZCcpLnJlbW92ZUNsYXNzKFwidmFsdWVcIik7XG4gICAgJCgnI2V4Y2VsIC50ZCcpLnJlbW92ZUNsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgXG4gICAgaWYoIGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSAhPSAtMSl7XG4gICAgICAkKCcjZXhjZWwgLnRkW2NvbD1cIicrKGxheWVycy52YWx1ZVtsYXllcnMuYWN0aXZlXSsxKSsnXCJdJykuYWRkQ2xhc3MoXCJ2YWx1ZVwiKTtcbiAgICB9XG5cbiAgICBpZiggbGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdICE9IC0xKXtcbiAgICAgICQoJyNleGNlbCAudGRbY29sPVwiJysobGF5ZXJzLmNhdGVnb3J5W2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcImNhdGVnb3J5XCIpO1xuICAgIH1cbiAgfSxcblxuICBzZXRfY2F0ZWdvcnkgOiBmdW5jdGlvbihvYmope1xuICAgIGxheWVycy5jYXRlZ29yeVtsYXllcnMuYWN0aXZlXSA9IHBhcnNlRmxvYXQoJChcIiNwYWxldHMgc2VsZWN0LmNhdGVnb3J5IG9wdGlvbjpzZWxlY3RlZFwiKS5hdHRyKCdjb2wnKSk7XG4gICAgJCgnI2V4Y2VsIC50ZCcpLnJlbW92ZUNsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgJCgnI2V4Y2VsIC50ZFtjb2w9XCInKyhsYXllcnMuY2F0ZWdvcnlbbGF5ZXJzLmFjdGl2ZV0rMSkrJ1wiXScpLmFkZENsYXNzKFwiY2F0ZWdvcnlcIik7XG4gICAgY2F0ZWdvcmllcy5jb2xvcl9mcm9tX2V4Y2VsKCk7XG4gIH0sIFxuXG4gIHNldF92YWx1ZSA6IGZ1bmN0aW9uKG9iail7XG5cbiAgICB2YXIgdmFsdWVfdG1wID0gcGFyc2VGbG9hdCgkKFwiI3BhbGV0cyBzZWxlY3QudmFsdWUgb3B0aW9uOnNlbGVjdGVkXCIpLmF0dHIoJ2NvbCcpKTtcblxuICAgIGlmKCQuaXNOdW1lcmljKCBleGNlbC5kYXRhWzFdW3ZhbHVlX3RtcF0gKSl7XG4gICAgICBsYXllcnMudmFsdWVbbGF5ZXJzLmFjdGl2ZV0gPSB2YWx1ZV90bXA7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhbGVydCgnd3licmFuYSBrb2x1bW5hIG5pZSB6YXdpZXJhIGxpY3piJylcbiAgICB9XG4gIFxuICAgICQoJyNleGNlbCAudGQnKS5yZW1vdmVDbGFzcyhcInZhbHVlXCIpO1xuICAgICQoJyNleGNlbCAudGRbY29sPVwiJysobGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdKzEpKydcIl0nKS5hZGRDbGFzcyhcInZhbHVlXCIpO1xuICBcbiAgICB2YXIgdG1wX3ZhbHVlID0gbGF5ZXJzLnZhbHVlW2xheWVycy5hY3RpdmVdO1xuICAgIFxuICAgIC8vd3lzenVrdWplbXkgbmFqbW5pZWpzemEgaSBuYWp3acSZa3N6xIUgd2FydG/Fm8SHIHcga29sdW1uaWUgd2FydG/Fm2NpXG4gICAgaWYoIGxheWVycy52YWx1ZVt0bXBfdmFsdWVdICE9IC0xICl7XG4gICAgICBcbiAgICAgIHZhciB0bXBfbWluID0gZXhjZWwuZGF0YVsxXVt0bXBfdmFsdWVdXG4gICAgICB2YXIgdG1wX21heCA9IGV4Y2VsLmRhdGFbMV1bdG1wX3ZhbHVlXTtcbiAgICAgIGZvcih2YXIgaSA9IDEsIGlfbWF4ID0gZXhjZWwuZGF0YS5sZW5ndGg7IGkgPCBpX21heDsgaSsrKXtcbiAgICAgICAgaWYodG1wX21pbiA+IGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkgdG1wX21pbiA9IGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXTtcbiAgICAgICAgaWYodG1wX21heCA8IGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXSkgdG1wX21heCA9IGV4Y2VsLmRhdGFbaV1bdG1wX3ZhbHVlXTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKFwibWluIG1heCB2YWx1ZTogXCIsdG1wX21pbiwgdG1wX21heCk7XG4gICAgfVxuXG4gICAgbGF5ZXJzLm1pbl92YWx1ZVtsYXllcnMuYWN0aXZlXSA9IHRtcF9taW5cbiAgICBsYXllcnMubWF4X3ZhbHVlW2xheWVycy5hY3RpdmVdID0gdG1wX21heDtcbiAgICBjYXRlZ29yaWVzLmNvbG9yX2Zyb21fZXhjZWwoKTtcbiAgfSxcblxuICBzaG93X2NvbG9yIDogZnVuY3Rpb24oKXtcbiAgICAvL3d5xZt3aWV0bGFteSBwaWVyd3N6YWxpc3TEmSBrb2xvcsOzd1xuICAgIHZhciBodG1sID0gJyc7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGk8aV9tYXg7IGkrKyl7XG4gICAgICBcbiAgICAgIGlmKGxheWVycy5jb2xvcnNfcG9zW2xheWVycy5hY3RpdmVdW2ldID09IDEpe1xuICAgICAgICBodG1sICs9ICc8c3BhbiBjbGFzcz1cImFjdGl2ZVwiIHN0eWxlPVwiYmFja2dyb3VuZDonK3RoaXMuY29sb3JfYXJyW2xheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdXVtpXSsnXCI+PC9zcGFuPic7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBodG1sICs9ICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQ6Jyt0aGlzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0rJ1wiPjwvc3Bhbj4nO1xuICAgICAgfVxuICAgIH1cblxuICAgICQoJyNwYWxldHMgI3NlbGVjdCcpLmh0bWwoIGh0bWwgKTtcbiAgICBcbiAgICAkKCcjcGFsZXRzICNzZWxlY3QgPiBzcGFuJykuY2xpY2soZnVuY3Rpb24oKXsgcGFsZXRzLnNlbGVjdF9jb2xvcih0aGlzKTsgfSk7XG5cbiAgfSxcblxuICBzaG93X3BhbGV0cyA6IGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgLy93eXN3aWV0bGFteSB3c3p5c3RraWUgcGFsZXR5XG4gICAgdmFyIGh0bWwgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2Fyci5sZW5ndGg7aSA8IGlfbWF4OyBpKyspe1xuICAgICAgXG4gICAgICBpZihpID09IGxheWVycy5wYWxldHNfYWN0aXZlW2xheWVycy5hY3RpdmVdKXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJhY3RpdmVcIj4nO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgaHRtbCArPSAnPHNwYW4+JztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaiA9IDAsIGpfbWF4ID0gdGhpcy5jb2xvcl9hcnJbMF0ubGVuZ3RoOyBqIDwgal9tYXg7IGorKyl7XG4gICAgICAgIGh0bWwgKz0gJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcl9hcnJbaV1bal0gKyAnXCI+PC9zcGFuPic7XG4gICAgICB9XG4gICAgICBodG1sICs9ICc8L3NwYW4+JztcblxuICAgIH1cbiAgICAkKCcjcGFsZXRzICNhbGwnKS5odG1sKCBodG1sICk7XG4gICAgJCgnI3BhbGV0cyAjYWxsID4gc3BhbicpLmNsaWNrKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZWxlY3RfcGFsZXRzKHRoaXMpO30pO1xuIFxuICB9LFxuXG4gIC8vemF6bmFjemFteSBrb25rcmV0bmUga29sb3J5IGRvIHd5xZt3aWV0bGVuaWFcbiAgc2VsZWN0X2NvbG9yIDogZnVuY3Rpb24ob2JqKXtcbiAgICBpZiggJChvYmopLmhhc0NsYXNzKCdhY3RpdmUnKSApe1xuICAgICAgbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV1bJChvYmopLmluZGV4KCldID0gMDtcbiAgICAgICQob2JqKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVskKG9iaikuaW5kZXgoKV0gPSAxO1xuICAgICAgJChvYmopLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG4gICAgdGhpcy5wYXJzZV9jb2xvcigpO1xuICAgIGNhdGVnb3JpZXMuY29sb3JfZnJvbV9leGNlbCgpO1xuICB9LFxuXG4gIHBhcnNlX2NvbG9yIDogZnVuY3Rpb24oKXtcbiAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgICBmb3IgKHZhciBpID0gMCwgaV9tYXggPSB0aGlzLmNvbG9yX2FyclswXS5sZW5ndGg7IGk8aV9tYXg7IGkrKyl7XG5cbiAgICAgIGlmKCAkKCcjcGFsZXRzICNzZWxlY3Qgc3BhbicpLmVxKGkpLmhhc0NsYXNzKCdhY3RpdmUnKSApe1xuICAgICAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXS5wdXNoKCByZ2IyaGV4KCQoJyNwYWxldHMgI3NlbGVjdCBzcGFuJykuZXEoaSkuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJykpICk7XG4gICAgICB9XG4gICAgIH1cblxuICAgIC8vZnVua2NqYSBwb21vY25pY3phXG4gICAgZnVuY3Rpb24gcmdiMmhleChyZ2IpIHtcbiAgICAgIHJnYiA9IHJnYi5tYXRjaCgvXnJnYlxcKChcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXCkkLyk7XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGhleCh4KSB7XG4gICAgICAgIHJldHVybiAoXCIwXCIgKyBwYXJzZUludCh4KS50b1N0cmluZygxNikpLnNsaWNlKC0yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIGhleChyZ2JbMV0pICsgaGV4KHJnYlsyXSkgKyBoZXgocmdiWzNdKTtcbiAgICB9XG4gIH0sXG5cbiAgLy96YXpuYWN6YW15IHBhbGV0ZSBrb2xvcsOzd1xuICBzZWxlY3RfcGFsZXRzIDogZnVuY3Rpb24ob2JqKXtcbiAgICAkKCcjcGFsZXRzICNhbGwgPiBzcGFuJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQob2JqKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgbGF5ZXJzLnBhbGV0c19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0gPSAkKG9iaikuaW5kZXgoKTtcbiAgICBcbiAgICAvL2FrdHVhbGl6dWplbXkgcGFsZXTEmSBha3R5d255Y2gga29sb3LDs3dcbiAgICBsYXllcnMuY29sb3JzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXSA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDAsIGlfbWF4ID0gbGF5ZXJzLmNvbG9yc19wb3NbbGF5ZXJzLmFjdGl2ZV0ubGVuZ3RoOyBpIDwgaV9tYXg7IGkrKyl7XG4gICAgICBpZihsYXllcnMuY29sb3JzX3Bvc1tsYXllcnMuYWN0aXZlXVtpXSA9PSAxKXtcbiAgICAgICAgbGF5ZXJzLmNvbG9yc19hY3RpdmVbbGF5ZXJzLmFjdGl2ZV0ucHVzaCggcGFsZXRzLmNvbG9yX2FycltsYXllcnMucGFsZXRzX2FjdGl2ZVtsYXllcnMuYWN0aXZlXV1baV0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNob3dfY29sb3IoKTtcbiAgICBjYXRlZ29yaWVzLmNvbG9yX2Zyb21fZXhjZWwoKTtcbiAgfVxufVxuXG4vL3pkYXJ6ZW5pYSBkb3R5Y3rEhWNlIHBhbGV0XG4kKCcjcGFsZXRzIHNlbGVjdC5jYXRlZ29yeScpLmNoYW5nZShmdW5jdGlvbigpeyBwYWxldHMuc2V0X2NhdGVnb3J5KHRoaXMpOyB9KTtcbiQoJyNwYWxldHMgc2VsZWN0LnZhbHVlJykuY2hhbmdlKGZ1bmN0aW9uKCl7IHBhbGV0cy5zZXRfdmFsdWUodGhpcyk7IH0pOyIsIi8vbWVudSBwb2ludGVyXG52YXIgcG9pbnRlcnMgPSB7XG5cdHNob3dfYWxsX3BvaW50IDogdHJ1ZSxcblx0cGFkZGluZ194IDogMSxcblx0cGFkZGluZ195IDogMSxcblx0dHJhbnNsYXRlX21vZHVsbyA6IGZhbHNlLFxuXHRzaXplIDogMTAsXG5cdG1haW5fa2luZCA6ICdzcXVhcmUnLFxuXHRraW5kcyA6IEFycmF5KCdzcXVhcmUnLCdjaXJjbGUnLCdoZXhhZ29uJywnaGV4YWdvbjInKSxcblxuXHRwb2ludGVycyA6IEFycmF5KCksIC8vcG9pbnRlcnMucG9pbnRlcnNbcnphZF1ba29sdW1uYV0gOiBrYXRlZ29yaWFbbnVtZXJdXG5cblx0bGFzdF9jb2x1bW4gOiBudWxsLFx0Ly9rb2x1bW5hIHBvaW50ZXJhIGt0w7NyeSB6b3N0YcWCIG9zdGF0bmlvIHptaWVuaW9ueVxuXHRsYXN0X3JvdyA6IG51bGwsXHQvL3dpZXJzeiBwb2ludGVyYSBrdMOzcnkgem9zdGHFgiBvc3RhdG5pbyB6bWllbmlvbnlcblxuXG5cdC8vcnlzb3dhbmllIHdzenlzdGtpY2ggcHVua3TDs3dcblx0ZHJhdyA6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHdpZHRoX3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeDtcblx0XHR2YXIgaGVpZ2h0X3BvaW50ZXIgPSB0aGlzLnNpemUgKyB0aGlzLnBhZGRpbmdfeTtcblx0XHR2YXIgbm9uZV9jb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiXG5cblx0XHRpZih0aGlzLnNob3dfYWxsX3BvaW50KSBub25lX2NvbG9yID0gXCJyZ2JhKDEyOCwxMjgsMTI4LDEpXCI7XG5cblx0XHRmb3IodmFyIHJvdyA9IDA7IHJvdyA8IGNhbnZhcy5hY3RpdmVfcm93OyByb3crKyl7XG5cdFx0XHRmb3IodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKyl7XG5cblx0XHRcdFx0aWYodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gPT0gMCl7XG5cdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZmlsbFN0eWxlID0gbm9uZV9jb2xvcjtcblx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IDAuNTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdGlmKCAodGhpcy5wb2ludGVyc1tyb3ddW2NvbHVtbl0gIT0gbWVudV90b3AuY2F0ZWdvcnkpICYmIChtZW51X3RvcC5jYXRlZ29yeSAhPSAwKSApe1xuXHRcdFx0XHRcdFx0Y2FudmFzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAwLjJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdGNhbnZhcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gMVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnl7XG5cdFx0XHRcdFx0XHRjYW52YXMuY29udGV4dC5maWxsU3R5bGUgPSBjYXRlZ29yaWVzLmNhdGVnb3J5WyB0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSBdWzFdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaChlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdFUlJPUiAzOSBMSU5FICEgJyx0aGlzLnBvaW50ZXJzW3Jvd11bY29sdW1uXSxyb3csY29sdW1uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggKHJvdyAlIDIgPT0gMCkgJiYgKHBvaW50ZXJzLnRyYW5zbGF0ZV9tb2R1bG8pICl7XG5cdFx0XHRcdFx0d2luZG93WydmaWd1cmVzJ11bdGhpcy5tYWluX2tpbmRdKCBjb2x1bW4qd2lkdGhfcG9pbnRlciArIHdpZHRoX3BvaW50ZXIvMiAsIHJvdypoZWlnaHRfcG9pbnRlciAsIHRoaXMuc2l6ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR3aW5kb3dbJ2ZpZ3VyZXMnXVt0aGlzLm1haW5fa2luZF0oIGNvbHVtbip3aWR0aF9wb2ludGVyICwgcm93KmhlaWdodF9wb2ludGVyICwgdGhpcy5zaXplKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vdHdvcnp5bXkgdGFibGljZSBwb250ZXLDs3cgKGplxZtsaSBqYWtpxZsgcG9udGVyIGlzdG5pZWplIHpvc3Rhd2lhbXkgZ28sIHcgcHJ6eXBhZGt1IGdkeSBwb2ludGVyYSBuaWUgbWEgdHdvcnp5bXkgZ28gbmEgbm93bylcblx0Y3JlYXRlX2FycmF5IDogZnVuY3Rpb24oKXtcblx0XHRjYW52YXMuYWN0aXZlX3JvdyA9IHBhcnNlSW50KCBjYW52YXMuaGVpZ2h0X2NhbnZhcyAvIChwb2ludGVycy5zaXplICsgcG9pbnRlcnMucGFkZGluZ195KSApO1xuXHRcdGNhbnZhcy5hY3RpdmVfY29sdW1uID0gcGFyc2VJbnQoIGNhbnZhcy53aWR0aF9jYW52YXMgLyAocG9pbnRlcnMuc2l6ZSArIHBvaW50ZXJzLnBhZGRpbmdfeCkgKTtcblxuXHRcdGlmKCAodGhpcy5wb2ludGVycy5sZW5ndGggPCBjYW52YXMuYWN0aXZlX3JvdykgfHwgKHRoaXMucG9pbnRlcnNbMF0ubGVuZ3RoIDwgY2FudmFzLmFjdGl2ZV9jb2x1bW4pIClcblx0XHR7XG5cdFx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCBjYW52YXMuYWN0aXZlX3Jvdzsgcm93KyspXG5cdFx0XHR7XG5cdFx0XHRcdGZvciAodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8IGNhbnZhcy5hY3RpdmVfY29sdW1uOyBjb2x1bW4rKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XSA9PSB1bmRlZmluZWQpIHRoaXMucG9pbnRlcnNbcm93XSA9IG5ldyBBcnJheSgpO1xuXHRcdFx0XHRcdGlmKHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID09IHVuZGVmaW5lZClcdHRoaXMucG9pbnRlcnNbcm93XVtjb2x1bW5dID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVfcG9pbnQgOiBmdW5jdGlvbih5LHgseV9sYXN0LHhfbGFzdCl7XG5cblx0XHR0aGlzLnBvaW50ZXJzW3ldW3hdID0gcGFyc2VJbnQoIG1lbnVfdG9wLmNhdGVnb3J5ICk7XG5cblx0XHQvL3d5em5hY3plbmllIHLDs3duYW5pYSBwcm9zdGVqXG5cdFx0aWYoICgoeV9sYXN0ICE9IHkpIHx8ICh4X2xhc3QgIT0geCkpICYmICh5X2xhc3QgIT0gbnVsbCkgJiYgKHhfbGFzdCAhPSBudWxsKSApe1xuXHRcdFx0dmFyIGEgPSAoeV9sYXN0IC0geSkgLyAoeF9sYXN0IC0geCk7XG5cdFx0XHR2YXIgYiA9IHkgLSBhKng7XG5cblx0XHRcdGlmKHhfbGFzdCA+IHgpe1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4O1xuXHRcdFx0XHR2YXIgY29sX3RvID0geF9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBjb2xfdG8gPSB4O1xuXHRcdFx0XHR2YXIgY29sX2Zyb20gPSB4X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHlfbGFzdCA+IHkpe1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5O1xuXHRcdFx0XHR2YXIgcm93X3RvID0geV9sYXN0O1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciByb3dfdG8gPSB5O1xuXHRcdFx0XHR2YXIgcm93X2Zyb20gPSB5X2xhc3Q7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByb3cgPSBudWxsO1xuXHRcdFx0Zm9yKHZhciBjb2wgPSBjb2xfZnJvbTsgY29sIDw9IGNvbF90bzsgY29sKyspXG5cdFx0XHR7XG5cdFx0XHRcdHJvdyA9IHBhcnNlSW50KCBhKmNvbCtiICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhyb3cpKSByb3cgPSB5O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgY29sID0gbnVsbDtcblx0XHRcdGZvcih2YXIgcm93ID0gcm93X2Zyb207IHJvdyA8PSByb3dfdG87IHJvdysrKVxuXHRcdFx0e1xuXHRcdFx0XHRjb2wgPSBwYXJzZUludCggKHJvdy1iKS9hICk7XG5cdFx0XHRcdGlmKCEkLmlzTnVtZXJpYyhjb2wpKSBjb2wgPSB4O1xuXHRcdFx0XHR0aGlzLnBvaW50ZXJzW3Jvd11bY29sXSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5wb2ludGVyc1t5XVt4XSA9IHBhcnNlSW50KCBtZW51X3RvcC5jYXRlZ29yeSApO1xuXHRcdH1cblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
