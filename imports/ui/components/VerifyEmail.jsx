import React from 'react';
import { Accounts } from 'meteor/accounts-base';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

export default class VerifyEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      verificationFailed: false,
    };
  }
  componentDidMount() {
    Accounts.verifyEmail(this.props.token, (error) => {
      if (error) {
        this.setState({verificationFailed: true});
        console.log(error);
      } else {
        this.setState({verificationFailed: false});
      }
    });
  }
  render() {
    return (
      <Row>
        <Col span={8} offset={8}>
          <div style={{ height: 210 }}>
            { this.state.verificationFailed ?
              <Alert
                message="E-mail verify failed"
                description='The link has been expired, please resent the password reset E-mail'
                type="error"
                showIcon
              />
              :
              <Alert message="E-mail verified successfully" type="success" showIcon />
            }
          </div>
        </Col>
      </Row>
    );
  }
};
