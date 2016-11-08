//funkcje globalne kontener na wszystko i nic ;)
var global = {
	toogle_panel  : function(obj){
		//if (!event) {event = window.event;} //latka dla mozilli
	
		//sprawdzamy z jakim panelem mamy do czynienia (czy pokazującym się z lewej czy z prawej strony)
		if(  parseInt($(obj).parent().css('left')) > 0 ){
			//panel jest z prawej strony
			if( $(obj).parent().css('right') == '0px' ){
				$(obj).parent().animate({right: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(obj).parent().animate({right: ["0px","swing"]}, 1000, function() {});
	    }
		}
		else{
			//panel jest z lewej strony
			if( $(obj).parent().css('left') == '0px' ){
				$(obj).parent().animate({left: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
	    }
	    else{
	    	 $(obj).parent().animate({left: ["0px","swing"]}, 1000, function() {});
	    }
		}

	}
}
