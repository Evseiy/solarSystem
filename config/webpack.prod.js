const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  mode: 'production',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, '../dist/js'),
    filename: 'main.js'
  },
  optimization: {
    usedExports: true
  },
  plugins: [
    new JavaScriptObfuscator({
      // 压缩,无换行
      compact: true,
      // 禁用调试
      debugProtection: true,
      debugProtectionInterval: true,
      // 通过固定和随机（在代码混淆时生成）的位置移动数组。
      // 这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。
      // 如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
      rotateStringArray: true,
      // 删除字符串文字并将它们放在一个特殊的数组中
      stringArray: true,
      // 编码的所有字符串文字stringArray使用base64或rc4并插入即用其解码回在运行时的特殊代码。
      // 'none': 不编码stringArray值;
      // 'base64': stringArray使用编码值base64;(大约慢30-50％)
      // 'rc4': stringArray使用编码值rc4。
      // (建议禁用unicodeEscapeSequence带rc4编码的选项以防止非常大的混淆代码。)
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1,
      // 允许启用/禁用字符串转换为unicode转义序列。
      // Unicode转义序列大大增加了代码大小，并且可以轻松地将字符串恢复为原始视图。建议仅对小型源代码启用此选项。
      unicodeEscapeSequence: false
    }, [])
  ]
}