/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

module.exports.isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};