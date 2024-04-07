// Weekly Creative Coding Challenge Topic 'Symmetries'
//
// Check the challenge page if you would like to join:
// https://openprocessing.org/curation/78544 

// For this week I would like to play with physics, as I haven't use Matter.js before.
//
// My initial plan is to create several shapes with a symmetric layout.
// Since the physics world generated by the code is mathematically perfect,
// I assume it would be balanced. I plan to let the user add force to break
// the balance and observe the outcome.
//
// However, upon coding the shapes, I realized they were far from stable.
// So it seems unnecessary to add another force to the system :P
//
// Haven't work on the colors yet, will add them later.

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
  createCanvas(windowWidth, windowHeight);
  _imgCanvas = createGraphics(width, height);
  _imgCanvas.colorMode(HSB);

  background(0);

  colorMode(HSB);
  frameRate(60);

  let boundaryThickness = 100;
  var boundaries = [];
  boundaries.push(Bodies.rectangle(-0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(width + 0.5 * boundaryThickness, 0.5 * height, boundaryThickness, height, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, -0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));
  boundaries.push(Bodies.rectangle(0.5 * width, height + 0.5 * boundaryThickness, width, boundaryThickness, { isStatic: true }));


  // process layout
  let layerCount = int(random(1, 6));
  let totalHeightUnit = 0;
  let layerHeights = [];

  // process layer heights
  for (let i = 0; i < layerCount; i++) {
    let nowLayerHeightUnit = int(random(1, 6));
    layerHeights.push(nowLayerHeightUnit);
    totalHeightUnit += nowLayerHeightUnit;
  }

  // draw layers
  let startY = 0;
  for (let i = 0; i < layerCount; i++) {
    let nowLayerHeight = height * layerHeights[i] / totalHeightUnit;
    let nowLayerWidth = random(0.1, 0.9) * width;

    // if it is last layer
    if (i == layerCount - 1) {
      nowLayerHeight *= random(0.6, 1.0);
    }

    let stackCount = int(random(1, 5));
    let stackWidth = width / stackCount;

    let layerStartX = (width - nowLayerWidth) / 2;
    let layerStartY = height - nowLayerHeight - startY;

    let hasFloor = (i > 0);
    drawLayer(layerStartX, layerStartY, nowLayerWidth, nowLayerHeight, hasFloor);
    startY += nowLayerHeight;
  }


  // add objects into the world
  let physicBodies = [];
  for (let i = 0; i < shapes.length; i++) {
    physicBodies.push(shapes[i].body);
  }
  Composite.add(engine.world, [...physicBodies, ...boundaries]);
}

let startUpdate = false;
let startShapeDraw = false;

function mousePressed(e) {
  if(e.button == 0)
  {
    startUpdate = true;
  }
}

function draw() {
    background(10);
    // drawGrids();

    // tint(0, 0, 100, 0.5);
    // image(_imgCanvas, 0, 0, 0.5*width, 0.5*height);

    for (let i = 0; i < shapes.length; i++) {
      shapes[i].updatePhysics();
      shapes[i].draw();
    }

    if (startUpdate)
      Engine.update(engine, 10);
}

function drawLayer(_x, _y, _w, _h, _hasFloor = false) {

  let layerX = _x;
  let layerY = _y;
  let layerW = _w;
  let layerH = _h;

  stroke(0, 0, 100);

  if (_hasFloor) {
    let floorThickness = random(10, 30);

    if (_h < 40) {
      floorThickness = _h;
    }

    layerH -= floorThickness;

    let floorY = _y + _h - floorThickness;

    fill(0, 0, 100, 0.5);
    rect(_x, floorY, _w, floorThickness);
    shapes.push(new RectShape(_x + 0.5 * _w, floorY + 0.5 * floorThickness, _w, floorThickness, 0, { h: random(0, 360), s: 100, b: 100, a: 100 }));
  }

  let stackCount = int(random(1, 7));
  let stacks = randomStacks(stackCount, layerW, layerH);

  // process stacks offset
  for (let i = 0; i < stacks.length; i++) {
    stacks[i].x += layerX;
    stacks[i].y += layerY;

    stroke('yellow');
    rect(stacks[i].x, stacks[i].y, stacks[i].w, stacks[i].h);
  }

  for (let i = 0; i < int(stackCount / 2); i++) {
    stackToShape(stacks[i], stacks[stackCount - 1 - i]);
  }

  if (stackCount % 2 == 1) {
    singleStackToShape(stacks[int(stackCount / 2)]);
  }

  noFill();
  rect(layerX, layerY, layerW, layerH);

}

