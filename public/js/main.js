var timeouts = [];

window.onload = function() {
    document.getElementById('profile_image').onclick = function() {
        var profile_info = document.getElementById('profile_info');
        if (profile_info.hidden) {
            profile_info.hidden = false;
        } else {
            profile_info.hidden = true;
        }
    }

    document.getElementById('create_url').onclick = function() {
        var url_input = document.getElementById('input_url');
        var clipboard_textarea = document.getElementById('clipboard_textarea');
        var result = JSON.parse(Request('post', `/create?url=${url_input.value}`));
        if(result.code == 'success') {
            showinfo(`<a href="${result.url}">${result.url}</a><br>자동으로 클립보드에 복사되었습니다!`, 2000);
            copyToClipboard(result.url);
        }
        else {
            showinfo(result.message, 2000);
        }
    }
}

function Request(method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open( method , url , false );
    xhr.send( null );
    return xhr.responseText;
}

function showinfo(text, hide) {
    var e = document.getElementById('info');
    e.style.opacity = 1;
    e.innerHTML = `<h2>${text}</h2>`;
    timeouts.forEach(function(value) {
        clearTimeout(value);
    });
    timeouts = [];
    timeouts.push(setTimeout(hideinfo, hide));
}

function hideinfo() {
    var e = document.getElementById('info');
    var i = 100;
    var a = setInterval(function() {
        if(i<0) {
            clearInterval(a);
            return;
        }
        e.style.opacity = i/100;
        i--
    }, 5);
}

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}