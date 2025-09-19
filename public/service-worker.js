// Cache name and version
const CACHE_NAME = 'pushme-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
function urlB64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// saveSubscription saves the subscription to the backend
async function saveSubscription (subscription) {
  const response = await fetch('/api/saveSubscription.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })
  return response.json()
}

async function registerPush () {
  const applicationServerKey = urlB64ToUint8Array(
    'BIneGPMXfpFUmGRuQ06yVw0Kt5Yh0QWxiMkFnLoo4K0A8MniSFVnDoliE35mQ1zEb6pGTKOWGJSO7YRlfzUmmd8'
  )
  const options = { applicationServerKey, userVisibleOnly: true }
  const subscription = await self.registration.pushManager.subscribe(options)
  return saveSubscription(subscription)
}

async function showLocalNotification (title, body, swRegistration) {
  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icons/icon-72x72.png'
      }
    ]
    // here you can add more properties like icon, image, vibrate, etc.
  }
  return swRegistration.showNotification(title, options)
}

self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
})

self.addEventListener('activate', function (event) {
  // This will be called only once when the service worker is activated.
  console.log('Registered Serviceworker')
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become available to all pages
  );
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    console.log('Push event! Showing data:', event.data.json())
    const notification = event.data.json()
    const notifPromise = showLocalNotification(notification.title, notification.body, self.registration)
    event.waitUntil(notifPromise)
  } else {
    console.log('Push event but no data')
  }
})

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('message', async function (event) {
  console.log('Handling message event:', event)
  if (event.data.subscribe) { // User wants to subscribe
    const response = await registerPush()
    event.ports[0].postMessage(response)
  }
})
