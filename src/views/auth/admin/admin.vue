<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <table-search-form :fields="searchFields"/>
        <Row>
            <Button type="primary"> <Icon type="plus"></Icon> 新建</Button>
        </Row>
        <Row class="margin-top-medium">
            <Table border :columns="columns" :data="data"></Table>
        </Row>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import tableSearchForm from '@/views/my-components/table-extention/search-form/search-form.vue';

    export default {
        name: 'page',
        components: {
            tableSearchForm
        },
        data() {
            return {
                columns: [
                    {key:'loginName', title:'登录名'},
                    {key:'name', title:'姓名'}
                ],
                searchFields: [
                    {key: 'loginName', title:'登录名'},
                    {key:'name', title:'姓名'}
                ],
                data: []
            }
        },
        methods: {
            loadGrid () {
                util.ajax('/api/admin?sort=sortNumber%2CupdatedDate&order=asc%2Cdesc&pageSize=15&currentPage=1')
                    .then((response) => {
                        this.data = response.data.content;
                    })
            }
        },
        mounted() {
            this.loadGrid();
        }
    };
</script>