function makeRequest(url, method, data) {
    return fetch(url, {
        method: method,
        img: data,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }

    }).then(res => res.json());
}
function upImg(url, method, data) {
    return fetch(url, {
        method: method,
        body: data,
    }).then(res => res.json());
}
