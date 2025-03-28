/* eslint-disable no-undef */
const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(
    payload,
    process.env.ACCESS_TOKEN_KEY,
  ),
  generateRefreshToken: (payload) => Jwt.token.generate(
    payload,
    process.env.REFRESH_TOKEN_KEY,
  ),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token is not valid');
    }
  },
};

module.exports = TokenManager;