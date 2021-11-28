export const createConfirmUserUrl = (token: string) => {
  return `http://localhost:3000/confirm-account/${token}`;
};
