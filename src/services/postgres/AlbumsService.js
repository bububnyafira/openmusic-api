const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to add');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };
    
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }

    return result.rows[0];
  }

  async getAlbumWithSongsById(id) {
    const albumQuery = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };
    
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album not found');
    }

    const album = albumResult.rows[0];

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);
    const songs = songsResult.rows;

    return {
      ...album,
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album. ID not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album. ID not found');
    }
  }
}

module.exports = AlbumsService;
