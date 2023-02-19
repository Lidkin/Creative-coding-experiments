const canvasSketch = require('canvas-sketch');
const { color } = require('canvas-sketch-util');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [1080, 1080]
};

const sketch = () => {
  return ({ context, width, height }) => {
       
    const cx = width * 0.5;
    const cy = height * 0.5;

    var grd = context.createRadialGradient(cx, cy, 10, cx, cy, cx);
    grd.addColorStop(0, 'red');
    grd.addColorStop(0.2, 'black');
    grd.addColorStop(1, 'black');
    context.fillStyle = grd;  
    context.fillRect(0, 0, width, height);
  
    let step = random.range(0.5, 0.8);
    const radMin = 5;
  
    let angle = 0.01;
    let angleEnd = step;
    let radius;
    let r = 20;
 
  
    for (let i = 1; i < 8; i++) {
      if (i >= 6) {
        r = 25;
      }
      radius = (radMin + i*r) * random.range(0.9, 1.1);
     
      for (let k = 1; k < 20; k++) {
        if(angle >= 2){
          angle -= 2;
        }

        if(angleEnd >= 2) {
          angleEnd -= step;
        }

        let x = cx + radius*Math.cos(angle - 0.25);
        let y = cy + radius*Math.sin(angle - 0.25);

        let newX = -(x - cx) / 8;
        let newY = -(y - cy) / 8;

        context.save();
        context.translate(cx + newX, cy + newY);
        context.fillStyle = color.parse([random.range(230,256), 
          random.range(10,60), random.range(0,50), 1 * random.range(0.6, 0.9)]).hex;

        context.beginPath();

        context.arc(0, 0, radius, angle*Math.PI, angleEnd*Math.PI);
        context.fill();
        context.restore();

        angle = angleEnd - random.range(0.8, 1.2);
        angleEnd = angle + step;

      } 
    }
  };
};

canvasSketch(sketch, settings);


