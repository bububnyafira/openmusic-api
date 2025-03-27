const Joi = require("joi");

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const CollaboratorPayloadSchema = Joi.object({
  userId: Joi.string().required(),
});

module.exports = {
  PlaylistPayloadSchema,
  PlaylistSongPayloadSchema,
  CollaboratorPayloadSchema,
};
