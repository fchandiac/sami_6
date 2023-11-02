module.exports = {
	images: {
        loader: 'custom',
        path: 'https://localhost:3001/images/'
    },
	webpack: (config, { isServer }) => {
	  if (!isServer) {
		config.target = 'electron-renderer';
	  }
	  return config;
	},
  };