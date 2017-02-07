/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

const mongoose = require('../util/database');

const tweetSchema = mongoose.Schema({
  coordinates: {
    coordinates: [Number],
    type: String
  },
  created_at: Date,
  id_str: String,
  possibly_sensitive: Boolean,
  source: String,
  scopes: {
    followers: Boolean
  },
  text: String,
  archive_link: String,
  _user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const tweetModel = mongoose.model('Tweet', tweetSchema);

module.exports = tweetModel;