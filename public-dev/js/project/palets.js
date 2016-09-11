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
    $('#excel_box .category').html( add_html );

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
    $('#excel_box .value').html( add_html );

    //kolorujemy odpowiednio excela
    $('#excel_wrapper .td').removeClass("value");
    $('#excel_wrapper .td').removeClass("category");
    
    if( layers.value[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
    }

    if( layers.category[layers.active] != -1){
      $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    }
  },

  set_category : function(obj){
    layers.category[layers.active] = parseFloat($("#excel_box select.category option:selected").attr('col'));
    $('#excel_wrapper .td').removeClass("category");
    $('#excel_wrapper .td[col="'+(layers.category[layers.active]+1)+'"]').addClass("category");
    categories.color_from_excel();
  }, 

  set_value : function(obj){

    var value_tmp = parseFloat($("#excel_box select.value option:selected").attr('col'));

    if($.isNumeric( excel.data[1][value_tmp] )){
      layers.value[layers.active] = value_tmp;
    }
    else{
      alert('wybrana kolumna nie zawiera liczb')
    }
  
    $('#excel_wrapper .td').removeClass("value");
    $('#excel_wrapper .td[col="'+(layers.value[layers.active]+1)+'"]').addClass("value");
  
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

  },

  parse_color : function(){
    layers.colors_active[layers.active] = [];
     for (var i = 0, i_max = this.color_arr[0].length; i<i_max; i++){

      if( $('#palets #select span').eq(i).hasClass('active') ){
        layers.colors_active[layers.active].push( rgb2hex($('#palets #select span').eq(i).css('background-color')) );
      }
     }
    categories.color_from_excel();
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
$('#excel_box select.category').change(function(){ palets.set_category(this); });
$('#excel_box select.value').change(function(){ palets.set_value(this); });