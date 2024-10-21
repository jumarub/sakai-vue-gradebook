<template>
  <div data-dial-init class="fixed end-6 bottom-6 group">
    <button
      type="button"
      @click="returnToSites"
      class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800 transition-all duration-300 ease-in-out"
    >
      <svg class="w-6 h-6 transition-opacity duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span class="absolute opacity-0 group-hover:opacity-100 group-hover:scale-100 text-sm font-medium transition-all duration-300 ease-in-out">Volver</span>
      <span class="sr-only">Volver</span>
    </button>
  </div>

  <Dialog v-model:visible="isModalVisible" modal :header="selectedAssignment.title" :style="{ width: '30rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8"></span>
    <label for="email" class="font-semibold w-24">Promedio de notas: {{ calculateAssignmentAverage() }}</label>
  </Dialog>

  <Tabs value="0">
    <TabList>
      <Tab value="0">Usuarios</Tab>
      <Tab value="1">Grupos</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <FloatLabel class="w-full md:w-56 mb-4" variant="on">
          <Select v-model="selectedGroup" :options="groupList" optionLabel="name"
            :loading="isLoadingGroups || isLoadingAssignments" showClear class="w-full md:w-56" />
          <label for="on_label">Seleccione un grupo</label>
        </FloatLabel>

        <div v-if="!isLoadingAssignments && assignmentList.length > 0" class="overflow-x-auto mb-4">
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="(assignment, index) in assignmentBlackList"
              :key="index"
              :value="assignment.title"
              @click="restoreColumn(assignment)"
              severity="danger"
              class="cursor-pointer transition ease-in-out duration-200 hover:bg-red-500 hover:text-white"
            />
          </div>
        </div>

        <SkeletonTable :isLoadingAssignments="isLoadingAssignments"></SkeletonTable>

        <template v-if="!isLoadingAssignments">
          <fwb-table class="border-collapse border-slate-400">
            <fwb-table-head class="bg-gray-100 text-gray-700">
              <fwb-table-head-cell class="border px-4 py-2 w-1/4">Estudiantes</fwb-table-head-cell>
              <fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">Promedio</fwb-table-head-cell>

              <template v-for="(assignment, assignmentIndex) in assignmentList" :key="assignment.id">
                <fwb-table-head-cell
                  :v-if="displayColumn(assignment, false)"
                  :class="{
                    'bg-blue-100 border-r-black': assignment.isGroup,
                    'bg-white': !assignment.isGroup,
                    'border-r-black': assignmentIndex < assignmentList.length - 1 && assignmentList[assignmentIndex + 1].isGroup
                  }"
                  class="max-w-[300px] truncate border px-4 py-2"
                >
                  <div class="flex items-center gap-x-4">
                    <div
                      class="max-w-[150px] truncate font-semibold cursor-pointer"
                      v-tooltip.top="assignment.title.length > 21 ? assignment.title : ''"
                      style="text-transform: none;"
                      @click="openAssignmentModal(assignment)"
                    >
                      {{ assignment.title }}
                    </div>
                    <i @click="deleteColumn(assignment)" class="cursor-pointer pi pi-times transition ease-in-out duration-200 text-gray-500 hover:text-black"></i>
                  </div>
                </fwb-table-head-cell>
              </template>
            </fwb-table-head>
    
            <fwb-table-body>
              <template v-for="(user, userIndex) in userList" :key="user.id">
                <fwb-table-row v-if="isUserInGroup(user.id)">
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
                      {{ calculateUserAverage(user, false) || 'N/A' }}
                    </div>
                  </fwb-table-cell>
        
                  <fwb-table-cell
                    v-for="(assignment, assignmentIndex) in assignmentList"
                    :key="assignment.id + user.id"
                    class="relative border border-white px-4 py-2"
                    :class="{
                      'border-b-0': userIndex === userList.length - 1,
                      'border-r-0': assignmentIndex === assignmentList.length - 1,
                      'border-r-black': (assignmentIndex < assignmentList.length - 1 && assignmentList[assignmentIndex + 1].isGroup) || assignment.isGroup
                    }"
                  >
                    <div
                      class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer transition ease-in-out duration-200"
                      :class="{
                        'bg-red-100 hover:bg-red-400': isNoSubmission(assignment.submissionList, user, false),
                        'bg-blue-100 hover:bg-blue-400': isSubmittedNotGraded(assignment.submissionList, user, false),
                        'bg-emerald-200 hover:bg-emerald-500': isGraded(assignment.submissionList, user, false),
                      }"
                      @click="buildLinkToSakaiGrader(assignment.id, getSubmissionIdByUserId(assignment.submissionList, user))"
                    >
                      <div v-if="getUserGrade(assignment.submissionList, user, false)" class="text-gray-800 font-semibold">
                        {{ getUserGrade(assignment.submissionList, user, false) }} / {{ assignment.maxPoints }}
                      </div>
                    </div>
                  </fwb-table-cell>
                </fwb-table-row>
              </template>
            </fwb-table-body>
          </fwb-table>
        </template>
      </TabPanel>
      <TabPanel value="1">
          <div v-if="!isLoadingAssignments && assignmentList.length > 0" class="overflow-x-auto">
            <div class="mb-4">
              <div class="flex flex-wrap gap-2">
                <template v-for="(assignment, index) in assignmentBlackList" :key="index">
                  <Tag
                    v-if="assignment.isGroup"
                    :value="assignment.title"
                    @click="restoreColumn(assignment)"
                    severity="danger"
                    class="cursor-pointer transition ease-in-out duration-200 hover:bg-red-500 hover:text-white"
                  />
                </template>
              </div>
            </div>
          </div>
          
          <SkeletonTable :isLoadingAssignments="isLoadingAssignments"></SkeletonTable>
          <template v-if="!isLoadingAssignments">
            <fwb-table class="border-collapse border-slate-400">
              <fwb-table-head class="bg-gray-100 text-gray-700">
                <fwb-table-head-cell class="border px-4 py-2 w-1/4">Grupos</fwb-table-head-cell>
                <fwb-table-head-cell class="text-center bg-white border px-4 py-2 w-1/4">Promedio</fwb-table-head-cell>
        
                <template v-for="(assignment, assignmentIndex) in assignmentList">
                  <fwb-table-head-cell
                    :key="assignment.id"
                    v-if="displayColumn(assignment, true)"
                    :class="{
                      'bg-gray-100': assignmentIndex % 2 === 0,
                      'bg-white': assignmentIndex % 2 !== 0
                    }"
                    class="max-w-[250px] truncate border px-4 py-2"
                  >
                    <div class="flex items-center gap-x-4">
                      <div
                        class="max-w-[150px] truncate font-semibold"
                        v-tooltip.top="assignment.title.length > 21 ? assignment.title : ''"
                        style="text-transform: none;"
                        @click="openAssignmentModal(assignment)"
                      >
                        {{ assignment.title }}
                      </div>
                      <i @click="deleteColumn(assignment)" class="cursor-pointer pi pi-times transition ease-in-out duration-200 text-gray-500 hover:text-black"></i>
                    </div>
                  </fwb-table-head-cell>
                </template>
              </fwb-table-head>
        
              <fwb-table-body>
                <fwb-table-row
                  v-for="(group, groupIndex) in groupList"
                  :key="group.id"
                >
                  <fwb-table-cell class="border px-4 py-2 text-gray-800"
                  :class="{
                    'bg-gray-100': groupIndex % 2 !== 0,
                    'bg-white': groupIndex % 2 === 0
                  }">
                    <div class="max-w-[150px] truncate" v-tooltip.right="group.name.length > 21 ? group.name : ''">
                      {{ group.name }}
                    </div>
                  </fwb-table-cell>
        
                  <fwb-table-cell class="relative border px-4 py-2"
                  :class="{
                    'bg-gray-100': groupIndex % 2 !== 0,
                    'bg-white': groupIndex % 2 === 0
                  }">
                    <div class="absolute inset-0 w-full h-full flex items-center justify-center transition ease-in-out duration-200 font-semibold">
                      {{ calculateUserAverage(group, true) || 'N/A' }}
                    </div>
                  </fwb-table-cell>
        
                  <template v-for="(assignment, assignmentIndex) in assignmentList">
                    <fwb-table-cell
                      v-if="displayColumn(assignment, true)"
                      :key="assignment.id + group.id"
                      class="relative border border-white px-4 py-2"
                      :class="{
                        'border-b-0': groupIndex === groupList.length - 1,
                        'border-r-0': assignmentIndex === assignmentList.length - 1
                      }"
                    >
                      <div
                        class="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer transition ease-in-out duration-200"
                        :class="{
                          'bg-red-100 hover:bg-red-400': isNoSubmission(assignment.submissionList, group, true),
                          'bg-blue-100 hover:bg-blue-400': isSubmittedNotGraded(assignment.submissionList, group, true),
                          'bg-emerald-200 hover:bg-emerald-500': isGraded(assignment.submissionList, group, true),
                        }"
                        @click="buildLinkToSakaiGrader(assignment.id, getSubmissionIdByUserId(assignment.submissionList, group))"
                      >
                        <div v-if="getUserGrade(assignment.submissionList, group, true)" class="text-gray-800 font-semibold">
                          {{ getUserGrade(assignment.submissionList, group, true) }} / {{ assignment.maxPoints }}
                        </div>
                      </div>
                    </fwb-table-cell>
                  </template>
                </fwb-table-row>
              </fwb-table-body>
            </fwb-table>
          </template>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup>
