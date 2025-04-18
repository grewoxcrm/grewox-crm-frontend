export const parsePermissions = (permissionsString) => {
    if (!permissionsString) return {};

    try {
        return typeof permissionsString === 'string' ?
            JSON.parse(permissionsString) : permissionsString;
    } catch (error) {
        console.error('Error parsing permissions:', error);
        return {};
    }
};

export const hasPermission = (permissions, module) => {
    if (!permissions || !module) return false;

    try {
        const parsedPermissions = parsePermissions(permissions);
        return !!parsedPermissions[module];
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

export const COMMON_MODULES = ['dashboards-chat', 'dashboards-mail', 'extra-pages-customersupports-ticket']; 