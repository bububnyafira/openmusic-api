const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Failed to add song to playlist");
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
             FROM songs
             JOIN playlist_songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifySongInPlaylist(playlistId, songId) {
    const query = {
      text: "SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError("Song not found in playlist");
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    // Verifikasi keberadaan lagu di playlist
    await this.verifySongInPlaylist(playlistId, songId);

    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING *", // Gunakan RETURNING *
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    // Periksa apakah ada baris yang dihapus
    if (!result.rowCount) {
      throw new InvariantError("Failed to remove song from playlist");
    }
  }

  async verifySongExistence(id) {
    const query = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Song not found");
    }
  }
}

module.exports = PlaylistSongsService;
