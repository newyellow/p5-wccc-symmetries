let Engine = Matter.Engine;
let Runner = Matter.Runner;
let Bodies = Matter.Bodies;
let Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(450, 50, 80, 80);


let shapes = [];

async function setup() {
  createCanvas(800, 1000);
  background(0);

  colorMode(HSB);
  frameRate(60);

  let boundaryThickness = 100;
  var boundaries = [];
  boundaries.push(Bodies.rectangle(-0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(width + 0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, -0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, height + 0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));
  
  shapes.push(new RectShape(400, 400, 100, 100, 0, NYColor.newRandomColor(200)));
  shapes.push(new RectShape(450, 200, 100, 100, 0, NYColor.newRandomColor(200)));

  shapes.push(new RectShape(50, 50, 100, 100, 0, NYColor.newRandomColor(200)));
  shapes.push(new RectShape(200, 200, 100, 100, 0, NYColor.newRandomColor(200)));
  shapes.push(new ArcShape(300, 200, 100, 100, 0, NYColor.newRandomColor(200)));

  // add objects into the world
  let physicBodies = [];
  for (let i = 0; i < shapes.length; i++) {
    physicBodies.push(shapes[i].body);
  }
  Composite.add(engine.world, [...physicBodies, ...boundaries]);
}

function draw() {
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].updatePhysics();
    shapes[i].draw();
  }
  Engine.update(engine, 10);
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}