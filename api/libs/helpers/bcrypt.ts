import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  firstPassword: string,
  secondPassword: string,
) => {
  return await bcrypt.compare(firstPassword, secondPassword);
};
