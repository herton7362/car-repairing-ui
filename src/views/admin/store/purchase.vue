<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <paged-table ref="table" :columns="table.columns" url="/api/store/goods/"></paged-table>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import singleTable from '@/views/my-components/single-table/single-table.vue';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';

    export default {
        components: {
            singleTable,
            PagedTable
        },
        data() {
            return {
                table: {
                    columns: [
                    ]
                },
                form: {
                    rule: {
                    },
                    data: {
                        id: null
                    }
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
        }
    };
</script>