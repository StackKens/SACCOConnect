export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
export const validatePhone = (phone: string): boolean => {
  const re = /^[+][0-9]{10,15}$/;
  return re.test(phone);
};
export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};
