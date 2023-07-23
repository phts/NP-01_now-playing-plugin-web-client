import React, { HTMLProps } from 'react';
import './Dock.scss';

export interface DockProps extends HTMLProps<HTMLDivElement> {
  position: string;
}

function Dock(props: DockProps) {
  return (
    <div className={`Dock Dock--${props.position}`}>
      {props.children}
    </div>
  );
}

export default Dock;
