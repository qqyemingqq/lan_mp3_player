

var canvas = document.querySelector('.visualizer');
var gl = canvas.getContext('webgl');
console.log(canvas);
// gl.viewport(0, 0, canvas.width / 2, canvas.height / 2 + 20);
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;
gl.clearColor(0.39, 0.39, 0.39, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
var vs = gl.createShader(gl.VERTEX_SHADER);
var fs = gl.createShader(gl.FRAGMENT_SHADER);
var vsSrc = `
    attribute vec4 a_Position;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = 5.0;
    }`;
var fsSrc = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;
gl.shaderSource(vs, vsSrc);
gl.shaderSource(fs, fsSrc);
gl.compileShader(vs);
gl.compileShader(fs);
var prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);
var u_FragColor = gl.getUniformLocation(prog, "u_FragColor");
var a_Position = gl.getAttribLocation(prog, "a_Position");
// gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

var indexV = new Uint8Array([  
    0,1,2,  
    2,1,3  
]); 

var vertices = new Float32Array([
    .5,  .5,  0.0,
    -.5,  .5,  0.0,
    .5, -.5,  0.0,
    -.5, -.5,  0.0
]);
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_Position);
console.log(a_Position);
console.log(u_FragColor);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

canvas.addEventListener("mouseup", () => {
    gl.vertexAttrib3f(a_Position, 1.0, 0.0, 0.0);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays(gl.POINTS, 0, 1);
});




function log() {
    Array.prototype.slice.call(arguments).forEach(function (item) {
        console.log(item);
    });
}


// // 绘制矩形
// // 0.着色器源程序
// // 顶点着色器源程序
// var vsSrc = 'void main() {' +
//     'gl_Position = vec4(0.0, 0.0, 0.0, 1.0);' + // 设置坐标
//     'gl_PointSize = 8.0;' +                   // 设置尺寸
//     '}';
// // 片元着色器源程序
// var fsSrc = 'void main() {' +
//     'gl_FragColor = vec4(1.0, 0.0, 1.0, 0.75);' + // 设置颜色
//     '}';
// // 初始化着色器
// // 1.创建着色器对象
// var vs = gl.createShader(gl.VERTEX_SHADER);
// var fs = gl.createShader(gl.FRAGMENT_SHADER);
// // 检查创建结果
// // if (vs === null) {
// //     log('gl.createShader(gl.VERTEX_SHADER) failed');
// // }
// // if (fs === null) {
// //     log('gl.createShader(gl.FRAGMENT_SHADER) failed');
// // }
// // 2.填充源程序
// gl.shaderSource(vs, vsSrc);
// gl.shaderSource(fs, fsSrc);
// // 3.编译
// gl.compileShader(vs);
// gl.compileShader(fs);
// // 检查编译错误
// // if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
// //     log('gl.compileShader(vs) failed');
// //     log(gl.getShaderInfoLog(vs));   // 输出错误信息
// // }
// // if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
// //     log('gl.compileShader(fs) failed');
// //     log(gl.getShaderInfoLog(fs));   // 输出错误信息
// // }
// // 4.创建程序对象
// var prog = gl.createProgram();
// // 检查创建结果
// // if (prog === null) {
// //     log('gl.createProgram() failed');
// // }
// // 5.为程序对象分配着色器
// gl.attachShader(prog, vs);
// gl.attachShader(prog, fs);
// // 检查分配错误
// // if (gl.getProgramParameter(prog, gl.ATTACHED_SHADERS) !== 2) {
// //     log('gl.getProgramParameter(prog, gl.ATTACHED_SHADERS) failed');
// // }
// // 6.连接程序对象
// gl.linkProgram(prog);
// // 检查连接错误
// // if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
// //     log('gl.linkProgram(prog) failed');
// //     log(gl.getProgramInfoLog(prog));
// // }
// // 7.使用程序对象
// gl.useProgram(prog);

// // 绘制矩形（一个点，但点的尺寸略大）
// gl.drawArrays(gl.POINTS, 0, 1);

// function log() {
//     Array.prototype.slice.call(arguments).forEach(function (item) {
//         console.log(item);
//     });
// }
