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


class ShapeData {
    constructor(_verts, _body, _color) {
        this.verts = _verts;
        this.body = _body;
        this.rotation = 0;

        this.color = _color;
    }

    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);

        stroke(0, 0, 0);
        strokeWeight(1);
        fill(this.color.h, this.color.s, this.color.b, this.color.a);

        beginShape();
        for (let i = 0; i < this.verts.length; i++) {
            vertex(this.verts[i].x, this.verts[i].y);
        }
        endShape(CLOSE);
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

        super(verts, newBody, _color);
    }
}

class ArcShape extends ShapeData {
    constructor(_x, _y, _w, _h, _rotation, _color) {
        let verts = [];
        verts.push({ x: - 0.5 * _w, y: - 0.5 * _h });

        let arcPointCount = 20;
        for (let i = 0; i < arcPointCount; i++) {
            let t = i / (arcPointCount - 1);

            let nowAngle = lerp(90, 180, t);
            let nowX = -0.5 * _w + sin(radians(nowAngle)) * _w;
            let nowY = -0.5 * _h - cos(radians(nowAngle)) * _h;

            verts.push({ x: nowX, y: nowY });
        }

        let newBody = Bodies.fromVertices(_x, _y, verts);

        let boundsX = lerp(newBody.bounds.min.x, newBody.bounds.max.x, 0.5);
        let boundsY = lerp(newBody.bounds.min.y, newBody.bounds.max.y, 0.5);

        console.log(`inputX: ${_x}, inputY: ${_y}`);
        console.log(`bodyX: ${newBody.position.x}, bodyY: ${newBody.position.y}`);
        console.log(`boundsX: ${boundsX}, boundsY: ${boundsY}`);

        let offsetX = _x - boundsX;
        let offsetY = _y - boundsY;

        for (let i = 0; i < verts.length; i++) {
            verts[i].x -= offsetX;
            verts[i].y -= offsetY;
        }

        Matter.Body.setPosition(newBody, {x: _x + offsetX, y: _y + offsetY});

        super(verts, newBody, _color);
    }
}