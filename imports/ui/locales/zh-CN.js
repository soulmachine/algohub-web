import datePickerLocale from 'antd/lib/date-picker/locale/zh_CN';
import appLocaleData from 'react-intl/locale-data/zh';
import messages from './zh-CN.messages';

const appLocale = {
  // 合并所有 messages，加入 antd 组件的 messages
  messages: Object.assign({}, messages, {
    datePickerLocale,
  }),

  antd: null,

  // locale
  locale: 'zh-CN',

  // react-intl locale-data
  data: appLocaleData,

  // 自定义 formates
  formats: {
    date: {
      normal: {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
    },
  },
};

export default appLocale;
