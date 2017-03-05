import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { createContainer } from 'meteor/react-meteor-data';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Menu from 'antd/lib/menu';
import Row from 'antd/lib/row';
import Tooltip from 'antd/lib/tooltip';
import message from 'antd/lib/message';

const FormItem = Form.Item;


const styles = {
  loginForm: {
    maxWidth: 300
  },
  loginFormForgot: {
    float: 'right'
  },
  loginFormButton: {
    width: '100%'
  }
};
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const ProfileTab = injectIntl(Form.create()(React.createClass({
  getInitialState() {
    return {
      updateFailed: false,
      isFirst: true,
    };
  },
  componentWillReceiveProps(nextProps){
    if (this.state.isFirst && nextProps.currentUser && nextProps.currentUser.nickname) {
      nextProps.form.setFieldsValue({nickname: nextProps.currentUser.nickname});
      this.setState({isFirst: false});
    }
  },
  checkNickname(rule, value, callback) {
    console.log(value);
    if (value) {
      if (value !== this.props.currentUser.nickname) {
        callback();
      } else {
        callback(this.props.intl.formatMessage({id: "usersettings.nickname no change"}));
      }
    } else {
      callback(this.props.intl.formatMessage({id: "usersettings.empty nickname"}));
    }
  },
  handleSubmit(e) {
    e.preventDefault();
    this.setState({updateFailed: false});
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        Meteor.call('user.updateNickname', values.nickname, (error, result) => {
          if (error) {
            this.setState({updateFailed: true});
            console.log(error);
          } else {
            this.setState({updateFailed: false});
            message.success(this.props.intl.formatMessage({id: "usersettings.updated successfully"}), 3);
          }
        });
      }
    });
  },
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit} style={styles.loginForm}>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.username"})}
        >
          <Input disabled value={this.props.currentUser ? this.props.currentUser.username : null } />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "usersettings.personal domain"})}
        >
          <span>{ Meteor.absoluteUrl() + 'people/' + (this.props.currentUser ? this.props.currentUser.username : '') }</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.nickname"})}
        >
          {getFieldDecorator('nickname', {
            rules: [{
              validator: this.checkNickname,
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="general.save" defaultMessage="Save" />
          </Button>
        </FormItem>
        { this.state.updateFailed ?
          <Alert message={this.props.intl.formatMessage({id: "usersettings.save failed"})} type="error"/>
          : null
        }
      </Form>
    );
  },
})));

const ChangePasswordForm = injectIntl(Form.create()(React.createClass({
  getInitialState() {
    return {
      showChangePaswordForm: false,
      passwordDirty: false,
    };
  },
  handleSubmit(e) {
    e.preventDefault();
    this.setState({showChangePaswordForm: false});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        Accounts.changePassword(values.old_password, values.password, (error) => {
          if (error) {
            message.error(this.props.intl.formatMessage({id: "usersettings.incorrect old password"}), 3);
            console.error(error);
          } else {
            message.success(this.props.intl.formatMessage({id: "usersettings.password updated"}), 3);
          }
        });
      }
    });
  },
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  },
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(this.props.intl.formatMessage({id: "resetpassword.two passwords"}));
    } else {
      if (value && value == form.getFieldValue('old_password')) {
        callback(this.props.intl.formatMessage({id: "usersettings.new password is the same"}));
      } else {
        callback();
      }
    }
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 9 },
    };

    if (this.state.showChangePaswordForm) {
      return (
        <Form horizontal onSubmit={this.handleSubmit} style={{maxWidth: 300}}>
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({id: "usersettings.old password"})}
            hasFeedback
          >
            {getFieldDecorator('old_password', {
              rules: [{
                required: true, message: this.props.intl.formatMessage({id: "usersettings.input old password"}),
              }],
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({id: "usersettings.new password"})}
            hasFeedback
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: this.props.intl.formatMessage({id: "usersettings.input new password"}),
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input type="password" onBlur={this.handlePasswordBlur} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({id: "usersettings.retype new password"})}
            hasFeedback
          >
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: this.props.intl.formatMessage({id: "usersettings.input new password"}),
              }, {
                validator: this.checkPassowrd,
              }],
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit"><FormattedMessage id="general.submit" /></Button>
          </FormItem>
        </Form>
      );
    } else {
      return (
        <a href="javascript:;" onClick={() => this.setState({showChangePaswordForm: true})}><FormattedMessage id="usersettings.change password" /></a>
      );
    }
  }
})));

