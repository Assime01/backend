// utils/apiResponse.js

function successResponse(res, message, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode
    });
  }

  function errorResponse(res, message, errors = [], statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode
    });
  }
  
  module.exports = { successResponse, errorResponse };
  