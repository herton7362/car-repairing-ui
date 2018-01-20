<style lang="less">
    @import '../../../styles/common.less';
    .kratos {
        &-fold {
            .search-btn{
                width: 30%;
                display: inline-block;
                text-align: left;
            }

            .search-btn.expanded{
                width: 91%;
                text-align: right;
            }
        }
    }
</style>

<template>
    <Card>
        <fold @on-expand="onFoldExpand" class="margin-bottom-large">
            <Form ref="queryForm" label-position="left" :model="queryParams" :label-width="80" inline>
                <FormItem class="padding-right-medium" prop="loginName" label="登录名" style="width: 30%">
                    <Input v-model="queryParams.loginName" placeholder="登录名"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="name" label="姓名" style="width: 30%">
                    <Input v-model="queryParams.name" placeholder="姓名"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="roleId" label="角色" v-show="expanded" style="width: 30%">
                    <label>
                        <Select v-model="queryParams.roleId">
                            <Option v-for="role in roles" :value="role.id" :key="role.id">{{role.name}}</Option>
                        </Select>
                    </label>
                </FormItem>
                <div class="search-btn" :class="{expanded}">
                    <Button type="primary" @click="loadGrid">查询</Button>
                    <Button type="ghost" @click="resetQueryForm">重置</Button>
                </div>
            </Form>
        </fold>
        <Row>
            <Button type="primary" @click="openNewModal"> <Icon type="plus"></Icon><span>新建</span></Button>
        </Row>
        <Row class="margin-top-medium">
            <Table border :columns="table.columns" :data="table.data"></Table>
        </Row>
        <Row class="margin-top-medium">
            <Page :total="table.total"
                  @on-change="onPageChange"
                  @on-page-size-change="onPageSizeChange" show-sizer show-elevator></Page>
        </Row>
        <Modal v-model="modal" title="管理员维护" :loading="loading" @on-ok="save">
            <Form ref="form" :model="form" :rules="rule" :label-width="80">
                <FormItem label="登录名" prop="loginName">
                    <Input v-model="form.loginName" placeholder="请输入登录名"/>
                </FormItem>
                <FormItem label="名称" prop="name">
                    <Input v-model="form.name" placeholder="请输入名称"/>
                </FormItem>
                <FormItem label="密码" prop="password">
                    <Input v-model="form.password" type="password" placeholder="密码为空则不修改"/>
                </FormItem>
                <FormItem label="角色" prop="roleIds">
                    <Select v-model="form.roleIds" multiple placeholder="请选择你的角色">
                        <Option v-for="role in roles" :value="role.id" :key="role.id">{{role.name}}</Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import fold from '@/views/my-components/fold/fold.vue';

    export default {
        name: 'single-page',
        components: {
            fold
        },
        data() {
            return {
                table: {
                    columns: [
                        {key:'loginName', title:'登录名'},
                        {key:'name', title:'姓名'},
                        {
                            key:'roles',
                            title:'角色',
                            render: (h, params) => {
                                return h('div', params.row.roles[0].name);
                            }
                        },
                        {
                            title: '操作',
                            key: 'action',
                            width: 150,
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
                                    )
                                ]);
                            }
                        }
                    ],
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: 10
                },
                queryParams: {
                    loginName: null,
                    name: null,
                    roleId: null
                },
                expanded: false,
                modal: false,
                loading: true,
                form: {
                    id: null,
                    loginName: null,
                    name: null,
                    password: null,
                    roleIds: []
                },
                rule: {
                    loginName: [
                        { required: true, message: '请填写登录名', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请填写名称', trigger: 'blur' }
                    ],
                    roleIds: [
                        { type:'array', required: true, message: '请选择角色', trigger: 'change' }
                    ]
                },
                roles: []
            }
        },
        methods: {
            onPageChange(page) {
                this.table.currentPage = page;
            },
            onPageSizeChange(pageSize) {
                this.table.pageSize = pageSize
            },
            onFoldExpand(expand) {
                if(expand) {
                    this.expanded = expand;
                } else {
                    setTimeout(()=>this.expanded = expand, 200)
                }
            },
            remove (row) {
                util.ajax.delete('/api/admin/' + row.id).then(() => {
                    this.modal = false;
                    this.$Message.success('删除成功');
                    this.loadGrid();
                });
            },
            save() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        if(!this.form.password) {
                            this.form.password = null;
                        }
                        util.ajax.post('/api/admin', this.form).then(() => {
                            this.modal = false;
                            this.$Message.success('保存成功');
                            this.loadGrid();
                        })
                    } else {
                        this.loading = false;
                        this.$nextTick(() => {
                            this.loading = true;
                        });
                    }
                })
            },
            openNewModal() {
                this.$refs.form.resetFields();
                this.modal = true;
            },
            openEditModal(row) {
                this.$refs.form.resetFields();
                util.ajax.get('/api/admin/' + row.id).then((response) => {
                    this.form = response.data;
                    this.form.password = null;
                    this.modal = true;
                });
            },
            resetQueryForm () {
                this.$refs.queryForm.resetFields();
            },
            loadGrid () {
                util.ajax.get('/api/admin', {
                    params: {
                        currentPage: this.table.currentPage,
                        pageSize: this.table.pageSize,
                        ...this.queryParams
                    }
                }).then((response) => {
                    this.table.data = response.data.content;
                    this.table.total = response.data.totalElements;
                })
            },
            loadRole() {
                util.ajax.get('/api/role', {
                    params: {
                        sort: 'sortNumber,updatedDate',
                        order: 'asc,desc'
                    }
                }) .then((response) => {
                    this.roles = response.data.content;
                })
            }
        },
        mounted() {
            this.loadGrid();
            this.loadRole();
        }
    };
</script>