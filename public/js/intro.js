var data_page = {};
data_page.login_box = true; //w zmiennej przechowujemy czy mamy otwarty pierwszy czy drugi ekran

$(document).ready(function(){

	//przełączanie się 
	$('.login_box .login span a, .register span a').click(function(){ login_box.change(); });
	$('.login_box .login button').click(function(){ login_box.login(); });
	$('.login_box .register button').click(function(){ login_box.register(); });
	
	//logowanie użytkownika po kliknięciu enter
	$(".login_box input[name=password]").keydown(function (e) { if (e.keyCode == 13) { login_box.login(); } });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaW50cm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZGF0YV9wYWdlID0ge307XG5kYXRhX3BhZ2UubG9naW5fYm94ID0gdHJ1ZTsgLy93IHptaWVubmVqIHByemVjaG93dWplbXkgY3p5IG1hbXkgb3R3YXJ0eSBwaWVyd3N6eSBjenkgZHJ1Z2kgZWtyYW5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuXHQvL3ByemXFgsSFY3phbmllIHNpxJkgXG5cdCQoJy5sb2dpbl9ib3ggLmxvZ2luIHNwYW4gYSwgLnJlZ2lzdGVyIHNwYW4gYScpLmNsaWNrKGZ1bmN0aW9uKCl7IGxvZ2luX2JveC5jaGFuZ2UoKTsgfSk7XG5cdCQoJy5sb2dpbl9ib3ggLmxvZ2luIGJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uKCl7IGxvZ2luX2JveC5sb2dpbigpOyB9KTtcblx0JCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXsgbG9naW5fYm94LnJlZ2lzdGVyKCk7IH0pO1xuXHRcblx0Ly9sb2dvd2FuaWUgdcW8eXRrb3duaWthIHBvIGtsaWtuacSZY2l1IGVudGVyXG5cdCQoXCIubG9naW5fYm94IGlucHV0W25hbWU9cGFzc3dvcmRdXCIpLmtleWRvd24oZnVuY3Rpb24gKGUpIHsgaWYgKGUua2V5Q29kZSA9PSAxMykgeyBsb2dpbl9ib3gubG9naW4oKTsgfSB9KTtcblxufSk7XG5cbnZhciBsb2dpbl9ib3ggPSB7IFxuXG5cdGNoYW5nZSA6IGZ1bmN0aW9uKCl7XG5cdFx0aWYoZGF0YV9wYWdlLmxvZ2luX2JveCl7XG5cdFx0XHQkKCcubG9naW5fYm94IC5sb2dpbicpLmZhZGVPdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnLmxvZ2luX2JveCAucmVnaXN0ZXInKS5mYWRlSW4oKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRkYXRhX3BhZ2UubG9naW5fYm94ID0gIWRhdGFfcGFnZS5sb2dpbl9ib3g7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHQkKCcubG9naW5fYm94IC5yZWdpc3RlcicpLmZhZGVPdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0JCgnLmxvZ2luX2JveCAubG9naW4nKS5mYWRlSW4oKTtcblx0XHRcdH0pO1x0XHRcdFxuXHRcdFx0ZGF0YV9wYWdlLmxvZ2luX2JveCA9ICFkYXRhX3BhZ2UubG9naW5fYm94O1xuXHRcdH0gXG5cdH0sICBcblx0XG5cdGxvZ2luIDogZnVuY3Rpb24oKXtcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bG9naW46ICQoJy5sb2dpbl9ib3ggaW5wdXRbbmFtZT1sb2dpbl0nKS52YWwoKSxcblx0XHRcdHBhc3N3b3JkOiAkKCcubG9naW5fYm94IGlucHV0W25hbWU9cGFzc3dvcmRdJykudmFsKClcblx0XHR9O1xuIFxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL2xvZ2luJyxcbiAgICBcdHR5cGU6IFwiUE9TVFwiLFxuICAgIFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSxcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoZnVuY3Rpb24oIHJlc3BvbnNlICl7XG5cblx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPT0gXCJlcnJvclwiKXtcblx0XHRcdFx0YWxlcnQoIHJlc3BvbnNlLm1lc3NhZ2UgKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbWFwc1wiO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fSk7XG5cblx0fSxcblxuXHRyZWdpc3RlciA6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRsb2dpbjogJCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgaW5wdXRbbmFtZT1sb2dpbl0nKS52YWwoKSxcblx0XHRcdGVtYWlsOiAkKCcubG9naW5fYm94IC5yZWdpc3RlciBpbnB1dFtuYW1lPWVtYWlsXScpLnZhbCgpLFxuXHRcdFx0cGFzc3dvcmQ6ICQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyIGlucHV0W25hbWU9cGFzc3dvcmRdJykudmFsKCksXG5cdFx0XHRwYXNzd29yZF9yZXBlYXQ6ICQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyIGlucHV0W25hbWU9cGFzc3dvcmRfcmVwZWF0XScpLnZhbCgpXG5cdFx0fTtcblxuXHRcdCQuYWpheCh7XG4gICBcdFx0dXJsOiAnL3JlZ2lzdGVyJyxcbiAgICBcdHR5cGU6IFwiUE9TVFwiLFxuICAgIFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSxcbiAgICBcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuXHRcdH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xuXG5cdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09IFwiZXJyb3JcIil7XG5cdFx0XHRcdGFsZXJ0KCByZXNwb25zZS5tZXNzYWdlICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL21hcHNcIjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XG5cdFx0fSk7XG5cblx0fVxufVxuXG5cblxuLy9sb2dpbl9ib3gubG9naW5fY2hlY2soKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
