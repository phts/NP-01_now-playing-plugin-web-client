import classNames from 'classnames';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { Scrollbars } from 'rc-scrollbars';
import './SyncedLyricsPanel.scss';
import React from 'react';
import { StylesBundleProps } from './StylesBundle';
import { MetadataSyncedLyrics } from 'now-playing-common';
import { usePlayerSeek } from '../contexts/PlayerProvider';
import deepEqual from 'deep-equal';

interface SyncedLyricsPanelProps extends StylesBundleProps {
  lyrics: MetadataSyncedLyrics;
  delay: number;
}

interface CurrentLine {
  index: number;
  highlight: boolean;
}

function currentLineReducer(currentValue: CurrentLine, newValue: Partial<CurrentLine>) {
  const _new = {
    index: newValue.index !== undefined ? newValue.index : currentValue.index,
    highlight: newValue.highlight !== undefined ? newValue.highlight : currentValue.highlight
  };
  if (!deepEqual(currentValue, _new)) {
    return _new;
  }
  return currentValue;
}

function SyncedLyricsPanel(props: SyncedLyricsPanelProps) {
  const { lyrics, delay = 0 } = props;
  const { currentSeekPosition } = usePlayerSeek();
  const scrollbarRef = useRef<Scrollbars | null>(null);
  const lineElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ currentLine, setCurrentLine ] = useReducer(currentLineReducer, { index: -1, highlight: false });

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
      setCurrentLine({ index: -1, highlight: false });
    };
  }, [ lyrics ]);

  useEffect(() => {
    const p = currentSeekPosition - delay;
    const index = lyrics.lines.findIndex((line, index) => {
      const end = line.end !== undefined ? line.end : (lyrics.lines[index + 1] ? lyrics.lines[index + 1].start : -1);
      return p >= line.start && (end < 0 || p < end);
    });
    if (index >= 0) {
      setCurrentLine({ index, highlight: true });
    }
    else {
      setCurrentLine({ highlight: false });
    }
  }, [ lyrics, currentSeekPosition, delay ]);

  const lineElements = useMemo(() => lyrics.lines.map((line, index) => {
    let lineClassName: string;
    if (baseClassName && stylesBundle) {
      lineClassName = classNames(
        stylesBundle[`${baseClassName}__line`] || 'SyncedLyricsPanel__line',
        index === currentLine.index && currentLine.highlight ? stylesBundle[`${baseClassName}__line--current`] || 'SyncedLyricsPanel__line--current' : null
      );
    }
    else {
      lineClassName = classNames(
        'SyncedLyricsPanel__line',
        index === currentLine.index && currentLine.highlight ? 'SyncedLyricsPanel__line--current' : null
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
  }), [ lyrics, currentLine, baseClassName, stylesBundle ]);

  useEffect(() => {
    if (!scrollbarRef.current) {
      return;
    }
    const lineElement = lineElementRefs.current[currentLine.index];
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
  }, [ currentLine ]);

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
