import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import enquire from 'enquire.js';
import classNames from 'classnames';

import 'antd/dist/antd.css';
import Badge from 'antd/lib/badge';
import Menu from 'antd/lib/menu';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Popover from 'antd/lib/popover';
import Input from 'antd/lib/input';

import { NotificationUnreadCounters } from '../../api/notifications.js';

const Search = Input.Search;
const SubMenu = Menu.SubMenu;


const NotificationBadge = createContainer(() => {
  Meteor.subscribe('notification_unread_counters');
  return {
    unread: NotificationUnreadCounters.find().fetch(),
  }
}, React.createClass({
  render() {
    let unreadCount = 0;
    if (this.props.unread.length >0) {
      unreadCount = this.props.unread[0].count;
    }
    return (
      <a href="/notifications">
        <Badge count={unreadCount}>
          <FormattedMessage id='header.notifications' defaultMessage='Notifications' />
        </Badge>
      </a>
    );
  },
}));


class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuMode: 'horizontal',
    };
  }

  componentDidMount() {
    enquire.register('only screen and (min-width: 320px) and (max-width: 940px)', {
      match: () => {
        this.setState({ menuMode: 'inline' });
      },
      unmatch: () => {
        this.setState({ menuMode: 'horizontal' });
      },
    });
  }

  render() {
    const { activeMenu } = this.props;
    let activeMenuItem = activeMenu || 'home';

    const headerClassName = classNames({
      clearfix: true,
      'home-nav-white': true,
    });

    let menu;
    if (this.props.currentUser) {
      menu = [
        <Menu mode={this.state.menuMode} selectedKeys={[activeMenuItem]} id="nav" key="nav">
          <Menu.Item key="home">
            <a href="/"><FormattedMessage id='header.problems' defaultMessage='Problems' /></a>
          </Menu.Item>
          <Menu.Item key="qa">
            <a href="/questions"><FormattedMessage id='header.qa' defaultMessage='Q&A' /></a>
          </Menu.Item>
          <Menu.Item key="solutions">
            <a href="/solutions"><FormattedMessage id='header.solutions' defaultMessage='Solutions' /></a>
          </Menu.Item>
          <SubMenu title={<span><Icon type="user"/>{this.props.currentUser.username}</span>} id="navsubmenu">
            <Menu.Item key="people">
              <a href={'/people/' + this.props.currentUser.username}><FormattedMessage id='header.homepage' defaultMessage='My Homepage' /></a>
            </Menu.Item>
            <Menu.Item key="notifications">
              <NotificationBadge />
            </Menu.Item>
            <Menu.Item key="settings">
              <a href='/settings'><FormattedMessage id='header.settings' defaultMessage='Settings' /></a>
            </Menu.Item>
            <Menu.Item key="logout">
              <a href='/logout'><FormattedMessage id='general.signout' defaultMessage='Log Out' /></a>
            </Menu.Item>
          </SubMenu>
        </Menu>,
      ]
    } else {
      if (FlowRouter.current().path != '/signin' && FlowRouter.current().path != '/signup') {
        Session.set("previous-url", FlowRouter.current().path);
      }
      menu = [
        <span className="lang" key='loginsignup'><a href="/signin"><FormattedMessage id='general.signin' defaultMessage='Sign in' /></a>{' '}<a href="/signup"><FormattedMessage id='general.signup' defaultMessage='Sign up' /></a></span>,
        <Menu mode={this.state.menuMode} selectedKeys={[activeMenuItem]} id="nav" key="nav">
          <Menu.Item key="home">
            <a href="/"><FormattedMessage id='header.problems' defaultMessage='Problems' /></a>
          </Menu.Item>
          <Menu.Item key="qa">
            <a href="/questions"><FormattedMessage id='header.qa' defaultMessage='Q&A' /></a>
          </Menu.Item>
          <Menu.Item key="solutions">
            <a href="/solutions"><FormattedMessage id='header.solutions' defaultMessage='Solutions' /></a>
          </Menu.Item>
        </Menu>,
      ]
    }

    return (
      <header id="header" className={headerClassName}>
        {this.state.menuMode === 'inline' ? <Popover
          overlayClassName="popover-menu"
          placement="bottomRight"
          content={menu}
          trigger="click"
          arrowPointAtCenter
        >
          <Icon
            className="nav-phone-icon"
            type="menu"
          />
        </Popover> : null}
        <Row>
          <Col lg={4} md={6} sm={24} xs={24}>
            <a href="/" id="logo">
              <img alt="logo" src="/images/logo.png" style={{width: 64, height: 64}}/>
              <span>AlgoHub</span>
            </a>
          </Col>
          <Col lg={20} md={18} sm={17} xs={0} style={{ display: 'block' }}>
            <div id="search-box">
              <Search placeholder="Enter keywords to search..."
                      onSearch={value => console.log(value)} style={{ width: 300 }} />
            </div>
            {this.state.menuMode === 'horizontal' ? menu : null}
          </Col>
        </Row>
      </header>
    );
  }
}

Header.propTypes = {
  currentUser: React.PropTypes.object,
};

export default createContainer(() => {
  return {
    currentUser: Meteor.user(),
  };
}, Header);
