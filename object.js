class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    copy() {
        return new NYColor(this.h, this.s, this.b, this.a);
    }

    slightRandomize(_hDiff = 10, _sDiff = 12, _bDiff = 12, _aDiff = 0.0) {
        this.h += random(-0.5 * _hDiff, 0.5 * _hDiff);
        this.s += random(-0.5 * _sDiff, 0.5 * _sDiff);
        this.b += random(-0.5 * _bDiff, 0.5 * _bDiff);
        this.a += random(-0.5 * _aDiff, 0.5 * _aDiff);

        this.h = processHue(this.h);
    }

    color() {
        return color(this.h, this.s, this.b, this.a);
    }

    static newRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-80, 80));
        let s = random(40, 100);
        let b = random(60, 100);

        return new NYColor(h, s, b);
    }
}


let GLOBAL_DOT_DENSITY = 0.24;

class ShapeData {
    constructor(_x, _y, _w, _h, _verts, _body) {

        this.imgX = _x - 0.5 * _w;
        this.imgY = _y - 0.5 * _h;
        this.imgW = _w;
        this.imgH = _h;

        this.verts = _verts;
        this.body = _body;
        this.rotation = 0;

        // process rotation and physics bounds
        let boundsX = lerp(this.body.bounds.min.x, this.body.bounds.max.x, 0.5);
        let boundsY = lerp(this.body.bounds.min.y, this.body.bounds.max.y, 0.5);

        this.offsetX = _x - boundsX;
        this.offsetY = _y - boundsY;

        for (let i = 0; i < this.verts.length; i++) {
            this.verts[i].x -= this.offsetX;
            this.verts[i].y -= this.offsetY;
        }

        // let rotatedOffset = rotatePoint(offsetX, offsetY, 0, 0, _rotation);

        Matter.Body.setPosition(this.body, { x: _x + this.offsetX, y: _y + this.offsetY});
        // Matter.Body.setPosition(this.body, { x: _x + rotatedOffset.x, y: _y + rotatedOffset.y });
        // Matter.Body.rotate(this.body, radians(_rotation));
    }

    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);

        stroke(0, 0, 0);
        strokeWeight(1);

        // beginShape();
        // for (let i = 0; i < this.verts.length; i++) {
        //     vertex(this.verts[i].x, this.verts[i].y);
        // }
        // endShape(CLOSE);
        image(_imgCanvas, -0.5 * this.imgW - this.offsetX, -0.5 * this.imgH - this.offsetY, this.imgW, this.imgH, this.imgX, this.imgY, this.imgW, this.imgH);
        pop();

        // debug physics shape
        push();
        stroke('red');
        strokeWeight(1);
        noFill();

        let startX = this.body.bounds.min.x;
        let startY = this.body.bounds.min.y;

        let sizeX = this.body.bounds.max.x - this.body.bounds.min.x;
        let sizeY = this.body.bounds.max.y - this.body.bounds.min.y;

        rect(startX, startY, sizeX, sizeY);
        pop();
    }

    updatePhysics() {
        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.rotation = this.body.angle;
    }
}

class RectShape extends ShapeData {
    constructor(_x, _y, _w, _h, _rotation, _color) {
        let verts = [];
        verts.push({ x: -0.5 * _w, y: -0.5 * _h });
        verts.push({ x: 0.5 * _w, y: -0.5 * _h });
        verts.push({ x: 0.5 * _w, y: 0.5 * _h });
        verts.push({ x: -0.5 * _w, y: 0.5 * _h });

        let newBody = Bodies.rectangle(_x, _y, _w, _h);

        // draw shape image
        let strokeCount = _w * _h * GLOBAL_DOT_DENSITY;

        _imgCanvas.push();
        _imgCanvas.translate(_x, _y);

        _imgCanvas.beginClip();
        _imgCanvas.rect(-0.5 * _w, -0.5 * _h, _w, _h);
        _imgCanvas.endClip();

        _imgCanvas.blendMode(BLEND);
        _imgCanvas.fill('white');
        _imgCanvas.noStroke();
        _imgCanvas.rect(-0.5 * _w, -0.5 * _h, _w, _h);

        _imgCanvas.blendMode(MULTIPLY);
        _imgCanvas.noFill();
        _imgCanvas.stroke(_color.h, _color.s, _color.b, _color.a);

        for(let i=0; i<strokeCount; i++)
        {
            let strokeWeight = random(1, 3);
            _imgCanvas.strokeWeight(strokeWeight);

            let strokeX = random(-0.5 * _w, 0.5 * _w);
            let strokeY = random(-0.5 * _h, 0.5 * _h);

            _imgCanvas.line(strokeX, strokeY - 6, strokeX, strokeY + 6);
        }
        _imgCanvas.pop();

        super(_x, _y, _w, _h, verts, newBody, _rotation);
    }
}

