import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import Items from './Items';
import styles from './Section.module.scss';
import $ from 'cash-dom';
import { useAppContext } from '../../contexts/AppContextProvider';
import { hasMenu } from './helper';

function Section(props) {
  const {host} = useAppContext();

  const listView = useMemo(() => {
    let availableListViews = props.list.availableListViews;
    if (!Array.isArray(availableListViews) || availableListViews.length === 0) {
      availableListViews = ['list', 'grid'];
    }
    const preferredListView = props.preferredListView || 'grid';
    return availableListViews.includes(preferredListView) ? 
      preferredListView : availableListViews[0];  
  }, [props.list.availableListViews, props.preferredListView]);

  //let title = data.title ? self.formatRichTitle(data.title) : '';
  const title = props.list.title || '';
  
  const titleClassNames = classNames([
    styles.Title,
    props.sectionIndex === 0 ? styles['Title--first'] : null,
    !title ? styles['Title--empty'] : null
  ]);

  const itemsContain = useMemo(() => {
    const result = {
      album: false,
      artist: false,
      duration: false,
      menu: false
    };
    for (const item of props.list.items) {
      if (item.album) { result.album = true; }
      if (item.artist) { result.artist = true; }
      if (item.duration) { result.duration = true; }
      if (hasMenu(item)) { result.menu = true; }
      if (result.album && result.artist && result.duration) {
        break;
      }
    }
    return result;
  }, [props.list.items]);

  const itemsClassNames = classNames([
    styles.Items,
    styles[`Items--${listView}`],
    !itemsContain.album ? styles[`Items--noAlbum`] : null,
    !itemsContain.artist ? styles[`Items--noArtist`] : null,
    !itemsContain.duration ? styles[`Items--noDuration`] : null,
    !itemsContain.menu ? styles[`Items--noMenu`] : null
  ]);

  const handleItemClicked = (item, itemIndex) => {
    props.onItemClick(item, props.list, itemIndex);
  };

  const handlePlayClicked = (item, itemIndex) => {
    props.onPlayClick(item, props.list, itemIndex);
  };

  const handleMenuItemClicked = (e) => {
    e.syntheticEvent.stopPropagation();
    const {itemIndex, action} = e.value;
    props.callItemAction(props.list.items[itemIndex], props.list, itemIndex, action);
  };

  /*
   * Temporary workaround for my plugins that provide rich titles
   */
  const formatRichTitle = useCallback((s) => {
    const hasHtml = /<[a-z][\s\S]*>/i.test(s);
    if (!hasHtml) {
      return s;
    }
    const titleEl = $('<div>' + s + '</div>');
  
    // Process images
    titleEl.find('img').each( function() {
      const img = $(this);
      const src = img.attr('src');
      if (src.startsWith('/albumart')) {
        img.attr('src', host + src);
      }
      // Also format image containers
      const container = img.parent('div');
      container.css({
        'display': 'flex',
        'align-items': 'center'
      });
      if (container.css('text-align') === 'right') {
        container.css('justify-content', 'flex-end');
      }
    });
  
    // Process divs
    titleEl.find('div').each( function() {
      const div = $(this);
      // Remove negative bottom margins and relative top positions
      // because our screens do not show insanely huge default margins
      if (div.css('margin-bottom') && parseInt(div.css('margin-bottom'), 10) < 0) {
        div.css('margin-bottom', '0');
      }
      if (div.css('top')) {
        div.css('top', '0');
      }
    })
  
    const html = `
      <div class="${styles['Title--rich']}">
        ${ titleEl.html() }
      </div>`;
    return html;
  }, [host]);

  const sectionClassNames = classNames(
    styles.Layout,
    styles[`Layout--${listView}`],
    props.maximized ? styles[`Layout--maximized`] : null
  );

  return (
    <section className={sectionClassNames}>
      <div 
        className={titleClassNames} 
        dangerouslySetInnerHTML={{ __html: formatRichTitle(title)}} />
      <div className={itemsClassNames}>
        <Items 
          styles={styles} 
          items={props.list.items} 
          location={props.location}
          onItemClick={handleItemClicked} 
          onPlayClick={handlePlayClicked}
          onMenuItemClick={handleMenuItemClicked}
          onMenuOverlay={props.onMenuOverlay} />
      </div>
    </section>
  );

  // TODO: If no items then display No Results as title
}

export default Section;
