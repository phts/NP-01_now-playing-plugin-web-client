Web client served by [Volumio Now Playing plugin](https://github.com/patrickkfkan/volumio-now-playing) (version: > 0.1.4), implemented in ReactJS.

## Changelog

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
