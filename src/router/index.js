import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers} from './router';
import store from '@/store';
import Main from '@/views/Main.vue';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.loadMenu = () => {
    const transformModuleToRouter = (module)=> {
        let menuRawData = [];
        module.forEach((menu)=>{
            let isFolder = !menu.parent;
            menuRawData.push({
                id: menu.id,
                parent: menu.parent,
                path: menu.url || '',
                name: menu.id,
                title: menu.name,
                icon: isFolder? 'ios-folder': 'ios-paper-outline',
                component: isFolder? Main: resolve => { require([`@/views${menu.url}.vue`], resolve); }
            })
        });
        let menus = Util.transformTreeData(menuRawData);
        menuRawData.forEach((menu)=>{
            menu.parent = null;
        });
        return menus;
    };

    router.menuloaded = false;

    router.menuloader = new Promise((resolve, reject)=>{
        Util.ajax.get('/api/admin/menus', {
            params: {
                _: new Date().getTime()
            }
        }).then((response)=>{
            const menus = transformModuleToRouter(response.data);
            store.commit('setAppRouter', menus);
            router.addRoutes(menus);
            store.commit('updateMenulist');
            router.menuloaded = true;
            resolve(menus);
        }).catch(reject)
    })
};

if(Util.hasLogin()) {// 如果已经登录过了则直接获取菜单
    router.loadMenu();
}

router.beforeEach((to, from, next) => {
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
        if (!Util.hasLogin() && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
        } else if (Util.hasLogin() && to.name === 'login') { // 判断是否已经登录且前往的是登录页
            Util.title();
            next({
                name: 'home_index'
            });
        } else if(to.matched.length === 0) { // 判断是否前往未知页面
            if(!router.menuloaded) { // 由于异步请求菜单，所以需要等菜单加载完成再前往一次
                router.menuloader.then(()=>{
                    next({
                        replace: true,
                        path: to.path
                    });
                })
            } else {
                next({
                    replace: true,
                    name: 'error-404'
                });
            }
        } else {
            const curRouterObj = Util.getRouterObjByName(routers, to.name);
            if (curRouterObj && curRouterObj.access !== undefined) { // 需要判断权限的路由
                if (curRouterObj.access === parseInt(Cookies.get('access'))) {
                    Util.toDefaultPage(routers, to.name, router, next); // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
                } else {
                    next({
                        replace: true,
                        name: 'error-403'
                    });
                }
            } else { // 没有配置权限的路由, 直接通过
                Util.toDefaultPage(routers, to.name, router, next);
            }
        }
    }
});

router.afterEach((to) => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

