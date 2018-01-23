import Vue from 'vue';
import iView from 'iview';
import iViewExpand from './views/my-components/iview-expand/index';
import {routers, appRouter, page404} from '@/router/router';
import {router} from '@/router/index';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import { VirtualScroller } from 'vue-virtual-scroller';
import util from "./libs/util";
import Main from '@/views/Main.vue';

Vue.use(VueI18n);
iViewExpand.expand(iView);
Vue.use(iView);

const loadMenu = ()=> {
    return new Promise((resolve, reject)=>{
        util.ajax.get('/api/admin/menus').then((response)=>{
            const menus = transformModuleToRouter(response.data);
            store.commit('setAppRouter', menus);
            router.addRoutes(menus);
            resolve(menus);
        }).catch(reject)
    })
};

const transformModuleToRouter = (module)=> {
    let menuRawData = [];
    module.forEach((menu)=>{
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
    let menus = util.transformTreeData(menuRawData);
    menuRawData.forEach((menu)=>{
        menu.parent = null;
    });
    return menus;
};

const init = function () {
    new Vue({
        el: '#app',
        router: router,
        store: store,
        render: h => h(App),
        data: {
            currentPageName: ''
        },
        methods: {
            loadMenu() {
                loadMenu();
            }
        },
        mounted () {
            this.currentPageName = this.$route.name;
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
            this.$store.commit('initCachepage');
            setInterval(()=>this.$store.commit('refreshToken'), 3 * 1000);
        },
        created() {
            // 添加响应拦截器
            util.ajax.interceptors.response.use((response) => {
                // 对响应数据做点什么
                return response;
            }, (error) => {
                // 对响应错误做点什么
                // 对请求错误做些什么
                if(500 === error.response.status) {
                    this.$Message.error('系统内部错误，请联系系统管理员');
                } else if(406 === error.response.status) {
                    this.$Message.warning(error.response.data);
                } else if(401 === error.response.status) {
                    router.push({
                        name: 'error-403'
                    });
                } else if(403 === error.response.status) {
                    router.push({
                        name: 'error-403'
                    });
                }
                return Promise.reject(error);
            });
        }
    });
};

if(util.hasLogin()) {
    loadMenu().then(()=>{
        init();
    })
} else {
    init();
}