import type { Role } from "@/generated/prisma/enums";

export const permissions = {
  "note:create": ["USER", "EMPLOYEE", "ADMIN"],
  "note:delete:own": ["EMPLOYEE", "ADMIN"],
  "note:delete:any": ["ADMIN"],
  "user:promote": ["ADMIN"],
} as const satisfies Record<string, Role[]>;

export type Action = keyof typeof permissions;

export function can(role: Role, action: Action): boolean {
  return (permissions[action] as readonly Role[]).includes(role);
}
