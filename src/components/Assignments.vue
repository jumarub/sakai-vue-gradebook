<script setup>
import axios from 'axios';
import { RouterLink, RouterView, useRouter } from 'vue-router'
import {
  FwbA,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
} from 'flowbite-vue';

</script>

<template>
  <div data-dial-init class="fixed end-6 bottom-6 group">
    <button type="button" @click="returnToSites" class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800 transition-all duration-300 ease-in-out">

      <svg class="w-6 h-6 transition-opacity duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>

      <span class="absolute opacity-0 group-hover:opacity-100 group-hover:scale-100 text-sm font-medium transition-all duration-300 ease-in-out">Volver</span>

      <span class="sr-only">Volver</span>
    </button>
  </div>

  <div v-if="isLoading" class="flex justify-center items-center">
    <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
  </div>
  <div v-if="!isLoading" class="overflow-x-auto">
    <fwb-table class="border-collapse border-slate-400">
      <fwb-table-head class="bg-gray-100 text-gray-700">
        <fwb-table-head-cell class="border px-4 py-2 w-1/4">Estudiantes</fwb-table-head-cell>
        <fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">Promedio</fwb-table-head-cell>
        <fwb-table-head-cell class="max-w-[250px] truncate border px-4 py-2"
          v-for="(assignment, assignmentIndex) in assignmentList" :key="assignment.id"
          :class="{
            'bg-gray-100': assignmentIndex % 2 === 0,
            'bg-white': assignmentIndex % 2 !== 0
          }">
          <div class="max-w-[150px] truncate font-semibold" style="text-transform: none;"
            v-tooltip.top="assignment.title.length > 21 ? assignment.title : ''">
            {{ assignment.title }}
          </div>
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row
          v-for="(user, userIndex) in userList"
          :key="user.id"
        >
          <fwb-table-cell class="border px-4 py-2 text-gray-800"
          :class="{
            'bg-gray-100': userIndex % 2 !== 0,
            'bg-white': userIndex % 2 === 0
          }">
            <div class="max-w-[150px] truncate" v-tooltip.right="user.name.length > 21 ? user.name : ''">
              {{ user.name }}
            </div>
          </fwb-table-cell>

          <fwb-table-cell class="relative border px-4 py-2"
          :class="{
            'bg-gray-100': userIndex % 2 !== 0,
            'bg-white': userIndex % 2 === 0
          }">
            <div class="absolute inset-0 w-full h-full flex items-center justify-center transition ease-in-out duration-200 font-semibold">
              {{ calculateAverage(user) || 'N/A' }}
            </div>
          </fwb-table-cell>

          <fwb-table-cell
            v-for="(assignment, assignmentIndex) in assignmentList"
            :key="assignment.id + user.id"
            class="relative border border-white px-4 py-2"
            :class="{
              'border-b-0': userIndex === userList.length - 1,
              'border-r-0': assignmentIndex === assignmentList.length - 1
            }"
          >
            <div
              class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer transition ease-in-out duration-200"
              :class="{
                'bg-red-100 hover:bg-red-400': isNoSubmission(assignment.submissionList, user),
                'bg-blue-100 hover:bg-blue-400': isSubmittedNotGraded(assignment.submissionList, user),
                'bg-emerald-200 hover:bg-emerald-500': isGraded(assignment.submissionList, user),
              }"
              @click="buildLinkToSakaiGrader(assignment.id, getSubmissionIdByUserId(assignment.submissionList, user))"
            >
              <div v-if="getUserGrade(assignment.submissionList, user)" class="text-gray-800 font-semibold">
                {{ getUserGrade(assignment.submissionList, user) }} / {{ parseGrade(assignment.maxPoints) }}
              </div>
            </div>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
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
      siteId: this.$route.params.siteId,
      siteList: [],
      userList: [],
      assignmentList: [],
      isLoading: true,
    };
  },
  computed: {
    siteId() {
      return this.$route.params.siteId;
    }
  },
  mounted() {
    this.getAssignments(this.siteId);
  },
  methods: {
    returnToSites() {
      redirectTo(this.$router, 'sites');
    },
    getSubmissionIdByUserId(submissionList, user) {
      for (const submission of submissionList) {
        for (const submitter of submission.submitterList) {
          if (submitter.id === user.id) {
            return submission.id;
          }
        }
      }

      return null;
    },
    isNoSubmission(submissionList, user) {
      const grade = this.getUserGrade(submissionList, user);
      return grade === null || grade === undefined;
    },
    isSubmittedNotGraded(submissionList, user) {
      const grade = this.getUserGrade(submissionList, user);
      return grade === '';
    },
    isGraded(submissionList, user) {
      const grade = this.getUserGrade(submissionList, user);
      return grade !== null && grade !== undefined && grade !== '';
    },
    getUserGrade(submissionList, user) {
      for (const submission of submissionList) {
        for (const submitter of submission.submitterList) {
          if (submitter.id === user.id) {
            let grade = submitter.grade;

            if (!!grade) {
              return this.parseGrade(grade);
            } else {
              return "";
            }
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
        console.log('assignments Retrieved Successfully:', response.data);

        const assignments = response.data.assignment_collection;
        let newAssignmentList = [];

        for (const assignment of assignments) {
          let assignmentId = assignment.id;
          let assignmentTitle = assignment.title;
          let assignmentMaxPoints = assignment.gradeScaleMaxPoints;
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

          newAssignmentList.push(new Assignment(assignmentId, assignmentTitle, assignmentMaxPoints, isGroupAssignment, submissionList));
        }

        this.sortByTitle(newAssignmentList);

        this.assignmentList = newAssignmentList;
        await this.getUsersBySiteId(siteId);
        this.isLoading = false;
        this.selectedSite = siteId;
      } catch (error) {
        console.error("Error retrieving assignments:", error.response);
      }
    },
    sortByTitle(assignmentList) {
      assignmentList.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    },
    calculateAverage(user) {
      const grades = this.assignmentList.map(assignment => this.getUserGrade(assignment.submissionList, user));

      const convertGrade = (grade) => {
        if (typeof grade === 'string') {
          grade = grade.replace(',', '.');
        }
        const number = parseFloat(grade);
        return isNaN(number) ? null : number;
      };

      const validGrades = grades.map(convertGrade).filter(grade => grade !== null);

      if (validGrades.length === 0) return null;

      const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
      return (sum / validGrades.length).toFixed(2);
    },
    buildLinkToSakaiGrader(assignmentId, submissionId) {
      let baseUrl = import.meta.env.VITE_SAKAI_URL + "/portal/site/";
      let siteId = this.selectedSite;

      let toolUri = "/tool/6be88365-9f22-4faf-94c5-f549104c7928";

      let siteAssignment = siteId + "/" + assignmentId;
      let assignmentIdQueryParam = "?assignmentId=/assignment/a/" + siteAssignment;

      let siteAssignmentSubmission = siteAssignment + "/" + submissionId;
      let submissionIdQueryParam = "&submissionId=/assignment/s/" + siteAssignmentSubmission;

      let panelSakaiActionQueryParam = "&panel=Main&sakai_action=doGrade_submission";

      baseUrl = baseUrl + siteId + toolUri + assignmentIdQueryParam + submissionIdQueryParam + panelSakaiActionQueryParam;

      window.open(baseUrl, '_blank');

      console.log(baseUrl);
    },
    parseGrade(grade) {
      if (grade.includes(",")) {
        grade = grade.replace(',', '.');
      }

      const number = parseFloat(grade);

      if (isNaN(number)) {
        return value
      }

      if (number % 1 === 0) {
        return Math.trunc(number);
      } else {
        return number.toFixed(2).replace('.', ',');
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
