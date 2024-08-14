/**
 *
 * Cors 跨域问题 ： https://juejin.cn/post/7022440903302201351
 * 配置 浏览器 plugin 解决 https://mybrowseraddon.com/access-control-allow-origin.html?v=0.1.9&type=install
 */
// module.exports = {
//   devServer: {
//     proxy: {
//       '^/api': {
//         target: 'http://localhost:8080/',//接口的前缀
//         ws:true,//代理websocked
//         changeOrigin:true,//虚拟的站点需要更管origin
//         pathRewrite:{
//           '^/api':''//重写路径
//         }
//       }
//     }
//   }
// }