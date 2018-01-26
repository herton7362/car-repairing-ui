<style lang="less">
    @import '../../../styles/common.less';
    @import './parts.less';
</style>

<template>
    <div class="parts-main">
        <div class="parts-tree">
            <Card>
                <Input v-model="tree.queryParams.name"
                       placeholder="搜索" :icon="tree.queryParams.name?'close-circled': ''" @on-click="clearSearchTree" @input="loadTreeData">
                <Icon type="search" slot="prepend" size="18"></Icon>
                </Input>
                <Row class="margin-top-medium">
                    <Button type="ghost" size="small" @click="openNewTreeModal">新建分类</Button>
                </Row>
                <Row class="margin-top-medium">
                    <Tree :data="tree.data" :render="treeRenderContent"></Tree>
                </Row>
            </Card>
        </div>
        <div class="parts-list">
            <Card>
                <Row>
                    <h2>
                        <Icon type="ios-gear"></Icon>
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
                                  form-title="零件维护"
                                  domain-url="parts"
                                  :form-rule="form.rule"
                                  :form-data="form.data"
                                  :form-transform-response="formTransformResponse"
                                  @on-new-modal-open="onNewModalOpen">
                        <template slot="query-form" slot-scope="props">
                            <FormItem class="padding-right-medium" prop="code" label="零件编码">
                                <Input v-model="props.params.code" placeholder="零件编码"/>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="name" label="零件名称">
                                <Input v-model="props.params.name" placeholder="零件名称"/>
                            </FormItem>
                        </template>

                        <template slot="edit-form" slot-scope="props">
                            <FormItem class="padding-right-medium" prop="categoryId" label="零件分类">
                                <Select v-model="props.data.categoryId" placeholder="请选择零件分类" style="width: 140px;">
                                    <Option v-for="row in tree.form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                                </Select>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="code" label="零件编码">
                                <Input v-model="props.data.code" placeholder="请输入零件编码" style="width: 240px;"/>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="name" label="零件名称">
                                <Input v-model="props.data.name" placeholder="请输入零件名称" style="width: 240px;"/>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="modelNumber" label="型号">
                                <Input v-model="props.data.modelNumber" placeholder="请输入型号" style="width: 240px;"/>
                            </FormItem>
                            <FormItem class="padding-right-medium" prop="standard" label="规格">
                                <Input v-model="props.data.standard" placeholder="请输入规格" style="width: 240px;"/>
                            </FormItem>
                            <Row>
                                <Col :span="12">
                                    <FormItem class="padding-right-medium" prop="originPlace" label="产地">
                                        <Input v-model="props.data.originPlace" placeholder="请输入产地"/>
                                    </FormItem>
                                </Col>
                                <Col :span="12">
                                    <FormItem class="padding-right-medium" prop="brand" label="厂牌" :label-width="60">
                                        <Input v-model="props.data.brand" placeholder="请输入厂牌"/>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col :span="12">
                                    <FormItem class="padding-right-medium" prop="unitId" label="单位">
                                        <Select v-model="props.data.unitId" placeholder="请选择单位">
                                            <Option v-for="row in form.unitSelect.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col :span="12">
                                    <FormItem class="padding-right-medium" prop="price" label="价格" :label-width="60">
                                        <Input v-model="props.data.price" placeholder="请输入价格"/>
                                    </FormItem>
                                </Col>
                            </Row>
                        </template>
                    </single-table>
                </Row>
            </Card>
        </div>
        <Modal v-model="tree.form.modal" title="零件分类维护" :loading="tree.form.loading" @on-ok="treeSave">
            <Form ref="treeForm" :model="tree.form.data" :rules="tree.form.rule" :label-width="110">
                <FormItem class="padding-right-medium" prop="name" label="零件分类名称">
                    <Input v-model="tree.form.data.name" placeholder="请输入零件分类名称"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="parentId" label="上级零件分类">
                    <Select v-model="tree.form.data.parentId" placeholder="请选择上级零件分类">
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
    components: {
        singleTable
    },
    data() {
        return {
            tree: {
                raw: [],
                data: [],
                selected: {
                    id: null,
                    name: null
                },
                queryParams: {
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
                        parentId: null
                    },
                    rule: {
                        name: [
                            { required: true, message: '请填写零件分类名称', trigger: 'blur' }
                        ],
                        parentId: [
                            { required: true, message: '请选择上级模块', trigger: 'change' }
                        ]
                    }
                }
            },
            table: {
                columns: [
                    {key:'code', title:'零件编码'},
                    {key:'name', title:'零件名称'},
                ]
            },
            form: {
                rule: {
                    name: [
                        { required: true, message: '请填写零件名称', trigger: 'blur' }
                    ]
                },
                unitSelect: {
                    data: []
                },
                data: {
                    id: null,
                    category: null,
                    categoryId: null,
                    code: null,
                    name: null,
                    modelNumber: null,
                    standard: null,
                    originPlace: null,
                    brand: null,
                    unit: null,
                    unitId: null,
                    price: null
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
        },
        'form.data.categoryId'(val) {
            this.form.data.category = this.tree.form.select.data.find((d)=>d.id === val);
        },
        'form.data.unitId'(val) {
            this.form.data.unit = this.form.unitSelect.data.find((d)=>d.id === val);
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
                        type: 'ios-gear'
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
            this.tree.form.id = null;
            this.tree.form.data.parentId = this.tree.selected.id || 'root';
            this.tree.form.modal = true;
        },
        openEditTreeModal() {
            util.ajax.get(`/api/partsCategory/${this.tree.selected.id}`).then((response) => {
                if(Object.is(response.data.parent, null)) {
                    response.data.parentId = 'root';
                }
                this.tree.form.data = response.data;
                this.tree.form.modal = true;
            })
        },
        treeSave() {
            this.$refs.treeForm.validate((valid) => {
                if (valid) {
                    util.ajax.post(`/api/partsCategory`, this.tree.form.data).then(() => {
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
        deleteTreeNode() {
            util.ajax.delete(`/api/partsCategory/${this.tree.selected.id}`).then(() => {
                this.$Message.success('删除成功');
                this.loadTreeData();
            })
        },
        formTransformResponse(response) {
            if(response.data.category) {
                response.data.categoryId = response.data.category.id;
            }
            if(response.data.unit) {
                response.data.unitId = response.data.unit.id;
            }
            return response;
        },
        loadTreeData() {
            util.ajax.get('/api/partsCategory', {
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
                        name: '所有零件分类'
                    },
                    ...response.data.content
                ];
            });
        },
        loadGrid() {
            const table = this.$refs.table;
            if(this.tree.selected.id) {
                table.table.queryParams['category.id'] = this.tree.selected.id;
                table.loadGrid({
                    silent: true
                });
            } else {
                table.clearData();
            }
        },
        onNewModalOpen() {
            this.$refs.table.form.data.categoryId = this.tree.selected.id;
        },
        loadUnit() {
            util.ajax.get('/api/dictionary/code/unit', {
                params: {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc',
                    code: 'unit'
                }
            }).then((response)=>{
                this.form.unitSelect.data = response.data
            });
        }
    },
    mounted() {
        this.loadTreeData();
        this.loadUnit();
    }
};
</script>