class ArcShape extends ShapeData {
    constructor(_x, _y, _w, _h, _dirType, _color) {
        let verts = [];

        let fromAngle = 0;
        let toAngle = 0;

        if (_dirType == 0) {
            verts.push({ x: - 0.5 * _w, y: - 0.5 * _h });
            fromAngle = 90;
            toAngle = 180;
        }
        else if (_dirType == 1) {
            verts.push({ x: 0.5 * _w, y: - 0.5 * _h });
            fromAngle = 180;
            toAngle = 270;
        }
        else if (_dirType == 2) {
            verts.push({ x: 0.5 * _w, y: 0.5 * _h });
            fromAngle = 270;
            toAngle = 360;
        }
        else {
            verts.push({ x: - 0.5 * _w, y: 0.5 * _h });
            fromAngle = 0;
            toAngle = 90;
        }

        let arcPointCount = 20;
        let startX = verts[0].x;
        let startY = verts[0].y;

        for (let i = 0; i < arcPointCount; i++) {
            let t = i / (arcPointCount - 1);

            let nowAngle = lerp(fromAngle, toAngle, t);
            let nowX = startX + sin(radians(nowAngle)) * _w;
            let nowY = startY - cos(radians(nowAngle)) * _h;

            verts.push({ x: nowX, y: nowY });
        }

        // draw

        _imgCanvas.push();
        _imgCanvas.translate(_x, _y);

        _imgCanvas.beginClip();
        _imgCanvas.beginShape();
        for (let i = 0; i < verts.length; i++) {
            _imgCanvas.vertex(verts[i].x, verts[i].y);
        }
        _imgCanvas.endShape(CLOSE);
        _imgCanvas.endClip();

        _imgCanvas.blendMode(BLEND);
        _imgCanvas.background('white');
        _imgCanvas.pop();

        let newBody = Bodies.fromVertices(_x, _y, verts);

        super(_x, _y, _w, _h, verts, newBody, 0);
    }
}

class TriangleShape extends ShapeData {
    constructor(_x, _y, _w, _h, _dirType, _color) {
        let verts = [];

        if (_dirType == 0) {
            verts.push({ x: -0.5 * _w, y: -0.5 * _h });
            verts.push({ x: 0.5 * _w, y: -0.5 * _h });
            verts.push({ x: -0.5 * _w, y: 0.5 * _h });
        }
        else if (_dirType == 1) {
            verts.push({ x: 0.5 * _w, y: -0.5 * _h });
            verts.push({ x: 0.5 * _w, y: 0.5 * _h });
            verts.push({ x: -0.5 * _w, y: -0.5 * _h });
        }
        else if (_dirType == 2) {
            verts.push({ x: 0.5 * _w, y: 0.5 * _h });
            verts.push({ x: -0.5 * _w, y: 0.5 * _h });
            verts.push({ x: 0.5 * _w, y: -0.5 * _h });
        }
        else {
            verts.push({ x: -0.5 * _w, y: 0.5 * _h });
            verts.push({ x: -0.5 * _w, y: -0.5 * _h });
            verts.push({ x: 0.5 * _w, y: 0.5 * _h });
        }

        // draw shape img
        let dotCount = _w * _h * GLOBAL_DOT_DENSITY * 0.5;

        _imgCanvas.push();
        _imgCanvas.translate(_x, _y);

        _imgCanvas.beginClip();
        _imgCanvas.triangle(verts[0].x, verts[0].y, verts[1].x, verts[1].y, verts[2].x, verts[2].y);
        _imgCanvas.endClip();

        _imgCanvas.blendMode(BLEND);
        _imgCanvas.background('white');
        _imgCanvas.noStroke();
        _imgCanvas.triangle(verts[0].x, verts[0].y, verts[1].x, verts[1].y, verts[2].x, verts[2].y);

        _imgCanvas.noFill();
        _imgCanvas.stroke(_color.h, _color.s, _color.b, _color.a);
        _imgCanvas.blendMode(MULTIPLY);

        for(let i=0; i<dotCount; i++)
        {
            let dotSize = random(1, 3);
            _imgCanvas.strokeWeight(dotSize);
            let dotX = random(-0.5 * _w, 0.5 * _w);
            let dotY = random(-0.5 * _h, 0.5 * _h);

            _imgCanvas.point(dotX, dotY);
        }
        _imgCanvas.pop();

        let newBody = Bodies.fromVertices(_x, _y, verts);
        super(_x, _y, _w, _h, verts, newBody, 0);
    }
}