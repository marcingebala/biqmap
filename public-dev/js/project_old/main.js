//podpinanie zdarzeń do obiektów
$(document).ready(function(){

  //po wczytaniu strony wyszukujemy i pobieramy info o obiekcie canvas
  canvas.init();
  layers.show();

  $('#window2 #width_canvas').focusout(function(){
    $(this).val( parseInt($(this).val()) );
    canvas.update( null, parseInt($(this).val()) );
    map.draw();
  });

  $('#window2 #height_canvas').focusout(function(){
    $(this).val( parseInt($(this).val()) );
    canvas.update( parseInt($(this).val()), null );
    map.draw();
  });

  $('#excel_list li').click(function(){
    $('#excel_list').addClass('accept');
    $('#excel_list li').removeClass('active');
    $(this).addClass('active');
    project.get_excel( $(this).attr('hash') );
  });

  $('#map_list li').click(function(){
    $('#map_list').addClass('accept');
    $('#map_list li').removeClass('active');
    $(this).addClass('active');
    map.get( $(this).attr('hash') );
  });

  $('#window_menu span.next').click(function(){
    project.next_window();
  });

  $('#window_menu span.prev').click(function(){
    project.prev_window();
  });

  //zdarzenia myszki odpowiedzialne za wykrywanie pozycji kursora
  $(document).mouseup(function(){
    mouse.set_up(event);
  });

  //rejestracja zdarzenia w momencie wciśnięcia przycisku myszki
  $('#window2 #border_right').mousedown(function(event){
    mouse.set_down(event);
  });

  //wywołanie funkcji podczas poruszania myszką
  $(document).mousemove(function(event){
    mouse.set_position(event); //zarejestrowanie pozycji myszki
    //jesli przycisk jest wciśnięty wykonujemy dodatkowe zdarzenia (przy ruszaniu myszką)
    if( mouse.down ) mouse.mousemove(event);
  });

  $('.input_base').focusout(function(){
    input.set_input($(this).attr('obj'),$(this).attr('property'),this);
  });

  $('.button_base').click(function(){
    input.set_button($(this).attr('obj'),$(this).attr('property'),this);
  });

  $('#pointer_box .switch').click(function(){
    input.set_switch( $(this).attr('obj'), $(this).attr('property'), this );
  });

  $('.select_base').change(function(){
    input.set_select( $(this).attr('obj'), $(this).attr('property'), this );
  });

  $('#color_box ul li').click( function(){ layers.list[layers.active].color_panel.switch_color(this); });

  $('#color_box .palets').on('click','li',function(){
    layers.list[layers.active].color_panel.set_palet(this);
  });

  $('#category_box table').on('click','button',function(){
    category.share(this);
  });

  //po wpisaniu i odznaczeniu textarea przypisanie nowego wzoru do chmury
  $('#cloud_box textarea').focusout(function(){ cloud.pattern = $(this).val() });

  $('#window2 #canvas').mousemove(function(){
    canvas.set_active_pointer();
    cloud.set_content();
  });

  $('#color_box select[name=category]').change(function(){ layers.list[layers.active].color_panel.set_category(this); });
  $('#color_box select[name=values]').change(function(){ layers.list[layers.active].color_panel.set_value(this); });
  $('#color_box select[name=color_count]').change(function(){ layers.list[layers.active].color_panel.set_color_count(this); });

  // ----- funkcje odpowiedzialne za dymek -----

  //ustawiamy pozycje i sprawdzamy czy dymek jest widoczny
  $('#canvas_wrapper, #canvas_cloud').mousemove(function(){ cloud.set_position(); });

  //po zjechaniu z głównego canvasa ukrywamy dymek (jeśli nie najechaliśmy na dymek)
  $('#canvas_wrapper, #canvas_cloud').mouseout(function(){ cloud.hide(); });

  //zdarzenia odpowiedzialne za aktualizacje i edycje komórek excela

  //w momencie edycji kolumny i jej odznaczenia wprowadzenie zmian do jsona
  $('#excel_table').on('blur', 'td textarea', function(){ excel.update_td(); });

  //możliwośc aktualizacji komórki nagłówków
  $('#excel_table').on('blur', 'th textarea', function(){ excel.update_th(); });

  //kliknięcie w edycje tabeli
  $('#excel_table').on('click', 'td, th', function(){ excel.edit(this); });

  //funkcja odpowiedzialna za dodawanie i usuwanie kolumn / wierszy
  $('#excel_table').on('click', '.add_row button, .add_column button', function(){ excel.change_cels(this); });

  //funkcje odpowiedzialne za dodawanie i odejmowanie nowych warstw
  $('#layers').on('click', 'span.add', function(){ layers.add(); });
  $('#layers').on('click', 'span.remove', function(){ layers.remove(); });
  
  //$('#layers').on('click', 'span', function(){ alert('klik'); });
  //$('#layers').on('dblclick', 'span', function(){ alert('dblklik'); });  

  $('#layers').on('click', 'span', function(){ layers.set_active( this ); });
  $('#layers').on('dblclick', 'span', function(){ layers.set_edit( this ); });
  $('#layers').on('focusout', 'span', function(){ layers.update( this ); });

  //blokujemy możliwość używania przycisku enter
  $('#layers').on('keypress', 'span', function(e){ return e.which != 13; });

});