// const {shell} = require('electron')
// console.log(shell)\

var musicPlayer = document.querySelector('.musicPlayer');
var dictorySelecter = document.querySelector('.dictorySelecter');
dictorySelecter.addEventListener('change', function (evt) {
  console.log(evt);
  addMusicFiles(evt.target.files);
  this.select();
  window.parent.document.body.focus();
}, false);

function checkUrl(url) {
  var url1 = String(url);
  console.log(url1);
  if (url1.match(/^\\\\\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) != null) {
    // shell.showItemInFolder('\\10.10.20.42\share')
  }
}
//本地文件写入
var path = require('path');
var fs = require('fs');
function addMusicFiles(floder) {
  console.log(floder);
  fs.readdir(floder[0].path, function (err, files) {
    console.log(files, err)
    var fileList = document.querySelector('#fileListTable');
    fileList.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
      var files_tr = document.createElement('tr');
      fileList.appendChild(files_tr);
      files_tr.innerHTML = `
                          <td class="col0"></td>
                          <td class="col1">` + files[i] + `</td>
                          <td class="col2">` + '123' + `</td>
                          <td class="col3">` + fileinfo(floder[0].path + '/' + files[i]) + `</td>
                          `;
      files_tr.addEventListener('dblclick', function () {
        console.log(this);
        musicPlayer.setAttribute('src', floder[0].path + '/' + this.getElementsByClassName('col1')[0].innerText);
        musicPlayer.play();
        createInterval();
      })
    }
  })
}
function createInterval() {
  var musicDuration = window.setInterval(function () {
    if (musicPlayer.duration && !mouseDown) {
      musicTimer.innerText = secToTimeFormat(musicPlayer.currentTime) + '/' + secToTimeFormat(musicPlayer.duration);
      controller.style.left = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth - controller.offsetWidth / 2 + 'px';
      processor.style.width = (musicPlayer.currentTime / musicPlayer.duration) * slider.offsetWidth + 'px';
      if (musicPlayer.ended) {
        controller.style.left = -13 + 'px';
        processor.style.width = 0 + 'px';
        resetMusicTimer();
        window.clearInterval(musicDuration);
      }
    }
  }, 100);
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
  if (musicPlayer.getAttribute('src')) {
    if (musicPlayer.paused == false) {
      musicPlayer.pause();
      playButton.setAttribute('src','./res/flatLight12.png');

    } else {
      musicPlayer.play();
      playButton.setAttribute('src','./res/flatLight14.png');
    }
  }
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
          if (event.movementX + controller.offsetLeft <= slider.offsetWidth - halfW && event.movementX + controller.offsetLeft >= 0 - halfW) {
            controller.style.left = event.movementX + controller.offsetLeft + 'px';
            processor.style.width = event.movementX + processor.offsetWidth + 'px';
          }
        }
        break;
      }
    case 'mouseup':
      {
        if (musicPlayer.getAttribute('src')) {
          musicPlayer.currentTime = ((controller.offsetLeft + controller.offsetWidth / 2) / slider.offsetWidth) * musicPlayer.duration;
        }
        mouseDown = false;
        break;
      }
  }
}
controller.addEventListener('mousedown', dragDropHandler);
window.addEventListener('mousemove', dragDropHandler);
window.addEventListener('mouseup', dragDropHandler);

