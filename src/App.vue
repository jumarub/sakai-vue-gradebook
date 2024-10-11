<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';

  export default {
    name: "App",
    setup() {
      const router = useRouter();
      
      // Check for token on app load
      const sessionToken = Cookies.get('JSESSIONID');
      
      if (sessionToken) {
        // If token exists, redirect to /sites
        router.push({ name: 'sites' });
      }

      return {};
    },
  };
</script>

<style>
/* Global styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>