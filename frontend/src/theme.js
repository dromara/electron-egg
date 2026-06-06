import { theme } from 'ant-design-vue';

export default {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#07C160',
    colorSuccess: '#07C160',
    colorWarning: '#e6a23c',
    colorError: '#f56c6c',
    colorInfo: '#07C160',
    colorLink: '#07C160',
    colorLinkHover: '#0ad672',
    fontSize: 14,
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorBorder: '#e8e8e8',
    colorBorderSecondary: '#f0f0f0',
    colorText: '#2c3e50',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff',
      borderRadius: 12,
      colorBorderSecondary: '#e8e8e8',
    },
    Menu: {
      colorItemBg: '#fafafa',
      colorItemBgHover: '#e6f7ff',
      colorItemBgActive: 'rgba(7, 193, 96, 0.08)',
      colorItemText: '#666666',
      colorItemTextHover: '#2c3e50',
      colorItemTextActive: '#07C160',
      colorItemTextSelected: '#07C160',
    },
    Layout: {
      colorBgBody: '#f0f2f5',
      colorBgSider: '#fafafa',
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorBorder: '#d9d9d9',
      colorTextPlaceholder: '#bfbfbf',
      addonBg: '#fafafa',
    },
    Button: {
      borderRadius: 8,
    },
    Progress: {
      remainingColor: '#f0f0f0',
    },
  },
};