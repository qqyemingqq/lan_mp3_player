// const {shell} = require('electron')
// console.log( )
var input_ele = document.getElementById('url_input');
var musicPlayer = document.querySelector('.musicPlayer');
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

fs.readdir(_path, function(err, files) {
  console.log(files)
  for (var i = 0; i < files.length; i++) {
    // mySound = new Audio(_path + '\\' + files[i]);
    // mySound.controls = true
    // mySound.preload = 'meta'
    // document.body.appendChild(mySound)
    var fileList = document.querySelector('#fileListTable');
    var files_tr = document.createElement('tr')
    files_tr.innerHTML = `
                        <td class="col0">
                        </td>
                        <td class="col1">` + files[i] + `</td>
                        <td class="col2">` + '123' + `</td>
                        <td class="col3">` + fileinfo(_path + '/' + files[i]) + `</td>
                        `
    files_tr.addEventListener('dblclick', function() {
      musicPlayer.setAttribute('src', _path + '/' + files_tr.getElementsByClassName('col1')[0].innerText)
      musicPlayer.play()

      musicTimer.innerText = musicPlayer.duration
    })
    fileList.appendChild(files_tr)
    // }
    // if (err) {
    //     console.log('read dir error');
    // } else {
    //     files.forEach(function(item) {
    //         console.log(item);
    //     });
    // }
  }
})

function fileinfo(dir_str) {
  return (fs.statSync(dir_str).size / 1024 / 1024).toFixed(2).toString() + "M"
}

var mousePosition = document.querySelector('#mousePosition');
mousePosition.style.position = 'absolute'
console.log(mousePosition)
// play button function
// progress funciton
var slider = document.querySelector('.slider');
var buffer = document.querySelector('.buffer');
var step = 0.05;
var timer = window.setInterval(function() {
  var sw = slider.offsetWidth;
  var w = buffer.offsetWidth;
  buffer.style.width = w + sw * step + 'px';
  if (w + sw * step == sw) {
    window.clearInterval(timer);
  }
}, 100);
// var processor = $('#processor');
// var controller = $('#controller');
var processor = document.querySelector('.processor');
var controller = document.querySelector('.controller');
var playButton = document.querySelector('.playButton');
playButton.style.backgroundImage = ('./res/flatLight14.png');
playButton.addEventListener('pointerup', function() {
  console.log(playButton)
})

var volumeButton = document.querySelector('.volumeButton');
var musicTimer = document.querySelector('.musicTimer');
musicTimer.innerText = '12:12';

var mouseDown = false;
var controllerPositionX = 0;

function dragDropHandler(event) {
  switch (event.type) {
    case 'mousedown':
      {
        mouseDown = true;
        var offectX = (controller.parentElement.offsetWidth * 0.4 - controller.offsetWidth) / 2;
        if (event.clientX - offectX <= slider.offsetWidth && event.clientX - offectX >= 0) {
          controller.style.left = event.clientX - offectX + 'px';
        }
        // processor.style.left = tx + halfW * 3 + 'px'
        break;
      }
    case 'mousemove':
      {
        mousePosition.style.top = event.clientY + 15 + 'px';
        mousePosition.style.left = event.clientX + 5 + 'px';
        mousePosition.innerText = '(' + event.clientX + ',' + event.clientY + ')'
        if (mouseDown) {
          var halfW = controller.offsetWidth >> 1;
          var offectX = controller.parentElement.offsetWidth * 0.2 - halfW + 88;
          if (event.clientX - offectX <= slider.offsetWidth - halfW && event.clientX - offectX >= 0 - halfW) {
            controller.style.left = event.clientX - offectX + 'px';
            processor.style.width = event.clientX - offectX + halfW + 'px';
          }
        }
        break;
      }
    case 'mouseup':
      {
        mouseDown = false;
        break;
      }
  }
}
controller.addEventListener('mousedown', dragDropHandler);
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mouseup', dragDropHandler);
