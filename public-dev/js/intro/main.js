var data_page = {};
data_page.login_box = true; //w zmiennej przechowujemy czy mamy otwarty pierwszy czy drugi ekran

$(document).ready(function(){

	//przełączanie się 
	$('.login_box .login span a, .register span a').click(function(){ login_box.change(); });
	$('.login_box .login button').click(function(){ login_box.login(); });
	$('.login_box .register button').click(function(){ login_box.register(); });

});

var login_box = { 

	change : function(){
		if(data_page.login_box){
			$('.login_box .login').fadeOut(function(){
				$('.login_box .register').fadeIn();
			});

			data_page.login_box = !data_page.login_box;
		}
		else{
			$('.login_box .register').fadeOut(function(){
				$('.login_box .login').fadeIn();
			});			
			data_page.login_box = !data_page.login_box;
		} 
	},  
	
	login : function(){

		var data = {
			login: $('.login_box input[name=login]').val(),
			password: $('.login_box input[name=password]').val()
		};
 
		$.ajax({
   		url: '/login',
    	type: "POST",
    	data: JSON.stringify( data ),
    	contentType: "application/json"
		}).done(function( response ){

			if (response.status == "error"){
				alert( response.message );
			}
			else{
				window.location.href = "/maps";
			}
			
		});

	},

	register : function(){
		
		var data = {
			login: $('.login_box .register input[name=login]').val(),
			email: $('.login_box .register input[name=email]').val(),
			password: $('.login_box .register input[name=password]').val(),
			password_repeat: $('.login_box .register input[name=password_repeat]').val()
		};

		$.ajax({
   		url: '/register',
    	type: "POST",
    	data: JSON.stringify( data ),
    	contentType: "application/json"
		}).done(function(response){

			if (response.status == "error"){
				alert( response.message );
			}
			else{
				window.location.href = "/maps";
			}

			alert( response );
			console.log( response );
		
		});

	}
}



//login_box.login_check();