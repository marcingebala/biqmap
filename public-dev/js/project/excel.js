var excel = {
	
	alpha : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
	data : [["wojewodztwo","wartosc1","wartosc2","wartosc3","wartosc1","wartosc2","wartosc3"],["krowodrza",1.4,20,6,1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["krowodrza",1.4,20,6],["srodmiescie",1.6,50,43],["nowa_huta",2,34,3],["podgorze",1,32,6],["nowa_huta1",2,34,3]],
	min_row : 10,
	min_col : 6,

	init : function(){

		//dodanie eventów przy kliknięciu excela
		$('#excel_box button').click(function(){ $('#excel_box input').click(); });
		$('#excel_box input').change(function(){ excel.send_file(); });

		//funkcja tymczasowa do narysowania tabelki excela
		this.draw();
	},

	//funkcja odpowiedziala za poprawne podpisanie osi
	draw : function(){

		add_html = '';

		//jeśli ilośc wierszy jest większa aktualizujemy wielkość tablicy
		if(excel.data.length > excel.min_row) excel.min_row = excel.data.length;
		if(excel.data[0].length > excel.min_col) excel.min_col = excel.data[0].length;

		//renderujemy całą tablicę excel
		for(var i = 0;i < this.min_row; i++){
			add_html += '<div class="tr">';
			for(var j = 0;j < this.min_col; j++){

				if((j == 0) && (i > 0)){
					add_html += '<div class="td" row="' + i + '" col="' + j + '" >'+ i +'</div>';
				}
				else{
					try{
						if(typeof(excel.data[i][(j-1)]) != "undefined"){
							add_html += '<div class="td" contenteditable="true" row="' + i + '" col="' + j + '">'+excel.data[i][(j-1)]+'</div>';
						}
						else{
							add_html += '<div class="td"  row="' + i + '" col="' + j + '"></div>';
						}
						//console.log(excel.data[i][(j+1)]);
					}catch(error){
						add_html += '<div class="td" row="' + i + '" col="' + j + '"></div>';
					}
				}

			}
			add_html += '</div>';
		}

		$('#excel_box .table').html( add_html );

		//dodajemy możliwość edycji excela
		$('#excel_box .table .td').blur(function(){ excel.edit(this); });

	},

	//funkcja umożliwiająca edycje zawartości komórki
	edit : function(obj){	
		excel.data[$(obj).attr('row')][($(obj).attr('col')-1)] = $(obj).html();
		palets.parse_color();
	},

	send_file : function() {
	
		var excel_form = new FormData(); 
		excel_form.append("excel_file", $("#excel_box input")[0].files[0]);

 		$.ajax( {
      url: '/api/projects/excel_parse',
      type: 'POST',
      data: excel_form,
      processData: false,
      contentType: false
    }).done(function( response ) {
			console.log( response )
    	excel.data = response.excel[0].data;
    	excel.draw();
    });
	}
}

excel.init();
