

export const validateField = (name, value, formData) => {
  const regexPatterns = {
    postingTitle: /^[A-Za-z0-9\s.,'-]{3,100}$/,
    title: /^[A-Za-z\s]+$/,
    departmentName: /^[A-Za-z\s]+$/,
    numOfPositions: /^[1-9][0-9]*$/,
    dateOpened: /^\d{4}-\d{2}-\d{2}$/,
    city: /^[A-Za-z\s]+$/,
    state: /^[A-Za-z\s]+$/,
    country: /^[A-Za-z\s]+$/,
    pin: /^[0-9]{6}$/,
    workExpInYear: /^\d{1,2}$/,
    workExpInMonth: /^\d{1,2}$/,
    jobDescription: /^.{5,1000}$/,
    phoneNumber: /^\+?\d{10,15}$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  };

  switch (name) {
    case 'postingTitle':
      if (!value.trim()) return 'Posting Title is required.';
      if (!regexPatterns.postingTitle.test(value)) return 'Posting Title is invalid. (3-100 characters, letters, numbers, and special characters like .,\'-)';
      return '';
    case 'title':
      if (!value.trim()) return 'Job Title is required.';
      if (!regexPatterns.title.test(value)) return 'Job Title is invalid. (Only letters and spaces allowed)';
      return '';
    case 'departmentName':
      if (!value.trim()) return 'Department is required.';
      if (!regexPatterns.departmentName.test(value)) return 'Department Name is invalid. (Only letters and spaces allowed)';
      return '';

    case 'numOfPositions':
      if (!value || value <= 0) return 'Number of Positions must be greater than 0.';
      if (!regexPatterns.numOfPositions.test(value)) return 'Number of Positions is invalid. (Positive integer required)';
      return '';
    case 'dateOpened':
      if (!value) return 'Date Opened is required.';
      if (!regexPatterns.dateOpened.test(value)) return 'Date Opened is invalid. (Format: YYYY-MM-DD)';
      return '';
    case 'city':
      if (!value.trim()) return 'City is required.';
      if (!regexPatterns.city.test(value)) return 'City is invalid. (Only letters and spaces allowed)';
      return '';
    case 'state':
      if (!value.trim()) return 'State is required.';
      if (!regexPatterns.state.test(value)) return 'State is invalid. (Only letters and spaces allowed)';
      return '';
    case 'country':
      if (!value.trim()) return 'Country is required.';
      if (!regexPatterns.country.test(value)) return 'Country is invalid. (Only letters and spaces allowed)';
      return '';
    case 'pin':
      if (!value.trim()) return 'Pin Code is required.';
      if (!regexPatterns.pin.test(value)) return 'Pin Code is invalid. (6-digit number required)';
      return '';
    
    case 'workExpInYear':
      if (value < 0) return 'Minimum experience cannot be negative.';
      if (!regexPatterns.workExpInYear.test(value)) return 'Minimum Experience is invalid. (Only numbers allowed)';
      return '';
    case 'workExpInMonth':
      if (value < 0) return 'Maximum experience cannot be negative.';
      if (!regexPatterns.workExpInMonth.test(value)) return 'Maximum Experience is invalid. (Only numbers allowed)';
      return '';

    case 'jobDescription':
      if (value.length < 5) return 'Job description should be at least 5 characters long.';
      if (!regexPatterns.jobDescription.test(value)) return 'Job Description is invalid. (Minimum 5 characters, maximum 1000)';
      return '';
    case 'phoneNumber':
      if (value && !regexPatterns.phoneNumber.test(value)) return 'Phone Number is invalid. (Should be 10-15 digits)';
      return '';
    case 'email':
      if (value && !regexPatterns.email.test(value)) return 'Email is invalid. (Valid email format required)';
      return '';
    default:
      return '';
  }
};

export const validateForm = (formData) => {
  const errors = {};
  let formIsValid = true;

  for (const field in formData) {
    const value = formData[field];

    if (field === 'workExp') {
      const workExpInYearError = validateField('workExpInYear', value.workExpInYear, formData);
      const workExpInMonthError = validateField('workExpInMonth', value.workExpInMonth, formData);

      if (workExpInYearError) {
        errors.workExpInYear = workExpInYearError;
        formIsValid = false;
      }
      if (workExpInMonthError) {
        errors.workExpInMonth = workExpInMonthError;
        formIsValid = false;
      }
    } else if (field === 'address') {
      const addressFields = ['city', 'state', 'country', 'pin'];
      addressFields.forEach(addressField => {
        const error = validateField(addressField, value[addressField], formData);
        if (error) {
          errors[`address${addressField.charAt(0).toUpperCase() + addressField.slice(1)}`] = error;
          // formIsValid = false;
        }
      });
    } else {
      const error = validateField(field, value, formData);
      if (error) {
        errors[field] = error;
        formIsValid = false;
      }
    }
  }

  return { errors, formIsValid };
};



export const validateOrganizationForm = (formData) => {
  const errors = {};
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const phoneRegex = /^[6-9][0-9]{9}$/;
  const nameRegex = /^[A-Za-z\s]+$/;

  const validationRules = {
    phone_number: {
      regex: phoneRegex,
      errorMessage: 'Phone number must start with 6, 7, 8, or 9 and contain only digits.',
      minLength: 10,
      maxLength: 15
    },
    email: {
      regex: emailRegex,
      errorMessage: 'Please enter a valid professional email address.'
    },
    name: {
      regex: nameRegex,
      errorMessage: 'Name must be at least 3 characters and contain only letters and spaces.',
      minLength: 3
    },
    organization_name: {
      minLength: 3,
      errorMessage: 'Organization name is required and should be at least 3 characters.'
    },
    organization_address: {
      minLength: 5,
      errorMessage: 'Organization address is required and should be at least 5 characters.'
    },
    organization_contact: {
      email: {
        regex: emailRegex,
        errorMessage: 'Please enter a valid email address for the organization.'
      }
    },
    
  };

  Object.keys(formData).forEach((field) => {
    if (field === 'organization_contact') {
      Object.keys(formData[field]).forEach((subField) => {
        const value = formData[field][subField];
        const rules = validationRules[field]?.[subField];

        if (rules?.regex && !rules.regex.test(value)) {
          errors[`${field}.${subField}`] = rules.errorMessage;
        } else if (rules?.minLength && value.length < rules.minLength) {
          errors[`${field}.${subField}`] = rules.errorMessage;
        }
      });
    } else if (field === 'organization_logo') {
      if (formData.organization_logo && !formData.organization_logo.startsWith('data:image/')) {
        errors.organization_logo = 'Invalid image format. Upload jpeg, jpg, png, svg, webp, or gif.';
      }
    } else {
      const value = formData[field];
      const rules = validationRules[field];

      if (rules?.regex && !rules.regex.test(value)) {
        errors[field] = rules.errorMessage;
      } else if (rules?.minLength && value.length < rules.minLength) {
        errors[field] = rules.errorMessage;
      } else if (rules?.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} cannot exceed ${rules.maxLength} characters.`;
      }
    }
  });

  return errors;
};
