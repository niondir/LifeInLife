var canvas = null;


function onload() {
    canvas = document.getElementById('gameCanvas');
    resize();
}

function resize(){
   canvas.width = canvas.parentNode.clientWidth;
  canvas.height = canvas.parentNode.clientHeight;


    var ctx = canvas.getContext("2d");
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3333ff';
    ctx.fillRect(canvas.width / 3, canvas.height / 3,
        canvas.width / 3, canvas.height / 3);
}
