import { Fragment, useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Icon from '@/components/Icon';
import { NAVIGATION, NavItem, NavRouteObject, NavSection } from '@/constants/routes';
import { isNavRouteObject, isNavSection } from '@/utils/routes';

import css from './SideBar.module.css';
import { ChangeEvent } from 'react';

export default function SideBar() {
  const [ search, setSearch ] = useState('');
  const closeClasses = [ css.close ];

  if (!search) closeClasses.push(css.hidden);

  const navigation = useMemo(() => NAVIGATION.map(filterNavigation(search)), [ search ]);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);

  const handleSearchClear = useCallback(() => setSearch(''), []);

  return (
    <menu className={css.base}>
      <div className={css.search}>
        <input className={css.input} placeholder="search" value={search} onChange={handleSearch} />
        <div className={closeClasses.join(' ')} onClick={handleSearchClear}>
          <Icon name="close" />
        </div>
      </div>
      <div className={css.menu}>
        {navigation.map((item) => Item(item, search))}
      </div>
    </menu>
  );
}

const filterNavigation = (search: string) => {
  const regex = new RegExp(search, 'i');
  return (item: NavItem): NavItem => {
    if (isNavSection(item)) {
      item.children = item.children.map(filterNavigation(search));
      const hasVisibleChild = item.children.reduce((acc, child) => acc || !child.hidden, false);
      item.hidden = !!search && !regex.test(item.label) && !hasVisibleChild;
    } else if (isNavRouteObject(item)) {
      item.hidden = !!search && !regex.test(item.label);
    }
    return item;
  }
};

function Item(item: NavItem, search: string) {
  if (isNavSection(item)) return Section(item, search);
  if (isNavRouteObject(item)) return Route(item, search);
  return null;
}

function Section(section: NavSection, search: string) {
  const [ isOpen, setIsOpen ] = useState(true);
  const classes = [ css.section ];

  if (!isOpen) classes.push(css.closed);
  if (section.hidden) classes.push(css.hidden);

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <section className={classes.join(' ')} key={section.label}>
      <div className={css.title} onClick={handleToggle}>
        <Icon name={isOpen ? 'arrow-down' : 'arrow-right'} />
        <span>{BoldedText(section.label, search)}</span>
      </div>
      <div className={css.body}>
        {section.children.map((child) => Item(child, search))}
      </div>
    </section>
  );
}

function Route(item: NavRouteObject, search: string) {
  const location = useLocation();
  const classes = [ css.link ];

  if (item.path === location.pathname) classes.push(css.current);

  return item.path && !item.hidden ? (
    <Link className={classes.join(' ')} key={item.path} to={item.path}>
      {BoldedText(item.label, search)}
    </Link>
  ) : null;
}

function BoldedText(text: string, shouldBeBold: string) {
  if (!shouldBeBold) return [ text ];

  const pieces = [];
  const regex = new RegExp(shouldBeBold, 'i');
  let remainder = text;
  let search = remainder.search(regex);

  while (search !== -1 && remainder) {
    const pre = remainder.substring(0, search);
    const match = remainder.substring(search, search + shouldBeBold.length);
    if (pre) pieces.push(pre);
    if (match) pieces.push(<b>{match}</b>);
    remainder = remainder.substring(search + shouldBeBold.length);
    search = remainder.search(regex);
  }
  pieces.push(remainder);

  return (
    <>
      {pieces.map((piece, index) => <Fragment key={index}>{piece}</Fragment>)}
    </>
  );
}