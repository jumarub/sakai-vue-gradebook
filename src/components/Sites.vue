<script setup>
import axios from 'axios';
import { RouterLink, RouterView } from 'vue-router'
import { FwbBadge } from 'flowbite-vue'


</script>

<template>

  <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Default</span>
  <span class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Dark</span>
  <span class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Red</span>
  <span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Green</span>
  <span class="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Yellow</span>
  <span class="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">Indigo</span>
  <span class="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">Purple</span>
  <span class="bg-pink-100 text-pink-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-pink-900 dark:text-pink-300">Pink</span>
  

  <div v-if="isLoading" class="flex justify-center items-center">
    <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
  </div>
  <div v-if="!isLoading">
    <div>
      <div style="border: 1px solid black">
      <div v-for="site in siteList" :key="site.id" @click="getAssignments(site.id)">{{ site.title }}</div>
      </div>
      <br>
    </div><br>

    <div class="overflow-x-auto">
      <table class="min-w-full table-auto border-collapse border border-gray-400">
      <thead>
        <tr class="bg-gray-300">
        <th class="px-4 py-2 border border-gray-400 text-left">Estudiantes</th>
        <!-- Assignment titles as column headers -->
        <th v-for="assignment in assignmentList" :key="assignment.id" class="px-4 py-2 border border-gray-400 text-left">
          {{ assignment.title }}
        </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user) in userList" :key="user.id" class="hover:bg-gray-200">
        <td class="px-4 py-2 border border-gray-400">{{ user.name }}</td>
        <td v-for="assignment in assignmentList" :key="assignment.id + user.id" class="px-4 py-2 border border-gray-400"
          :class="getUserGrade(assignment.submissionList, user) ? '' : 'bg-black-100'">
          <div v-if="getUserGrade(assignment.submissionList, user)" class="flex items-center justify-center">
          <div>{{ getUserGrade(assignment.submissionList, user) }}</div>
          </div>
        </td>
        </tr>
      </tbody>
      </table>
    </div>
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

export default {
  data() {
    return {
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
    getUserGrade(submissionList, user) {
      for (const submission of submissionList) {
        for (const submitter of submission.submitterList) {
          if (submitter.id === user.id) {
            let grade = submitter.grade;

            if (grade.includes(",")) {
              grade = grade.replace(',', '.');
            }

            if (!isNaN(grade)) {
              grade = parseFloat(grade);
              if (grade % 1 === 0) {
                return parseInt(grade);
              }
            }

            return grade;
          }
        }
      }

      return null;
    },
    async getUsersBySiteId(siteId) {
      const url = `/api/direct/site/` + siteId + `/memberships.json`;

      try {
        const response = await axios.get(url, { withCredentials: true });
        console.log('Users Retrieved Successfully:', response.data);

        const users = response.data.membership_collection;
        let userList = [];

        for (const user of users) {
          const userId = user.userId;
          const displayName = user.userDisplayName;
          const role = user.memberRole;

          if (userId != null && displayName != null && role != null &&
            role !== "maintain") {
              userList.push(new User(userId, displayName));
          }
        }

        this.userList = userList;

      } catch (error) {
        console.error("Error retrieving users:", error.response);
        return null;
      }
    },
    async getGroupBySiteIdAndGroupId(siteId, groupId) {
      const url = `/api/direct/site/` + siteId + `/group/` + groupId + `.json`;

      try {
        const response = await axios.get(url, { withCredentials: true });
        console.log('Group Retrieved Successfully:', response.data);

        if (response.data && response.data.title) {
          return new Group(groupId, response.data.title);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error retrieving group:", error.response);
        return null;
      }
    },
    async getAssignments(siteId) {
      const url = `/api/direct/assignment/site/` + siteId + `.json`;

      console.log('Fetching assignments from:', url);

      try {
        const response = await axios.get(url, { withCredentials: true });
        console.log('Assignments Retrieved Successfully:', response.data);

        const assignments = response.data.assignment_collection;
        let newAssignmentList = [];

        for (const assignment of assignments) {
          let assignmentId = assignment.id;
          let assignmentTitle = assignment.title;
          let isGroupAssignment = assignment.groups && assignment.groups.length > 0;
          let submissionList = [];
          

          if (assignment.submissions) {
            for (const submission of assignment.submissions) {
              var submissionId = submission.id;
              let group = null;
              let submitterList = [];

              if (submission.groupId) {
                group = await this.getGroupBySiteIdAndGroupId(siteId, submission.groupId);
              }

              if (submission.submitters) {
                submission.submitters.forEach(submitter => {
                  submitterList.push(new Submitter(submitter.id, submitter.displayName, submitter.grade));
                });
              }

              submissionList.push(new Submission(submissionId, group, submitterList));
            }
          }

          newAssignmentList.push(new Assignment(assignmentId, assignmentTitle, isGroupAssignment, submissionList));
        }

        this.assignmentList = newAssignmentList;
        await this.getUsersBySiteId(siteId);
      } catch (error) {
        console.error("Error retrieving assignments:", error.response);
      }
    },
    async getSites() {
      const url = `/api/direct/site.json`;

      console.log('Fetching sites from:', url);

      try {
        const response = await axios.get(url, { withCredentials: true });
        console.log('Sites Retrieved Successfully:', response.data);

        this.siteList = response.data.site_collection.map(site => new Site(site.id, site.entityTitle));
        this.isLoading = false;
      } catch (error) {
        console.error("Error retrieving sites:", error.response);
      }
    },
  },
};
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
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
