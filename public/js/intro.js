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

			console.log( response );
		
		});

	}
}



//login_box.login_check();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaW50cm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZGF0YV9wYWdlID0ge307XG5kYXRhX3BhZ2UubG9naW5fYm94ID0gdHJ1ZTsgLy93IHptaWVubmVqIHByemVjaG93dWplbXkgY3p5IG1hbXkgb3R3YXJ0eSBwaWVyd3N6eSBjenkgZHJ1Z2kgZWtyYW5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHQvL3ByemXFgsSFY3phbmllIHNpxJkgXG5cdCQoJy5sb2dpbl9ib3ggLmxvZ2luIHNwYW4gYSwgLnJlZ2lzdGVyIHNwYW4gYScpLmNsaWNrKGZ1bmN0aW9uKCl7IGxvZ2luX2JveC5jaGFuZ2UoKTsgfSk7XG5cdCQoJy5sb2dpbl9ib3ggLmxvZ2luIGJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCl7IGxvZ2luX2JveC5sb2dpbigpOyB9KTtcblx0JCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXsgbG9naW5fYm94LnJlZ2lzdGVyKCk7IH0pO1xuXG59KTtcblxudmFyIGxvZ2luX2JveCA9IHsgXG5cblx0Y2hhbmdlIDogZnVuY3Rpb24oKXtcblx0XHRpZihkYXRhX3BhZ2UubG9naW5fYm94KXtcblx0XHRcdCQoJy5sb2dpbl9ib3ggLmxvZ2luJykuZmFkZU91dChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcubG9naW5fYm94IC5yZWdpc3RlcicpLmZhZGVJbigpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGRhdGFfcGFnZS5sb2dpbl9ib3ggPSAhZGF0YV9wYWdlLmxvZ2luX2JveDtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdCQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyJykuZmFkZU91dChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCcubG9naW5fYm94IC5sb2dpbicpLmZhZGVJbigpO1xuXHRcdFx0fSk7XHRcdFx0XG5cdFx0XHRkYXRhX3BhZ2UubG9naW5fYm94ID0gIWRhdGFfcGFnZS5sb2dpbl9ib3g7XG5cdFx0fSBcblx0fSwgIFxuXHRcblx0bG9naW4gOiBmdW5jdGlvbigpe1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRsb2dpbjogJCgnLmxvZ2luX2JveCBpbnB1dFtuYW1lPWxvZ2luXScpLnZhbCgpLFxuXHRcdFx0cGFzc3dvcmQ6ICQoJy5sb2dpbl9ib3ggaW5wdXRbbmFtZT1wYXNzd29yZF0nKS52YWwoKVxuXHRcdH07XG4gXG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvbG9naW4nLFxuICAgIFx0dHlwZTogXCJQT1NUXCIsXG4gICAgXHRkYXRhOiBKU09OLnN0cmluZ2lmeSggZGF0YSApLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZShmdW5jdGlvbiggcmVzcG9uc2UgKXtcblxuXHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PSBcImVycm9yXCIpe1xuXHRcdFx0XHRhbGVydCggcmVzcG9uc2UubWVzc2FnZSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9tYXBzXCI7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9KTtcblxuXHR9LFxuXG5cdHJlZ2lzdGVyIDogZnVuY3Rpb24oKXtcblx0XHRcblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGxvZ2luOiAkKCcubG9naW5fYm94IC5yZWdpc3RlciBpbnB1dFtuYW1lPWxvZ2luXScpLnZhbCgpLFxuXHRcdFx0ZW1haWw6ICQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyIGlucHV0W25hbWU9ZW1haWxdJykudmFsKCksXG5cdFx0XHRwYXNzd29yZDogJCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgaW5wdXRbbmFtZT1wYXNzd29yZF0nKS52YWwoKSxcblx0XHRcdHBhc3N3b3JkX3JlcGVhdDogJCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgaW5wdXRbbmFtZT1wYXNzd29yZF9yZXBlYXRdJykudmFsKClcblx0XHR9O1xuXG5cdFx0JC5hamF4KHtcbiAgIFx0XHR1cmw6ICcvcmVnaXN0ZXInLFxuICAgIFx0dHlwZTogXCJQT1NUXCIsXG4gICAgXHRkYXRhOiBKU09OLnN0cmluZ2lmeSggZGF0YSApLFxuICAgIFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG5cdFx0fSkuZG9uZShmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPT0gXCJlcnJvclwiKXtcblx0XHRcdFx0YWxlcnQoIHJlc3BvbnNlLm1lc3NhZ2UgKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbWFwc1wiO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zb2xlLmxvZyggcmVzcG9uc2UgKTtcblx0XHRcblx0XHR9KTtcblxuXHR9XG59XG5cblxuXG4vL2xvZ2luX2JveC5sb2dpbl9jaGVjaygpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
