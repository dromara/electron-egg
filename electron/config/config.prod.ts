import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: false,
  };
};

export default config;