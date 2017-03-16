import fetch from 'isomorphic-fetch';

export const API_URL = `http://www.alphastagegames.com/api`

export default function callApi(endpoint, method = 'get', body) {
  let token = localStorage.getItem('id_token') || null

  return fetch(`${API_URL}/${endpoint}`, {
    headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${token}` },
    method,
    body: JSON.stringify(body),
  })
  .then(response => response.json().then(json => ({ json, response })))
  .then(({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }

    return json;
  })
  .then(
    response => response,
    error => error
  );
}

export function uploadFileDirectly(method, url, file, done) {
  let token = localStorage.getItem('id_token') || null

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.onload = function () {
    done(null, xhr.response);
  };
  xhr.onerror = function () {
    done(xhr.response);
  };
  xhr.send(file);
}
