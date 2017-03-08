import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import 'antd/dist/antd.css';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import Tag from 'antd/lib/tag';
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

class ProblemPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problem: null,
      loading: true,
      lang: "Python",
      mode: "python",
      code: ""
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
    Meteor.call('getProblem', this.props.title_slug, (error, result) => {
      if(error) {
        console.log(error);
      } else {
        const difficultyId = result.difficulty == 1 ? 'general.easy' : (result.difficulty == 2 ? 'general.medium' : 'general.hard');
        result['difficultyStr'] = this.props.intl.formatMessage({id: difficultyId});
        result.default_code.sort((x,y) => x.lang.localeCompare(y.lang));

        const defaultLanguage = localStorage.getItem(result.title_slug+ "-lang") || "Python";
        const defaultMode = this.langToMode(defaultLanguage);
        let defaultCode = localStorage.getItem(result.title_slug+ "-" + defaultLanguage);
        if(!defaultCode) {
          const tmp = result.default_code.find(x => {
            return x.lang === defaultLanguage;
          });
          defaultCode = tmp.code;
        }
        this.setState({problem: result, loading: false, lang: defaultLanguage, mode: defaultMode, code: defaultCode});
      }
    })
  }

  changeLanguage(value) {
    localStorage.setItem(this.state.problem.title_slug+ "-lang", value);
    let defaultCode = localStorage.getItem(this.state.problem.title_slug+ "-" + value);
    if(!defaultCode) {
      const tmp = this.state.problem.default_code.find(x => {
        return x.lang === value;
      });
      defaultCode = tmp.code;
    }
    this.setState({
      lang: value,
      mode: this.langToMode(value),
      code: defaultCode
    });
  }
  changeCode(value) {
    localStorage.setItem(this.state.problem.title_slug+ "-" + this.state.lang, value);
    this.setState({code: value});
  }
  resetCode() {
    const tmp = this.state.problem.default_code.find(x => {
      return x.lang === this.state.lang;
    });
    const defaultCode = tmp.code;
    this.setState({code: defaultCode});
    localStorage.setItem(this.state.problem.title_slug+ "-" + this.state.lang, defaultCode);
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
          <Col span={20} dangerouslySetInnerHTML={{__html: marked(this.state.problem.description)}} className="markdown-body gutter-row"></Col>
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
        <div style={{marginTop: 20}}>
          <div style={{marginBottom: 10}}>
            <Select defaultValue={this.state.lang} onChange={this.changeLanguage.bind(this)} style={{ width: 100 }}>
              { this.state.problem.default_code.map((obj, i) => {
                return <Select.Option value={obj.lang} key={obj.lang}>{obj.lang}</Select.Option>;
              })}
            </Select>
            <Button type="primary" icon="reload" style={{marginLeft: 10}} onClick={this.resetCode.bind(this)}><FormattedMessage id="problem.reset" defaultMessage="Reset"/></Button>
          </div>
          <AceEditor
            mode={this.state.mode}
            theme="github"
            name="algohub_ace_editor"
            value={this.state.code}
            onChange={this.changeCode.bind(this)}
            wrapEnabled= {true}
            width="80%"
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
        </div>
      </div>
    )
  }
}

export default injectIntl(ProblemPage);