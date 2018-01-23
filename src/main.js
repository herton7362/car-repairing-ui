import Vue from 'vue';
import iView from 'iview';
import iViewExpand from './views/my-components/iview-expand/index';
import {routers, appRouter} from '@/router/router';
import {router} from '@/router/index';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import { VirtualScroller } from 'vue-virtual-scroller';


Vue.use(VueI18n);
iViewExpand.expand(iView);
Vue.use(iView);

router.then((r)=>{
    new Vue({
        el: '#app',
        router: r,
        store: store,
        render: h => h(App),
        data: {
            currentPageName: ''
        },
        mounted () {
            this.currentPageName = this.$route.name;
            // 显示打开的页面的列表
            this.$store.commit('setOpenedList');
            this.$store.commit('initCachepage');
            setInterval(()=>this.$store.commit('refreshToken'), 3 * 1000);
        },
        created() {
            let tagsList = [];
            appRouter.map((item) => {
                if (item.children.length <= 1) {
                    tagsList.push(item.children[0]);
                } else {
                    tagsList.push(...item.children);
                }
            });
            this.$store.commit('setAppRouter', appRouter);
            this.$store.commit('setTagsList', tagsList);
        }
    });
})