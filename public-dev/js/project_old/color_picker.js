//sama nazwa wiele tłumaczy po prostu colorpicker
var colorpicker = {

	click_id : null,

	add : function(){

		this.remove();
		
		if ( (layers.list[layers.active].color_panel.select_category != 'wybierz') && (layers.list[layers.active].color_panel.select_category != 'wybierz') ) {

			$('.colorpicker_box').ColorPicker({
				color: '#ff0000',
				onShow: function (colpkr) {
					if($(colpkr).css('display')=='none'){
						$(colpkr).fadeIn(200);
						colorpicker.click_id = $(this).attr('id_category');
					}
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(200);
					return false;
				},
				onChange: function (hsb, hex, rgb) {				

					// jeśli po raz pierwszy definiujemy moją własną paletem
					if (!layers.list[layers.active].color_panel.my_palet) {

						//przypisujemy aktualną paletę do własnej palety użytkownika (ważne paleta użytkownika zawsze jest zdefiniowana na końcu  tablicy)
						layers.list[layers.active].color_panel.palet_data[(layers.list[layers.active].color_panel.palet_data.length-1)] = layers.list[layers.active].color_panel.palet_data[layers.list[layers.active].color_panel.select_palet].slice();

						$('#color_box #colors li.row').removeClass('active');
						$('#color_box #colors li.row').last().addClass('active');

						layers.list[layers.active].color_panel.select_palet = (layers.list[layers.active].color_panel.palet_data.length - 1);
		
					}

					//aktualizujemy kolory w liście kategorii
					var group = category.list[colorpicker.click_id].group; 

					//aktualizujemy wszystkie kolory w kategorii (jeśli grupa jest taka sama)
					for(var i = 1,i_max = category.list.length; i < i_max ; i++){		
						if(category.list[i].group == group){
							category.list[i].color = '#' + hex;
							$('.colorpicker_box[id_category="' + i + '"]').css('backgroundColor', '#' + hex);
						}
					}

					layers.list[layers.active].color_panel.palet_data[layers.list[layers.active].color_panel.select_palet][ layers.list[layers.active].color_panel.group_to_color[group] ] = '#' + hex;

	 				//na zakończenie rysujemy na nowo canvas
					map.draw();
					layers.list[layers.active].color_panel.show();

				}
			});
		
		}

	},

	remove : function(){
		$('.colorpicker').remove();
	}

}
