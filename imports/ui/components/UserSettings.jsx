import React from 'react';
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

const ProfileTab = Form.create()(React.createClass({
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
        callback('Nickname has no change');
      }
    } else {
      callback('Nickname is empty');
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
            message.success("Updated successfully", 3);
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
          label="Username"
        >
          <Input disabled value={this.props.currentUser ? this.props.currentUser.username : null } />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="个性域名"
        >
          <span>{ Meteor.absoluteUrl() + 'people/' + (this.props.currentUser ? this.props.currentUser.username : '') }</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Nickname"
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
            Save
          </Button>
        </FormItem>
        { this.state.updateFailed ?
          <Alert message="Save failed" type="error"/>
          : null
        }
      </Form>
    );
  },
}));

const ChangePasswordForm = Form.create()(React.createClass({
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
            message.error("The old password is incorrect", 3);
            console.error(error);
          } else {
            message.success("Password updated successfully", 3);
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
      callback('The two passwords you typed do not match');
    } else {
      if (value && value == form.getFieldValue('old_password')) {
        callback('The new password is the same as the old one');
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
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };

    if (this.state.showChangePaswordForm) {
      return (
        <Form horizontal onSubmit={this.handleSubmit} style={{maxWidth: 300}}>
          <FormItem
            {...formItemLayout}
            label="Old password"
            hasFeedback
          >
            {getFieldDecorator('old_password', {
              rules: [{
                required: true, message: 'Please input your old password',
              }],
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="New password"
            hasFeedback
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: 'Please input the password',
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input type="password" onBlur={this.handlePasswordBlur} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Confirm new Password"
            hasFeedback
          >
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: 'Please confirm your password',
              }, {
                validator: this.checkPassowrd,
              }],
            })(
              <Input type="password" />
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit">Submit</Button>
          </FormItem>
        </Form>
      );
    } else {
      return (
        <a href="javascript:;" onClick={() => this.setState({showChangePaswordForm: true})}>Change password</a>
      );
    }
  }
}));

const TIME_OUT = 60;  // seconds

const AccountTab = React.createClass({
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
        message.error("Password reset E-mail resent failed", 3);
        console.error(error);
      } else {
        message.success("Password reset E-mail resent successfully", 3);
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
          <Col span={1}>E-mail:</Col>
          <Col span={12}>
            { this.props.currentUser ? this.props.currentUser.emails[0].address + (this.props.currentUser.emails[0].verified ? "(已验证)" : null) : null}
            <br />
            { this.props.currentUser && !this.props.currentUser.emails[0].verified ?
              <span>
                <Alert message="Your E-mail is not verified, please check your E-mail and click the activation link." type="warning" />
                <Button type="primary" onClick={this.resendEmail} disabled={this.state.counter!=TIME_OUT}>{this.state.counter != TIME_OUT ? "Send again("+this.state.counter+")" : "Send again"}</Button>
              </span>
              : null
            }
          </Col>
        </Row>
        <Row>
          <Col span={1}>Password:</Col>
          <Col span={12}><ChangePasswordForm /></Col>
        </Row>
      </div>
    );
  },
});

class UserSettings extends React.Component {
  render() {
    const activeTab = this.props.activeTab || 'profile';

    return (
      <div>
        <div style={{height: '48px', borderBottom: "1px solid #e9e9e9", background: "#fff"}}>
          <div style={{padding: '0 50px'}}>
            <Menu mode="horizontal" selectedKeys={['settings/' + activeTab]} style={{marginLeft: 124}}>
              <Menu.Item key="settings/profile"><a href="/settings/profile">My profile</a></Menu.Item>
            <Menu.Item key="settings/account"><a href="/settings/account">Account</a></Menu.Item>
              <Menu.Item key="settings/notifications"><a href="/settings/notifications">Notifications</a></Menu.Item>
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
}, UserSettings);
