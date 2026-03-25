export type AuthUser = {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
};
