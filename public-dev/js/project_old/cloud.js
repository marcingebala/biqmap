//obiekt odpowiedzialny za zarządzanie chmurą
//obiekt dymka (wyskakujący po najechaniu na mapę)
var cloud = {

  pattern : '',
  parse_content : null,
  margin : 10,
  last_active_pointer : null,

  //ustawiamy pozycje dymka w zależności od pozycji myszki
  set_position : function(){	
	 document.getElementById("canvas_cloud").style.left = (mouse.left+this.margin) + 'px';
	 document.getElementById("canvas_cloud").style.top = (mouse.top+this.margin) + 'px';
  },

  set_content : function(){
    
    if((canvas.active.pointer > 0) && (this.pattern != '')){
      
      this.check_visible();

      //nie wykonujemy wszystkich obliczeń za kazdym razem (jedynie przy zmimanie aktywnej grupy pointerów)
      if(this.last_active_pointer != canvas.active.pointer){

        if(category.list[canvas.active.pointer].share){
            
          var category_name =  map.data[1][canvas.active.row][canvas.active.column].share_category,
          category_id = Number(canvas.active.pointer)-1;
        
        }
        else{

            var category_name = category.list[canvas.active.pointer][0],
            category_id = Number(canvas.active.pointer)-1;
        }

       // console.log('cloud', category_name,category_id);

        var text = this.pattern;
        var pattern = /\$[a-zA-Z0-9]*/g;
        var find_words = text.match(pattern); 

        //console.log(typeof find_words);
        if(find_words !== null ){

          for(var i = 0, i_max = find_words.length;i < i_max;i++){
       
            var zm_tmp;
            var column = excel.data_key.label[find_words[i].substring(1)];

            try{
              zm_tmp = excel.data.value_array[category_id][column];
            }
            catch(err){}

            if(typeof zm_tmp != 'undefined'){
              text = text.replace(find_words[i], zm_tmp);
            }

          }
        }        
        $('#canvas_cloud').html( text );
      }
      
    }
    else{
      this.hide();
    }

  },

  //funkcja sprawdzająca widoczność dymka, jesli nie jest widoczny pokazujemy go
  check_visible : function(){
    if( !$('#canvas_cloud').is(":visible") ){
      $('#canvas_cloud').fadeIn();
    }
  },

	//kod ukrywający nasz dymek 
  hide : function(){
  	var id = $(event.relatedTarget).attr('id');
  	//console.log('identyfikator', id);
  	if( (id != 'canvas_cloud') && (id != 'canvas') ){
      $('#canvas_cloud').fadeOut();    
    }
  }
}