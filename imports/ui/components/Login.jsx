import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import message from 'antd/lib/message';

import RecaptchaItem from './RecaptchaItem';

const FormItem = Form.Item;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginFailed: false,
      loginFailedCount: parseInt(localStorage.getItem("login-failed-count")) || 0,
      failedReason: '',
    };
  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({loginFailed: false, failedReason: null});
    console.log("loginFailedCount", this.state.loginFailedCount);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        if (this.state.loginFailedCount > 5) {
          Meteor.call('verifyCaptcha', values.captcha, (error, result) => {
            if (error) {
              console.log("Captcha verification failed with error: ", error);
              this.setState({ loginFailed: true, failedReason: this.props.intl.formatMessage({id: "signin.incorrect captcha"}) });
            } else {
              if (result) {
                Meteor.loginWithPassword(values.username, values.password, (error) => {
                  if (error) {
                    localStorage.setItem("login-failed-count", (this.state.loginFailedCount+1).toString());
                    this.setState({
                      loginFailed: true, loginFailedCount: (this.state.loginFailedCount + 1),
                      failedReason: this.props.intl.formatMessage({id: "signin.incorrect username or password"})
                    });
                  } else {
                    message.success(this.props.intl.formatMessage({id: "signin.signed in successfully"}), 3);
                    localStorage.removeItem("login-failed-count");
                    const previous = Session.get('previous-url');
                    if (previous) FlowRouter.redirect(Session.get('previous-url'));
                    else FlowRouter.redirect('/');
                    Session.set('previous-url', undefined);
                  }
                });
              } else {
                console.log("Captcha verification failed");
                this.setState({ loginFailed: true, failedReason: this.props.intl.formatMessage({id: "signin.incorrect captcha"}) });
              }
            }
          });
        } else {
          Meteor.loginWithPassword(values.username, values.password, (error) => {
            if (error) {
              localStorage.setItem("login-failed-count", (this.state.loginFailedCount+1).toString());
              this.setState({
                loginFailed: true, loginFailedCount: (this.state.loginFailedCount + 1),
                failedReason: this.props.intl.formatMessage({id: "signin.incorrect username or password"})
              });
            } else {
              message.success(this.props.intl.formatMessage({id: "signin.signed in successfully"}), 3);
              localStorage.removeItem("login-failed-count");
              const previous = Session.get('previous-url');
              if (previous) FlowRouter.redirect(Session.get('previous-url'));
              else FlowRouter.redirect('/');
              Session.set('previous-url', undefined);
            }
          });
        }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
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
    }
    return (
      <Form onSubmit={this.handleSubmit.bind(this)} style={styles.loginForm}>
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: this.props.intl.formatMessage({id: "signin.input username or email"}) }],
          })(
            <Input addonBefore={<Icon type="user" />} placeholder={this.props.intl.formatMessage({id: "signin.username or email"})} />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: this.props.intl.formatMessage({id: "signin.input password"}) }],
          })(
            <Input addonBefore={<Icon type="lock" />} type="password" placeholder={this.props.intl.formatMessage({id: "signin.password"})} />
          )}
        </FormItem>
        { this.state.loginFailedCount > 5 ?
          <FormItem>
            {getFieldDecorator('captcha', {
              rules: [{required: true, message: this.props.intl.formatMessage({id: "signin.input captcha"})}],
            })(<RecaptchaItem />)}
          </FormItem>
          :
          null
        }
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox><FormattedMessage id='login.remember me' defaultMessage='Remember Me' /></Checkbox>
          )}
          <a className="login-form-forgot" href='/forgot-password' style={styles.loginFormForgot}><FormattedMessage id='login.forgot password' defaultMessage='Forgot password' /></a>
          <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
            <FormattedMessage id='general.signin' defaultMessage='Sign in' />
          </Button>
          <FormattedMessage id='login.or' defaultMessage='Or' /> <a href="/signup"><FormattedMessage id='login.sign up now' defaultMessage='Sign up Now' /></a>
        </FormItem>
        { this.state.loginFailed ?
          <Alert message={this.state.failedReason} type="error"/>
          : null
        }
      </Form>
    );
  }
};

export default injectIntl(Form.create()(Login));
