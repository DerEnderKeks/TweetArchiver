/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

const mongoose = require('../util/database');

const userSchema = mongoose.Schema({
  id_str: String,
  screen_name: String,
  name: String,
  description: String,
  url: String,
  location: String,
  verified: Boolean,
  created_at: Date,
  _tweets: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Tweet',
  }],
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;