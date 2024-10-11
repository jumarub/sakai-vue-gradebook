<template>
	<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Inicio de sesión</h2>
	  </div>
  
	  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6" @submit.prevent="login">
		  <div>
			<label for="email" class="block text-sm font-medium leading-6 text-gray-900">Identificador</label>
			<div class="mt-2">
			  <input type="text" v-model="username" required
				class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
			</div>
		  </div>
  
		  <div>
			<div class="flex items-center justify-between">
			  <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
			</div>
			<div class="mt-2">
			  <input id="password" v-model="password" type="password" required
				class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
			</div>
		  </div>
  
		  <div>
			<button type="submit"
			  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Login</button>
		  </div>
		</form>
	  </div>
	</div>
</template>
  
<script>
import axios from 'axios';
import Cookies from 'js-cookie';

	export default {
		data() {
			return {
				username: '',
				password: '',
			};
		},
		computed: {
			// Computed property that checks if both fields have values
			isDisabled() {
			return !this.username || !this.password;
			}
		},
		methods: {
			async login() {
				try {
					const response = await axios.get('/api/sakai-ws/rest/login/login', {
						params: {
							id: this.username,
							pw: this.password,
						},
					});

					const token = response.data;

					if (token != undefined && token.trim() !== "") {
						// Nombre de la cookie puede cambiar, depende del sakai.properties del servidor
						// Id del servidor puede cambiar
						Cookies.set('JSESSIONID', response.data + '.EDFPC-010', { path: '/', secure: true });

						this.$router.push('/sites');
					} else {
						// ERROR HANDLER
					}
				} catch (error) {
					console.error('Login Error:', error);
				}
			}
		},
	};
</script>