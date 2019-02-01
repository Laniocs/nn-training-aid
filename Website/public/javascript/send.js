async function upImg(url, method, data) {
    const res = await fetch(url, {
        method: method,
        body: data,
    });
    const send = await res.json();
    return send;
}

function makeRequest(method = "GET", url, dataArray = undefined) {
    return new Promise((res, rej) => {
        const data = {
            value: dataArray
        }

        const xhr = new window.XMLHttpRequest();
        xhr.open(method, url, true);
        
        if (dataArray != undefined) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(data))
        } else {
            xhr.send();
        }
        xhr.onload = function () {
            res(JSON.parse(xhr.response));
        };
        xhr.onerror = (e) => {
            res("fml", e)
        }
    });
}