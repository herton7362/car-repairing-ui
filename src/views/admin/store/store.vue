<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="仓库维护"
                      domain-url="store"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :label-width="100"
                      :actions="table.actions"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="code" label="仓库代码">
                    <Input v-model="props.params.code" placeholder="仓库代码"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="name" label="仓库名称">
                    <Input v-model="props.params.name" placeholder="仓库名称"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <FormItem label="仓库代码" prop="code">
                    <Input v-model="props.data.code" placeholder="请输入仓库代码"/>
                </FormItem>
                <FormItem label="仓库名称" prop="name">
                    <Input v-model="props.data.name" placeholder="请输入仓库名称"/>
                </FormItem>
                <FormItem label="仓库管理员" prop="adminId">
                    <Select v-model="props.data.adminId" placeholder="请选择仓库管理员" filterable>
                        <Option :value="admin.id"
                                v-for="admin in form.admins"
                                :key="admin.id">{{admin.name}}</Option>
                    </Select>
                </FormItem>
            </template>
        </single-table>
        <Modal v-model="goodsForm.modal" title="仓库货物" :width="800">
            <paged-table ref="goodsFormTable" :columns="goodsForm.columns" :url="goodsForm.tableUrl"></paged-table>
        </Modal>
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
                        {key: 'code', title: '仓库代码'},
                        {key: 'name', title: '仓库名称'},
                        {
                            key: 'adminId',
                            title: '仓库管理员',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/admin/${param.row.adminId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        }
                    ],
                    actions: [
                        (h, params)=> {
                            return h('Button', {
                                props: {
                                    type: 'ghost',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.openGoodsModal(params.row)
                                    }
                                }
                            }, '查看货物')
                        }
                    ]
                },
                form: {
                    admins: [],
                    rule: {
                        code: [
                            { required: true, message: '请输入仓库代码', trigger: 'blur' }
                        ],
                        name: [
                            { required: true, message: '请输入仓库名称', trigger: 'blur' }
                        ],
                        adminId: [
                            { required: true, message: '请选择仓库管理员', trigger: 'change' }
                        ]
                    },
                    data: {
                        id: null,
                        code: null,
                        name: null,
                        adminId: null
                    }
                },
                goodsForm: {
                    modal: false,
                    columns: [
                        {
                            key: 'relationId',
                            title: '零件',
                            render(h, param) {
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/parts/${param.row.relationId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        },
                        {
                            key: 'count',
                            title: '数量 / 单位',
                            width: 250,
                            align: 'right',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/parts/${param.row.relationId}`).then((response)=>{
                                    if(param.row.count < 5) {
                                        span.elm.style.color = 'red';
                                    }
                                    span.elm.innerHTML = `${param.row.count} / ${response.data.unit.name}`;
                                })
                                return span;
                            }
                        }
                    ],
                    tableDomain: '/api/store/goods/',
                    tableUrl: null
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            },
            loadAdmins() {
                util.ajax.get('/api/admin', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.admins = response.data;
                })
            },
            openGoodsModal(row) {
                this.goodsForm.modal = true;
                this.goodsForm.tableUrl = this.goodsForm.tableDomain + row.id;
                this.$refs.goodsFormTable.$nextTick(()=>{
                    this.$refs.goodsFormTable.loadGrid();
                })
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
            this.loadAdmins();
        }
    };
</script>