function drawShapeStack(_x, _y, _w, _h) {
  stroke('yellow');
  noFill();
  rect(_x, _y, _w, _h);
}

function drawGrids() {
  for (let x = 0; x < width; x += 100) {
    stroke(0, 0, 60);
    strokeWeight(1);
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += 100) {
    stroke(0, 0, 60);
    strokeWeight(1);
    line(0, y, width, y);
  }
}

// symmetric
function randomStacks(_count, _totalWidth, _layerHeight) {
  let stacks = [];

  let stackWidths = [];
  let totalStackWidth = 0;

  if (_count == 1) {
    let onlyStackWidth = random(0.6, 1.0) * _totalWidth;
    let onlyStackHeight = _layerHeight;

    return [{
      x: (_totalWidth - onlyStackWidth) / 2,
      y: 0,
      w: onlyStackWidth,
      h: onlyStackHeight
    }];
  }

  // sides
  for (let i = 0; i < int(_count / 2); i++) {
    stackWidths[i] = random(1, 4);
    stackWidths[_count - 1 - i] = stackWidths[i];
    totalStackWidth += 2 * stackWidths[i];
  }

  // middle
  if (_count % 2 == 1) {
    stackWidths[int(_count / 2)] = random(1, 4);
    totalStackWidth += stackWidths[int(_count / 2)];
  }

  // get each stack's width
  for (let i = 0; i < stackWidths.length; i++)
    stackWidths[i] = stackWidths[i] / totalStackWidth * _totalWidth;

  let startStackX = 0;
  for (let i = 0; i < int(_count / 2); i++) {
    let nowStackWidth = random(0.6, 1.0) * stackWidths[i];
    let nowStackHeight = random(0.3, 1.0) * _layerHeight;

    if (random() < 0.25)
      nowStackHeight = _layerHeight;

    let nowStackX = startStackX;
    let nowStackY = _layerHeight - nowStackHeight;

    stacks[i] = {
      x: nowStackX,
      y: nowStackY,
      w: nowStackWidth,
      h: nowStackHeight
    };

    stacks[_count - 1 - i] = {
      x: _totalWidth - nowStackX - nowStackWidth,
      y: nowStackY,
      w: nowStackWidth,
      h: nowStackHeight
    };

    startStackX += nowStackWidth;
  }

  // if odd, middle one must 100% height
  if (_count % 2 == 1) {
    let nowStackWidth = random(0.3, 1.0) * stackWidths[int(_count / 2)];
    let nowStackHeight = _layerHeight; // 100% height

    let nowStackX = 0.5 * _totalWidth - 0.5 * nowStackWidth;
    let nowStackY = _layerHeight - nowStackHeight;

    stacks[int(_count / 2)] = {
      x: nowStackX,
      y: nowStackY,
      w: nowStackWidth,
      h: nowStackHeight
    };
  }
  // if even, center 2 must be 100% height
  else if (_count % 2 == 0) {
    stacks[int(_count / 2) - 1].y = 0;
    stacks[int(_count / 2) - 1].h = _layerHeight;

    stacks[int(_count / 2)].y = 0;
    stacks[int(_count / 2)].h = _layerHeight;
  }

  return stacks;
}

