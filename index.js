const {shell} = require('electron')
console.log( )
var input_ele = document.getElementById('url_input');
console.log(input_ele);

var url_button = document.getElementById('url_button');
url_button.addEventListener('click', function () { checkUrl(input_ele.value) });

function checkUrl(url) {
    var url1 = String(url);
    console.log(url1);
    if(url1.match(/^\\\\\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)!=null){
        shell.showItemInFolder('\\10.10.20.42\share')
    }
}