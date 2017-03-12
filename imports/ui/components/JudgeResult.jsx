import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

function JudgeResult({statusCode, errorMessage}) {
  return (
    <div>
      <span style={{fontSize: 25, bold: true}}>
        <FormattedMessage id="judgeresult.judge result" defaultMessage="Judge Result" />:
        <span style={{color: statusCode==4 ? "green" : "red"}}>{errorMessage}</span>
      </span>
    </div>
  );
}

export default injectIntl(JudgeResult);
