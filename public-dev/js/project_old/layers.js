var layers = {

	list : ['warstwa1'],

	show : function(){
		
		var html = "";
		for(var i = 0, i_max = this.list.length; i < i_max; i++){
			html += '<span>' + this.list[i] + '</span>';
		}
		console.log('layers_show');
		$('#layers').html(html);

	}
}

/*
	//dodajemy nową warstwę
	add : function(){

		var name = 'warstwa ' + (parseInt( this.list.length ) + 1);
		this.list.push({ name: name, color_panel: new _color_panel() });
		this.show();

	},

	//usuwamy ostatnią warstwę
	remove : function(){
		
		if(this.list.length > 1){
			var name = 'warstwa ' + (parseInt( this.list.length ) + 1);
			this.list.pop();
			this.show();
		}
	
	},

	//aktualizacja (wyświetlamy wszystkie warstwy)
	show : function(){

		var add_html = '';

		for(var i = 0, i_max = this.list.length; i < i_max; i++){

			if( i == layers.active ){
				add_html += '<span number="'+i+'" class="active">' + this.list[i].name + '</span>';
			}
			else{
				add_html += '<span number="'+i+'">' + this.list[i].name + '</span>';
			}
	
		}
		
		add_html += '<span class="add"> + </span> <span class="remove"> - </span>';
		$('#layers').html( add_html );
	
	},

	//ustawiamy aktualną warstwę
	set_active : function( obj ){
		
		if( $.isNumeric( $(obj).attr('number') ) ){
			this.active = parseInt( $(obj).attr('number') );		
		}

		if ( (!$(obj).hasClass('add')) && (!$(obj).hasClass('remove')) ){
			$('#layers span').removeClass('active');
			$(obj).addClass('active');		
		}

		layers.list[layers.active].color_panel.show();
		layers.list[layers.active].color_panel.parse_data();


		excel.show();
		pointers.draw();
		
		layers.list[layers.active].color_panel.show_active_color();

	},

	set_edit : function (obj){
		$(obj).prop('contenteditable', true);
		$(obj).select();
		$(obj).focus();
	},

	update : function( obj ){
		var number = $(obj).attr('number');
		this.list[number].name = $(obj).html();
		
		$(obj).prop('contenteditable', false);
	}
*/
