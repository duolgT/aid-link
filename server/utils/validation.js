export const validateReport = (data) => {
  const errors = [];

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required');
  }

  if (!data.title || data.title.trim().length < 6) {
    errors.push('Title must be at least 6 characters');
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!data.organizationId) {
    errors.push('Organization ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateOrganization = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Organization name must be at least 2 characters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.sector) {
    errors.push('Sector is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
