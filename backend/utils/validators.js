const mongoose = require('mongoose');

const CAMPAIGN_CATEGORIES = [
  'Medical',
  'Education',
  'Food',
  'Shelter',
  'Emergency',
  'Environment',
  'Children',
  'Other'
];

const CAMPAIGN_STATUSES = ['Active', 'Completed', 'Paused', 'Cancelled'];
const NGO_STATUSES = ['Pending', 'Approved', 'Rejected'];
const DONATION_PAYMENT_METHODS = ['creditCard', 'paypal', 'bankTransfer'];

const CATEGORY_ALIASES = {
  emergency: 'Emergency',
  'emergency relief': 'Emergency',
  'disaster relief': 'Emergency',
  healthcare: 'Medical',
  health: 'Medical',
  medical: 'Medical',
  education: 'Education',
  food: 'Food',
  'food aid': 'Food',
  shelter: 'Shelter',
  environment: 'Environment',
  children: 'Children',
  'children & youth': 'Children',
  other: 'Other',
  'water & sanitation': 'Other'
};

const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};

const validatePhone = (phone) => {
  if (typeof phone !== 'string') return false;
  return /^\+?[0-9\s().-]{7,20}$/.test(phone.trim());
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanString = (value, maxLength = 500) => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'string' ? value : String(value);
  return text.trim().slice(0, maxLength);
};

const normalizeCategory = (category) => {
  if (typeof category !== 'string') return category;
  const value = category.trim();
  return CATEGORY_ALIASES[value.toLowerCase()] || value;
};

const parsePositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include at least one letter and one number';
  }

  return null;
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return start < end;
};

const validateCampaignData = (data, options = {}) => {
  const partial = Boolean(options.partial);
  const errors = [];
  const value = {};

  if (!partial || data.title !== undefined) {
    value.title = cleanString(data.title, 120);
    if (!value.title) errors.push('Title is required');
  }

  if (!partial || data.description !== undefined) {
    value.description = cleanString(data.description, 4000);
    if (!value.description) errors.push('Description is required');
  }

  if (!partial || data.ngoId !== undefined) {
    value.ngoId = cleanString(data.ngoId, 64);
    if (!value.ngoId || !isValidObjectId(value.ngoId)) {
      errors.push('A valid NGO ID is required');
    }
  }

  if (!partial || data.targetAmount !== undefined) {
    value.targetAmount = parsePositiveNumber(data.targetAmount);
    if (!Number.isFinite(value.targetAmount) || value.targetAmount <= 0) {
      errors.push('Target amount must be greater than 0');
    }
  }

  if (data.collectedAmount !== undefined) {
    value.collectedAmount = parsePositiveNumber(data.collectedAmount);
    if (!Number.isFinite(value.collectedAmount) || value.collectedAmount < 0) {
      errors.push('Collected amount cannot be negative');
    }
  }

  if (!partial || data.category !== undefined) {
    value.category = normalizeCategory(data.category);
    if (!CAMPAIGN_CATEGORIES.includes(value.category)) {
      errors.push(`Category must be one of: ${CAMPAIGN_CATEGORIES.join(', ')}`);
    }
  }

  if (data.status !== undefined) {
    value.status = cleanString(data.status, 30);
    if (!CAMPAIGN_STATUSES.includes(value.status)) {
      errors.push(`Status must be one of: ${CAMPAIGN_STATUSES.join(', ')}`);
    }
  }

  if (!partial || data.startDate !== undefined) {
    value.startDate = data.startDate;
    if (!value.startDate || Number.isNaN(new Date(value.startDate).getTime())) {
      errors.push('A valid start date is required');
    }
  }

  if (!partial || data.endDate !== undefined) {
    value.endDate = data.endDate;
    if (!value.endDate || Number.isNaN(new Date(value.endDate).getTime())) {
      errors.push('A valid end date is required');
    }
  }

  if (value.startDate && value.endDate && !validateDateRange(value.startDate, value.endDate)) {
    errors.push('End date must be after start date');
  }

  if (data.image !== undefined) {
    value.image = cleanString(data.image, 1000) || null;
  }

  return {
    isValid: errors.length === 0,
    errors,
    value
  };
};

