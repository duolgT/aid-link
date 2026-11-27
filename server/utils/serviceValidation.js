export const validateService = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push('Service name must be at least 3 characters');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!data.servicesOffered || !Array.isArray(data.servicesOffered) || data.servicesOffered.length === 0) {
    errors.push('At least one service must be offered');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmergencyGuide = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.summary || data.summary.trim().length < 10) {
    errors.push('Summary must be at least 10 characters');
  }

  if (!data.steps || !Array.isArray(data.steps) || data.steps.length < 2) {
    errors.push('At least 2 steps are required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
