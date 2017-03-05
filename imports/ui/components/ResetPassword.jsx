import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Accounts } from 'meteor/accounts-base';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';

const FormItem = Form.Item;

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordDirty: false,
      updateFailed: false,
    };
  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({updateFailed: false});
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        Accounts.resetPassword(this.props.token, values.password, (error) => {
          if (error) {
            this.setState({updateFailed: true});
            console.log('Password Reset Error: ', error);
          } else {
            message.success(this.props.intl.formatMessage({id: "resetpassword.password updated"}), 3);
            console.log('Password updated successfully!');
            FlowRouter.redirect('/');
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 10 },
    };
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
      <Row>
        <Col span={8} offset={8}>
          <Form onSubmit={this.handleSubmit.bind(this)} style={styles.loginForm}>
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
                  required: true, message: this.props.intl.formatMessage({id: "signin.input password"}),
                }, {
                  validator: this.checkPassowrd.bind(this),
                }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
                <FormattedMessage id="general.submit" defaultMessage="Submit" />
              </Button>
            </FormItem>
            { this.state.updateFailed ?
              <Alert message={this.props.intl.formatMessage({id: "resetpassword.link expired"})} type="error"/>
              : null
            }
          </Form>
        </Col>
      </Row>
    );
  }
};

export default injectIntl(Form.create()(ResetPassword));
