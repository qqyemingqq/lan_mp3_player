// const {shell} = require('electron')
// console.log( )
var input_ele = document.getElementById('url_input');
console.log(input_ele);

// var url_button = document.getElementById('url_button');
// url_button.addEventListener('click', function () { checkUrl(input_ele.value) });

function checkUrl(url) {
    var url1 = String(url);
    console.log(url1);
    if (url1.match(/^\\\\\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) != null) {
        // shell.showItemInFolder('\\10.10.20.42\share')
    }
}
//本地文件写入
var path = require('path');
var _path = path.join(__dirname, '.', '/Musics');
// var path1 = "d:\\ProjectsSpace\\ElectronProjects\\ElectronTest2\\app\\html\\config\\record.txt";
// console.log(_path);//测试路径对不对的
var fs = require('fs');
// fs.readFile(_path, 'utf8', function (err, data) {
// if (err) return console.log(err);
// });

// fs.writeFile(_path, "electron + Javascript", function (err) {
// if (!err)
//     console.log("写入成功！")
// })

fs.readdir(_path, function (err, files) {
    console.log(files)
    var audio = document.getElementById('audio_source');
    for (var i = 0; i < files.length; i++) {
        // audio.setAttribute('src', _path + '/' + files[0])
        // mySound = new Audio(_path + '\\' + files[i]);
        // mySound.controls = true
        // mySound.preload = 'meta'
        // document.body.appendChild(mySound)
        // // console.log(mySound.duration)
        // // mySound.onload = function(){
        // //     console.log(this.duration)
        // // }
        // var fileList = document.querySelector('#fileListTable');
        // var files_tr = document.createElement('tr')
        // // var files_td = document.createElement('td')
        // files_tr.innerHTML =    `
        //                         <td class="col0">   
        //                         </td>
        //                         <td class="col1">`+files[i]+`</td>
        //                         <td class="col2">`+'123'+`</td>
        //                         <td class="col3">`+fileinfo(_path + '/' + files[i])+`</td>
        //                         `
        // files_tr.addEventListener('dblclick',function(){console.log(files_tr.getElementsByClassName('col1').innerHTML);;})
        // fileList.appendChild(files_tr)
    }
    // if (err) {  
    //     console.log('read dir error');  
    // } else {  
    //     files.forEach(function(item) {  
    //         console.log(item);
    //     });
    // }
})
function fileinfo(dir_str) {
    return (fs.statSync(dir_str).size / 1024 / 1024).toFixed(2).toString() + "M"
}

// play button function
var playButton = document.querySelector('#playButtonRes')
playButton.addEventListener('pointerup', function () {
    var playButtonRes = document.querySelector('#playButtonRes')
    if (playButtonRes.getAttribute('src') == './res/flatLight14.png') {
        playButtonRes.setAttribute('src', './res/flatLight12.png')
    } else {
        playButtonRes.setAttribute('src', './res/flatLight14.png')
    }

})
// progress funciton
var slider = document.querySelector('.slider');
var buffer = document.querySelector('.buffer');
var step = 0.05;
var timer = window.setInterval(function () {
    var sw = slider.offsetWidth;
    var w = buffer.offsetWidth;
    buffer.style.width = w + sw * step + 'px';
    if (w + sw * step == sw) {
        window.clearInterval(timer);
    }
}, 100);
// var processor = $('#processor');
// var controller = $('#controller');
var processor = document.querySelector('.processor')
var controller = document.querySelector('.controller')

var mouseDown = false;
var controllerPositionX = 0;
function dragDropHandler(event) {
    switch (event.type) {
        case 'mousedown': {
            mouseDown = true;
            console.log('mousedown:' + mouseDown);
            var tx = event.clientX - 70;
            controller.style.left = event.clientX- (controller.parentElement.offsetWidth-controller.offsetWidth)/2 + 'px'
            // processor.style.left = tx + halfW * 3 + 'px'
            break;
        }
        case 'mousemove': {
            console.log('mousemove:' + mouseDown);
            if (mouseDown) {
                var tx = event.clientX - 70;
                var halfW = controller.offsetWidth >> 1;
                var offectX = (controller.parentElement.offsetWidth*0.4-controller.offsetWidth)/2
                controller.style.left = event.clientX - offectX + 'px';
                console.log(offectX)
                // processor.style.left = tx + halfW * 3 + 'px'
            }
            break;
        }
        case 'mouseup': {
            console.log('mouseup:' + mouseDown);
            var mousePosText = document.createElement('lable')
            mousePosText.innerText = event.clientX + ":" + event.clientY
            document.body.appendChild(mousePosText)
            mousePosText.style.position = 'absolute'
            mousePosText.style.top = event.clientY + 'px'
            mousePosText.style.left = event.clientX + 'px'
            mouseDown = false;
            break;
        }
    }
}
slider.addEventListener('mousedown', dragDropHandler);
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mouseup', dragDropHandler);


