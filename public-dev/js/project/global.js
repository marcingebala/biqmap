//funkcje globalne kontener na wszystko i nic ;)
var global = {
	toogle_right  : function(obj){
		//panel jest z prawej strony
		if( $(obj).parent().css('right') == '0px' ){
			$(obj).parent().animate({right: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
    }
    else{
    	 $(obj).parent().animate({right: ["0px","swing"]}, 1000, function() {});
    } 
	},
	toogle_left  : function(obj){
		//panel jest z lewej strony
		if( $(obj).parent().css('left') == '0px' ){
			$(obj).parent().animate({left: [-$(obj).parent().width()-20,"swing"]}, 1000, function() {});
    }
    else{
    	 $(obj).parent().animate({left: ["0px","swing"]}, 1000, function() {});
	  }
	}
}
