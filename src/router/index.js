import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers, otherRouter, appRouter, errorRouters} from './router';
import Main from '@/views/Main.vue';

Vue.use(VueRouter);

export const router = new Promise((accept, reject)=>{
    Util.ajax.get('/api/admin/menus').then((response)=>{
        let menuRawData = [];
        response.data.forEach((menu)=>{
            let isFolder = !menu.parent;
            menuRawData.push({
                id: menu.id,
                parent: menu.parent,
                path: menu.url,
                name: menu.code,
                title: menu.name,
                icon: isFolder? 'ios-folder': 'ios-paper-outline',
                component: isFolder? Main: resolve => { require([`@/views${menu.url}.vue`], resolve); }
            })
        });
        let menus = Util.transformTreeData(menuRawData);
        menuRawData.forEach((menu)=>{
            menu.parent = null;
        });
        appRouter.splice(0);
        appRouter.push(...menus);
        // 路由配置
        const RouterConfig = {
            // mode: 'history',
            routes: [
                ...routers,
                ...appRouter,
                ...errorRouters
            ]
        };

        const r = new VueRouter(RouterConfig);
        accept(r);
    }).catch(reject);
});

router.then((r)=>{
    r.beforeEach((to, from, next) => {
        iView.LoadingBar.start();
        Util.title(to.meta.title);
        if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
            next({
                replace: true,
                name: 'locking'
            });
        } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
            next(false);
        } else {
            if (!Cookies.get('user') && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
                next({
                    name: 'login'
                });
            } else if (Cookies.get('user') && to.name === 'login') { // 判断是否已经登录且前往的是登录页
                Util.title();
                next({
                    name: 'home_index'
                });
            } else {
                const curRouterObj = Util.getRouterObjByName([otherRouter, ...appRouter], to.name);
                if (curRouterObj && curRouterObj.access !== undefined) { // 需要判断权限的路由
                    if (curRouterObj.access === parseInt(Cookies.get('access'))) {
                        Util.toDefaultPage([otherRouter, ...appRouter], to.name, r, next); // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
                    } else {
                        next({
                            replace: true,
                            name: 'error-403'
                        });
                    }
                } else { // 没有配置权限的路由, 直接通过
                    Util.toDefaultPage([...routers], to.name, r, next);
                }
            }
        }
    });

    r.afterEach((to) => {
        iView.LoadingBar.finish();
        window.scrollTo(0, 0);
    });
})