const validateNGOData = (data, options = {}) => {
  const partial = Boolean(options.partial);
  const errors = [];
  const value = {};

  if (!partial || data.name !== undefined) {
    value.name = cleanString(data.name, 120);
    if (!value.name) errors.push('Name is required');
  }

  if (!partial || data.email !== undefined) {
    value.email = cleanString(data.email, 254).toLowerCase();
    if (!validateEmail(value.email)) errors.push('A valid email is required');
  }

  if (!partial || data.phone !== undefined) {
    value.phone = cleanString(data.phone, 30);
    if (!validatePhone(value.phone)) errors.push('A valid phone number is required');
  }

  if (!partial || data.registrationNumber !== undefined) {
    value.registrationNumber = cleanString(data.registrationNumber, 80);
    if (!value.registrationNumber) errors.push('Registration number is required');
  }

  if (data.description !== undefined) {
    value.description = cleanString(data.description, 4000);
  }

  if (data.website !== undefined) {
    value.website = cleanString(data.website, 500) || null;
  }

  if (data.documents !== undefined) {
    value.documents = Array.isArray(data.documents) ? data.documents : [];
  }

  if (data.status !== undefined) {
    value.status = cleanString(data.status, 30);
    if (!NGO_STATUSES.includes(value.status)) {
      errors.push(`Status must be one of: ${NGO_STATUSES.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value
  };
};

const validateAuthRegistration = (data) => {
  const errors = [];
  const role = cleanString(data.role || data.userType || 'donor', 20).toLowerCase();
  const passwordError = validatePassword(data.password);

  const value = {
    name: cleanString(data.name, 120),
    email: cleanString(data.email, 254).toLowerCase(),
    role,
    password: data.password
  };

  if (!value.name) errors.push('Name is required');
  if (!validateEmail(value.email)) errors.push('A valid email is required');
  if (!['donor', 'ngo', 'admin'].includes(role)) errors.push('Role must be donor, ngo, or admin');
  if (passwordError) errors.push(passwordError);

  if (role === 'ngo') {
    value.ngo = validateNGOData({
      name: data.organizationName || data.name,
      email: data.email,
      phone: data.phone,
      registrationNumber: data.registrationNumber,
      description: data.description,
      website: data.website
    }).value;

    const ngoValidation = validateNGOData(value.ngo);
    if (!ngoValidation.isValid) {
      errors.push(...ngoValidation.errors.map((error) => `NGO ${error.toLowerCase()}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value
  };
};

const validateDonationData = (data) => {
  const errors = [];
  const value = {
    campaignId: cleanString(data.campaignId, 64),
    amount: parsePositiveNumber(data.amount),
    message: cleanString(data.message || '', 500),
    isAnonymous: Boolean(data.isAnonymous),
    paymentMethod: cleanString(data.paymentMethod || 'creditCard', 30)
  };

  if (!value.campaignId || !isValidObjectId(value.campaignId)) {
    errors.push('A valid campaign ID is required');
  }

  if (!Number.isFinite(value.amount) || value.amount <= 0) {
    errors.push('Donation amount must be greater than 0');
  }

  if (!DONATION_PAYMENT_METHODS.includes(value.paymentMethod)) {
    errors.push(`Payment method must be one of: ${DONATION_PAYMENT_METHODS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    value
  };
};

const validateReportData = (data) => {
  const errors = [];
  const value = {
    campaignId: cleanString(data.campaignId, 64),
    title: cleanString(data.title, 160),
    description: cleanString(data.description || '', 1000),
    fileName: cleanString(data.fileName, 255),
    fileType: cleanString(data.fileType, 120),
    fileSize: parsePositiveNumber(data.fileSize),
    fileData: typeof data.fileData === 'string' ? data.fileData : ''
  };

  if (!value.campaignId || !isValidObjectId(value.campaignId)) {
    errors.push('A valid campaign ID is required');
  }

  if (!value.title) errors.push('Report title is required');
  if (!value.fileName) errors.push('Report file name is required');
  if (!value.fileData) errors.push('Report file data is required');
  if (!Number.isFinite(value.fileSize) || value.fileSize <= 0) {
    errors.push('Report file size is required');
  }

  const maxSize = Number(process.env.REPORT_MAX_BYTES) || 2 * 1024 * 1024;
  if (value.fileSize > maxSize) {
    errors.push(`Report file must be ${Math.round(maxSize / 1024 / 1024)}MB or smaller`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    value
  };
};

module.exports = {
  CAMPAIGN_CATEGORIES,
  CAMPAIGN_STATUSES,
  NGO_STATUSES,
  DONATION_PAYMENT_METHODS,
  validateEmail,
  validatePhone,
  validatePassword,
  validateDateRange,
  validateCampaignData,
  validateNGOData,
  validateAuthRegistration,
  validateDonationData,
  validateReportData,
  parsePagination,
  isValidObjectId,
  cleanString,
  normalizeCategory
};
