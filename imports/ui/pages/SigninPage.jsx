import React from 'react';

import 'antd/dist/antd.css';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import Signin from '../components/Signin';

function SigninPage() {
  return (
    <Row>
      <Col span={8} offset={8}>
        <Signin />
      </Col>
    </Row>
  )
}

export default SigninPage;
