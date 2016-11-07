//funkcje rysujące pojedyńczy punkt (pointer)
var figures = {

	square : function(x,y,size){
		canvas.context.fillRect(x,y,size,size);
	},

	circle : function(x,y,size){
		var size = size / 2;
		var center_x = x + size;
		var center_y = y + size;
		canvas.context.beginPath();
		canvas.context.arc(center_x, center_y, size, 0, 2 * Math.PI);
		canvas.context.fill();
	},

	hexagon  : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x,y+a2);
    canvas.context.lineTo(x+a,y+a2-h);
  	canvas.context.lineTo(x+a+a2,y+a2-h);
		canvas.context.lineTo(x+size,y+a2);
		canvas.context.lineTo(x+size-a,y+a2+h);
		canvas.context.lineTo(x+a,y+a2+h);
		canvas.context.lineTo(x,y+a2);
		canvas.context.fill();
	},

	hexagon2 : function(x,y,size){
		var a = size/4;
		var a2 = size/2;
		var h = size/2*Math.sqrt(3)/2;

		canvas.context.beginPath();
		canvas.context.moveTo(x+a2,y);
    canvas.context.lineTo(x+a2+h,y+a);
  	canvas.context.lineTo(x+a2+h,y+a2+a);
    canvas.context.lineTo(x+a2,y+size);
    canvas.context.lineTo(x+a2-h,y+a2+a);
    canvas.context.lineTo(x+a2-h,y+a);
    canvas.context.lineTo(x+a2,y);
		canvas.context.fill();
	},

  square_border_small : function(data){

  if(data.line_width_y < 2){
    y_trans = -2;
  }
  else{
    y_trans = -3;
  }

  if(data.line_width_x < 3){
    x_trans = -2;
  }
  else{
    x_trans = -1*data.line_width_x;
  }

  if(data.border.top){
    canvas.context.fillRect(
      data.x+x_trans+1,
      data.y+y_trans+1,
      data.size+data.line_width_x+1,
      1
    );
  }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x+x_trans+1,
        data.y+y_trans+1,
        parseInt((data.size+data.line_width_x+1)/2),
        1
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+x_trans+1+parseInt((data.size+data.line_width_x+1)/2),
        data.y+y_trans+1,
        Math.ceil((data.size+data.line_width_x+1)/2),
        1
      );
    }

    if(data.border.right){
      if(data.line_width_x < 2){
        x_trans = -1;
      }
      else{
        x_trans = 0;
      }

      if(data.line_width_y < 2){
        y_trans = 2;
      }
      else{
        y_trans = data.line_width_y;
      }

      canvas.context.fillRect(
        data.x+data.size+x_trans+1,
        data.y-1,
        1,
        data.size+y_trans 
      );
    }
  },
square_border_big : function(data){

  if(data.line_width_y < 2){
    y_trans = -2;
  }
  else{
    y_trans = -3;
  }

  if(data.line_width_x < 3){
    x_trans = -2;
  }
  else{
    x_trans = -1*data.line_width_x;
  }

  if(data.border.top){
    canvas.context.fillRect(
      data.x+x_trans,
      data.y+y_trans,
      data.size+data.line_width_x+3,
      3
    );
  }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x+x_trans,
        data.y+y_trans,
        parseInt((data.size+data.line_width_x+3)/2),
        3
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+x_trans+parseInt((data.size+data.line_width_x+3)/2),
        data.y+y_trans,
        Math.ceil((data.size+data.line_width_x+3)/2),
        3
      );
    }

    if(data.border.right){
      if(data.line_width_x < 2){
        x_trans = -1;
      }
      else{
        x_trans = 0;
      }

      if(data.line_width_y < 2){
        y_trans = 2;
      }
      else{
        y_trans = data.line_width_y;
      }

      canvas.context.fillRect(
        data.x+data.size+x_trans,
        data.y,
        3,
        data.size+y_trans 
      );
    }
  }
}
