import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';

import RecaptchaItem from './RecaptchaItem';

const FormItem = Form.Item;

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertVisable: false,
      failed: false,
      failureReason: '',
    };
  }

  emailExists(rule, value, callback) {
    if (value) {
      Meteor.call('emailExists', value, (error, result) => {
        if (error) {
          console.log('There is an error while checking email');
          callback();
        } else {
          if (result) {
            callback();
          } else {
            callback(this.props.intl.formatMessage({id: "forgotpassword.email not exists"}));
          }
        }
      });
    } else {
      callback();
    }
  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({alertVisable: false, failed: false, failureReason: ''});
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        Meteor.call('verifyCaptcha', values.captcha, (error, result) => {
          if(error){
            console.log("Captcha verification failed with error: ", error);
          } else {
            if (result) {
              Accounts.forgotPassword({email: values.email}, (error) => {
                if (error) {
                  this.setState({alertVisable: true, failed: true, failureReason: error.reason});
                  console.log('Password Reset Error: ', error);
                } else {
                  this.setState({alertVisable: true, failed: false});
                  console.log('Email Sent & Please check your email.')
                }
              });
            } else {
              console.log("Captcha verification failed");
            }
          }
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const styles = {
      loginForm: {
        maxWidth: 300
      },
      loginFormButton: {
        width: '100%'
      }
    }

    let alert;
    if (this.state.alertVisable) {
      alert = this.state.failed ?
        <Alert message={this.state.failureReason} type="error"/>
        :
        <Alert message={this.props.intl.formatMessage({id: "forgotpassword.password reset email"})} type="success"/>
    } else {
      alert = null;
    }

    return (
    <Row>
      <Col span={8} offset={8}>
        <Form onSubmit={this.handleSubmit.bind(this)} style={styles.loginForm}>
          <FormItem>
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
              <Input addonBefore={<Icon type="mail" />} placeholder={this.props.intl.formatMessage({id: "forgotpassword.input your email"})} />
            )}
          </FormItem>

          <FormItem>
            {getFieldDecorator('captcha', {
              rules: [{ required: true, message: this.props.intl.formatMessage({id: "signin.input captcha"}) }],
            })(<RecaptchaItem />)}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
              <FormattedMessage id="general.submit" defaultMessage="Submit" />
            </Button>
          </FormItem>
          {alert}
        </Form>
      </Col>
    </Row>
    );
  }
};

export default injectIntl(Form.create()(ForgotPassword));
