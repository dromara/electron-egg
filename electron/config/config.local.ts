import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: {
      mode: 'bottom'
    },
    jobs: {
      messageLog: true
    }
  };
};

export default config;