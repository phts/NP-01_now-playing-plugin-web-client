import './Dock.scss';

function Dock(props) {
  return (
    <div className={`Dock Dock--${props.position}`}>
      {props.children}
    </div>
  );
}

export default Dock;