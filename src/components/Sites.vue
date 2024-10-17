<script setup>
import axios from 'axios';
import 'flowbite';
import { RouterLink, RouterView } from 'vue-router'
import { FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
</script>

<template>
<div data-dial-init class="fixed right-6 bottom-6 group">
    <div id="speed-dial-menu-dropdown-square" class="flex flex-col justify-end hidden py-1 mb-4 space-y-2 bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
        <ul class="text-sm text-gray-500 dark:text-gray-300">
            <li>
                <a href="#" class="flex items-center px-5 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white">
                    <svg class="w-3.5 h-3.5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 14 3-3m-3 3 3 3m-3-3h16v-3m2-7-3 3m3-3-3-3m3 3H3v3"></path>
                    </svg>
                    <span class="text-sm font-medium">Actualizar</span>
                </a>
            </li>
            <li>
                <a href="#" class="flex items-center px-5 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white">
                    <svg class="w-3.5 h-3.5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                  </svg>
                    <span class="text-sm font-medium">Volver</span>
                </a>
            </li>
        </ul>
    </div>
    <button type="button" data-dial-toggle="speed-dial-menu-dropdown-square" aria-controls="speed-dial-menu-dropdown-square" aria-expanded="false" class="flex items-center justify-center ml-auto text-white bg-blue-700 rounded-lg w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
        </svg>
        <span class="sr-only">Open actions menu</span>
    </button>
</div>


  <div v-if="isLoading" class="flex justify-center items-center">
    <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
  </div>

  <div v-if="!isLoading" class="flex justify-center items-center">
    <fwb-list-group style="width: 500px; text-align: center;">
      <fwb-list-group-item hover class="py-3" style="justify-content:center; font-size: 18px" v-for="site in siteList" :key="site.id" @click="fetchAssignments(site.id)">{{ site.title }}</fwb-list-group-item>
    </fwb-list-group>
  </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import Site from '../classes/Site';
import Assignment from '../classes/Assignment';
import Group from '../classes/Group';
import Submitter from '../classes/Submitter';
import Submission from '../classes/Submission';
import User from '../classes/User';
import { redirectTo } from '@/utils/helper';

export default {
  data() {
    return {
      selectedSite: null,
      siteList: [],
      userList: [],
      assignmentList: [],
      isLoading: true,
    };
  },
  mounted() {
    this.getSites();
  },
  methods: {
    async getSites() {
      const url = `/api/direct/site.json`;

      console.log('Fetching sites from:', url);

      try {
        const response = await axios.get(url, { withCredentials: true });
        console.log('Sites Retrieved Successfully:', response.data);

        this.siteList = response.data.site_collection.map(site => new Site(site.id, site.entityTitle, site.description));
        this.isLoading = false;
      } catch (error) {
        console.error("Error retrieving sites:", error.response);
      }
    },
    fetchAssignments(siteId) {
      if (siteId !== null) {
        let params = { siteId : siteId };
        redirectTo(this.$router, 'assignments', params);
      }
    }
  },
};
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.hoveredGrade:hover > div {
  color: white;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
