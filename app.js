/* global localStorage navigator caches XMLHttpRequest */

(function () {
  'use strict'

  let app = {}
  const url = 'https://sw-test-43ffd.firebaseio.com/'
  const name = 'world!'

  app.saveName = function () {
    localStorage.user = { name: name }
    document.getElementById('name').textContent = localStorage.user
  }

  // updates from database
  app.updateName = function (newName) {
    localStorage.user = newName
    document.getElementById('name').textContent = localStorage.user
  }

  app.getNames = function () {
    let namesUrl = url + 'name.json'
    if ('caches' in window) {
      caches.match(namesUrl).then(function (response) {
        if (response) {
          response.json().then(function (json) {
            // Only update if the XHR is still pending, otherwise the XHR
            // has already returned and provided the latest data.
            if (app.hasRequestPending) {
              console.log('[app] updated from cache')
              app.updateName(json)
            }
          }).catch(function (err) {
            console.log('[app.getNames] Error ' + err)
          })
        }
      })
    }

    // Make the XHR to get the data, then update the card
    app.hasRequestPending = true
    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          console.log('[app] updated from firebase')
          var response = JSON.parse(request.response)
          app.hasRequestPending = false
          app.updateName(response)
        }
      }
    }
    request.open('GET', namesUrl)
    request.send()
  }

  app.user = localStorage.user
  if (!app.user) {
    app.getNames()
  } else {
    document.getElementById('name').textContent = localStorage.user
    console.log('[app] updated from localStorage')
  }

  /* register service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('/service-worker.js')
             .then(function () { console.log('Service Worker Registered') })
  }
})()
