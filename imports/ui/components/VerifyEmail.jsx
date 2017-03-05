import React from 'react';
import { injectIntl } from 'react-intl';
import { Accounts } from 'meteor/accounts-base';

import 'antd/dist/antd.css';
import Alert from 'antd/lib/alert';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

class VerifyEmail extends React.Component {
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
                message={this.props.intl.formatMessage({id: "verifyemail.verification failed"})}
                description={this.props.intl.formatMessage({id: "verifyemail.link expired"})}
                type="error"
                showIcon
              />
              :
              <Alert message={this.props.intl.formatMessage({id: "verifyemail.verification succeeded"})} type="success" showIcon />
            }
          </div>
        </Col>
      </Row>
    );
  }
};

export default injectIntl(VerifyEmail);
