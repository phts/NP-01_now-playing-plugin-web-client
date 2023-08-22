# PHTS NP-01: Web client for Now Playing plugin

This is a modification of original [volumio-now-playing-reactjs-client] (part of [NP-01_now-playing-plugin]) which is used by [PHTS NP-01].

Noticeable changes:

- Redesign/reorder player buttons, progress bar, album art, etc
- Render year, bitrate, track number
- Hide all controls on initial screen, leave only default picture, which also changed
- [...and more][commits]

## Deploy

1. Go to [NP-01_now-playing-plugin] and run `scripts/deploy.sh`

[volumio-now-playing-reactjs-client]: https://github.com/patrickkfkan/volumio-now-playing-reactjs-client
[NP-01_now-playing-plugin]: https://github.com/phts/NP-01_now-playing-plugin
[phts np-01]: https://tsaryk.com/NP-01
[commits]: https://github.com/phts/NP-01_now-playing-plugin/commits/master
