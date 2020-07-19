function deleteurl(url) {
    location.href = `/removeurl/${url}?redirecturl=${location.href}`;
}