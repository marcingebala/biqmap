//główny obiekt zawierający pola i metody do obsługi excela
var excel = {

  data : null,
  data_key : [], //specjalna konwersja zmiennych rekordów w tablicę asocjacyjną
  last_obj : null,

  //funkcja przerabiająca tablię obiektów na tablicę kluczy z obiektami
  convert : function(category_number){
    console.log('excel - convert');
    //jeśli data jest zdefiniowana
    if (typeof this.data != 'undefined' ) {

      //sortujemy tablicę wartości po zadanym kluczu
      if ( typeof category_number != 'undefined' ){
        this.data_key['value'] = [];
        for(var i = 0, i_max = this.data.value_array.length;i < i_max; i++){
        //  console.log('conver',this.data[i][category_number]);
          this.data_key['value'][this.data.value_array[i][category_number]] = this.data.value_array[i];
        }
      }

      this.data_key['label'] = [];
      //sortujemy tablicę kategorii (domyślnie zawsze)
      for(var i = 0, i_max = this.data.label_array.length;i < i_max; i++){
        this.data_key['label'][this.data.label_array[i]] = i;
      } 
    }  
    
  //console.log('przerobiono tablicę obiektów na tablice kluczy z obiektami')
  
  },

  show : function(){
    
    var add_html = '<table>'

    var col_max = this.data.label_array.length;
    var row_max = this.data.value_array.length;

    //wyświetlamy wiersz nagłówków th
    add_html += '<tr>';
    for (var col = 0; col < col_max; col++){
       add_html += '<th col="' + col + '">' + this.data.label_array[col] + '</th>';
    }
    add_html += '</tr>';


    //wyświetlamy zawartość tabeli
    for (var row = 0; row < row_max; row++){
      
      add_html += '<tr>';
      
      for (var col = 0; col < col_max; col++){
        add_html += '<td row="' + row + '" col="' + col + '">' + this.data.value_array[row][col] + '</td>';
      }
      
      add_html += '</tr>';
    
    }

    add_html += '</table><div class="add_row"><button class="add">+</button><button class="remove">-</button></div><div class="add_column"><button class="add">+</button><button class="remove">-</button></div>';

    //wyświetlamy dane w oknie divu
    $('#window2 #excel_table').html( add_html );

    //po narysowaniu excela dodajemy kolory do jego kolumn
    $('#excel_table tr td[col='+layers.list[layers.active].color_panel.select_category+'], #excel_table tr th[col=' + layers.list[layers.active].color_panel.select_category + ']').css('background-color','#d5d9dc');
    $('#excel_table tr td[col='+layers.list[layers.active].color_panel.select_value+'], #excel_table tr th[col=' + layers.list[layers.active].color_panel.select_value + ']').css('background-color','#c5e0c7');
  
  },

  edit:function(obj){
    if( $(obj).children('textarea').length == 0 ){

      if (this.last_obj != null){
        $(this.last_obj).html( $(this.last_obj).children('textarea').val()  );
      }

      this.last_obj = obj;
      var content = $(obj).html();
      $(obj).append('<textarea>' + content + '</textarea>');
      $(obj).css('padding','0px');
      $(obj).children('textarea').select();
    }
  },

  //aktualizacja kategorii
  update_td:function(){
    
    if (this.last_obj != null){
      
      var content = $(this.last_obj).children('textarea').val();
      var col = $(this.last_obj).attr('col')
      var row = $(this.last_obj).attr('row')

      $(this.last_obj).html( content );
      $(this.last_obj).css('padding','5px');
      this.data.value_array[row][col] = content;

      layers.list[layers.active].color_panel.parse_data();
      excel.convert(layers.list[layers.active].color_panel.select_category);
    }

  },

  //aktualizacja tytułu nagłówków (inna konstrukcja z uwagi na klucze tabeli)
  update_th:function(){
    if (this.last_obj != null){
      
      var content = $(this.last_obj).children('textarea').val();
      var col = $(this.last_obj).attr('col')

      $(this.last_obj).html( content );
      $(this.last_obj).css('padding','5px');
      this.data.label_array[col] = content;

      this.show();
      //layers.list[layers.active].color_panel.add_data();
      layers.list[layers.active].color_panel.parse_data();
      excel.convert(layers.list[layers.active].color_panel.select_category);
    }
  },

  save:function(){

    var formData = new FormData();
    formData.append("data", JSON.stringify(this.data) );
    formData.append("hash", excel_hash);
    formData.append("_token", csrf_token);
    formData.append("_method", "patch");

    jQuery.ajax({
      url: basic_url + '/excel/' + excel_hash,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data){
        alert(data);
      }
    });
  },

  //metoda odpowiedzialna za dodawanie nowych rekordów, kolumn
  change_cels: function(obj){

    var action = $(obj).parent().attr('class') + '-' + $(obj).attr('class');

    switch ( action ){
      
      case 'add_row-add':        
        excel.data.value_array.push([]);
        
        for(var i = 0, i_max = excel.data.value_array[0].length; i < i_max; i++){
          excel.data.value_array[(excel.data.value_array.length-1)].push('');
        }

        excel.convert(layers.list[layers.active].color_panel.select_category);
        excel.show();
      break;

      case 'add_row-remove':
        excel.data.value_array.pop();
        excel.convert(layers.list[layers.active].color_panel.select_category);
        excel.show();
      break;
      
      case 'add_column-add':        
        excel.data.label_array.push('');

        for(var i = 0, i_max = excel.data.value_array.length; i < i_max; i++){
          excel.data.value_array[i].push('');
        }

        excel.convert(layers.list[layers.active].color_panel.select_category);
        excel.show();
      break;

      //funkcja odpwoiedzialna za dodawanie kolumny do tabeli excel
      case 'add_column-remove':       
        excel.data.label_array.pop();

        for(var i = 0, i_max = excel.data.value_array.length; i < i_max; i++){
          excel.data.value_array[i].pop();
        }

        excel.convert(layers.list[layers.active].color_panel.select_category);
        excel.show();
      break;
    
    }
  }

}

