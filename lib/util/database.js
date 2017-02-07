/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

const mongoose = require('mongoose');
const config = require('config');

const mongooseOptions = {
  user: config.get('db.username') ? config.get('db.username') : undefined,
  pass: config.get('db.password') ? config.get('db.password') : undefined,
};
mongoose.connect(`mongodb://${config.get('db.address')}:${config.get('db.port')}/${config.get('db.db')}`, mongooseOptions);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB.')
});

module.exports = mongoose;
