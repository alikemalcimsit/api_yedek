/**
 * User System Role Constants
 * Database'de tuttuğumuz rol değerleri
 */
export const USER_ROLES = {
    AGENT: '0',
    ADMIN: '1', 
    SUPER_ADMIN: '2'
};

/**
 * Rol isimlerini almak için mapping
 */
export const ROLE_NAMES = {
    [USER_ROLES.AGENT]: 'Agent',
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin'
};

/**
 * Rol grup tanımları - sık kullanılan kombinasyonlar
 */
export const ROLE_GROUPS = {
    // Sadece adminler (Admin + Super Admin)
    ADMINS_ONLY: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    
    // Sadece super adminler
    SUPER_ADMINS_ONLY: [USER_ROLES.SUPER_ADMIN],
    
    // Tüm yetkililer (Admin + Super Admin + Agent)
    ALL_AUTHORIZED: [USER_ROLES.AGENT, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    
    // Yönetici seviyesi (Admin + Super Admin)
    MANAGEMENT_LEVEL: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]
};

/**
 * Rol kontrolü yardımcı fonksiyonları
 */
export const roleHelpers = {
    /**
     * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
     * @param {string|number} userRole - Kullanıcının rolü
     * @param {string} requiredRole - Gerekli rol
     * @returns {boolean}
     */
    hasRole: (userRole, requiredRole) => {
        return String(userRole) === String(requiredRole);
    },

    /**
     * Kullanıcının belirli rollerden birine sahip olup olmadığını kontrol eder
     * @param {string|number} userRole - Kullanıcının rolü
     * @param {Array} allowedRoles - İzin verilen roller
     * @returns {boolean}
     */
    hasAnyRole: (userRole, allowedRoles) => {
        const userRoleStr = String(userRole);
        const allowedRolesStr = allowedRoles.map(role => String(role));
        return allowedRolesStr.includes(userRoleStr);
    },

    /**
     * Kullanıcının admin yetkisi olup olmadığını kontrol eder
     * @param {string|number} userRole - Kullanıcının rolü
     * @returns {boolean}
     */
    isAdmin: (userRole) => {
        return roleHelpers.hasAnyRole(userRole, ROLE_GROUPS.ADMINS_ONLY);
    },

    /**
     * Kullanıcının super admin yetkisi olup olmadığını kontrol eder
     * @param {string|number} userRole - Kullanıcının rolü
     * @returns {boolean}
     */
    isSuperAdmin: (userRole) => {
        return roleHelpers.hasRole(userRole, USER_ROLES.SUPER_ADMIN);
    },

    /**
     * Kullanıcının agent olup olmadığını kontrol eder
     * @param {string|number} userRole - Kullanıcının rolü
     * @returns {boolean}
     */
    isAgent: (userRole) => {
        return roleHelpers.hasRole(userRole, USER_ROLES.AGENT);
    },

    /**
     * Rol adını döner
     * @param {string|number} userRole - Kullanıcının rolü
     * @returns {string}
     */
    getRoleName: (userRole) => {
        return ROLE_NAMES[String(userRole)] || 'Bilinmeyen Rol';
    }
};