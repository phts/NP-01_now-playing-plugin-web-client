/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContextualModal from '../../common/ContextualModal';
import VolumeIndicator from '../../common/VolumeIndicator';
import VolumeSlider from '../../common/VolumeSlider';
import { useSettings } from '../../contexts/SettingsProvider';
import styles from './DockedVolumeIndicator.module.scss';
import { CommonSettingsCategory } from 'now-playing-common';

function DockedVolumeIndicator() {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const settings = screenSettings.dockedVolumeIndicator;
  const placement = settings.placement;
  const showVolumeBarOnClick = settings.showVolumeBarOnClick;
  const volumeBarPosition = settings.volumeBarPosition;
  const volumeBarOrientation = settings.volumeBarOrientation;
  const [ volumeBarVisible, showVolumeBar ] = useState(false);
  const [ windowSize, setWindowSize ] = useState({ width: window.innerWidth, height: window.innerHeight });
  const indicatorWrapperRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const volumeBarRef = useRef<HTMLDivElement | null>(null);

  const toggleVolumeBar = useCallback(() => {
    showVolumeBar(!volumeBarVisible);
  }, [ showVolumeBar, volumeBarVisible ]);

  useEffect(() => {
    const handleWindowResized = () => {
      if (showVolumeBarOnClick) {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener('resize', handleWindowResized);

    return () => {
      window.removeEventListener('resize', handleWindowResized);
    };
  }, [ showVolumeBarOnClick ]);

  const getVolumeBarWrapperInset = useCallback(() => {
    if (!indicatorRef.current || volumeBarPosition === 'center') {
      return '0';
    }
    const indicatorRect = indicatorRef.current.getBoundingClientRect();
    const inset: any = { top: 0, right: 0, bottom: 0, left: 0 };
    // Top, bottom
    switch (placement) {
      case 'top-left':
      case 'top':
      case 'top-right':
        inset.top = `${indicatorRect.bottom}px`;
        inset.bottom = '0';
        break;
      case 'left':
      case 'right':
        inset.top = '0';
        inset.bottom = '0';
        break;
      case 'bottom-left':
      case 'bottom':
      default: // Bottom-right
        inset.top = '0';
        inset.bottom = `${windowSize.height - indicatorRect.top}px`;
    }
    // Left, right
    switch (placement) {
      case 'left':
        inset.left = `${indicatorRect.left + indicatorRect.width}px`;
        inset.right = '0';
        break;
      case 'right':
        inset.left = '0';
        inset.right = `${windowSize.width - indicatorRect.left}px`;
        break;
      case 'top-left':
      case 'top':
      case 'top-right':
      case 'bottom-left':
      case 'bottom':
      default: // Bottom-right
        inset.left = '0';
        inset.right = '0';
    }
    return Object.values(inset).join(' ');
  }, [ placement, volumeBarPosition, windowSize ]);

  const volumeBarInset = useMemo(() => {
    if (!showVolumeBarOnClick) {
      return null;
    }
    const inset = {
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto'
    };
    const volumeBarRect = volumeBarRef.current ? volumeBarRef.current.getBoundingClientRect() : null;
    // 'center' position
    if (volumeBarPosition === 'center' && volumeBarRect) {
      // Target position
      const targetTop = ((windowSize.height - volumeBarRect.height) / 2);
      const targetLeft = ((windowSize.width - volumeBarRect.width) / 2);
      inset.top = `${targetTop}px`;
      inset.left = `${targetLeft}px`;
    }
    // 'anchored' position
    else if (volumeBarPosition === 'anchored') {
      switch (placement) {
        case 'top-left':
        case 'top':
        case 'top-right':
          inset.top = '0';
          break;
        case 'left':
          inset.left = '0';
          break;
        case 'right':
          inset.right = '0';
          break;
        case 'bottom-left':
        case 'bottom':
        default: // Bottom-right
          inset.bottom = '0';
      }
      if (indicatorRef.current && volumeBarRect) {
        const indicatorRect = indicatorRef.current.getBoundingClientRect();
        switch (placement) {
          case 'left':
          case 'right':
            let calcTop = Math.max(indicatorRect.top +
              ((indicatorRect.height - volumeBarRect.height) / 2), 0);
            const overflowY = calcTop + volumeBarRect.height - windowSize.height;
            if (overflowY > 0) {
              calcTop -= overflowY;
            }
            inset.top = `${calcTop}px`;
            break;
          case 'top-left':
          case 'top':
          case 'top-right':
          case 'bottom-left':
          case 'bottom':
          default: // Bottom-right
            let calcLeft = Math.max(indicatorRect.left +
              ((indicatorRect.width - volumeBarRect.width) / 2), 0);
            const overflowX = calcLeft + volumeBarRect.width - windowSize.width;
            if (overflowX > 0) {
              calcLeft -= overflowX;
            }
            inset.left = `${calcLeft}px`;
        }
      }
    }

    return Object.values(inset).join(' ');
  }, [ showVolumeBarOnClick, placement, volumeBarPosition, windowSize ]);

  const volumeBarBeforeClose = useMemo(() => {
    if (!showVolumeBarOnClick) {
      return null;
    }
    const translate: any = { x: 0, y: 0 };
    // 'center' position
    switch (placement) {
      case 'top-left':
      case 'top':
      case 'top-right':
        translate.y = '-80px';
        break;
      case 'left':
        translate.x = '-80px';
        break;
      case 'right':
        translate.x = '80px';
        break;
      case 'bottom-left':
      case 'bottom':
      default: // Bottom-right
        translate.y = '80px';
    }

    return `translate(${translate.x}, ${translate.y})`;
  }, [ showVolumeBarOnClick, placement ]);

  const dockedStyles = {
    '--docked-margin': settings.margin
  } as React.CSSProperties;

  if (settings.fontSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-font-size': settings.fontSize,
      '--docked-font-size-percent-symbol': settings.fontSizePercentSymbol,
      '--docked-font-color': settings.fontColor
    });
  }

  if (settings.iconSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-icon-size': settings.iconSize,
      '--docked-muted-icon-size': settings.iconSize,
      '--docked-icon-color': settings.iconColor
    });
  }

  const volumeBarModalClassNames = showVolumeBarOnClick ? {
    base: styles.VolumeBarWrapper,
    afterOpen: styles['VolumeBarWrapper--after-open'],
    beforeClose: styles['VolumeBarWrapper--before-close']
  } : undefined;

  const volumeBarClassNames = showVolumeBarOnClick ? classNames(
    styles.VolumeBar,
    styles[`VolumeBar--${volumeBarOrientation}`],
    styles[`VolumeBar--${volumeBarPosition}`],
    volumeBarPosition === 'anchored' ? styles[`VolumeBar--anchored-${placement}`] : null
  ) : undefined;

  const indicatorWrapperFontSize = indicatorWrapperRef.current ?
    getComputedStyle(indicatorWrapperRef.current).getPropertyValue('font-size')
    : null;

  const volumeBarModalInlineStyles = showVolumeBarOnClick ? {
    content: {
      '--volume-bar-wrapper-inset': getVolumeBarWrapperInset(),
      '--volume-bar-inset': volumeBarInset,
      '--volume-bar-before-close': volumeBarBeforeClose,
      'fontSize': volumeBarPosition === 'center' ? indicatorWrapperFontSize : null
    } as React.CSSProperties
  } : undefined;

  const volumeBarOverlayClassNames = showVolumeBarOnClick ? {
    base: classNames(
      styles.VolumeBarOverlay,
      styles[`VolumeBarOverlay--${volumeBarPosition}VolumeBar`]
    ),
    afterOpen: styles['VolumeBarOverlay--after-open'],
    beforeClose: styles['VolumeBarOverlay--before-close']
  } : undefined;

  // This gets called when modal hosting the volume bar is opened.
  // At this stage, the volume bar is mounted and we can obtain
  // Its bounding rect for calculating its position
  const onVolumeBarModalOpened = () => {
    if (volumeBarRef.current) {
      // Force a refresh so that volume bar position can be recalculated
      setWindowSize({ ...windowSize });
    }
  };

  return (
    <>
      <div
        ref={indicatorWrapperRef}
        style={dockedStyles}
        onClick={showVolumeBarOnClick ? toggleVolumeBar : undefined}>
        <VolumeIndicator
          ref={indicatorRef}
          showDial={false}
          styles={{
            baseClassName: 'DockedVolumeIndicator',
            bundle: styles
          }} />
      </div>
      <ContextualModal
        isOpen={volumeBarVisible}
        onAfterOpen={onVolumeBarModalOpened}
        closeTimeoutMS={200}
        overlayClassName={volumeBarOverlayClassNames}
        className={volumeBarModalClassNames}
        preventScroll
        onRequestClose={toggleVolumeBar}
        style={volumeBarModalInlineStyles}>
        <div ref={volumeBarRef} className={volumeBarClassNames}>
          <VolumeSlider orientation={volumeBarOrientation} />
        </div>
      </ContextualModal>
    </>
  );
}

export default DockedVolumeIndicator;
