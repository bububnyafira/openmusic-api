exports.up = pgm => {
    // Create a constraint for existing songs
    pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = '' OR album_id NOT IN (SELECT id FROM albums)");
  
    // Add the constraint
    pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', {
      foreignKeys: {
        columns: 'album_id',
        references: 'albums(id)',
        onDelete: 'CASCADE',
      },
    });
  };
  
  exports.down = pgm => {
    pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
  };
  