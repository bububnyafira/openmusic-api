/* eslint-disable no-unused-vars */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId = null }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    if (albumId) {
      // Pastikan albumId ada di tabel albums sebelum menambahkan lagu
      const checkAlbum = await this._pool.query({
        text: 'SELECT id FROM albums WHERE id = $1',
        values: [albumId],
      });

      if (checkAlbum.rowCount === 0) {
        throw new InvariantError('Album ID tidak ditemukan');
      }
    }

    const query = {
      text: 'INSERT INTO songs (id, title, year, performer, genre, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let queryText = 'SELECT id, title, performer FROM songs';
    const values = [];
  
    if (title && performer) {
      queryText += ' WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)';
      values.push(`%${title}%`, `%${performer}%`);
    } else if (title) {
      queryText += ' WHERE LOWER(title) LIKE LOWER($1)';
      values.push(`%${title}%`);
    } else if (performer) {
      queryText += ' WHERE LOWER(performer) LIKE LOWER($1)';
      values.push(`%${performer}%`);
    }
  
    const result = await this._pool.query(queryText, values);
    return result.rows;
  }  

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }

    return mapSongsDBToModel(result.rows[0]);
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update song. ID not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete song. ID not found');
    }
  }

  async verifySongExists(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
  }
}

module.exports = SongsService;
