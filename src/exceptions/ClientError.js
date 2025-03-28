class ClientError extends Error {
    constructor(message, statusCode = 400) {
      super(`Failed. ${message}`);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
    }
  }
  
  module.exports = ClientError;