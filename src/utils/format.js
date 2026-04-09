export const formatValidationError = (errors) => {
  if (!errors) return 'Validation failed';

  if (Array.isArray(errors)) {
    return errors.map((error) => error.message).join(', ');
  }

  if (errors.issues && Array.isArray(errors.issues)) {
    return errors.issues.map((issue) => issue.message).join(', ');
  }

  return JSON.stringify(errors);
};
