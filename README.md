# PHTS NP-01: Now Playing plugin for Volumio (Web client)

This is a modification of [volumio-now-playing-reactjs-client] (part of [NP-01_now-playing-plugin]) which is used by [PHTS NP-01].

Tweaks made to [the original repo][volumio-now-playing-reactjs-client]:

- Redesign "now playing" screen:
  - Reorder player buttons, progress bar, album art, etc.
- Render new data from state:
  - Album year
  - Bitrate
  - Track number / Amount of queue items
  - "Favorite" flag
  - "Stop after current" indicator
- Redesign "initial" screen: hide all controls, leave only default picture, which is also changed
- Support "Show clock" options for idle screen config ([patrickkfkan/volumio-now-playing-reactjs-client#5](https://github.com/patrickkfkan/volumio-now-playing-reactjs-client/pull/5))
- Support manual triggering idle screen when set config `waitTime=0`
- [...and more][commits]

## Deploy

1. Go to [NP-01_now-playing-plugin] and run `scripts/deploy.sh`

[volumio-now-playing-reactjs-client]: https://github.com/patrickkfkan/volumio-now-playing-reactjs-client
[NP-01_now-playing-plugin]: https://github.com/phts/NP-01_now-playing-plugin
[phts np-01]: https://tsaryk.com/NP-01
[commits]: https://github.com/phts/NP-01_now-playing-plugin-web-client/commits/master