function singleStackToShape(_stackData) {
  let shapeMaxCount = int(_stackData.h / _stackData.w);
  let _shapeCount = max(1, shapeMaxCount + int(random(-1, 2)));

  let totalWidth = _stackData.w;
  let totalHeight = _stackData.h;

  let shapeHeight = totalHeight / _shapeCount;

  for (let i = 0; i < _shapeCount; i++) {
    let nowShapeX = _stackData.x;
    let nowShapeY = _stackData.y + i * shapeHeight;

    let nowShapeW = totalWidth;
    let nowShapeH = shapeHeight;

    let shapeType = int(random(0, 5));
    let shapeColor = NYColor.newRandomColor(60);

    if (shapeType == 0) {
      shapes.push(new RectShape(nowShapeX + 0.5 * nowShapeW, nowShapeY + 0.5 * nowShapeH, nowShapeW, nowShapeH, 0, shapeColor));
    }
    else if (shapeType == 1) {
      let subShapeWidth = nowShapeW / 2;
      let subShapeHeight = nowShapeH;

      let subShapeAX = nowShapeX + 0.5 * subShapeWidth;
      let subShapeAY = nowShapeY + 0.5 * subShapeHeight;

      let subShapeBX = nowShapeX + 1.5 * subShapeWidth;
      let subShapeBY = nowShapeY + 0.5 * subShapeHeight;

      let dirA = 1;
      let dirB = 0;

      shapes.push(new TriangleShape(subShapeAX, subShapeAY, subShapeWidth, subShapeHeight, dirA, shapeColor));
      shapes.push(new TriangleShape(subShapeBX, subShapeBY, subShapeWidth, subShapeHeight, dirB, shapeColor));
    }
    else if (shapeType == 2) {
      let subShapeWidth = nowShapeW / 2;
      let subShapeHeight = nowShapeH;

      let subShapeAX = nowShapeX + 0.5 * subShapeWidth;
      let subShapeAY = nowShapeY + 0.5 * subShapeHeight;

      let subShapeBX = nowShapeX + 1.5 * subShapeWidth;
      let subShapeBY = nowShapeY + 0.5 * subShapeHeight;

      let dirA = 2;
      let dirB = 3;

      shapes.push(new TriangleShape(subShapeAX, subShapeAY, subShapeWidth, subShapeHeight, dirA, shapeColor));
      shapes.push(new TriangleShape(subShapeBX, subShapeBY, subShapeWidth, subShapeHeight, dirB, shapeColor));
    }
    else if (shapeType == 3) {
      let subShapeWidth = nowShapeW / 2;
      let subShapeHeight = nowShapeH;

      let subShapeAX = nowShapeX + 0.5 * subShapeWidth;
      let subShapeAY = nowShapeY + 0.5 * subShapeHeight;

      let subShapeBX = nowShapeX + 1.5 * subShapeWidth;
      let subShapeBY = nowShapeY + 0.5 * subShapeHeight;

      let dirA = 1;
      let dirB = 0;

      shapes.push(new ArcShape(subShapeAX, subShapeAY, subShapeWidth, subShapeHeight, dirA, shapeColor));
      shapes.push(new ArcShape(subShapeBX, subShapeBY, subShapeWidth, subShapeHeight, dirB, shapeColor));
    }
    else if (shapeType == 4) {
      let subShapeWidth = nowShapeW / 2;
      let subShapeHeight = nowShapeH;

      let subShapeAX = nowShapeX + 0.5 * subShapeWidth;
      let subShapeAY = nowShapeY + 0.5 * subShapeHeight;

      let subShapeBX = nowShapeX + 1.5 * subShapeWidth;
      let subShapeBY = nowShapeY + 0.5 * subShapeHeight;

      let dirA = 2;
      let dirB = 3;

      shapes.push(new ArcShape(subShapeAX, subShapeAY, subShapeWidth, subShapeHeight, dirA, shapeColor));
      shapes.push(new ArcShape(subShapeBX, subShapeBY, subShapeWidth, subShapeHeight, dirB, shapeColor));
    }
  }
}

function stackToShape(_stackData, _mirroredStack) {
  let sizeRatio = _stackData.w / _stackData.h;

  if (sizeRatio > 2) {
    let shapeCount = int(random(2, int(sizeRatio)));
    horizontalStackToShape(_stackData, _mirroredStack, shapeCount);
  }
  else if (sizeRatio < 0.5) {
    let shapeCount = int(random(2, int(1 / sizeRatio)));
    verticalStackToShape(_stackData, _mirroredStack, shapeCount);
  }
  else {
    let shapeCount = int(random(1, 2));
    verticalStackToShape(_stackData, _mirroredStack, shapeCount);
  }
}

