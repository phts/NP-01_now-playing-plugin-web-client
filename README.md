# PHTS NP-01: Web client for Now Playing plugin

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
- Support "Show clock" options for idle screen config
- [...and more][commits]

## Deploy

1. Go to [NP-01_now-playing-plugin] and run `scripts/deploy.sh`

[volumio-now-playing-reactjs-client]: https://github.com/patrickkfkan/volumio-now-playing-reactjs-client
[NP-01_now-playing-plugin]: https://github.com/phts/NP-01_now-playing-plugin
[phts np-01]: https://tsaryk.com/NP-01
[commits]: https://github.com/phts/NP-01_now-playing-plugin-web-client/commits/master
