import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Scrollbars } from 'rc-scrollbars';
import './SyncedLyricsPanel.scss';
import React from 'react';
import { StylesBundleProps } from './StylesBundle';
import { MetadataLyrics } from 'now-playing-common';
import { usePlayerSeek } from '../contexts/PlayerProvider';

interface SyncedLyricsPanelProps extends StylesBundleProps {
  lyrics: MetadataLyrics & {type: 'synced'};
}

function SyncedLyricsPanel(props: SyncedLyricsPanelProps) {
  const { lyrics } = props;
  const { currentSeekPosition } = usePlayerSeek();
  const scrollbarRef = useRef<Scrollbars | null>(null);
  const lineElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ currentLineIndex, setCurrentLineIndex ] = useState(-1);

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'SyncedLyricsPanel',
      [ ...extraClassNames ]
    )
    :
    classNames(
      'SyncedLyricsPanel',
      [ ...extraClassNames ]
    );

  useEffect(() => {
    return () => {
      lineElementRefs.current = [];
    };
  }, [ lyrics ]);

  useEffect(() => {
    const index = lyrics.lines.findIndex((line, index) => {
      const nextStart = lyrics.lines[index + 1] ? lyrics.lines[index + 1].start : -1;
      return currentSeekPosition >= line.start && (nextStart < 0 || currentSeekPosition < nextStart);
    });
    setCurrentLineIndex(index);
  }, [ lyrics, currentSeekPosition ]);

  const lineElements = useMemo(() => lyrics.lines.map((line, index) => {
    let lineClassName: string;
    if (baseClassName && stylesBundle) {
      lineClassName = classNames(
        stylesBundle[`${baseClassName}__line`] || 'SyncedLyricsPanel__line',
        index === currentLineIndex ? stylesBundle[`${baseClassName}__line--current`] || 'SyncedLyricsPanel__line--current' : null
      );
    }
    else {
      lineClassName = classNames(
        'SyncedLyricsPanel__line',
        index === currentLineIndex ? 'SyncedLyricsPanel__line--current' : null
      );
    }
    return (
      <div
        ref={(el) => {
          lineElementRefs.current[index] = el;
        }}
        className={lineClassName}>
        {line.text || ' '}
      </div>
    );
  }), [ lyrics, currentLineIndex, baseClassName, stylesBundle ]);

  useEffect(() => {
    if (!scrollbarRef.current) {
      return;
    }
    const lineElement = lineElementRefs.current[currentLineIndex];
    const scrollbar = scrollbarRef.current;
    if (lineElement) {
      const lineY = lineElement.offsetTop;
      const lineHeight = lineElement.clientHeight;
      const viewPortHeight = scrollbar.getClientHeight();
      const scrollY = lineY - ((viewPortHeight - lineHeight) / 2);
      scrollbarRef.current.scrollTop(Math.max(scrollY, 0));
    }
    else {
      scrollbarRef.current.scrollTop(0);
    }
  }, [ currentLineIndex ]);

  return (
    <div
      style={{height: '100%'}}>
      <Scrollbars
        ref={scrollbarRef}
        className={mainClassName}
        classes={{
          thumbVertical: 'Scrollbar__handle'
        }}
        autoHide>
        {lineElements}
      </Scrollbars>
    </div>
  );
}

export default SyncedLyricsPanel;
