import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Table from 'antd/lib/table';
import Icon from 'antd/lib/icon';

const { Column } = Table;

class Problems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      totalCount: 0,
      loading: true,
      skipCount: 0,
      sortInfo: {column: '_id', order: 'ascend'}
    };
  }
  // sortBy field name, desc 1 or -1
  queryData(skipCount, column, order) {
    this.setState({loading: true});
    Meteor.call('getProblems', skipCount, column, order, (error, result) => {
      if (error) {
        console.log(error);
        this.setState({
          loading: false
        })
      }  else {
        result.forEach(x => {
          x['ratio'] = (100 * x.total_accepted/ x.total_submissions).toFixed(2) + '%(' + x.total_accepted + '/' + x.total_submissions + ')';
          const difficultyId = x.difficulty == 1 ? 'general.easy' : (x.difficulty == 2 ? 'general.medium' : 'general.hard');
          x['difficultyStr'] = this.props.intl.formatMessage({id: difficultyId})
          if(x['title'][this.props.intl.locale]) {
            x['title'] = x['title'][this.props.intl.locale];
          } else if(x['title'][this.props.intl.locale.substring(0,2)]) {
            x['title'] = x['title'][this.props.intl.locale.substring(0,2)];
          } else {
            x['title'] = x['title']['en'];
          }
        });
        this.setState({
          data: result,
          skipCount,
          sortInfo: {column, order},
          loading: false
        });
      }
    });
  }
  handleChange(pagination, filters, sorter) {
    // console.log('Various parameters', pagination, filters, sorter);
    const skipCount = (pagination.current - 1) * pagination.pageSize;
    if(sorter.columnKey) {
      this.queryData(skipCount, sorter.columnKey, sorter.order);
    } else {
      this.queryData(skipCount, this.state.sortInfo.column, this.state.sortInfo.order);
    }
  }
  componentDidMount() {
    this.queryData(this.state.skipCount, this.state.sortInfo.column, this.state.sortInfo.order);
    Meteor.call('totalProblemCount', (error, result) => {
      if(error) {
        console.log(error);
      } else {
        this.setState({totalCount: result});
      }
    })
  }
  render() {
    const columns = [{
      title: this.props.intl.formatMessage({id: "general.title"}),
      dataIndex: 'title',
      key: 'title',
      render: (text, record, index) => <a href={"/problems/" + record._id}>{text}</a>,
      sorter: (a, b) => a.title.en.localeCompare(b.title.en),
      sortOrder: this.state.sortInfo.column === 'title' && this.state.sortInfo.order,
    }, {
      title: this.props.intl.formatMessage({id: "general.ratio"}) + "(AC/Submit)",
      dataIndex: 'ratio',
      key: 'ratio',
      sorter: (a, b) => a.ratio.localeCompare(b.ratio),
      sortOrder: this.state.sortInfo.column === 'ratio' && this.state.sortInfo.order,
    }, {
      title: this.props.intl.formatMessage({id: "general.difficulty"}),
      dataIndex: 'difficultyStr',
      key: 'difficulty',
      sorter: (a, b) => a.difficulty - b.difficulty,
      sortOrder: this.state.sortInfo.column === 'difficulty' && this.state.sortInfo.order,
    }];
    if(Meteor.userId()) {
      columns.push({
        title: this.props.intl.formatMessage({id: "general.finished"}),
        dataIndex: 'finished',
        key: 'finished',
        render: (text, record, index) => record.finished ? <Icon type="check" /> : ""
      });
    }
    return (
      <Table dataSource={this.state.data} columns={columns} rowKey="_id" loading={this.state.loading} onChange={this.handleChange.bind(this)} pagination={{defaultPageSize: parseInt(Meteor.settings.public.recordsPerPage), total: this.state.totalCount}} />
    )
  }
}

export default injectIntl(Problems);
