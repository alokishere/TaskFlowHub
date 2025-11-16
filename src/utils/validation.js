export const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateTaskForm = (formData) => {
  const errors = {};

  if (!formData.taskTitle?.trim()) {
    errors.taskTitle = 'Task title is required';
  } else if (formData.taskTitle.trim().length > 200) {
    errors.taskTitle = 'Task title cannot exceed 200 characters';
  }

  if (!formData.taskDescription?.trim()) {
    errors.taskDescription = 'Task description is required';
  } else if (formData.taskDescription.trim().length > 1000) {
    errors.taskDescription = 'Task description cannot exceed 1000 characters';
  }

  if (!formData.taskDate) {
    errors.taskDate = 'Task date is required';
  }

  if (!formData.category?.trim()) {
    errors.category = 'Category is required';
  } else if (formData.category.trim().length > 50) {
    errors.category = 'Category cannot exceed 50 characters';
  }

  if (!formData.assignedTo) {
    errors.assignedTo = 'Please assign the task to someone';
  }

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formData.password?.trim()) {
    errors.password = 'Password is required';
  }

  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (!validateName(formData.firstName)) {
    errors.firstName = 'First name must be between 2 and 50 characters';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formData.password?.trim()) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};