<template>
	<template v-if="isLoadingAssignments">
		<fwb-table class="border-collapse border-slate-400">
		  <fwb-table-head class="bg-gray-100 text-gray-700">
			<fwb-table-head-cell class="border px-4 py-2 w-1/4">Estudiantes</fwb-table-head-cell>
			<fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">Promedio</fwb-table-head-cell>
			<fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">
			  <div role="status" class="animate-pulse">
				<div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
			  </div>
			</fwb-table-head-cell>
			<fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">
			  <div role="status" class="animate-pulse">
				<div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
			  </div>
			</fwb-table-head-cell>
			<fwb-table-head-cell class="bg-white border px-4 py-2 w-1/4">
			  <div role="status" class="animate-pulse">
				<div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
			  </div>
			</fwb-table-head-cell>
		  </fwb-table-head>
		  <fwb-table-body>
			<template v-for="n in 4" :key="n">
			  <fwb-table-row>
				<template v-for="n in 4" :key="n">
				  <fwb-table-cell class="border px-4 py-2 text-gray-800">
					<div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
				  </fwb-table-cell>
				</template>
			  </fwb-table-row>
			</template>
		  </fwb-table-body>
		</fwb-table>
	  </template>
</template>

<script setup>
	import { defineProps } from 'vue';
	import {
		FwbA,
		FwbTable,
		FwbTableBody,
		FwbTableCell,
		FwbTableHead,
		FwbTableHeadCell,
		FwbTableRow,
	} from 'flowbite-vue';

	const props = defineProps({
		isLoadingAssignments: {
			type: Boolean,
			required: true
		},
	})
</script>