<style lang="less">
    @import '../../../styles/common.less';
    @import './parts.less';
</style>

<template>
    <div class="parts-main">
        <div class="parts-tree">
            <Card>
                <Input type="text" placeholder="Username">
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
                        <Button type="ghost" size="small" style="width: 70px;">编辑</Button>
                    </h2>
                </Row>
                <Row class="margin-top-large">
                    <single-table ref="table"
                                  :columns="table.columns"
                                  form-title="模块维护"
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
                            <FormItem class="padding-right-medium" prop="category.id" label="零件分类">
                                <Select v-model="props.data.category.id" placeholder="请选择零件分类" style="width: 140px;">
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
                                    <FormItem class="padding-right-medium" prop="unit.id" label="单位">
                                        <Select v-model="props.data.unit.id" placeholder="请选择单位">
                                            <Option v-for="row in tree.form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
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
                <FormItem class="padding-right-medium" prop="parent.id" label="上级零件分类">
                    <Select v-model="tree.form.data.parent.id" placeholder="请选择上级零件分类">
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
                form: {
                    modal: false,
                    loading: true,
                    select: {
                        data: []
                    },
                    data: {
                        id: null,
                        name: null,
                        parent: {}
                    },
                    rule: {
                        name: [
                            { required: true, message: '请填写零件分类名称', trigger: 'blur' }
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
                data: {
                    id: null,
                    category: {},
                    code: null,
                    name: null,
                    modelNumber: null,
                    standard: null,
                    originPlace: null,
                    brand: null,
                    unit: {},
                    price: null
                }
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
        openNewTreeModal() {
            this.$refs.treeForm.resetFields();
            this.tree.form.id = null;
            this.tree.form.data.parent = {id: this.tree.selected.id || 'root'};
            this.tree.form.modal = true;
        },
        treeSave() {
            this.$refs.treeForm.validate((valid) => {
                if (valid) {
                    if(this.tree.form.data.parent.id === 'root') {
                        util.ajax.post(`/api/partsCategory`, {
                            ...this.tree.form.data,
                            parent: null
                        }).then(() => {
                            this.tree.form.modal = false;
                            this.$Message.success('保存成功');
                            this.loadTreeData();
                        })
                    } else {
                        util.ajax.get(`/api/partsCategory/${this.tree.form.data.category.id}`)
                            .then((response)=>{
                                this.tree.form.data.parent = response.data;
                                return util.ajax.post(`/api/partsCategory`, this.tree.form.data);
                            })
                            .then(() => {
                                this.tree.form.modal = false;
                                this.$Message.success('保存成功');
                                this.loadTreeData();
                            })
                    }

                } else {
                    this.tree.form.loading = false;
                    this.$nextTick(() => {
                        this.tree.form.loading = true;
                    });
                }
            })
        },
        formTransformResponse(response) {
            response.data.category = response.data.category || {id: 'root'};
            return response;
        },
        loadTreeData() {
            util.ajax.get('/api/partsCategory', {
                params: {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }
            }).then((response)=>{
                // 如果树刷新需要重新选中之前选中的节点
                response.data.content.forEach((n)=>n.selected = n.id === this.tree.selected.id);
                this.tree.data = util.transformTreeData(response.data.content, 'name');
                this.selectTree(this.tree.data[0]);
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
            table.table.queryParams['category.id'] = this.tree.selected.id;
            table.loadGrid({
                silent: true
            });
        },
        onNewModalOpen() {
            this.$refs.table.form.data.category = {
                id: this.tree.selected.id
            };
        }
    },
    mounted() {
        this.loadTreeData();
    }
};
</script>
