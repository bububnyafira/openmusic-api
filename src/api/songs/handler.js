/* eslint-disable no-undef */
const SongsService = require("../../services/postgres/SongsService");
const SongsValidator = require("../../validator/songs");
const ClientError = require("../../exceptions/ClientError");

class SongsHandler {
  constructor() {
    this._songsService = new SongsService();
    this._validator = SongsValidator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { title, year, genre, performer, duration, albumId } =
        request.payload;
      const songId = await this._songsService.addSong({
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      });

      const response = h.response({
        status: "success",
        message: "Song has been added",
        data: { songId },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getSongsHandler(request) {
    try {
      const { title, performer } = request.query;
      const songs = await this._songsService.getSongs(title, performer);

      return {
        status: "success",
        data: { songs },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._songsService.getSongById(id);
  
      return {
        status: "success",
        data: { song },
      };
    } catch (error) {
      return this._handleError(error, h); 
    }
  }  

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
  
      const { id } = request.params;
      await this._songsService.editSongById(id, request.payload);
  
      return {
        status: "success",
        message: "Song has been updated",
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }  

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._songsService.deleteSongById(id);

      return {
        status: "success",
        message: "Song has been deleted",
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  // Fungsi untuk menangani error secara konsisten
  _handleError(error, h) {
    if (error instanceof ClientError) {
      return h
        .response({
          status: "fail",
          message: error.message,
        })
        .code(error.statusCode);
    }
  
    // Menangani error dari database
    if (error.code === "23505") {
      // Contoh: duplicate key violation
      return h
        .response({
          status: "fail",
          message: "Data sudah ada dalam database.",
        })
        .code(400);
    }
  
    console.error(`[ERROR] ${new Date().toISOString()} - ${error.message}`);
    console.error(error.stack);
  
    return h
      .response({
        status: "error",
        message: "Terjadi kesalahan pada server.",
      })
      .code(500);
  }  
}

module.exports = SongsHandler;
