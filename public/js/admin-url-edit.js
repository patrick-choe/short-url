window.onload = function() {
    document.getElementById('remove_url').onclick = function() {
        location.href = `/removeurl/${urlname}?redirecturl=${location.href}`;
    }
}