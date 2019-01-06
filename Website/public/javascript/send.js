function makeRequest(url, method, data = {}) {
    if (method == "POST") {
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            }

        }).then(res => res.json());
    } else {
        return fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            }
        }).then((resp) => {
            let json = resp.json(); // there's always a body
            if (resp.status >= 200 && resp.status < 300) {
              return json;
            } else {
              return json.then(Promise.reject.bind(Promise));
            }
          })
    }
}

function upImg(url, method, data) {
    return fetch(url, {
        method: method,
        body: data,
    }).then(res => res.json());
}