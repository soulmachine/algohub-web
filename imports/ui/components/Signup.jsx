import React from 'react';
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
              this.setState({signupFailed: true, failedReason: "Incorrect captcha"});
            } else {
              this.setState({signupFailed: true, failedReason: "Signup failed, unknown internal error"});
            }
          }
          else {
            message.success("Signup successfully, please check your E-mail", 3);
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
      callback('The two passwords you typed do not match');
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
            callback('The username already exists');

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
            callback('The E-mail already exists');
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
              Username&nbsp;
              <Tooltip title="Username as the unique ID">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('username', {
            rules: [{
              required: true, message: 'Please input username'
            }, { validator: this.usernameExists.bind(this)
            }],
            validateTrigger: 'onBlur',
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Password"
          hasFeedback
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: 'Please input password',
            }, {
              validator: this.checkConfirm.bind(this),
            }],
          })(
            <Input type="password" onBlur={this.handlePasswordBlur.bind(this)} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Re-enter password"
          hasFeedback
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: 'Please double check the password',
            }, {
              validator: this.checkPassowrd.bind(this),
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="E-mail"
          hasFeedback
        >
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: 'Illegal E-mail address',
            }, {
              required: true, message: 'Please input your E-mail',
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
          label="Gender"
          hasFeedback
        >
          {getFieldDecorator('gender', {
            rules: [{ required: true, message: 'Please choose your gender' }],
          })(
            <RadioGroup>
              <Radio key="male" value='male'>Male</Radio>
              <Radio key="female" value='female'>Female</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Birthday"
          hasFeedback
        >
          {getFieldDecorator('birthyear', {
            rules: [{ required: true, message: 'Please choose your birthday' }],
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
            rules: [{ required: true, message: 'Please input the captcha you got!' }],
          })(<RecaptchaItem />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={{width: '100%'}}>Create Account</Button>
        </FormItem>
        <span>By clicking Create Account, you agree to our <a href="/terms">Terms</a></span>
        { this.state.signupFailed ?
          <Alert message={this.state.failedReason} type="error"/>
          : null
        }
      </Form>
    );
  }
}

export default Form.create()(Signup);

