var excel = {
	
	alpha : ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','w','x','y','z'],
	data : [["wojewodztwo","wartosc1","wartosc2","wartosc3"],["malopolska",1.4,20,6],["slask",1.6,50,43],["mazowsze",2,34,3],["wielkopolska",1,32,6]],
	min_row : 10,
	min_col : 6,
  //column : ,
  //my_category : ['wybierz kategorię'],
  //my_value : ['wybierz wartość'],

	init : function(){

		//dodanie eventów przy kliknięciu excela
		$('#excel button').click(function(){
			$('#excel input').click();
			$('#excel input').change(function(){
				excel.send_file();
			})
		});

		$("#excel .table").scroll(function(e){
			console.log('test');
      e.stopPropagation();
      e.preventDefault();
    });

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
							add_html += '<div class="td" row="' + i + '" col="' + j + '">'+excel.data[i][(j-1)]+'</div>';
						}
						else{
							add_html += '<div class="td" row="' + i + '" col="' + j + '"></div>';
						}
						//console.log(excel.data[i][(j+1)]);
					}catch(error){
						add_html += '<div class="td" row="' + i + '" col="' + j + '"></div>';
					}
				}

			}
			add_html += '</div>';
		}

		$('#excel .table').html( add_html );

	/*
		$("#excel .tr").each(function(index, obj){
			
			$(obj).children('.td').eq(0).html( index-1 );
			//console.log(index, obj);
		});

		$("#excel .tr").eq(0).find(".td").each(function(index, obj){
			
			$(obj).html( excel.alpha[index] );
			//console.log(index, obj);
		});
	*/

	},

	send_file : function() {

var excel_form = new FormData(); 
excel_form.append("excel_file", $("#excel input")[0].files[0]);

 $.ajax( {
      url: '/api/projects/excel_parse',
      type: 'POST',
      data: excel_form,
      processData: false,
      contentType: false
    } ).done(function( response ) {
console.log( response )
    	excel.data = response.excel[0].data;
    	excel.draw();

    });



//console.log( typeof $("#excel input")[0].files[0] );

/*


		console.log( excel_form )
	}

*/

}

}

excel.init();