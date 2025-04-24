export const authorizedUser = (user, roles, permission) => {
	if (!roles && !permission) return false;
	// console.log(user)

	let roleValid = false;
	let permissionValid = false;

	if (roles && roles.length > 0) {
		roleValid = roles.includes(user.userRole);
	}

	if (permission && user.permissions.length > 0) {
		permissionValid = user.permissions.includes(permission);
	}

	return roleValid || permissionValid;
};
