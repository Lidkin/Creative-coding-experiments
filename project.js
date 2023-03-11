const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [1000, 1000],
  animate: true,
};

var points = [];

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({context, width, height}) => {

  var cell = 25;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;

  //return
  typeContext.fillStyle = 'white';
  typeContext.fillRect(0, 0, cols, rows);

  const letter = 'A';
  const fontFamily = 'Times New Roman';
  const fontSize = cols;

  typeContext.font = `${fontSize}px ${fontFamily}`;
  typeContext.fillStyle = 'black'; 
  typeContext.textBaseline = 'top';

  const metrics = typeContext.measureText(letter);
  const mx = metrics.actualBoundingBoxLeft * -1;
  const my = metrics.actualBoundingBoxAscent * -1;
  const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  const tx = (cols -  mw) * 0.5 - mx;
  const ty = (rows - mh) * 0.5 - my;

  typeContext.save();
  typeContext.translate(tx, ty);
  typeContext.beginPath();
  typeContext.rect(mx, my, mw, mh);
  typeContext.fillText(letter, 0, 0);
  typeContext.restore();
  //context.drawImage(typeCanvas, 0, 0);
  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  let startCoord = [];
  let coord = {};
  let k = 0;

  for (let i = 0; i < numCells; i++) {
    const col = i % cols;
    const row = Math.floor( i / cols );

    var x = col * cell;
    var y = row * cell;

    const r = typeData[i * 4 + 0];

    if (r < 255) { 
      points.push(new Element(x, y)); 
      coord = {'x': x, 'y': y};    
      startCoord.push(coord);
      k++;
    }
  }

  return ({context, width, height, frame}) => {

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    
    let numPair = 1;
    for(let i = 0; i < points.length; i++) {
      for(let j = i + 1; j < points.length; j++){
        if (points[i].color == 'black' && points[j].color == 'black' ) {
          let dist = points[i].pos.getDistance(points[j].pos);
          if (dist > cell || numPair >= 2) continue;
          var other = math.mapRange(dist, cell * 0.5, cell, -1, 1);
            points[i].distance = true;
            points[j].distance = true;
            points[i].reverse(other, width, height, cell);
            points[j].reverse(other, width, height, cell);
            numPair++;
        }
      }
    }

    for(let i = 0; i < points.length; i++) {
    
      points[i].update();
      points[i].drawing(context, cell);
      points[i].bounce(width, height);
      points[i].letter(startCoord, cell);
    }

  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }  

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

}

class Element {
  constructor (x, y){
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.noise1D(random.range(-1, 1), random.range(0.01, 0.08), random.range(30, 40)),
     random.noise1D(random.range(-1, 1), random.range(0.01, 0.08), random.range(30, 40)));
    this.color = 'black';
    this.flag = false;
    this.distance = true;
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) {
      this.vel.x *= -1;
      this.flag = true;
      this.distance = false;
    }
    if (this.pos.y <= 0 || this.pos.y >= height) {
      this.vel.y *= -1;
      this.flag = true;
      this.distance = false;
    }
  }

  reverse(other, width, height, cell) {
    if (this.pos.x <= 0 + cell * 1.5 || this.pos.x >= width - cell * 1.5) this.distance = false;
    if (this.pos.y <= 0 + cell * 1.5 || this.pos.y >= height - cell * 1.5) this.distance = false;
    if (this.flag == true && this.distance == true) {
      if (other < 0 ) {
        this.vel.x = -1 * this.vel.x + random.range(1, 3);
        this.vel.y = -1 * this.vel.y + random.range(1, 3);
      }
    }
  }
 

  letter(startCoord, cell) {
    if (this.flag == true) {
      let count = 0;
      startCoord.forEach(coord => {
        const px = Object.getOwnPropertyDescriptor(coord, 'x').value;
        const py = Object.getOwnPropertyDescriptor(coord, 'y').value;
        if ((this.pos.x >= px && this.pos.x < (px + cell)) && (this.pos.y >= py && this.pos.y < (py + cell))) {
          this.vel.x = 0;
          this.vel.y = 0;
          this.pos.x = px;
          this.pos.y = py;
          this.color = 'red';
          startCoord.splice(count, 1);
        }
        count++;
      });
    }
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  drawing(context, cell) {
    context.save();
    context.translate(this.pos.x, this.pos.y);
    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, cell * 0.5, 0, 2 * Math.PI);
    context.fill();
    context.restore();
  }
}
