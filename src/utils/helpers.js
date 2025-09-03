const moment = require('moment');

const generateId = (prefix) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}-${timestamp.slice(-6)}-${random}`;
};

const generateProjectId = () => generateId('PROJ');
const generatePONumber = () => generateId('PO');
const generateQuotationId = () => generateId('QUO');
const generateVoucherNumber = () => generateId('VCH');

const calculateDateDifference = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

const isDeadlineApproaching = (deadline, daysThreshold = 3) => {
  const daysUntilDeadline = moment(deadline).diff(moment(), 'days');
  return daysUntilDeadline <= daysThreshold && daysUntilDeadline >= 0;
};

const isOverdue = (deadline) => {
  return moment().isAfter(moment(deadline));
};

const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateContractNumber = (projectId) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `CON-${year}${month}-${projectId}`;
};

module.exports = {
  generateProjectId,
  generatePONumber,
  generateQuotationId,
  generateVoucherNumber,
  generateContractNumber,
  calculateDateDifference,
  formatDate,
  isDeadlineApproaching,
  isOverdue,
  calculateProgress,
  validateEmail
};