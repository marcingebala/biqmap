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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJpbnRyby5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBkYXRhX3BhZ2UgPSB7fTtcbmRhdGFfcGFnZS5sb2dpbl9ib3ggPSB0cnVlOyAvL3cgem1pZW5uZWogcHJ6ZWNob3d1amVteSBjenkgbWFteSBvdHdhcnR5IHBpZXJ3c3p5IGN6eSBkcnVnaSBla3JhblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG5cdC8vcHJ6ZcWCxIVjemFuaWUgc2nEmSBcblx0JCgnLmxvZ2luX2JveCAubG9naW4gc3BhbiBhLCAucmVnaXN0ZXIgc3BhbiBhJykuY2xpY2soZnVuY3Rpb24oKXsgbG9naW5fYm94LmNoYW5nZSgpOyB9KTtcblx0JCgnLmxvZ2luX2JveCAubG9naW4gYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKXsgbG9naW5fYm94LmxvZ2luKCk7IH0pO1xuXHQkKCcubG9naW5fYm94IC5yZWdpc3RlciBidXR0b24nKS5jbGljayhmdW5jdGlvbigpeyBsb2dpbl9ib3gucmVnaXN0ZXIoKTsgfSk7XG5cbn0pO1xuXG52YXIgbG9naW5fYm94ID0geyBcblxuXHRjaGFuZ2UgOiBmdW5jdGlvbigpe1xuXHRcdGlmKGRhdGFfcGFnZS5sb2dpbl9ib3gpe1xuXHRcdFx0JCgnLmxvZ2luX2JveCAubG9naW4nKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyJykuZmFkZUluKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0ZGF0YV9wYWdlLmxvZ2luX2JveCA9ICFkYXRhX3BhZ2UubG9naW5fYm94O1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0JCgnLmxvZ2luX2JveCAucmVnaXN0ZXInKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQoJy5sb2dpbl9ib3ggLmxvZ2luJykuZmFkZUluKCk7XG5cdFx0XHR9KTtcdFx0XHRcblx0XHRcdGRhdGFfcGFnZS5sb2dpbl9ib3ggPSAhZGF0YV9wYWdlLmxvZ2luX2JveDtcblx0XHR9IFxuXHR9LCAgXG5cdFxuXHRsb2dpbiA6IGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdGxvZ2luOiAkKCcubG9naW5fYm94IGlucHV0W25hbWU9bG9naW5dJykudmFsKCksXG5cdFx0XHRwYXNzd29yZDogJCgnLmxvZ2luX2JveCBpbnB1dFtuYW1lPXBhc3N3b3JkXScpLnZhbCgpXG5cdFx0fTtcbiBcblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9sb2dpbicsXG4gICAgXHR0eXBlOiBcIlBPU1RcIixcbiAgICBcdGRhdGE6IEpTT04uc3RyaW5naWZ5KCBkYXRhICksXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKGZ1bmN0aW9uKCByZXNwb25zZSApe1xuXG5cdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09IFwiZXJyb3JcIil7XG5cdFx0XHRcdGFsZXJ0KCByZXNwb25zZS5tZXNzYWdlICk7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL21hcHNcIjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0pO1xuXG5cdH0sXG5cblx0cmVnaXN0ZXIgOiBmdW5jdGlvbigpe1xuXHRcdFxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0bG9naW46ICQoJy5sb2dpbl9ib3ggLnJlZ2lzdGVyIGlucHV0W25hbWU9bG9naW5dJykudmFsKCksXG5cdFx0XHRlbWFpbDogJCgnLmxvZ2luX2JveCAucmVnaXN0ZXIgaW5wdXRbbmFtZT1lbWFpbF0nKS52YWwoKSxcblx0XHRcdHBhc3N3b3JkOiAkKCcubG9naW5fYm94IC5yZWdpc3RlciBpbnB1dFtuYW1lPXBhc3N3b3JkXScpLnZhbCgpLFxuXHRcdFx0cGFzc3dvcmRfcmVwZWF0OiAkKCcubG9naW5fYm94IC5yZWdpc3RlciBpbnB1dFtuYW1lPXBhc3N3b3JkX3JlcGVhdF0nKS52YWwoKVxuXHRcdH07XG5cblx0XHQkLmFqYXgoe1xuICAgXHRcdHVybDogJy9yZWdpc3RlcicsXG4gICAgXHR0eXBlOiBcIlBPU1RcIixcbiAgICBcdGRhdGE6IEpTT04uc3RyaW5naWZ5KCBkYXRhICksXG4gICAgXHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHR9KS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PSBcImVycm9yXCIpe1xuXHRcdFx0XHRhbGVydCggcmVzcG9uc2UubWVzc2FnZSApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9tYXBzXCI7XG5cdFx0XHR9XG5cblx0XHRcdGFsZXJ0KCByZXNwb25zZSApO1xuXHRcdFx0Y29uc29sZS5sb2coIHJlc3BvbnNlICk7XG5cdFx0XG5cdFx0fSk7XG5cblx0fVxufVxuXG5cblxuLy9sb2dpbl9ib3gubG9naW5fY2hlY2soKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
