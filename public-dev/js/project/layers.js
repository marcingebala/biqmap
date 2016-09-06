var layers = {

	list : ['warstwa1'],
	active : 0,

	//tablica z podstawowywmi danymi zagregowanymi dla każdej warstwy
	data : {
		category : [],
		value : [],
		colors_active : [],
		min_value : [],
		max_value : [],
		cloud : []
	},

	get_data : function(){

		this.data.colors_active[this.active] = palets.colors_active;
		this.data.category[this.active] = palets.category;


		//wyszukujemy najmniejsza i największą wartość w kolumnie wartości
		if(palets.value != -1){
			this.data.value[this.active] = palets.value;
			
			var tmp_min = excel.data[1][palets.value]
			var tmp_max = excel.data[1][palets.value];
			for(var i = 1, i_max = excel.data.length; i < i_max; i++){
				if(tmp_min > excel.data[i][palets.value]) tmp_min = excel.data[i][palets.value];
				if(tmp_max < excel.data[i][palets.value]) tmp_max = excel.data[i][palets.value];
			}
			console.log("min max value: ",tmp_min, tmp_max);
		}

		this.data.min_value[this.active] = tmp_min
		this.data.max_value[this.active] = tmp_max;
	},

	//set_data : function

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
		console.log('layers_show');
		$('#layers').html(html);

		$('#layers .add').click(function(){layers.add();});
		$('#layers .remove').click(function(){layers.remove();});
		
		$('#layers span').click(function(){ console.log('clicl');layers.select(this);});
		$('#layers span').dblclick(function(){ layers.edit(this); });
		$('#layers span').focusout(function(){ layers.end_edit(this); });

	},

	select : function(obj){
		this.get_data();
		$('#layers span').removeClass('active');
		$(obj).addClass('active');
		layers.active = $(obj).index();
	},

	add : function(){

		this.list.push( 'warstwa' + parseInt(this.list.length+1));
		this.show();

	},

	remove : function(){
		this.list.pop()
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
