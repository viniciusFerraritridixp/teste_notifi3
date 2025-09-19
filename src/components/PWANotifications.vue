<template>
  <div class="pwa-notifications">
    <!-- Install Banner Component -->
    <div v-if="showInstallBanner" class="install-banner">
      <div class="banner-content">
        <span>📱 Instale o PushMe como um app!</span>
        <div class="banner-buttons">
          <button @click="installApp" class="install-btn">
            Instalar
          </button>
          <button @click="dismissBanner" class="dismiss-btn">
            Dispensar
          </button>
        </div>
      </div>
    </div>

    <!-- Update Available Banner -->
    <div v-if="showUpdateBanner" class="update-banner">
      <div class="banner-content">
        <span>🔄 Nova versão disponível!</span>
        <div class="banner-buttons">
          <button @click="updateApp" class="update-btn">
            Atualizar
          </button>
          <button @click="dismissUpdateBanner" class="dismiss-btn">
            Mais tarde
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PWANotifications',
  data() {
    return {
      showInstallBanner: false,
      showUpdateBanner: false,
      deferredPrompt: null,
      newWorker: null
    }
  },
  mounted() {
    this.setupPWAListeners()
  },
  methods: {
    setupPWAListeners() {
      // Install prompt listener
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.deferredPrompt = e
        this.showInstallBanner = true
      })

      // App installed listener
      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed')
        this.showInstallBanner = false
        this.deferredPrompt = null
      })

      // Service worker update listener
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            this.newWorker = registration.installing
            this.newWorker.addEventListener('statechange', () => {
              if (this.newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateBanner = true
              }
            })
          })
        })
      }
    },
    async installApp() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt()
        const choiceResult = await this.deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        
        this.deferredPrompt = null
        this.showInstallBanner = false
      }
    },
    dismissBanner() {
      this.showInstallBanner = false
    },
    updateApp() {
      if (this.newWorker) {
        this.newWorker.postMessage({ action: 'skipWaiting' })
        window.location.reload()
      }
    },
    dismissUpdateBanner() {
      this.showUpdateBanner = false
    }
  }
}
</script>

<style scoped>
.install-banner,
.update-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.install-banner {
  background: #3273dc;
  color: white;
}

.update-banner {
  background: #48c774;
  color: white;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-buttons {
  display: flex;
  gap: 8px;
}

.install-btn,
.update-btn {
  background: white;
  color: #3273dc;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.install-btn:hover,
.update-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.dismiss-btn {
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .banner-buttons {
    justify-content: center;
  }
}
</style>