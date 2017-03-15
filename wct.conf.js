var config = {
  'suites': [
    'test'
  ],
  expanded: true,
  testTimeout: 5 * 60 * 1000,
  plugins: {
    local: {
      browsers: ['chrome']
    },
    istanbul: {
      dir: './coverage',
      reporters: [
        'text',
        'text-summary',
        'lcov',
        'json'
      ],
      include: [
        '/*.js',
        '/*.html'
      ],
      exclude: [
      ],
      thresholds: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        }
      }
    }
  }
};

module.exports = config;
