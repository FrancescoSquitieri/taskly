/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'style',
        'revert',
      ],
    ],
    'scope-empty': [0],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
