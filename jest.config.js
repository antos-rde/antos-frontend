module.exports = {
    roots: ['<rootDir>'],
    transform : {
        '^.+\\.ts$': 'ts-jest'
    },
    testRegex: '(/tests/test.*|(\\.|/)(test|spec))\\.[tj]s?$',
    moduleFileExtensions: ['js', 'ts'],
  }