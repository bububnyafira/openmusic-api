exports.up = pgm => {
    pgm.createTable('playlist_song_activities', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      song_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      action: {
        type: 'TEXT',
        notNull: true,
      },
      time: {
        type: 'TIMESTAMP',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
    });
  
    pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', {
      foreignKeys: {
        columns: 'playlist_id',
        references: 'playlists(id)',
        onDelete: 'CASCADE',
      },
    });
  };

  exports.down = pgm => {
    pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id');
    pgm.dropTable('playlist_song_activities');
  };