const TIME_OUT = 60;  // seconds

const AccountTab = injectIntl(React.createClass({
  getInitialState() {
    return {
      counter: TIME_OUT,
      intervalId: null,
      showChangePaswordForm: false,
    };
  },
  resendEmail() {
    Meteor.call('sendVerificationEmail', (error, result)=> {
      if (error) {
        message.error(this.props.intl.formatMessage({id: "usersettings.verification email sent failed"}), 3);
        console.error(error);
      } else {
        message.success(this.props.intl.formatMessage({id: "usersettings.verification email sent successfully"}), 3);
      }
    });

    intervalId = Meteor.setInterval(() => {
      if (this.state.counter > 0) this.setState({counter: this.state.counter-1});
    }, 1000);
    this.setState({intervalId: intervalId});
  },
  componentWillUpdate() {
    if (this.state.counter <= 1) { // attention! it's 1 instead of 0
      Meteor.clearInterval(this.state.intervalId);
      this.setState({counter: TIME_OUT, intervalId: null});
    }
  },
  render() {
    return (
      <div>
        <Row>
          <Col span={2}><FormattedMessage id="general.email" />:</Col>
          <Col span={12}>
            { this.props.currentUser ? this.props.currentUser.emails[0].address + (this.props.currentUser.emails[0].verified ? "(已验证)" : null) : null}
            <br />
            { this.props.currentUser && !this.props.currentUser.emails[0].verified ?
              <span>
                <Alert message={this.props.intl.formatMessage({id: "usersettings.email not verified"})} type="warning" />
                <Button type="primary" onClick={this.resendEmail} disabled={this.state.counter!=TIME_OUT}>{this.state.counter != TIME_OUT ? this.props.intl.formatMessage({id: "usersettings.send again"}) + "("+this.state.counter+")" : this.props.intl.formatMessage({id: "usersettings.send again"})}</Button>
              </span>
              : null
            }
          </Col>
        </Row>
        <Row>
          <Col span={2}><FormattedMessage id="general.password" />:</Col>
          <Col span={12}><ChangePasswordForm /></Col>
        </Row>
      </div>
    );
  },
}));

class UserSettings extends React.Component {
  render() {
    const activeTab = this.props.activeTab || 'profile';

    return (
      <div>
        <div style={{height: '48px', borderBottom: "1px solid #e9e9e9", background: "#fff"}}>
          <div style={{padding: '0 50px'}}>
            <Menu mode="horizontal" selectedKeys={['settings/' + activeTab]} style={{marginLeft: 124}}>
              <Menu.Item key="settings/profile"><a href="/settings/profile"><FormattedMessage id="usersettings.basic profile" /></a></Menu.Item>
            <Menu.Item key="settings/account"><a href="/settings/account"><FormattedMessage id="usersettings.account and password" /></a></Menu.Item>
              <Menu.Item key="settings/notifications"><a href="/settings/notifications"><FormattedMessage id="usersettings.notifications" /></a></Menu.Item>
            </Menu>
          </div>
        </div>
        <div style={{padding: "0 50px"}}>
          <div style={{margin: '24px 0 0', position: 'relative', overflow: "hidden"}}>
            { activeTab == 'profile' ? <ProfileTab currentUser={this.props.currentUser} /> : null  }
            { activeTab == 'account' ? <AccountTab currentUser={this.props.currentUser} /> : null  }
            { activeTab == 'profile' ? <div></div> : null }
            { activeTab == 'notifications' ? <div></div> : null }
          </div>
        </div>
      </div>
    );
  }
};


export default createContainer(() => {
  return {
    currentUser: Meteor.user(),
  };
}, injectIntl(UserSettings));
