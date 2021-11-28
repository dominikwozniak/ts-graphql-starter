export const createForgotPasswordUrl = (token: string) => {
  return `http://localhost:3000/forgot-password/${token}`;
};
