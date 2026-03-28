export const isValidEmail = (email = '') => /^\S+@\S+\.\S+$/.test(email);

export const isValidPassword = (password = '') => password.length >= 6;

export const required = (value = '') => value.trim().length > 0;