import 'primeicons/primeicons.css';
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import {
  FwbA,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
} from 'flowbite-vue';
import Cookies from 'js-cookie';
import Site from '../classes/Site';
import Assignment from '../classes/Assignment';
import Group from '../classes/Group';
import Submitter from '../classes/Submitter';
import Submission from '../classes/Submission';
import User from '../classes/User';
import { redirectTo } from '@/utils/helper';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import SkeletonTable from './SkeletonTable.vue';

const route = useRoute();
const router = useRouter();

const siteId = ref(route.params.siteId);
const userList = ref([]);
const assignmentList = ref([]);
const groupList = ref([]);

const isLoadingAssignments = ref(true);
const isLoadingGroups = ref(true);


const assignmentBlackList = ref([]);
const isModalVisible = ref(false);
const selectedAssignment = ref({});
const selectedGroup = ref({});

onMounted(() => {
  getAssignments(siteId.value);
  getGroups(siteId.value);
});

const openAssignmentModal = (assignment) => {
  selectedAssignment.value = assignment;
  isModalVisible.value = true;
}

const returnToSites = () => {
  redirectTo(router, 'sites');
};

const getSubmissionIdByUserId = (submissionList, user) => {
  for (const submission of submissionList) {
    for (const submitter of submission.submitterList) {
      if (submitter.id === user.id) {
        return submission.id;
      }
    }
  }
  return null;
};

