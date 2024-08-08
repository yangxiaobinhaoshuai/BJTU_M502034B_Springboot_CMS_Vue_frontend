


//  Resolve ts 2307 https://blog.csdn.net/m0_47659279/article/details/130796116
// declare module '*.vue' {
//   import Vue from 'vue';
//   export default Vue;
// }


// https://blog.csdn.net/peng2hui1314/article/details/135481952
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}