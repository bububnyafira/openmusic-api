const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistSongsService,
    playlistActivitiesService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistSongsService,
      playlistActivitiesService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};