// Check if the submission is not present
const isNoSubmission = (submissionList, entity, isGroupRelease) => {
  const grade = getUserGrade(submissionList, entity, isGroupRelease);
  return grade === null || grade === undefined;
};

// Check if the submission is submitted but not graded
const isSubmittedNotGraded = (submissionList, entity, isGroupRelease) => {
  const grade = getUserGrade(submissionList, entity, isGroupRelease);
  return grade === '';
};

// Check if the submission is graded
const isGraded = (submissionList, entity, isGroupRelease) => {
  const grade = getUserGrade(submissionList, entity, isGroupRelease);
  return grade !== null && grade !== undefined && grade !== '';
};

// Get user grade
const getUserGrade = (submissionList, entity, isGroupRelease) => {
  for (const submission of submissionList) {
    if (isGroupRelease) {
      if (submission.group && submission.group.id === entity.id) {
        let grade = submission.points;
        return grade ? grade : "";
      }
    } else {
      for (const submitter of submission.submitterList) {
        if (submitter.id === entity.id) {
          let grade = submitter.grade;
          return grade ? grade : "";
        }
      }
    }
  }
  return null;
};

// Fetch users by site ID
const getUsersBySiteId = async (siteId) => {
  const url = `/api/direct/site/${siteId}/memberships.json`;
  try {
    const response = await axios.get(url, { withCredentials: true });
    const users = response.data.membership_collection;

    userList.value = users
      .filter(user => user.userId && user.userDisplayName && user.memberRole !== "maintain")
      .map(user => new User(user.userId, user.userDisplayName));
  } catch (error) {
    console.error("Error retrieving users:", error.response);
  }
};

const getGroups = async (siteId) => {
  const url = `/api/direct/site/${siteId}/groups.json`;

  try {
    const response = await axios.get(url, { withCredentials: true });
    const groups = response.data;

    groupList.value = await Promise.all(groups.map(async (group) => {
      return new Group(group.id, group.title, group.users);
    }));

    isLoadingGroups.value = false;
  } catch (error) {
    console.error("Error retrieving groups:", error.response);
  }
}

