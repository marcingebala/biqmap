var category = {

  //zmienna przechowująca wszystkie kategorie
  list : [],

  //tworzymy listę kategorii na podstawie tablicy w mapie
  parse : function(){

    this.list = []; //zerowanie tablicy

    for (var i = 0, i_max = map.data[2].length; i < i_max; i++){
      var add_arr = [];
      add_arr['name'] = map.data[2][i][0];
      add_arr['color'] = map.data[2][i][1];
      add_arr['group'] = 0; 
      add_arr['share'] = false;
      add_arr['main_category'] = true;
      add_arr['main_id'] = i;
      this.list.push(add_arr);
    }

  },


  //pokazanie wszystkich kategorii w menu po prawej
  show : function(){

    var add_html = '';

    for (var i = 1, i_max = this.list.length; i < i_max;i++){

      if( this.list[i].main_category ){
        if(this.list[i].share){
          add_html += '<tr><td>' + this.list[i].name + '</td><td><div class="colorpicker_box" id_category="' + i + '" style="background-color:' + this.list[i].color + '"></div></td><td><button category="' + i + '" class="share unlink"></button></td></tr>' ;
        }else{
          add_html += '<tr><td>' + this.list[i].name + '</td><td><div class="colorpicker_box" id_category="' + i + '" style="background-color:' + this.list[i].color + '"></div></td><td><button category="' + i + '" class="share"></button></td></tr>' ;
        }
      }

    }

    $('#category_box table').html( add_html );
    colorpicker.add(); //dodajemy colorpicker do kategorii (mozliwosc zmiany koloru kategorii)
  },

  //dzielimy kategorię na podkategorie
  share : function(obj){

    //pobieramy numer id dzielonej kategorii
    var category_id = $(obj).attr('category');

    if( !this.list[category_id].share ){
      //dzielimy kategorię na podkategorię
      
      this.list[category_id].share = true;

      //wykonujemy pętlę po wszystkich komórkach mapy
      var i = 0;
      var first = true;

      for( var row = 0, row_max = map.data[1].length; row < row_max; row++ ){
        for( var col = 0, col_max = map.data[1][0].length; col < col_max; col++ ){
          if(map.data[1][row][col] == category_id){
            
            var add_arr = [];
            add_arr['name'] = this.list[category_id].name + '-' + i;
            add_arr['color'] = this.list[category_id].color;
            add_arr['group'] = this.list[category_id].group; 
            add_arr['share'] = true;
            add_arr['main_category'] = false;
            add_arr['main_id'] = category_id;
            add_arr['row'] = row; //dwie zmienne ułatwiające potem scalenie 2 kategorii
            add_arr['col'] = col;

            //uruchmaiamy tylko w przypadku jednego wiersza w przeciwnym razie dodajemy nowy element na końcu tablicy
            if(first){
              add_arr['name'] = this.list[category_id].name;
              add_arr['main_category'] = true;
              $.extend( this.list[category_id], add_arr);
              first = false;
            }
            else
            {
              this.list.push( add_arr );
              map.data[1][row][col] = Number(this.list.length)-1;
              i++;
            }
          }
        }
      }
    }
    else{
    //łączymy kategorię w jedną całość
      
      //pobieramy główną kategorię
      var main_id =  this.list[category_id].main_id;

      this.list[category_id].share = false;

      for (var i = 1; i < this.list.length; i++){
        if( (this.list[i].main_id != i) && (this.list[i].share) ){

          map.data[1][this.list[i].row][this.list[i].col] = this.list[i].main_id;
         
          this.list.splice(i, 1);
          i--;
        }
      }
    }
    
    //pokazujemy na nowo całą tabele excel
    category.show();
    map.draw();
  }
}