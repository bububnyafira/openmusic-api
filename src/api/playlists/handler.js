const ClientError = require("../../exceptions/ClientError");

class PlaylistsHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    playlistActivitiesService,
    validator
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;

    // Binding functions inside the constructor
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
    this.getPlaylistActivitiesHandler =
      this.getPlaylistActivitiesHandler.bind(this);
    this.postPlaylistCollaboratorHandler =
      this.postPlaylistCollaboratorHandler.bind(this);
    this.deletePlaylistCollaboratorHandler =
      this.deletePlaylistCollaboratorHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      // Validate playlist name
      if (!name) {
        throw new ClientError("Playlist name is required", 400);
      }

      this._validator.validatePlaylistPayload(request.payload);

      const playlistId = await this._playlistsService.addPlaylist({
        name,
        owner: credentialId,
      });

      return h
        .response({
          status: "success",
          data: { playlistId },
        })
        .code(201);
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
      await this._playlistSongsService.verifySongExistence(songId);
      await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
      await this._playlistActivitiesService.addActivity(
        playlistId,
        songId,
        credentialId,
        "add"
      );

      return h
        .response({
          status: "success",
          message: "Song added to playlist",
        })
        .code(201);
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
      const playlist = await this._playlistsService.getPlaylistById(playlistId);
      const songs = await this._playlistSongsService.getSongsFromPlaylist(
        playlistId
      );

      return {
        status: "success",
        data: {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            username: playlist.username,
            songs,
          },
        },
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      const playlists = await this._playlistsService.getPlaylists(credentialId);

      return {
        status: "success",
        data: { playlists },
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      await this._playlistsService.deletePlaylistById(id);

      return {
        status: "success",
        message: "Playlist deleted successfully",
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      // Verifikasi akses ke playlist
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );

      // Verifikasi keberadaan lagu di playlist
      await this._playlistSongsService.verifySongInPlaylist(playlistId, songId);

      // Hapus lagu dari playlist
      await this._playlistSongsService.deleteSongFromPlaylist(
        playlistId,
        songId
      );

      // Tambahkan aktivitas penghapusan lagu (jika ada)
      await this._playlistActivitiesService.addActivity(
        playlistId,
        songId,
        credentialId,
        "delete"
      );

      // Kembalikan respons sukses
      return {
        status: "success", // Perbaiki respons status
        message: "Song removed from playlist",
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      // Pastikan user memiliki akses ke playlist
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );

      // Periksa apakah playlist benar-benar ada sebelum mengambil aktivitas
      await this._playlistActivitiesService.verifyPlaylistExistence(playlistId);

      const activities = await this._playlistActivitiesService.getActivities(
        playlistId
      );

      return {
        status: "success",
        data: { activities },
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  // Added for collaboration feature
  async postPlaylistCollaboratorHandler(request, h) {
    try {
      this._validator.validateCollaboratorPayload(request.payload);

      const { userId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
      await this._playlistsService.addCollaborator(playlistId, userId);

      return h
        .response({
          status: "success",
          message: "Collaborator added successfully",
        })
        .code(201);
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  async deletePlaylistCollaboratorHandler(request, h) {
    try {
      this._validator.validateCollaboratorPayload(request.payload);

      const { userId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );
      await this._playlistsService.deleteCollaborator(playlistId, userId);

      return {
        status: "success",
        message: "Collaborator removed successfully",
      };
    } catch (error) {
      return this._handleErrorResponse(h, error);
    }
  }

  _handleErrorResponse(h, error) {
    if (error instanceof ClientError) {
      return h
        .response({
          status: "fail",
          message: error.message,
        })
        .code(error.statusCode);
    }

    console.error(error);
    return h
      .response({
        status: "error",
        message: "Sorry, internal server error occurred",
      })
      .code(500);
  }
}

module.exports = PlaylistsHandler;
