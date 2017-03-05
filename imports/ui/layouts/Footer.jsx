import React from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'antd/lib/select';
import 'antd/dist/antd.css';

class Footer extends React.Component {
  render() {
    return (
      <footer id="footer">
        <ul>
          <li>
            <h2><FormattedMessage id='footer.about' defaultMessage='About' /></h2>
            <div>
              <a target="_blank " href="https://www.algohub/terms">
                <FormattedMessage id='footer.terms' defaultMessage='Terms' />
              </a>
            </div>
            <div>
              <a target="_blank " href="https://www.algohub/faq">
                <FormattedMessage id='footer.faq' defaultMessage='FAQ' />
              </a>
            </div>
          </li>
          <li>
            <div>Copyright © 2017 AlgoHub</div>
            <div>All Rights Reserved</div>
          </li>
          <li>
            <h2><FormattedMessage id='footer.contact us' defaultMessage='Contact Us' /></h2>
            <div>
              <a target="_blank " href="https://twitter.com/algohub">
                Twitter
              </a>
            </div>
            <div>
              <a target="_blank " href="https://weibo.com/algohub">
                微博
              </a>
            </div>
          </li>
          <li>
            <h2><FormattedMessage id='footer.select language' defaultMessage='Select Language' /></h2>
            <Select defaultValue={this.props.locale} onChange={this.props.onChange}>
              <Select.Option value="en-US">English</Select.Option>
              <Select.Option value="zh-CN">简体中文</Select.Option>
            </Select>
          </li>
        </ul>
      </footer>
    );
  }
}

export default Footer;
