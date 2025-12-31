export type Role = "ADMIN" | "USER" | "AGENT";
export const checkRole = (user: any, role: Role) => user.role === role;
