window.onload = function() {
    document.getElementById('key_renew').onclick = function() {
        location.href = '/changeapikey';
    }
    document.getElementById('toggle_apikey_log').onclick = function() {
        var ele = document.getElementById('apikey_log');
        if(ele.hidden) ele.hidden = false;
        else ele.hidden = true;
    }
    document.getElementById('key_header').onclick = function() {
        location.href = '#key';
    }
    document.getElementById('guide_header').onclick = function() {
        location.href = '#guide';
    }
    document.getElementById('domain_header').onclick = function() {
        location.href = '#domain';
    }
    document.getElementById('example_header').onclick = function() {
        location.href = '#example';
    }
}