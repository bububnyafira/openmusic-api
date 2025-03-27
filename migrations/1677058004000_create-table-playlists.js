exports.up = pgm => {
    pgm.createTable('playlists', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      name: {
        type: 'TEXT',
        notNull: true,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      created_at: {
        type: 'TIMESTAMP',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
      updated_at: {
        type: 'TIMESTAMP',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
    });
  
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
      foreignKeys: {
        columns: 'owner',
        references: 'users(id)',
        onDelete: 'CASCADE',
      },
    });
  };
  
  exports.down = pgm => {
    pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
    pgm.dropTable('playlists');
  };
  