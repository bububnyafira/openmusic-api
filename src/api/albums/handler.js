/* eslint-disable no-undef */
const AlbumsService = require("../../services/postgres/AlbumsService");
const AlbumsValidator = require("../../validator/albums");
const ClientError = require("../../exceptions/ClientError");

class AlbumsHandler {
  constructor() {
    this._albumsService = new AlbumsService();
    this._validator = AlbumsValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const { name, year } = request.payload;
      const albumId = await this._albumsService.addAlbum({ name, year });

      const response = h.response({
        status: "success",
        message: "Album has been added",
        data: { albumId },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getAlbumByIdHandler(request, h) { // Menambahkan 'h'
    try {
      const { id } = request.params;
      const album = await this._albumsService.getAlbumWithSongsById(id);

      return {
        status: "success",
        data: { album },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async putAlbumByIdHandler(request, h) { // Menambahkan 'h'
    try {
      this._validator.validateAlbumPayload(request.payload);

      const { id } = request.params;
      await this._albumsService.editAlbumById(id, request.payload);

      return {
        status: "success",
        message: "Album has been updated",
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async deleteAlbumByIdHandler(request, h) { // Menambahkan 'h'
    try {
      const { id } = request.params;
      await this._albumsService.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album has been deleted",
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  _handleError(error, h) {
    if (error instanceof ClientError) {
      return h.response({
        status: "fail",
        message: error.message,
      }).code(error.statusCode);
    }

    console.error("Unexpected Error: ", error); // Logging lebih jelas
    return h.response({
      status: "error",
      message: "Terjadi kesalahan pada server.",
    }).code(500);
  }
}

module.exports = AlbumsHandler;
