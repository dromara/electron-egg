interface OpenDevTools {
  mode: string;
}

interface Jobs {
  messageLog: boolean;
}

interface AppConfig {
  openDevTools: OpenDevTools;
  jobs: Jobs;
}

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