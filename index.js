const Twitter = require('twitter');
const config = require('config');
const phantom = require('phantom');
const queue = require('queue');

let q = queue({
  concurrency: config.get('archival.parallel'),
  autostart: true,
});

const Tweet = require('./lib/schemas/tweetSchema');
const User = require('./lib/schemas/userSchema');

const twitter = new Twitter(config.get('twitter'));

const trackTweets = (_user) => {
  const findUser = (user) => {
    User.findOne({id_str: user.id_str}, (err, result) => {
      if (err) return console.error(err);
      if (result
        && (result.screen_name != user.screen_name
        || result.description != user.description
        || result.url != user.url
        || result.location != user.location
        || result.verified != user.verified)) return updateUser(user);
      if (result) return startInterval(result);
      createUser(user);
    });
  };

  const createUser = (user) => {
    new User({
      id_str: user.id_str,
      screen_name: user.screen_name,
      description: user.description,
      url: user.url,
      location: user.location,
      verified: user.verified,
      created_at: user.created_at,
    }).save((err, result) => {
      if (err || !result) return console.error(`Failed to create database entry for user '${user.screen_name}'!`);
      findUser(user);
    });
  };

  const updateUser = (user) => {
    User.where({
      id_str: user.id_str
    }).update({
      screen_name: user.screen_name,
      description: user.description,
      url: user.url,
      location: user.location,
      verified: user.verified
    }, (err, result) => {
      if (err) console.error(err);
      findUser(user);
    })
  };

  const startInterval = (user) => {
    setInterval(() => {
      twitter.get('statuses/user_timeline', {user_id: _user.id_str, count: 200}, (error, result, response) => {
        if (error || !result) return;
        result.forEach((tweet) => {
          if (tweet.user.id_str != user.id_str) return;
          Tweet.findOne({id_str: tweet.id_str}, (err, result) => {
            if (err) return console.error(err);
            if (result) return;
            new Tweet({
              id_str: tweet.id_str,
              coordinates: tweet.coordinates,
              created_at: tweet.created_at,
              possibly_sensitive: tweet.possibly_sensitive,
              source: tweet.source,
              scopes: tweet.scopes,
              text: tweet.text,
              _user: user._id,
            }).save((err, result) => {
              if (err) return console.error(`Failed to save new tweet from user '${user.screen_name}'!`);
              console.log(`Saved new tweet from user '${user.screen_name}'!`);
              q.push((cb) => {
                (async function() {
                  console.log(`Archiving tweet ${tweet.id_str}...`);
                  const instance = await phantom.create();
                  const page = await instance.createPage();
                  await page.on("onResourceRequested", function(requestData) {
                    //console.info('Requesting', requestData.url)
                  });

                  const status = await page.open(`https://web.archive.org/save/https://twitter.com/${user.screen_name}/status/${tweet.id_str}`);
                  //console.log(status);

                  const content = await page.property('content');
                  //console.log(content);

                  await instance.exit();
                  Tweet.where({id_str: tweet.id_str}).update({
                    archive_link: `https://web.archive.org/web/https://twitter.com/${user.screen_name}/status/${tweet.id_str}`
                  }, (err, result) => {
                    if (err) return cb();
                    console.log(`Saved archive link for tweet ${tweet.id_str}.`);
                    cb();
                  });
                }());
              });
            });
          });
        });
      });
    }, 10 * 1000);
  };

  findUser(_user);
};

config.get('trackedUsers').forEach((user) => {
  twitter.get('users/lookup', {screen_name: user}, (error, result, response) => {
    if (error || !result ) console.error(`Failed to lookup user '${user}'!`);
    result.forEach((user) => {
      trackTweets(user);
    });
  });
});