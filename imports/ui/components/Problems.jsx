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
          x['acceptance'] = (100 * x.total_accepted/ x.total_submissions).toFixed(2) + '%';
          const difficultyId = x.difficulty == 1 ? 'general.easy' : (x.difficulty == 2 ? 'general.medium' : 'general.hard');
          x['difficultyStr'] = this.props.intl.formatMessage({id: difficultyId})
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
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      sorter: (a, b) => a._id - b._id,
      sortOrder: this.state.sortInfo.column === '_id' && this.state.sortInfo.order,
    }, {
      title: this.props.intl.formatMessage({id: "general.title"}),
      dataIndex: 'title',
      key: 'title',
      render: (text, record, index) => <a href={"/problems/" + record.title_slug}>{text}</a>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: this.state.sortInfo.column === 'title' && this.state.sortInfo.order,
    }, {
      title: this.props.intl.formatMessage({id: "general.acceptance"}),
      dataIndex: 'acceptance',
      key: 'acceptance',
      sorter: (a, b) => a.acceptance.localeCompare(b.acceptance),
      sortOrder: this.state.sortInfo.column === 'acceptance' && this.state.sortInfo.order,
    }, {
      title: this.props.intl.formatMessage({id: "general.difficulty"}),
      dataIndex: 'difficultyStr',
      key: 'difficulty',
      sorter: (a, b) => a.difficulty - b.difficulty,
      sortOrder: this.state.sortInfo.column === 'difficulty' && this.state.sortInfo.order,
    }];
    return (
      <Table dataSource={this.state.data} columns={columns} rowKey="_id" loading={this.state.loading} onChange={this.handleChange.bind(this)} pagination={{defaultPageSize: parseInt(Meteor.settings.public.recordsPerPage), total: this.state.totalCount}} />
    )
  }
}

export default injectIntl(Problems);
