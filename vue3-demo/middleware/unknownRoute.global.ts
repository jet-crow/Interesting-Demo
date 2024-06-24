/**
 *   未知路由重定向到根路径
 */
export default defineNuxtRouteMiddleware((to, from) => {

  // 访问未定义路由跳转首页
  if (!to.matched.length) {
    return navigateTo('/')
  }
})