import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Icon from '@/components/Icon';
import { NAVIGATION, NavItem, NavRouteObject, NavSection } from '@/constants/routes';
import { isNavRouteObject, isNavSection } from '@/utils/routes';

import css from './SideBar.module.css';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {NAVIGATION.map((item) => Item(item))}
    </menu>
  );
}

function Item(item: NavItem) {
  if (isNavSection(item)) return Section(item);
  if (isNavRouteObject(item)) return Route(item);
  return null;
}

function Section(section: NavSection) {
  const [ isOpen, setIsOpen ] = useState(true);
  const classes = [ css.section ];

  if (!isOpen) classes.push(css.closed);

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <section className={classes.join(' ')} key={section.label}>
      <div className={css.title} onClick={handleToggle}>
        <Icon name={isOpen ? 'arrow-down' : 'arrow-right'} />
        <span>{section.label}</span>
      </div>
      <div className={css.body}>
        {section.children.map((child) => Item(child))}
      </div>
    </section>
  );
}

function Route(item: NavRouteObject) {
  const location = useLocation();
  const classes = [ css.link ];

  console.log(item.path, location.pathname)
  if (item.path === location.pathname) classes.push(css.current);

  return item.path ? (
    <Link className={classes.join(' ')} key={item.path} to={item.path}>{item.label}</Link>
  ) : null;
}
