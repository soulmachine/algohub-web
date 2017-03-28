import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import 'antd/dist/antd.css';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import Tabs from 'antd/lib/tabs';
import Tag from 'antd/lib/tag';
import Tooltip from 'antd/lib/tooltip';
import marked from 'marked';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/mode/c_cpp';
import 'brace/mode/swift';
import 'brace/mode/python';
import 'brace/mode/ruby';
import 'brace/mode/csharp';
import 'brace/mode/javascript';
import 'brace/mode/golang';
import 'brace/mode/haskell';
import 'brace/mode/scala';
import 'brace/theme/github';

import JudgeResult from '../components/JudgeResult';


const TabPane = Tabs.TabPane;


class ProblemPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problem: null,
      loading: true,
      lang: "Python",
      mode: "python",
      code: "",
      judgeResult: null,
      waiting: false,
      activeTab: "description"
    };
  }
  langToMode(lang) {
    if(lang == "C++" || lang == "C") {
      return "c_cpp";
    } else if(lang == "C#") {
      return "csharp";
    } else {
      return lang.toLowerCase();
    }
  }
  componentDidMount() {
    Meteor.call('getProblem', this.props.id, (error, result) => {
      if(error) {
        console.log(error);
      } else {
        const difficultyId = result.difficulty == 1 ? 'general.easy' : (result.difficulty == 2 ? 'general.medium' : 'general.hard');
        result['difficultyStr'] = this.props.intl.formatMessage({id: difficultyId});
        if(result['title'][this.props.intl.locale]) {
          result['title'] = result['title'][this.props.intl.locale];
        } else if(result['title'][this.props.intl.locale.substring(0,2)]) {
          result['title'] = result['title'][this.props.intl.locale.substring(0,2)];
        } else {
          result['title'] = result['title']['en'];
        }
        if(result['description'][this.props.intl.locale]) {
          result['description'] = result['description'][this.props.intl.locale];
        } else if(result['description'][this.props.intl.locale.substring(0,2)]) {
          result['description'] = result['description'][this.props.intl.locale.substring(0,2)];
        } else {
          result['description'] = result['description']['en'];
        }
        const defaultLanguage = localStorage.getItem(result._id+ "-lang") || "Python";
        const defaultMode = this.langToMode(defaultLanguage);
        let defaultCode = localStorage.getItem(result._id+ "-" + defaultLanguage);
        if(!defaultCode) {
          defaultCode = result.default_code[defaultLanguage]
        }
        this.setState({problem: result, loading: false, lang: defaultLanguage, mode: defaultMode, code: defaultCode});
      }
    })
  }
  changeTab(value) {
    console.log(value);
  }
  changeLanguage(value) {
    localStorage.setItem(this.state.problem._id+ "-lang", value);
    let defaultCode = localStorage.getItem(this.state.problem._id+ "-" + value);
    if(!defaultCode) {
      defaultCode = this.state.problem.default_code[value]
    }
    this.setState({
      lang: value,
      mode: this.langToMode(value),
      code: defaultCode
    });
  }
  changeCode(value) {
    localStorage.setItem(this.state.problem._id+ "-" + this.state.lang, value);
    this.setState({code: value});
  }
  resetCode() {
    const defaultCode = this.state.problem.default_code[this.state.lang];
    this.setState({code: defaultCode});
    localStorage.setItem(this.state.problem._id+ "-" + this.state.lang, defaultCode);
  }
  resetToLastSubmitted() {
    if(!Meteor.userId()) {
      return;
    }
  }
  submitCode() {
    if(!Meteor.userId()) {
      return;
    }

    this.setState({waiting: true});
    Meteor.call('submitCode', this.props.id, this.state.lang, this.state.code, (error, result) => {
      if(error) {
        console.log(error);
        this.setState({waiting: false});
      } else {
        console.log(result);
        this.setState({judgeResult: result, waiting: false});
      }
    })
  }

  render() {
    if (this.state.loading) {
      return <Row style={{marginTop: 20}}>
        <Col span={4} offset={10}>
          <Spin size="large" />
        </Col>
      </Row>;
    }
    return (
      <div>
        <h2>
          {this.state.problem._id}. {this.state.problem.title}
        </h2>
        <Row gutter={16}>
          <Col span={20}>
            <Tabs defaultActiveKey={this.state.activeTab} onChange={this.changeTab.bind(this)}>
              <TabPane tab={this.props.intl.formatMessage({id: "problem.description"})} key="description"><span dangerouslySetInnerHTML={{__html: marked(this.state.problem.description)}} className="markdown-body gutter-row"></span></TabPane>
              <TabPane tab={this.props.intl.formatMessage({id: "problem.submissions"})} key="submissions">Content of Tab Pane 2</TabPane>
            </Tabs>
          </Col>
          <Col span={4}>
            <ul>
              <li>Total Accepted: {this.state.problem.total_accepted}</li>
              <li>Total Submissions: {this.state.problem.total_submissions}</li>
              <li>{this.props.intl.formatMessage({id: "general.difficulty"})}: {this.state.problem.difficultyStr}</li>
              <li>Author: Admin</li>
            </ul>
          </Col>
        </Row>
        <span>{this.props.intl.formatMessage({id: "general.tags"})}:
          { this.state.problem.tags.map((tag, i) => {
            return <Tag color="orange" key={tag}>{tag}</Tag>;
          })}
        </span>
        <Row gutter={16}>
          <Col span={20} className="gutter-row">
            <div style={{marginTop: 20}}>
              <div style={{marginBottom: 10}}>
                <Select defaultValue={this.state.lang} onChange={this.changeLanguage.bind(this)} style={{ width: 100 }}>
                  { this.state.problem.default_code['Java'] ?
                    <Select.Option value="Java" key="Java">Java</Select.Option>
                    :
                    null
                  }
                  { this.state.problem.default_code['C++'] ?
                    <Select.Option value="C++" key="C++">C++</Select.Option>
                    :
                    null
                  }
                  { this.state.problem.default_code['Python'] ?
                    <Select.Option value="Python" key="Python">Python</Select.Option>
                    :
                    null
                  }
                  { Object.keys(this.state.problem.default_code).filter(x => x != "Java" && x != "C++" && x != "Python").sort().map((lang, i) => {
                    return <Select.Option value={lang} key={lang}>{lang}</Select.Option>;
                  })}
                </Select>
                <Tooltip title={this.props.intl.formatMessage({id: "problem.reset to default"})}>
                  <Button type="primary" icon="reload" onClick={this.resetCode.bind(this)} style={{marginLeft: 10}} />
                </Tooltip>
                <Tooltip title={this.props.intl.formatMessage({id: "problem.reset to last submitted"})}>
                  <Button icon="download" onClick={this.resetToLastSubmitted.bind(this)} style={{marginLeft: 10}} disabled={!Meteor.userId()} />
                </Tooltip>
              </div>
              <AceEditor
                mode={this.state.mode}
                theme="github"
                name="algohub_ace_editor"
                value={this.state.code}
                onChange={this.changeCode.bind(this)}
                wrapEnabled= {true}
                width="100%"
                fontSize = {14}
                showPrintMargin = {false}
                maxLines={200}
                minLines = {25}
                editorProps={{$blockScrolling: true}}
                onLoad={(editor) => {
                  editor.focus();
                  editor.getSession().setUseWrapMode(true);
                }}
                style={{borderWidth:1, borderColor: "#CCC", borderStyle: "solid"}}
              />
              <div style={{marginTop: 10, float: "right"}}>
                {/*<Button onClick={this.runSmallTestcases.bind(this)}><FormattedMessage id="problem.small testcases" defaultMessage="Run Small Testcases"/></Button>*/}
                <Button type="primary" style={{marginLeft: 10}} onClick={this.submitCode.bind(this)} disabled={!Meteor.userId() || this.state.waiting}>{Meteor.userId() ? <FormattedMessage id="problem.submit code" defaultMessage="Submit Code"/> : <FormattedMessage id="problem.cannot submit code" defaultMessage="Submit Code(You have NOT signed in)"/>}</Button>
              </div>
            </div>
            { this.state.judgeResult ?
              <div style={{marginTop: 50, borderTopWidth:1, borderTopColor: "#CCC", borderTopStyle: "solid"}}>
                <JudgeResult statusCode={this.state.judgeResult.judge_result.status_code} errorMessage={this.state.judgeResult.judge_result.error_message} />
              </div>
              :
              this.state.waiting ? <div style={{marginTop: 50, borderTopWidth:1, borderTopColor: "#CCC", borderTopStyle: "solid"}}><Spin size="large" /></div> : null
            }
          </Col>
        </Row>
      </div>
    )
  }
}

export default injectIntl(ProblemPage);
