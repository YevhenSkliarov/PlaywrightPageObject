export default {
  timeout: 200000,
  reporter: [['allure-playwright']],
  //global setup
  globalSetup: './global-setup.js',
  use: {
    // Browser options
    headless: false,
    //base url
    baseURL: 'https://www.i.ua',
    // Context options
    viewport: { width: 1280, height: 720 },
    // Artifacts
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
};
