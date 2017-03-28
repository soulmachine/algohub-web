import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

export function statusCodeToMessageId(statusCode) {
    switch (statusCode) {
      case 2:
        return "judgeresult.compile error";
      case 3:
        return "judgeresult.runtime error";
      case 4:
        return "judgeresult.accepted";
      case 5:
        return "judgeresult.wrong answer";
      case 6:
        return "judgeresult.time limit exceeded";
      case 7:
        return "judgeresult.memory limit exceeded";
      case 8:
        return "judgeresult.output limit exceeded";
      case 9:
        return "judgeresult.restricted call";
      case 10:
        return "judgeresult.code too long";
      default:
        throw new Error("Unknown status code");
    }
}

function JudgeResult({statusCode, errorMessage}) {
  const messageId = statusCodeToMessageId(statusCode);
  return (
    <div>
        <FormattedMessage id="judgeresult.judge result" defaultMessage="Judge Result" />:
        { statusCode != 4 ?
          <div>
          <span style={{fontSize: 25, bold: true, color: "red"}}><FormattedMessage id={messageId} /></span>
          <div style={{color: "red"}}> { errorMessage ?
            errorMessage.split(/\n/).map((line, i) =>{
              return <p key={i}>{line}</p>;
            })
            : null
          }
          </div>
          </div>
          :
          <span style={{fontSize: 25, bold: true, color: "green"}}><FormattedMessage id="judgeresult.accepted" defaultMessage="Accepted" /></span>
        }
    </div>
  );
}

export default injectIntl(JudgeResult);
