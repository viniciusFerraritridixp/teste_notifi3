import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              if (confirm('Nova versão disponível! Deseja atualizar?')) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// PWA Install Prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA Install prompt')
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  
  // Add install button or show install banner
  showInstallBanner()
})

function showInstallBanner() {
  // Create install banner
  const installBanner = document.createElement('div')
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #3273dc;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      <span>Instale o PushMe como um app!</span>
      <button id="install-btn" style="
        margin-left: 10px;
        background: white;
        color: #3273dc;
        border: none;
        padding: 5px 15px;
        border-radius: 3px;
        cursor: pointer;
      ">Instalar</button>
      <button id="dismiss-btn" style="
        margin-left: 5px;
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 5px 15px;
        border-radius: 3px;
        cursor: pointer;
      ">Dispensar</button>
    </div>
  `
  
  document.body.appendChild(installBanner)
  
  // Install button click
  document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        deferredPrompt = null
        installBanner.remove()
      })
    }
  })
  
  // Dismiss button click
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    installBanner.remove()
  })
}

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA was installed')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
