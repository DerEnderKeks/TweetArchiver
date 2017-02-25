/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

const express = require('express');
const router = express.Router();
const path = require("path");
const util = require(path.join(__dirname, '..', '..', 'lib', 'util', 'misc'));

const User = require(path.join(__dirname, '..', '..', 'lib', 'schemas', 'userSchema'));
const Tweet = require(path.join(__dirname, '..', '..', 'lib', 'schemas', 'tweetSchema'));

const notFound = new Error('Not Found').status = 404;

/**
 * PARAM username
 */
router.param('username', (req, res, next, param) => {
  User.findOne({screen_name: param.toString()})
    .exec((err, result) => {
      if (err) return next(new Error(err));
      if (!result) return next(notFound);
      req.searchedUser = result;
      return next();
  })
});

router.param('page', (req, res, next, param) => {
  req.page = util.isNumeric(param) ? parseInt(param) : 1;
  return next();
});

router.get('/', (req, res, next) => {
  User
    .find()
    .exec((err, result) => {
      if (err) return next(new Error(err));
      if (!result) result = [];
      res.render('index', {
        title: 'TweetArchiver',
        users: result
      })
    });
});

router.get('/:username', (req, res, next) => {
  return res.redirect(`/${req.searchedUser.screen_name}/1`);
});

router.get('/:username/:page', (req, res, next) => {
  const perPage = 25;
  Tweet
    .find({_user: req.searchedUser._id})
    .count()
    .exec((err, result) => {
      if (err) return next(new Error(err));
      const pages = Math.ceil(result / perPage);

      Tweet.find({_user: req.searchedUser._id})
        .sort({created_at: -1})
        .skip((req.page - 1) * perPage)
        .limit(perPage)
        .exec((err, result) => {
          if (err) return next(new Error(err));
          if (!result) return next(notFound);
          res.render('user', {
            title: `${req.searchedUser.name} (@${req.searchedUser.screen_name}) - TweetArchiver`,
            user: req.searchedUser,
            tweets: result,
            page: req.page,
            pages: pages,
            require: require
          })
        })
  });
});

module.exports = router;