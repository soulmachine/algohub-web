import React from 'react';
import {IntlProvider, addLocaleData} from 'react-intl';
import LocaleProvider from 'antd/lib/locale-provider';
import appLocaleEn from '../locales/en-US.js'
import appLocaleZh from '../locales/zh-CN.js'
import Header from './Header';
import Footer from './Footer';
import '../../ui/static/style';


class MainLayout extends React.Component {
  constructor() {
    super();
    this.state = {
      locale: localStorage.getItem("locale") || navigator.language || navigator.browserLanguage || 'en-US',
    };
  }
  handleChange(value) {
    this.setState({locale: value});
    localStorage.setItem("locale", value);
    location.reload(); // must refresh current page to make new locale take effect
  }
  render() {
    const activeMenu = FlowRouter.getRouteName();
    let appLocale = null;
    if(this.state.locale === 'en-US') {
      appLocale = appLocaleEn;
    } else if (this.state.locale === 'zh-CN') {
      appLocale = appLocaleZh;
    } else {
      appLocale = appLocaleEn;
    }
    addLocaleData(appLocale.data);

    return (
      //<div className="page-wrapper">
      <LocaleProvider locale={appLocale.antd}>
        <IntlProvider
          locale={appLocale.locale}
          messages={appLocale.messages}
          formats={appLocale.formats}
        >
          <div>
            <Header activeMenu={activeMenu} />
            <div className="main-wrapper">
              {this.props.children}
            </div>
            <Footer locale={this.state.locale} onChange={this.handleChange.bind(this)} />
          </div>
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

export default MainLayout;
