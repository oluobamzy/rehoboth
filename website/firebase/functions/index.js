// Firebase Functions Index
// Exports all Cloud Functions for the Rehoboth Church website

const tempFileFunctions = require('./cleanupTempFiles');

// Export all functions
module.exports = {
  // Temporary file cleanup functions
  cleanupTempFiles: tempFileFunctions.cleanupTempFiles,
  markTempFileUpload: tempFileFunctions.markTempFileUpload,
  
  // Add other function exports here as they are developed
};
