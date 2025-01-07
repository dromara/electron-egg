interface AppConfig {
  openDevTools: boolean;
}

const config: () => AppConfig = () => {
  return {
    openDevTools: false,
  };
};

export default config;