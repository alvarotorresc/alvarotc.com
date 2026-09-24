const desktop = process.env.LH_FORM_FACTOR === 'desktop';

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/', 'http://localhost/es/'],
      numberOfRuns: 3,
      settings: desktop ? { preset: 'desktop' } : {},
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: desktop ? './lighthouse/desktop' : './lighthouse/mobile',
    },
  },
};