// Fetch assignments by site ID
const getAssignments = async (siteId) => {
  const url = `/api/direct/assignment/site/${siteId}.json`;
  try {
    const response = await axios.get(url, { withCredentials: true });
    const assignments = response.data.assignment_collection;

    assignmentList.value = await Promise.all(assignments.map(async (assignment) => {
      const submissionList = await Promise.all(
        (assignment.submissions || []).map(async submission => {
          const group = submission.groupId ? await getGroupBySiteIdAndGroupId(siteId, submission.groupId) : null;
          const submitterList = (submission.submitters || []).map(submitter => new Submitter(submitter.id, submitter.displayName, parseToDouble(submitter.grade)));
          return new Submission(submission.id, group, parseToDouble(submission.grade), submitterList);
        })
      );
      return new Assignment(assignment.id, assignment.title, parseToDouble(assignment.gradeScaleMaxPoints), !!assignment.groups?.length, submissionList);
    }));

    assignmentList.value.sort((a, b) => a.title.localeCompare(b.title));
    await getUsersBySiteId(siteId);
    setTimeout(() => {
      isLoadingAssignments.value = false;
    }, 5000);
  } catch (error) {
    console.error("Error retrieving assignments:", error.response);
  }
};

// Fetch group by site ID and group ID
const getGroupBySiteIdAndGroupId = async (siteId, groupId) => {
  const url = `/api/direct/site/${siteId}/group/${groupId}.json`;
  try {
    const response = await axios.get(url, { withCredentials: true });
    return response.data && response.data.title ? new Group(groupId, response.data.title) : null;
  } catch (error) {
    console.error("Error retrieving group:", error.response);
    return null;
  }
};

const calculateUserAverage = (entity, isGroupRelease) => {
  const filteredAssignments = assignmentList.value.filter(assignment => !assignmentBlackList.value.includes(assignment.id));

  const grades = filteredAssignments.map(assignment => getUserGrade(assignment.submissionList, entity, isGroupRelease));
  const validGrades = grades.filter(grade => grade !== null && grade !== undefined && !isNaN(grade) && grade !== "");

  return validGrades.length ? (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2) : null;
};

const calculateAssignmentAverage = () => {
  const grades = selectedAssignment.value.submissionList.map(submission => parseFloat(submission.points)); // Replace comma with dot and convert to float
  const totalGrades = grades.reduce((sum, grade) => sum + grade, 0);
  return grades.length > 0 ? (totalGrades / grades.length).toFixed(2).replace('.', ',') : 'N/A'; // Return the average in the "3,56" format
};

// Build link to Sakai Grader
const buildLinkToSakaiGrader = (assignmentId, submissionId) => {
  const baseUrl = `${import.meta.env.VITE_SAKAI_URL}/portal/site/${siteId.value}/tool/6be88365-9f22-4faf-94c5-f549104c7928?assignmentId=/assignment/a/${siteId.value}/${assignmentId}&submissionId=/assignment/s/${siteId.value}/${assignmentId}/${submissionId}&panel=Main&sakai_action=doGrade_submission`;
  window.open(baseUrl, '_blank');
};

const displayColumn = (assignment, filterByGroup) => {
  if (assignmentBlackList.value.includes(assignment.id)) {
    return false;
  } else {
    if (filterByGroup) {
      if (assignment.isGroup) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}

const deleteColumn = (assignment) => {
  if (!assignmentBlackList.value.includes(assignment)) {
    assignmentBlackList.value.push(assignment);
  }

  assignmentList.value = assignmentList.value.filter(assignmentFromList => assignmentFromList.id !== assignment.id);
};

// Restore a column by removing it from the assignmentBlackList
const restoreColumn = (assignment) => {
  assignmentList.value.push(assignment);
  assignmentList.value.sort((a, b) => a.title.localeCompare(b.title));

  assignmentBlackList.value = assignmentBlackList.value.filter(blackListAssignment => blackListAssignment !== assignment);
};

const isUserInGroup = (userId) => {
  if (selectedGroup && selectedGroup.value && selectedGroup.value.userList && selectedGroup.value.userList.length > 0) {
    if (selectedGroup.value.userList.includes(userId)) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

function parseToDouble(value) {
  if (value === null || value === undefined || value === "") {
    // Return null if value is null, undefined, or an empty string
    return null;
  }

  // Replace the comma with a dot to handle decimal formatting
  const stringValue = value.replace(",", ".");

  // Parse the string to a float
  const parsedValue = parseFloat(stringValue);

  // If parsing fails (returns NaN), return null
  if (isNaN(parsedValue)) {
    return null;
  }

  // Return the parsed value, optionally formatting to two decimals
  return Number(parsedValue.toFixed(2));
}

</script>

<style>

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>