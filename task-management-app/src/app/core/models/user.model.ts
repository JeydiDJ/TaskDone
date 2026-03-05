export type Users = User[];

export interface User {
  _id: string;
  email?: string;
  password?: string;
  token?: string;
  expiresIn?: number;
  __v?: number;
}