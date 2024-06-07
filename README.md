Web client served by [Volumio Now Playing plugin](https://github.com/patrickkfkan/volumio-now-playing) (version: > 0.1.4), implemented in ReactJS.

## Changelog

0.6.1:
- Add support for 'Content Region' settings
- Add support for 'Album Art -> Margin' setting

0.6.0:
- Add support for seekbar styling options
- Add support for 'Dock Component - Media Format'
- Add support for new 'Dock Component - Menu' options

0.5.2:
- Add support for 'Startup Options'
- Fix My Background URLs in Background component
- Revert change in v0.5.1 where Volumio logo bg is always displayed when player statua is 'stop'

0.5.1:
－Add support for 'Background -> My Background' settings
- Minor bug fixes

0.5.0:
- Fix regression: MetaDataPanel not showing description correctly
- Add support for 'Docked Volume Indicator -> % Symbol Size' setting
- Add support for Track Info Visibility settings
- Add support for 'IdleScreen -> My Background' settings
- Add support for 'IdleScreen -> Weather Area Height' setting

0.4.0:
- Migrate to TypeScript
- Change settings handling

0.3.0:
- Fix seekbar not working when moving to shorter song
- Add support for track info marquee title setting
- Add support for IdleScreen main alignment 'cycle' setting

0.2.5:
- Idle screen Unsplash background: fetch image URL from API endpoint instead of constructing directly in the client.
- Add shutdown button to Action Panel
- Add support for 'Dock Component - Menu' setting

0.2.4
- Add hourly weather to idle screen (tap / click "Current" weather to toggle between daily and hourly).
- Idle screen now shows all available forecast periods - scroll horizontally to view.
- Add workaround to seekbar for music services that don't push 'stop' state when playback finishes, causing displayed seek time to overflow duration.
- Add support for metadata font settings
- Improve responsive display of grid columns on browse screen.
- Add "Maximize" button to browse screen and queue for displays with horizontal resolutions higher than 1024px, so that contents won't be fixed at 80% width.
- Misc UI fixes and improvements

0.2.3
- Fix volume bar of docked volume indicator closing on click

0.2.2
- Improve seekbar accuracy when screen is inactive
- Add support for option to show volume bar when docked volume indicator is clicked
- Add translation support
- Misc UI fixes

0.2.1
- Minor bug fix

0.2.0
- Add Idle Screen
- Add support for Dock Components:
  - Action Panel trigger
  - Volume Indicator (replaces Volume Indicator Tweaks)
  - Clock
  - Weather
- Add support for seek time font size and color
- Fix state not updating on socket reconnect
- Fix seekbar's unreasonably high memory consumption (caused by `react-range` component; switched to `rc-slider` instead)
- Various other bug fixes

0.1.2
- Add support for the following style settings:
  - Track info display order
  - Album art border
  - Background overlay gradients
  - Additional Volume Indicator Tweaks
- Some minor bug fixes

0.1.1
- Add menus
- Add metadata service support
- Add Info View to Now Playing Screen
- Add performance settings support
- Misc UI fixes and improvements

0.1.0
- Initial release

## License

MIT
