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

  square_border : function(data){

    if(data.border.top){
      canvas.context.fillRect(
        data.x-data.line_width_x,
        data.y-data.line_width_y,
        data.size+2*data.line_width_x,
        data.line_width_y
      );
    }

    if(data.border.top_left){
      canvas.context.fillRect(
        data.x,
        data.y-data.line_width_y,
        Math.ceil(data.size/2),
        data.line_width_y
      );
    }

    if(data.border.top_right){
      canvas.context.fillRect(
        data.x+Math.floor(data.size/2),
        data.y-data.line_width_y,
        Math.ceil(data.size/2)+data.line_width_x,
        data.line_width_y
      );
    }

    if(data.border.right){
      canvas.context.fillRect(
        data.x+data.size,
        data.y-data.line_width_y,
        data.line_width_x,
        data.size+2*data.line_width_y
        );
    }
  }
}
