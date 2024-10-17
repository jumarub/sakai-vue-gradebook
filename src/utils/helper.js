export function redirectTo(router, name, params) {
	if (name !== null) {
		const route = { name: name };

		if (params !== null) {
			route.params = params;
		}
		router.push(route);
	}
}