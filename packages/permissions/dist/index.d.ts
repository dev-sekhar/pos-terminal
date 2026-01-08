export declare const ROLES: {
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly CASHIER: "CASHIER";
};
export declare const permissions: {
    VIEW_SALES: ("ADMIN" | "MANAGER" | "CASHIER")[];
    VIEW_PURCHASES: ("ADMIN" | "MANAGER")[];
    VIEW_INVENTORY: ("ADMIN" | "MANAGER" | "CASHIER")[];
    VIEW_PRODUCTS: ("ADMIN" | "MANAGER" | "CASHIER")[];
    VIEW_SUPPLIERS: ("ADMIN" | "MANAGER")[];
    VIEW_BRANCHES: "ADMIN"[];
    VIEW_REPORTS: ("ADMIN" | "MANAGER")[];
    VIEW_USERS: ("ADMIN" | "MANAGER")[];
    VIEW_SETTINGS: "ADMIN"[];
    MANAGE_USERS: "ADMIN"[];
    MANAGE_BRANCHES: "ADMIN"[];
    MANAGE_PRODUCTS: "ADMIN"[];
    MANAGE_CATEGORIES: "ADMIN"[];
    MANAGE_INVENTORY: ("ADMIN" | "MANAGER")[];
    MANAGE_PURCHASES: ("ADMIN" | "MANAGER")[];
    MANAGE_SUPPLIERS: ("ADMIN" | "MANAGER")[];
    MANAGE_SETTINGS: "ADMIN"[];
    CREATE_SALES: ("ADMIN" | "MANAGER" | "CASHIER")[];
    MANAGE_SALES_RECORDS: ("ADMIN" | "MANAGER")[];
};
export declare const can: (userRole: string | undefined, permission: keyof typeof permissions) => boolean;
//# sourceMappingURL=index.d.ts.map