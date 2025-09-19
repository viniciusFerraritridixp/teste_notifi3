<template>
  <div id="app">
    <PWANotifications />
    <Head />
    <router-view/>
  </div>
</template>

<style lang="sass" src="bulma"></style>

<script>
import Head from '@/components/Head.vue'
import PWANotifications from '@/components/PWANotifications.vue'

export default {
  name: 'home',
  components: {
    Head,
    PWANotifications
  }
}
</script>
