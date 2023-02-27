const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');
import tinycolor from 'tinycolor2';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
};

const params = {
  phrase: 'creative coding',
  family: 'serif',
  weight: 500,
  color: '#FFFFFF',
  glyphs: 'art,%^~<>',
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  const cell = 15;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  typeCanvas.width =  cols;
  typeCanvas.height = rows;

  return ({ context, width, height}) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    var fontFamily = params.family;
    var fontWeight = params.weight;

    let text = params.phrase.split(' ');
    let maxLenght = maxStringLength(text);
    let words = myText(text, maxLenght);
    maxLenght = maxStringLength(words);
    let fontSize = myFontSize(words, cols, rows, maxLenght);

    typeContext.fillStyle = 'white';
    typeContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    typeContext.textBaseline = 'top';
  
    for (let i = 0; i < words.length; i++) {

      const metrics = typeContext.measureText(words[i]);

      const mx = metrics.actualBoundingBoxLeft * -1;
      const my = metrics.actualBoundingBoxAscent * -1;
      const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;


      const tx = (cols - mw) * 0.5 - mx;
      const ty = (rows / words.length - mh) * 0.5 - (my + i * mh) + rows / words.length * i;

      typeContext.save();
      typeContext.translate(tx, ty);
      
      typeContext.beginPath();
      typeContext.rect(mx, my + i * mh, mw, mh);
      typeContext.stroke();
  
      typeContext.fillText(words[i], 0, i * mh);
      typeContext.restore();
    }

      const typeData = typeContext.getImageData(0, 0, cols, rows).data;



      context.fillStyle = harmoniousColor(params.color);
      context.fillRect(0, 0, width, height);

      context.textBaseline = 'middle';
      context.textAlign = 'center';

      for(let i = 0; i < numCells; i++){
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = col * cell;
        const y = row * cell;

        const r = typeData[i * 4 + 0];

        var glyph = myGlyph(r);

        context.font = `${fontWeight} ${cell * 2}px ${fontFamily}`;
        var k = words.length > 2 ? 2 : random.range(3, 6);
        if (Math.random() < 0.1) context.font = `${fontWeight} ${cell * k}px ${fontFamily}`;
        context.fillStyle = params.color;


        context.save();
        context.translate(x, y);
        context.translate(cell * 0.5, cell * 0.5);

        context.fillText(glyph, 0 , 0);
        context.restore();
        context.willReadFrequently = true;
      }
    
  };
};

const harmoniousColor = (color) => {
  if (color === '#FFFFFF') return '#000000';
  const degrees = 180;
  const tc = tinycolor(color);
  const newColor = tc.spin(degrees).toHexString();
  console.log(newColor);
  return newColor;

};

const creatPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;
  folder = pane.addFolder({title: 'My phrase'});
  folder.addInput(params, 'phrase');
  folder = pane.addFolder({title: 'Font'});
  folder.addInput(params, 'family', {options: {serif: 'serif', Arial: 'Arial', cursive: 'cursive'}});
  folder.addInput(params, 'weight', {min: 100, max: 900, step: 100});
  folder = pane.addFolder({title: 'Color'});
  folder.addInput(params, 'color');
  folder = pane.addFolder({title: 'Glyphs'});
  folder.addInput(params, 'glyphs');
};

creatPane();
canvasSketch(sketch, settings);

const myGlyph = (v) => {
  if (v < 50) return '';
  if (v < 100) return random.pick(['.', ',', `'`]);
  if (v < 150) return random.pick([':', ';', `"`]);
  if (v < 200) return random.pick(['+', '-', '~']);

  let glyphs = params.glyphs;
  if (/^[a-zA-Z]+$/.test(glyphs) == true) return glyphs;
  let arrG = glyphs.includes(',') == true ? glyphs.split(',') : glyphs.split('');
  var oldArr = arrG;
  let temp = [];
  for (let i = 0; i < arrG.length; i++){
    if (/^[a-zA-Z]+$/.test(arrG[i]) != true && arrG[i].length > 1) {
      console.log(i);
      let addArr = arrG[i].split('');
      oldArr.splice(i,1);
      temp = oldArr.concat(addArr);
    }
  }
  if (temp.length != 0) arrG = temp;
  return random.pick(arrG);
};

const maxStringLength = (strings) => {
  let wordsLength = [];
  if (strings.length > 1) {
    strings.forEach(string => {
      wordsLength.push(string.length);
    });
  return Math.max(...wordsLength);
  } else {
    return strings[0].length;
  }
}

const myText = (words, maxWordLen) => {
  let line = '';
  let lines = [];
  for (let i = 0; i < words.length; i++) {
    const testLine = line + ' ' + words[i];
    if ( testLine.length >= maxWordLen + 3 && words.length > 1 ) {
      lines.push(line.trim());
      line = words[i];
    } else {
      line = testLine.trim();
    }
  }
  lines.push(line);
  lines.forEach((item, index) => {
    if (item === '') {
      lines.splice(index, 1);
    }
  });
  return lines;
};

const myFontSize = (lines, width, height, maxWordLen) => {
  let fontSize = height / lines.length; // calculate font size depending on the number of lines
  let maxLineWidth = maxWordLen * fontSize; // calculate maximum line width in pixels
  
  while (maxLineWidth > width && maxLineWidth > (2.3 * Math.min(width, height)) ) { 
    fontSize -= 1;
    maxLineWidth = maxWordLen * fontSize;
  } 
  let k = lines.length > 1 ? 1.1 : 1;
  return params.family !== 'serif' ? fontSize * 0.8 * k : fontSize * 0.9 * k;
};

