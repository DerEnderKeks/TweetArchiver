# TweetArchiver

Well, it archives tweets. Can't tell you anything the name didn't already told you.

---

### How to use

#### Dependencies

* Docker
* docker-compose

#### Installation

```bash
cd /opt
git clone https://github.com/DerEnderKeks/TweetArchiver.git
cd TweetArchiver
cp config/default.json.docker config/default.json # Edit this file to change tracked users and insert your twitter API credentials here
cp config/production.json.example config/production.json
docker-compose up
```
Done.

If you modify your config after you built the container, you have to rebuild it using `docker-compose up --build`.

#### Systemd

If you want to run this in background use the systemd unit file in `init/systemd/`. You may have to modify that file if you installed TweetArchiver to a different location than `/opt/TweetArchiver`.

```bash
cp init/systemd/tweetarchiver.service /etc/systemd/system/
systemctl start tweetarchiver # Starts the service
systemctl enable tweetarchiver # Enables autostart
```