function horizontalStackToShape(_stackAData, _stackBData, _shapeCount) {
  let totalWidth = _stackAData.w;
  let totalHeight = _stackAData.h;

  let shapeWidth = totalWidth / _shapeCount;

  for (let i = 0; i < _shapeCount; i++) {
    // left to right
    let shapeA_X = _stackAData.x + i * shapeWidth;
    let shapeA_Y = _stackAData.y;
    let shapeA_W = shapeWidth;
    let shapeA_H = totalHeight;

    // right to left
    let shapeB_X = _stackBData.x + _stackBData.w - (i * shapeWidth);
    let shapeB_Y = _stackBData.y;
    let shapeB_W = shapeWidth;
    let shapeB_H = totalHeight;

    let shapeType = int(random(0, 3));
    let shapeColor = NYColor.newRandomColor(60);

    if (shapeType == 0) {
      shapes.push(new RectShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, 0, shapeColor));
      shapes.push(new RectShape(shapeB_X - 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, 0, shapeColor));
    }
    else if (shapeType == 1) {
      let dirA = int(random(0, 4));
      let dirB = 0;

      if (dirA == 0) dirB = 1;
      else if (dirA == 1) dirB = 0;
      else if (dirA == 2) dirB = 3;
      else if (dirA == 3) dirB = 2;

      shapes.push(new TriangleShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, dirA, shapeColor));
      shapes.push(new TriangleShape(shapeB_X - 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, dirB, shapeColor));
    }
    else if (shapeType == 2) {
      let dirA = int(random(0, 4));
      let dirB = 0;

      if (dirA == 0) dirB = 1;
      else if (dirA == 1) dirB = 0;
      else if (dirA == 2) dirB = 3;
      else if (dirA == 3) dirB = 2;

      shapes.push(new ArcShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, dirA, shapeColor));
      shapes.push(new ArcShape(shapeB_X - 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, dirB, shapeColor));
    }

  }
}

function verticalStackToShape(_stackAData, _stackBData, _shapeCount) {
  let totalWidth = _stackAData.w;
  let totalHeight = _stackAData.h;

  let shapeHeight = totalHeight / _shapeCount;

  for (let i = 0; i < _shapeCount; i++) {
    let shapeA_X = _stackAData.x;
    let shapeA_Y = _stackAData.y + i * shapeHeight;
    let shapeA_W = _stackAData.w;
    let shapeA_H = shapeHeight;

    // right to left
    let shapeB_X = _stackBData.x;
    let shapeB_Y = _stackBData.y + i * shapeHeight
    let shapeB_W = _stackBData.w;
    let shapeB_H = shapeHeight;

    let shapeType = int(random(0, 3));
    let shapeColor = NYColor.newRandomColor(60);

    if (shapeType == 0) {
      shapes.push(new RectShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, 0, shapeColor));
      shapes.push(new RectShape(shapeB_X + 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, 0, shapeColor));
    }
    else if (shapeType == 1) {
      let dirA = int(random(0, 4));
      let dirB = 0;

      if (dirA == 0) dirB = 1;
      else if (dirA == 1) dirB = 0;
      else if (dirA == 2) dirB = 3;
      else if (dirA == 3) dirB = 2;

      shapes.push(new TriangleShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, dirA, shapeColor));
      shapes.push(new TriangleShape(shapeB_X + 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, dirB, shapeColor));
    }
    else if (shapeType == 2) {
      let dirA = int(random(0, 4));
      let dirB = 0;

      if (dirA == 0) dirB = 1;
      else if (dirA == 1) dirB = 0;
      else if (dirA == 2) dirB = 3;
      else if (dirA == 3) dirB = 2;

      shapes.push(new ArcShape(shapeA_X + 0.5 * shapeA_W, shapeA_Y + 0.5 * shapeA_H, shapeA_W, shapeA_H, dirA, shapeColor));
      shapes.push(new ArcShape(shapeB_X + 0.5 * shapeB_W, shapeB_Y + 0.5 * shapeB_H, shapeB_W, shapeB_H, dirB, shapeColor));
    }

  }
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}