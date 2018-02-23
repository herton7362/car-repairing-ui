<style lang="less">
    @import '../../../styles/common.less';
    @import './list.less';
</style>

<template>
    <div class="dictionary-main">
        <div class="dictionary-tree">
            <Card>
                <Input v-model="tree.queryParams.name"
                       placeholder="搜索" :icon="tree.queryParams.name?'close-circled': ''" @on-click="clearSearchTree" @input="loadTreeData">
                    <Icon type="search" slot="prepend" size="18"></Icon>
                </Input>
                <Row class="margin-top-medium">
                    <Button type="ghost" size="small" @click="openNewTreeModal">新建字典</Button>
                </Row>
                <Row class="margin-top-medium">
                    <Tree :data="tree.data" :render="treeRenderContent"></Tree>
                </Row>
            </Card>
        </div>
        <div class="dictionary-list">
            <Card>
                <Row>
                    <h2>
                        <Icon type="ios-book"></Icon>
                        {{tree.selected.name}}
                        <Button type="ghost" size="small" style="width: 70px;" @click="openEditTreeModal">编辑</Button>
                        <Poptip transfer confirm title="您确定删除这个字典吗？" @on-ok="deleteTreeNode">
                            <Button type="error" size="small" style="width: 50px;margin-left:8px">删除</Button>
                        </Poptip>
                    </h2>
                </Row>
                <Row class="margin-top-large">
                    <single-table ref="table"
                                  :columns="table.columns"
                                  form-title="字典维护"
                                  domain-url="dictionary"
                                  :form-rule="form.rule"
                                  :form-data="form.data"
                                  :form-transform-response="formTransformResponse"
                                  @on-new-modal-open="onNewModalOpen">
                        <template slot="query-form" slot-scope="props">
                            <FormItem class="padding-right-medium" prop="code" label="编码" :label-width="40">
                                <Input v-model="props.params.code" placeholder="编码"/>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="name" label="名称" :label-width="40">
                                <Input v-model="props.params.name" placeholder="名称"/>
                            </FormItem>
                        </template>

                        <template slot="edit-form" slot-scope="props">
                            <FormItem class="padding-right-medium" prop="dictionaryCategoryId" label="字典">
                                <Select v-model="props.data.dictionaryCategoryId" placeholder="请选字典" style="width: 140px;">
                                    <Option v-for="row in tree.form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                                </Select>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="name" label="名称">
                                <Input v-model="props.data.name" placeholder="名称"/>
                            </FormItem>
                        </template>
                    </single-table>
                </Row>
            </Card>
        </div>
        <Modal v-model="tree.form.modal" title="字典维护" :loading="tree.form.loading" @on-ok="treeSave">
            <Form ref="treeForm" :model="tree.form.data" :rules="tree.form.rule" :label-width="110">
                <FormItem class="padding-right-medium" prop="name" label="字典名称">
                    <Input v-model="tree.form.data.name" placeholder="请输入字典名称"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="code" label="字典编码">
                    <Input v-model="tree.form.data.code" placeholder="请输入字典编码"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="parentId" label="上级字典">
                    <Select v-model="tree.form.data.parentId" placeholder="请选择上级字典">
                        <Option v-for="row in tree.form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script>
import util from '@/libs/util';
import singleTable from '@/views/my-components/single-table/single-table.vue';

