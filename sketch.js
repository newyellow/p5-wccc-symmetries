let Engine = Matter.Engine;
let Runner = Matter.Runner;
let Bodies = Matter.Bodies;
let Composite = Matter.Composite;

// create an engine
var engine = Engine.create();


let shapes = [];

let _imgCanvas = null;

let _rects = [];

async function setup() {
  createCanvas(800, 1000);
  _imgCanvas = createGraphics(width, height);
  _imgCanvas.colorMode(HSB);

  background(0);

  colorMode(HSB);
  frameRate(10);

  let boundaryThickness = 100;
  var boundaries = [];
  boundaries.push(Bodies.rectangle(-0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(width + 0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, -0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, height + 0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));
  

  let halfRects = subdivideRect(0, 0, width * 0.5, height, 0);
  for(let i=0; i< halfRects.length; i++)
  {
    let nowRect = halfRects[i];
    let x = nowRect.x;
    let y = nowRect.y;
    let w = nowRect.w;
    let h = nowRect.h;

    stroke('white');
    noFill();
    rect(x, y, w, h);
  }

  let mirroredRects = mirrorRects(halfRects);
  for(let i=0; i< mirroredRects.length; i++)
  {
    let nowRect = mirroredRects[i];
    let x = nowRect.x + width;
    let y = nowRect.y;
    let w = nowRect.w;
    let h = nowRect.h;

    stroke('yellow');
    noFill();
    rect(x, y, w, h);
  }

  // add objects into the world
  let physicBodies = [];
  for (let i = 0; i < shapes.length; i++) {
    physicBodies.push(shapes[i].body);
  }
  Composite.add(engine.world, [...physicBodies, ...boundaries]);
}

// function draw() {
//   background(10);
//   // drawGrids();

//   // tint(0, 0, 100, 0.5);
//   // image(_imgCanvas, 0, 0, 0.5*width, 0.5*height);

//   for (let i = 0; i < shapes.length; i++) {
//     shapes[i].updatePhysics();
//     shapes[i].draw();
//   }
//   Engine.update(engine, 10);
// }

function drawGrids () {
  for(let x=0; x< width; x+= 100)
  {
    stroke(0, 0, 60);
    strokeWeight(1);
    line(x, 0, x, height);
  }

  for(let y=0; y< height; y+= 100)
  {
    stroke(0, 0, 60);
    strokeWeight(1);
    line(0, y, width, y);
  }
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}