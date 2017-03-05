import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Radio from 'antd/lib/radio';
import Select from 'antd/lib/select';

import RecaptchaItem from './RecaptchaItem';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;


class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signupFailed: false,
      failedReason: '',
      passwordDirty: false,
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({signupFailed: false, failedReason: ''});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Received values of form: ', values);
        Accounts.createUser({
          username: values.username,
          email: values.email,
          password: values.password,
          profile: {gender: values.gender, birthyear: parseInt(values.birthyear), captcha: values.captcha}
        }, (error) => {
          if (error) {
            console.log('Signup failed with error: ', error);
            if (error.message.includes("reCAPTCHA")) {
              console.log("Captcha verification failed");
              this.setState({signupFailed: true, failedReason: this.props.intl.formatMessage({id: "signin.incorrect captcha"})});
            } else {
              this.setState({signupFailed: true, failedReason: this.props.intl.formatMessage({id: "signup.unkown error"})});
            }
          }
          else {
            message.success(this.props.intl.formatMessage({id: "signup.success email"}), 3);
            const previous = Session.get('previous-url');
            if (previous) FlowRouter.redirect(Session.get('previous-url'));
            else FlowRouter.redirect('/');
            Session.set('previous-url', undefined);
          }
        });
      }
    });
  }
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(this.props.intl.formatMessage({id: "resetpassword.two passwords"}));
    } else {
      callback();
    }
  }
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  usernameExists(rule, value, callback) {
    console.log('username: ', value);
    if (value) {
      Meteor.call('usernameExists', value, (error, result) => {
        if (error) {
          console.log('There is an error while checking username');
          callback();
        } else {
          if (result) {
            callback(this.props.intl.formatMessage({id: "signup.username already exists"}));
          } else {
            callback();
          }
        }
      });
    } else {
      callback();
    }
  }
  emailExists(rule, value, callback) {
    console.log('email: ', value);
    if (value) {
      Meteor.call('emailExists', value, (error, result) => {
        if (error) {
          console.log('There is an error while checking email');
          callback();
        } else {
          if (result) {
            callback(this.props.intl.formatMessage({id: "signup.email already exists"}));
          } else {
            callback();
          }
        }
      });
    } else {
      callback();
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 11 },
      wrapperCol: { span: 12 },
    };

    const beginYear=  (new Date().getFullYear())-80;
    const years = [...Array(77).keys()].map((x)=>x+beginYear);

    return (
      <Form horizontal onSubmit={this.handleSubmit.bind(this)} style={{maxWidth: 300}}>
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              {this.props.intl.formatMessage({id: "general.username"})}&nbsp;
              <Tooltip title={this.props.intl.formatMessage({id: "signup.username unique"})}>
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('username', {
            rules: [{
              required: true, message: this.props.intl.formatMessage({id: "signup.input username"}),
            }, { validator: this.usernameExists.bind(this)
            }],
            validateTrigger: 'onBlur',
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.password"})}
          hasFeedback
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: this.props.intl.formatMessage({id: "signin.input password"}),
            }, {
              validator: this.checkConfirm.bind(this),
            }],
          })(
            <Input type="password" onBlur={this.handlePasswordBlur.bind(this)} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "resetpassword.retype password"})}
          hasFeedback
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: this.props.intl.formatMessage({id: "resetpassword.two passwords"}),
            }, {
              validator: this.checkPassowrd.bind(this),
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.email"})}
          hasFeedback
        >
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: this.props.intl.formatMessage({id: "forgotpassword.illegal email address"}),
            }, {
              required: true, message: this.props.intl.formatMessage({id: "forgotpassword.input your email"}),
            }, {
              validator: this.emailExists.bind(this),
            }],
            validateTrigger: 'onBlur',
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.gender"})}
          hasFeedback
        >
          {getFieldDecorator('gender', {
            rules: [{ required: true, message: this.props.intl.formatMessage({id: "signup.choose gender"}) }],
          })(
            <RadioGroup>
              <Radio key="male" value='male'>{this.props.intl.formatMessage({id: "general.male"})}</Radio>
              <Radio key="female" value='female'>{this.props.intl.formatMessage({id: "general.female"})}</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={this.props.intl.formatMessage({id: "general.birthday"})}
          hasFeedback
        >
          {getFieldDecorator('birthyear', {
            rules: [{ required: true, message: this.props.intl.formatMessage({id: "signup.input birthday"}) }],
          })(
            <Select size="large" style={{ width: 100 }}>
              { years.map((year)=> {
                return (<Option value={''+year} key={''+year}>{year}</Option>);
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('captcha', {
            rules: [{ required: true, message: this.props.intl.formatMessage({id: "signin.input captcha"})}],
          })(<RecaptchaItem />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={{width: '100%'}}>{this.props.intl.formatMessage({id: "general.signup"})}</Button>
        </FormItem>
        <span><FormattedMessage id="signup.clicking means agree" defautMessage="By clicking Create Account, you agree to our " /> <a href="/terms">{this.props.intl.formatMessage({id: "general.terms"})}</a></span>
        { this.state.signupFailed ?
          <Alert message={this.state.failedReason} type="error"/>
          : null
        }
      </Form>
    );
  }
}

export default injectIntl(Form.create()(Signup));