export default {
    name: 'dictionary-list',
    components: {
        singleTable
    },
    data() {
        return {
            tree: {
                raw: [],
                data: [],
                queryParams: {
                    name: null
                },
                selected: {
                    id: null,
                    name: null
                },
                form: {
                    modal: false,
                    loading: true,
                    select: {
                        data: []
                    },
                    data: {
                        id: null,
                        name: null,
                        parent: {},
                        parentId: '',
                        code: null
                    },
                    rule: {
                        name: [
                            { required: true, message: '请填写字典名称', trigger: 'blur' }
                        ],
                        code: [
                            { required: true, message: '请填写字典代码', trigger: 'blur' }
                        ],
                        parentId: [
                            { required: true, message: '请选择上级字典', trigger: 'change' }
                        ]
                    }
                }
            },
            table: {
                columns: [
                    {key:'name', title:'名称'}
                ]
            },
            form: {
                rule: {
                    name: [
                        { required: true, message: '请填写名称', trigger: 'blur' }
                    ],
                    dictionaryCategoryId: [
                        { required: true, message: '请选择字典', trigger: 'change' }
                    ]
                },
                data: {
                    id: null,
                    dictionaryCategory: null,
                    dictionaryCategoryId: '',
                    name: null,
                    code: null
                }
            }
        }
    },
    watch: {
        'tree.form.data.parentId'(val) {
            if('root' === val) {
                this.tree.form.data.parent = null;
            } else {
                this.tree.form.data.parent = this.tree.form.select.data.find((d)=>d.id === val);
            }
        }
    },
    methods: {
        treeRenderContent(h, { root, node, data }) {
            return h('span',{
                style: {
                    fontSize: '14px'
                },
                class: ['ivu-tree-title', this.tree.selected.id === data.id? 'ivu-tree-title-selected': ''],
                on: {
                    click: ()=> {
                        this.selectTree(data);
                    }
                }
            }, [
                h('Icon', {
                    props: {
                        type: 'ios-book'
                    },
                    style: {
                        marginRight: '8px'
                    }
                }),
                h('span', data.title)
            ]);
        },
        selectTree(node) {
            this.tree.selected = node;
            this.loadGrid();
        },
        clearSearchTree() {
            this.tree.queryParams.name = null;
            this.loadTreeData();
        },
        openNewTreeModal() {
            this.$refs.treeForm.resetFields();
            this.tree.form.data.id = null;
            this.tree.form.data.parentId = this.tree.selected.id || 'root';
            this.tree.form.modal = true;
        },
        openEditTreeModal() {
            util.ajax.get(`/api/dictionaryCategory/${this.tree.selected.id}`).then((response) => {
                if(Object.is(response.data.parent, null)) {
                    response.data.parentId = 'root';
                }
                this.tree.form.data = response.data;
                this.tree.form.modal = true;
            })
        },
        deleteTreeNode() {
            util.ajax.delete(`/api/dictionaryCategory/${this.tree.selected.id}`).then(() => {
                this.$Message.success('删除成功');
                this.loadTreeData();
            })
        },
        treeSave() {
            this.$refs.treeForm.validate((valid) => {
                if (valid) {
                    util.ajax.post(`/api/dictionaryCategory`, this.tree.form.data).then(() => {
                        this.tree.form.modal = false;
                        this.$Message.success('保存成功');
                        this.loadTreeData();
                    })
                } else {
                    this.tree.form.loading = false;
                    this.$nextTick(() => {
                        this.tree.form.loading = true;
                    });
                }
            })
        },
        formTransformResponse(response) {
            if(response.data.dictionaryCategory) {
                response.data.dictionaryCategoryId = response.data.dictionaryCategory.id;
            }
            if(response.data.unit) {
                response.data.unitId = response.data.unit.id;
            }
            return response;
        },
        loadTreeData() {
            util.ajax.get('/api/dictionaryCategory', {
                params: {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc',
                    ...this.tree.queryParams
                }
            }).then((response)=>{
                // 如果树刷新需要重新选中之前选中的节点
                response.data.content.forEach((n)=>n.selected = n.id === this.tree.selected.id);
                this.tree.data = util.transformTreeData(response.data.content, 'name');
                this.selectTree(this.tree.data[0] || {});
                this.tree.form.select.data = [
                    {
                        id: 'root',
                        name: '所有字典'
                    },
                    ...response.data.content
                ];
            });
        },
        loadGrid() {
            const table = this.$refs.table;
            if(this.tree.selected.id) {
                table.$refs.table.table.queryParams['dictionaryCategory.id'] = this.tree.selected.id;
                table.loadGrid({
                    silent: true
                });
            } else {
                table.clearData();
            }
        },
        onNewModalOpen() {
            this.$refs.table.form.data.dictionaryCategoryId = this.tree.selected.id;
        }
    },
    mounted() {
        this.$refs.table.$watch( 'form.data.dictionaryCategoryId', (val) => {
            this.$refs.table.form.data.dictionaryCategory = this.tree.form.select.data.find((d)=>d.id === val);
        })
        this.loadTreeData();
    }
};
</script>
