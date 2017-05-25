// const {shell} = require('electron')
// console.log( )



var musicPlayer = document.querySelector('.musicPlayer');

var url_button = document.getElementById('url_button');
url_button.addEventListener('click', function () { console.log(musicPlayer.duration) });

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
var fs = require('fs');

fs.readdir(_path, function (err, files) {
  console.log(files)
  for (var i = 0; i < files.length; i++) {
    var fileList = document.querySelector('#fileListTable');
    var files_tr = document.createElement('tr')
    fileList.appendChild(files_tr)
    files_tr.innerHTML = `
                        <td class="col0"></td>
                        <td class="col1">` + files[i] + `</td>
                        <td class="col2">` + '123' + `</td>
                        <td class="col3">` + fileinfo(_path + '/' + files[i]) + `</td>
                        `
    files_tr.addEventListener('dblclick', function () {
      musicPlayer.setAttribute('src', _path + '/' + files_tr.getElementsByClassName('col1')[0].innerText)
      musicPlayer.play()
      createInterval();
    })
  }
})
function createInterval() {
  var musicDuration = window.setInterval(function () {
    if (musicPlayer.duration) {
      musicTimer.innerText = secToTimeFormat(musicPlayer.currentTime) + '/' + secToTimeFormat(musicPlayer.duration)
      if(musicPlayer.ended){
        resetMusicTimer();
      window.clearInterval(musicDuration);
        
      }
    }
  }, 1000);
}

function secToTimeFormat(time) {
  if (typeof (time) == 'number') {
    var sec = (time % 60).toFixed(0);
    var min = (time / 60).toFixed(0);
    if (min < 10) min = '0' + min;
    if (sec < 10) sec = '0' + sec;
    return (min + ':' + sec)
  }
}
function fileinfo(dir_str) {
  return (fs.statSync(dir_str).size / 1024 / 1024).toFixed(2).toString() + "M"
}

var mousePosition = document.querySelector('#mousePosition');
mousePosition.style.position = 'absolute'
console.log(mousePosition)
var slider = document.querySelector('.slider');
var buffer = document.querySelector('.buffer');
var step = 0.05;
var timer = window.setInterval(function () {
  var sw = slider.offsetWidth;
  var w = buffer.offsetWidth;
  buffer.style.width = w + sw * step + 'px';
  if (w + sw * step >= sw) {
    buffer.style.width = sw + 'px';
    window.clearInterval(timer);
  }
}, 100);
var processor = document.querySelector('.processor');
var controller = document.querySelector('.controller');
var playButton = document.querySelector('.playButton');
playButton.style.backgroundImage = ('./res/flatLight14.png');
playButton.addEventListener('pointerup', function () {
  console.log(playButton);
})

var volumeButton = document.querySelector('.volumeButton');
var musicTimer = document.querySelector('.musicTimer');
resetMusicTimer();
function resetMusicTimer() {
  musicTimer.innerText = '00:00/00:00';
}

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

