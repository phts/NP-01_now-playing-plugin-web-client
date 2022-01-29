import './Button.scss';
import classNames from 'classnames';

function Button(props) {
  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'Button',
      props.toggleable ? stylesBundle[`${baseClassName}--toggleable`] || 'Button--toggleable': null,
      props.toggled ? stylesBundle[`${baseClassName}--toggled`] || 'Button--toggled' : null,
      [...extraClassNames]
    )
    :
    classNames(
      'Button',
      props.toggleable ? 'Button--toggleable' : null,
      props.toggled ? 'Button--toggled' : null,
      [...extraClassNames]
    );

  const getElementClassName = (element) => (baseClassName && stylesBundle) ? 
      stylesBundle[`${baseClassName}__${element}`] || `Button__${element}`:
      `Button__${element}`;

  const dataKeys = Object.keys(props).filter(key => key.startsWith('data-'));
  const dataAttrs = dataKeys.reduce((prev, current) => {
    prev[current] = props[current];
    return prev;
  }, {});

  return (
    <button className={mainClassName} onClick={props.onClick} {...dataAttrs}>
      { props.image ? <img className={getElementClassName('image')} src={props.image} alt=""/> : null }
      { props.icon ? <span className={getElementClassName('icon')}>{ props.icon }</span> : null }
      { props.text ? <span className={getElementClassName('text')}>{ props.text }</span> : null }
    </button>
  );
}

export default Button;
