const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    // Pastikan playlist ada sebelum menambahkan aktivitas
    await this.verifyPlaylistExistence(playlistId);

    const query = {
      text: `INSERT INTO playlist_song_activities 
             (id, playlist_id, song_id, user_id, action, time) 
             VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
        throw new InvariantError('Failed to add activity');
      }

      return result.rows[0].id;
    } catch (error) {
      console.error("Error adding activity:", error);
      throw new InvariantError("Failed to log activity");
    }
  }

  async getActivities(playlistId) {
    // Pastikan playlist ada sebelum mengambil aktivitas
    await this.verifyPlaylistExistence(playlistId);

    const query = {
      text: `SELECT users.username, songs.title, action, time
             FROM playlist_song_activities
             JOIN users ON users.id = playlist_song_activities.user_id
             JOIN songs ON songs.id = playlist_song_activities.song_id
             WHERE playlist_song_activities.playlist_id = $1
             ORDER BY time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyPlaylistExistence(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }
  }
}

module.exports = PlaylistActivitiesService;
