<style lang="less">
    @import '../../../styles/common.less';
    @import 'single-table.less';
</style>

<template>
    <div>
        <fold @on-expand="onFoldExpand" :class="{'margin-bottom-large': expandable}" :expandable="expandable">
            <Form ref="queryForm" label-position="left" :model="table.queryParams" :label-width="80" inline>
                <slot name="query-form" :params="table.queryParams"/>
                <div class="search-btn" :class="{expanded}">
                    <Button type="primary" @click="loadGrid">查询</Button>
                    <Button type="ghost" @click="resetQueryForm">重置</Button>
                </div>
            </Form>
        </fold>
        <Row>
            <Button type="primary" @click="openNewModal"> <Icon type="plus"></Icon><span>新建</span></Button>
            <slot name="actions"/>
        </Row>
        <Row class="margin-top-medium">
            <Table border :columns="table.columns" :data="table.data"></Table>
        </Row>
        <Row class="margin-top-medium">
            <Page :total="table.total"
                  @on-change="onPageChange"
                  @on-page-size-change="onPageSizeChange" show-sizer show-elevator></Page>
        </Row>
        <Modal v-model="form.modal" :title="formTitle" :loading="form.loading" @on-ok="save">
            <Form ref="form" :model="form.data" :rules="formRule" :label-width="80">
                <slot name="edit-form" :data="form.data"/>
            </Form>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import fold from '@/views/my-components/fold/fold.vue';

    export default {
        name: 'single-table',
        components: {
            fold
        },
        props: {
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },
            actions: {
                type: Array,
                default() {
                    return [];
                }
            },
            domainUrl: String,
            formTitle: {
                type: String,
                default: '窗口'
            },
            formRule: {
                type: Object,
                default() {
                    return {};
                }
            },
            formData: {
                type: Object,
                default() {
                    return {};
                }
            },
            formTransformResponse: {
                type: Function,
                default(response) {
                    return response
                }
            },
            tableTransformResponse: {
                type: Function,
                default(response) {
                    return response
                }
            }
        },
        data() {
            return {
                table: {
                    columns: [
                        ...this.columns,
                        {
                            title: '操作',
                            key: 'action',
                            width: 150 + (this.actions.length * 40),
                            align: 'center',
                            render: (h, params) => {
                                return h('div', [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.openEditModal(params.row);
                                            }
                                        }
                                    }, '修改'),
                                    h('Poptip',
                                        {
                                            props: {
                                                confirm: true,
                                                transfer: true,
                                                title: '您确认删除这条内容吗？'
                                            },
                                            style: {
                                                marginRight: '5px'
                                            },
                                            on: {
                                                'on-ok': () => {
                                                    this.remove(params.row)
                                                }
                                            }
                                        },
                                        [
                                            h('Button', {
                                                props: {
                                                    type: 'error',
                                                    size: 'small'
                                                }
                                            }, '删除')
                                        ]
                                    ),
                                    ...this.actions.map((action)=>action(h, params))
                                ]);
                            }
                        }
                    ],
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: 10,
                    queryParams: {}
                },
                expanded: false,
                expandable: false,
                form: {
                    modal: false,
                    loading: true,
                    data: this.formData
                }
            }
        },
        methods: {
            onPageChange(page) {
                this.table.currentPage = page;
                this.loadGrid();
            },
            onPageSizeChange(pageSize) {
                this.table.pageSize = pageSize;
                this.loadGrid();
            },
            onFoldExpand(expand) {
                if(this.$refs.queryForm.fields.length > 2) {
                    this.expandable = true;
                }
                if(expand) {
                    this.expanded = expand;
                    this.$refs.queryForm.fields.forEach((field, index)=>{
                        index > 1 && (field.$el.style.display = 'inline-block');
                    })
                } else {
                    this.expanded = expand;
                    this.$refs.queryForm.fields.forEach((field, index)=>{
                        index > 1 && (field.$el.style.display = 'none');
                    })
                }
            },
            remove (row) {
                util.ajax.delete(`/api/${this.domainUrl}/${row.id}`).then(() => {
                    this.form.modal = false;
                    this.$Message.success('删除成功');
                    this.loadGrid();
                });
            },
            save() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        util.ajax.post(`/api/${this.domainUrl}`, this.form.data).then(() => {
                            this.form.modal = false;
                            this.$Message.success('保存成功');
                            this.loadGrid();
                        })
                    } else {
                        this.form.loading = false;
                        this.$nextTick(() => {
                            this.form.loading = true;
                        });
                    }
                })
            },
            openNewModal() {
                this.$refs.form.resetFields();
                this.$emit('on-new-modal-open');
                this.form.data.id = null;// 解决清空表单id不会删除问题
                this.form.modal = true;
            },
            openEditModal(row) {
                this.$emit('on-edit-modal-open');
                this.$refs.form.resetFields();
                util.ajax.get(`/api/${this.domainUrl}/${row.id}`).then((response) => {
                    response = this.formTransformResponse(response);
                    this.form.data = response.data;
                    this.form.modal = true;
                });
            },
            resetQueryForm () {
                this.$refs.queryForm.resetFields();
                this.loadGrid();
            },
            loadGrid ({
                          silent = false // 不触发事件
            } = {}) {
                if(!silent) {
                    this.$emit('on-load');
                }
                util.ajax.get(`/api/${this.domainUrl}`, {
                    params: {
                        currentPage: this.table.currentPage,
                        pageSize: this.table.pageSize,
                        ...this.table.queryParams
                    }
                }).then((response) => {
                    response = this.tableTransformResponse(response);
                    this.table.data = response.data.content;
                    this.table.total = response.data.totalElements;
                })
            },
            initQueryForm() {
                this.onFoldExpand();
                this.$refs.queryForm.fields.forEach((field)=>{
                    field.$el.style.width = '30%';
                });
            }
        },
        mounted() {
            this.initQueryForm();
        }
    };
</script>