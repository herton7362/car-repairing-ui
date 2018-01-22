<style lang="less">
    @import './module.less';
</style>

<template>
    <div class="module-main">
        <div class="module-tree">
            <Card>
                <Tree :data="tree.data"></Tree>
            </Card>
        </div>
        <div class="module-list">
            <Card>

            </Card>
        </div>
    </div>
</template>

<script>
import util from '@/libs/util';
import singleTable from '@/views/my-components/single-table/single-table.vue';

export default {
    name: 'module',
    components: {
        singleTable
    },
    data() {
        return {
            tree: {
                raw: [],
                data: []
            }
        }
    },
    methods: {
        loadTreeData() {
            util.ajax.get('/api/module', {
                params: {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }
            }).then((response)=>{
                this.tree.data = util.transformTreeData(response.data.content, 'name', false);
                this.tree.data.forEach((n)=>n.expand = true);
            });
        }
    },
    mounted() {
        this.loadTreeData();
    }
};
</script>
