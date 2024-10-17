<template>
  <div id="app" class="min-w-full">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: "App",
    setup() {
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