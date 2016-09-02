//obiekt obaługujący panel settng_box, zmiana wartości za pomocą selectów
 function _color_panel() {

  this.val_max = null;
  this.val_min = null;
  this.val_interval = null;

  //podstawowe palety kolorów ( ostatnia paleta jest naszą własną do zdefiniowania )
  this.palet_data = [
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
  ];
  
  //talbica zawierająca wszystkie aktywne kolory
  this.active_color = ['#66c2a4'];
  this.group_to_color = [4];

  this.my_palet = false; //zmienna która pokazuje czy korzystamy z własnej czy innej palety kolorów

  //wybrana etykieta, paleta, wartość
  this.select_category = 'wybierz';
  this.select_value = 'wybierz';
  this.select_palet = 0;

  //uzupełniamy lewy panel (wyświetlamy selecty, ilość kolorów, palety)
  this.show = function(){

    console.log('color_panel.show()');

    //zerowanie danych
    var add_html = '<option value="wybierz">wybierz</option>';
    
    for (i = 0; i < excel.data.label_array.length; i++) {
      add_html += '<option value="' + i + '">' + excel.data.label_array[i] + '</option>';
    }

    //dodajemy opcje do pola wyboru (kolumna kategorii oraz kolumna wartości)
    $('#color_box select[name=category]').html( add_html );
    $('#color_box select[name=values]').html( add_html );

    $('#color_box select[name="category"] option').removeAttr('selected');
    $('#color_box select[name="category"] option[value='+this.select_category+']').attr('selected', true);

    $('#color_box select[name="values"] option').removeAttr('selected');
    $('#color_box select[name="values"] option[value='+this.select_value+']').attr('selected', true);


   //wstawiamy kolorów do głównego podglądu wybranych kolorów
    for(var i = 0; i < 9 ; i++){
      $('#color_box #colors li').eq(i).css('background-color', this.palet_data[this.select_palet][i] );
    }

    //rysujemy palete wszystkich kolorów
    var add_html = '';
    for (var row = 0; row < this.palet_data.length; row++) {

      add_html += '<li class="row" row="' + row + '">';

      for (var column = 0; column < this.palet_data[row].length; column++) {
        add_html += '<div style="background:' + this.palet_data[row][column] + '"></div>';
      }
 
      add_html += '</li>';

    }

    //dodajemy paletę wszystkich kolorów i zaznaczamy aktualny rekord
    $('#color_box .palets .rows').html( add_html );
    $('#color_box .palets .row').eq(this.select_palet).addClass('active');

  };

  //kolumna kategorii
  this.set_category = function(obj){

    //w pliku excela podkreślamy wybraną kategorię, 
    console.log('color_panel.set_category()');

    if( $(obj).val() != this.select_value ) {
      //usuwamy zaznaczenie oraz kolor we wcześniej wybranych kolumnach excela / options
      $('select[name=values] option[value=' + this.select_value + ']').removeAttr('selected');
      $('#excel_table tr td[col='+this.select_category+'], #excel_table tr th[col='+this.select_category+']').css('background-color','#fff');
      
      //zaznaczamy wybraną kategorię
      this.select_category = $(obj).val();
      $('#excel_table tr td[col='+this.select_category+'], #excel_table tr th[col='+this.select_category+']').css('background-color','#d5d9dc');
    }
    else {
      //w przypadku wybrania tej samej kategorii i wartości wyświetlamy błąd
      $('select[name=values] option[value=' + this.select_category + ']').attr('selected', true);
      $('#excel_table tr td[col='+this.select_category+'], #excel_table tr th[col='+this.select_category+']').css('background-color','#fff');
      
      alert('kolumna kategorii i wartości muszą być różne');
    }

    this.parse_data();
  };

  //ustawiamy kolumne wartości
  this.set_value = function(obj){

    console.log('color_panel.set_value()');

    //najpierw sprawdzamy czy wybarana kolumna zawiera liczby
    if ( $.isNumeric(excel.data.value_array[0][$(obj).val()]) ){

      //sprawdzamy czy kolumna wartości nie jest identyczna z kolumną kategorii
      if ( $(obj).val() != this.select_category ) {
        
        $('select[name=values] option[value=' + this.select_category + ']').removeAttr('selected');
        
        $('#excel_table tr td[col='+this.select_value+'], #excel_table tr th[col='+this.select_value+']').css('background-color','#fff');
        
        this.select_value = $(obj).val();
        
        $('#excel_table tr td[col='+this.select_value+'], #excel_table tr th[col='+this.select_value+']').css('background-color','#c5e0c7');
      
      }
      else{

        $('select[name=values] option[value=' + this.select_value + ']').attr('selected', true);
        alert('kolumna kategorii i wartości muszą być różne');
      
      }
    }
    else{
      //jeśli nie wyświetlamy komunikat że muszą to byc liczby
      $('select[name=values] option[value=' + this.select_value + ']').attr('selected', true);
      alert('kolumna wartości musi zawierać dane liczbowe');
    }
  
    this.parse_data();
  
  };

  //wybieramy określoną palete kolorów
  this.set_palet = function(obj){

    console.log('color_panel.set_palet()');

    this.select_palet = parseInt( $(obj).attr('row') );
    
    $(obj).parent().children('li').removeClass('active');
    $(obj).addClass('active');

    //wstawiamy kolor panelu colors
    for(var i = 0; i < 9 ; i++){  
      $('#color_box #colors li').eq(i).css('background-color', this.palet_data[$(obj).attr('row')][i] );
    }

    this.parse_data();
    //this.set_active_color();
  };

  //funkcja służy do ustalenia wartości minimalnej maksymalnej i interwału w wybranej kolumnie wartości excel
  this.parse_data = function(){
    
    console.log('color_panel.parse_data()');

    //sprawdzamy czy wybrao jedną i drugą kategorię   
    if( (this.select_category != 'wybierz') && (this.select_value != 'wybierz') ){
 
      this.val_max = excel.data.value_array[0][this.select_value];
      this.val_min = excel.data.value_array[0][this.select_value];
      
      //this.val_interval : null,

      for(var i = (excel.data.value_array.length - 1); i >= 0; i--){
      
        var val_tmp = excel.data.value_array[i][this.select_value];

        if( this.val_max < val_tmp){
          this.val_max = val_tmp;
        }

        if ( this.val_min > val_tmp){
          this.val_min = val_tmp;
        }

      }

      this.val_interval =  Math.round( (Math.abs(this.val_max -  this.val_min) / this.active_color.length) * 100 ) / 100;

      this.set_color_category();
    }
  },

  //na podstawie wybranego interwału oraz ustalonej kolumny wartości i kategorii(Excel) obliczamy w jakim przedziale znajduje się dana kategoria
  this.set_color_category = function(){

    console.log('set_color_category');

    //sprawdzamy czy zdefiniowano odpowiednie zmienne których potrzebujemy
    if ((this.val_min != null) && (this.val_max != null) && (this.val_interval != null) && (this.select_category != 'wybierz') && (this.select_value != 'wybierz') ){

      excel.convert(this.select_category);
    
      //pętla iterująca po wszystkich kategoriach mapy (category.list)
      for (var i = 1, i_max = category.list.length; i < i_max ; i++){

        try{
          var group = Math.floor( (excel.data_key.value[category.list[i].name][this.select_value]-this.val_min) / this.val_interval );
        }
        catch(e){
          var group = 0;
        }

        if(group >= this.active_color.length){
          group--;
        } 

        category.list[i].color = this.active_color[group];
        category.list[i].group = group;
      }

      //aktualizujemy mapę i wyświetlamy ponownie listę kategorii z nowymi kolorami
      map.draw();
      category.show();

    }
    else{
      console.log('nieodpowiednie dane', this.val_min, this.val_max, this.val_interval, this.select_category, this.select_value);
    }
  };


  //funckja służąca do zmiany / zaznaczania ilości aktywnych kolorów
  this.switch_color = function(obj){

    //console.log('switch_color');
    var num = $(obj).attr('num');

    //jeśli kolor nie jest zaznaczony
    if( !$(obj).hasClass('active') ){
      $(obj).addClass('active'); //dodajemy klasę active
    }
    else{
      if(this.active_color.length > 1){
        //jeśli mamy zaznaczone więcej niż jeden kolor wtedy możemy odznaczyć (zabezpieczenie przed odznaczeniem wszystkich kolorów)
        $(obj).removeClass('active'); //usuwamy klasę active
      }
      else{
        alert('co najmniej jeden kolor musi być zaznaczony');
      }
    }

    this.active_color.push( this.palet_data[this.select_palet][num] );
    this.group_to_color.push( num );
  
  };

  //przeszukujemy cały box 
  this.set_active_color = function(){

    console.log('set_active_color - ONE');

    this.active_color = [];
    this.group_to_color = [];

    var th = this;

    $( "#color_box #colors li" ).each( function( index ) {
      if( $(this).hasClass('active') ){
        th.active_color.push( th.palet_data[th.select_palet][index] );
        th.group_to_color.push( index );
      }
    });

    this.parse_data();
    //this.show_active_color();
  };

  //funckja wyświetla zaznaczone kolory z tablicy group_to_color
  this.show_active_color = function(){

    console.log('show_active_color');

    $("#colors li").removeClass('active');
    for(var i = 0, i_max = this.group_to_color.length; i < i_max; i++){
      $("#colors li").eq(this.group_to_color[i]).addClass('active');
    }

    this.set_active_color(); 
  
  }
}