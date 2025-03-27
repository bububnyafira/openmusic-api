const ClientError = require('../exceptions/ClientError');

const AuthMiddleware = {
  verifyOwnership: async (handler) => async (request, h) => {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const { PlaylistsService } = request.server.app;

    try {
      // Pastikan playlist ada terlebih dahulu
      await PlaylistsService.verifyPlaylistExistence(playlistId);

      // Verifikasi kepemilikan
      await PlaylistsService.verifyPlaylistOwner(playlistId, userId);

      // Jika tidak ada error, lanjutkan
      return handler(request, h);
    } catch (error) {
      return AuthMiddleware.handleError(h, error);
    }
  },

  verifyAccess: async (handler) => async (request, h) => {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const { PlaylistsService, CollaborationsService } = request.server.app;

    try {
      // Pastikan playlist ada terlebih dahulu
      await PlaylistsService.verifyPlaylistExistence(playlistId);

      // Coba verifikasi kepemilikan
      await PlaylistsService.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof ClientError) {
        // Jika bukan pemilik, cek apakah user adalah kolaborator
        try {
          await CollaborationsService.verifyCollaborator(playlistId, userId);
        } catch (collabError) {
          return AuthMiddleware.handleError(h, collabError);
        }
      } else {
        return AuthMiddleware.handleError(h, error);
      }
    }

    return handler(request, h);
  },

  handleError: (h, error) => {
    const response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(error.statusCode || 500);
    return response;
  },
};

module.exports = AuthMiddleware;
