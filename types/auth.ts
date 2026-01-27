export type Role = string;

export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  locations: string[];
  password?: string;
};
