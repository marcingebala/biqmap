var layers = {

	list : ['warstwa1'],
	active : 0,

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
