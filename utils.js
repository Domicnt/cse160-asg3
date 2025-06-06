class RenderObject {
    constructor() {
        this.type = "object";
        this.textureID = -1;

        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1 ];

        this.modelMatrix = new Matrix4();
        this.calculateMatrix = true;

        this.vertexCount = 0;
        this.vertexBuffer = gl.createBuffer();
        this.color = null;
        this.colorBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
    }

    translate(x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.calculateMatrix = true;
    }

    setTranslate(x, y, z) {
        this.position = [x, y, z];
        this.calculateMatrix = true;
    }

    rotate(value, x, y, z) {
        this.rotation[0] += x * value;
        this.rotation[1] += y * value;
        this.rotation[2] += z * value;
        this.calculateMatrix = true;
    }

    setScale(x, y, z) {
        this.scale = [x, y, z];
        this.calculateMatrix = true;
    }

    updateMatrix() {
        this.modelMatrix.setTranslate(this.position[0], this.position[1], this.position[2]).rotate(this.rotation[0], 1, 0, 0).rotate(this.rotation[1], 0, 1, 0).rotate(this.rotation[2], 0, 0, 1).scale(this.scale[0], this.scale[1], this.scale[2]);
        this.calculateMatrix = false;
    }

    static lastType = null;
    static lastTexture = -1;
    static lastColor = [0,0,0,0];

    static renderObjects(gl, objects=[], u_ModelMatrix, u_selector) {
        for (var object of objects) {
          if (object.calculateMatrix) {
            object.updateMatrix();
          }
      
          if (object.type != this.lastType) {
            //bind position buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
      
            //bind uv buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, object.uvBuffer);
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_UV);
      
            this.lastType = object.type;
          }
      
          if (object.textureID != this.lastTexture) {
            gl.uniform2f(u_selector, object.textureID==0?1:0, object.textureID==1?1:0);

            this.lastTexture = object.textureID;
          }
      
          if (object.color[0] != this.lastColor[0] || object.color[1] != this.lastColor[1] || object.color[2] != this.lastColor[2] || object.color[3] != this.lastColor[3]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, object.colorBuffer);
            gl.vertexAttribPointer(a_VertexColor, 4, gl.FLOAT, false, 0, 0); 
            gl.enableVertexAttribArray(a_VertexColor);
      
            this.lastColor = object.color;
          }
      
          //set modelMatrix 
          gl.uniformMatrix4fv(u_ModelMatrix, false, object.modelMatrix.elements);
      
          gl.drawArrays(gl.TRIANGLES, 0, object.vertexCount);
        }
    }
}

class Cube extends RenderObject {
    constructor(gl, rgba=null, textureID=-1) {
        super();
        this.type = "cube";
        this.vertexCount = 36;

        let vertices = [
            //FRONT
            -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
            -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
            //LEFT
            -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
            -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
            //RIGHT
            0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
            0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
            //TOP
            -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
            -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
            //BACK
            0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
            -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
            //BOTTOM
            -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
            -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        if (rgba != null) {
            this.color = rgba;
            let colors = [];
            for (var j = 0; j < 36; ++j) {
                colors = colors.concat(this.color);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        } else {
            this.color = [0,0,0,0];
            let colors = [];
            for (var j = 0; j < 6*4; ++j) {
                colors = colors.concat(this.color);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        }

        this.textureID = textureID;

        let uvs = new Float32Array([
            // FRONT
            .25,.25,.25,.5,0,.5,.25,.25,0,.5,0,.25,
            // LEFT
            .5,.25,.5,0,.75,0,.5,.25,.75,0,.75,.25,
            // RIGHT
            .5,.75,.5,.5,.75,.5,.5,.75,.75,.5,.75,.75,
            // TOP
            1,.25,1,.5,.75,.5,1,.25,.75,.5,.75,.25,
            // BACK
            .75,.5,.5,.5,.75,.25,.75,.25,.5,.5,.5,.25,
            // BOTTOM
            .5,.25,.5,.5,.25,.5,.5,.25,.25,.5,.25,.25
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    }
}

class HeightMap extends RenderObject {
    constructor(gl, heights=[[0,0],[0,0]]) {
        super();
        this.type = "heightMap";
        this.vertexCount = 6 * (heights.length-1) * (heights[0].length-1);

        let vertices = [];
        this.color = [.5,.45,.4,1];
        let colorMod = .1
        let colors = [];
        for (let i = 0; i < heights.length-1; i++) {
            let row = []
            for (let j = 0; j < heights[0].length-1; j++) {
                row = row.concat([i, heights[i][j]], j);
                colors = colors.concat([this.color[0] + heights[i][j]*colorMod, this.color[1] + heights[i][j]*colorMod, this.color[2] + heights[i][j]*colorMod, this.color[3]]);
                row = row.concat([i, heights[i][j+1]], j+1);
                colors = colors.concat([this.color[0] + heights[i][j+1]*colorMod, this.color[1] + heights[i][j+1]*colorMod, this.color[2] + heights[i][j+1]*colorMod, this.color[3]]);
                row = row.concat([i+1, heights[i+1][j]], j);
                colors = colors.concat([this.color[0] + heights[i+1][j]*colorMod, this.color[1] + heights[i+1][j]*colorMod, this.color[2] + heights[i+1][j]*colorMod, this.color[3]]);
                
                row = row.concat([i+1, heights[i+1][j]], j);
                colors = colors.concat([this.color[0] + heights[i+1][j]*colorMod, this.color[1] + heights[i+1][j]*colorMod, this.color[2] + heights[i+1][j]*colorMod, this.color[3]]);
                row = row.concat([i, heights[i][j+1]], j+1);
                colors = colors.concat([this.color[0] + heights[i][j+1]*colorMod, this.color[1] + heights[i][j+1]*colorMod, this.color[2] + heights[i][j+1]*colorMod, this.color[3]]);
                row = row.concat([i+1, heights[i+1][j+1]], j+1);
                colors = colors.concat([this.color[0] + heights[i+1][j+1]*colorMod, this.color[1] + heights[i+1][j+1]*colorMod, this.color[2] + heights[i+1][j+1]*colorMod, this.color[3]]);
            }
            vertices = vertices.concat(row);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }
}

class TrianglePrism extends RenderObject {
    constructor(gl, rgba=[0.6,0.4,0.8,1.0]) {
        super();
        this.type = "triPrism";
        this.vertexCount = 24;

        this.vertices = [
            -1.0,-1.0,-1.0,  1.0,-1.0,-1.0,  -1.0,-1.0,1.0,  1.0,-1.0,1.0,
            0.0,1.0,-1.0,  0.0,1.0,1.0
        ];

        this.colors = [];
        for (var j = 0; j < 6*4; ++j) {
            this.colors = this.colors.concat(rgba);
        }

        //update buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
    }
}