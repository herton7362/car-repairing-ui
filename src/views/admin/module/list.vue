<style lang="less">
    @import './list.less';
</style>

<template>
    <div class="module-main">
        <div class="module-tree">
            <Card>
                <Tree :data="tree.data" @on-select-change="onSelectTree"></Tree>
            </Card>
        </div>
        <div class="module-list">
            <Card>
                <single-table ref="table"
                              :columns="table.columns"
                              form-title="模块维护"
                              domain-url="module"
                              :form-rule="form.rule"
                              :form-data="form.data"
                              :form-transform-response="formTransformResponse"
                              @on-load="onLoadGrid"
                              @on-new-modal-open="onNewModalOpen">
                    <template slot="query-form" slot-scope="props">
                        <FormItem class="padding-right-medium" prop="name" label="名称">
                            <Input v-model="props.params.name" placeholder="名称"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="type" label="类型">
                            <RadioGroup v-model="props.params.type" type="button">
                                <Radio label="MENU">菜单</Radio>
                                <Radio label="FUNCTION">功能</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="url" label="链接">
                            <Input v-model="props.params.url" placeholder="链接"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="code" label="权限代码">
                            <Input v-model="props.params.code" placeholder="权限代码"/>
                        </FormItem>
                    </template>

                    <template slot="edit-form" slot-scope="props">
                        <FormItem class="padding-right-medium" prop="parent.id" label="上级模块">
                            <Select v-model="props.data.parent.id" placeholder="请选择上级模块">
                                <Option v-for="row in form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                            </Select>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="name" label="名称">
                            <Input v-model="props.data.name" placeholder="请输入名称"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="type" label="类型">
                            <RadioGroup v-model="props.data.type" type="button">
                                <Radio label="MENU">菜单</Radio>
                                <Radio label="FUNCTION">功能</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="url" label="链接">
                            <Input v-model="props.data.url" placeholder="请输入链接"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="code" label="权限代码">
                            <Input v-model="props.data.code" placeholder="请输入权限代码"/>
                        </FormItem>
                    </template>
                </single-table>
            </Card>
        </div>
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
                selectedId: 'isNull'
            },
            table: {
                columns: [
                    {key:'name', title:'名称'},
                    {
                        key:'type',
                        title:'类型',
                        width: 90,
                        align: 'center',
                        render: (h, params)=>{
                            if(params.row.type === 'MENU') {
                                return h('Tag', {
                                    props: {
                                        color: 'green'
                                    }
                                }, '菜单');
                            }
                            return h('Tag', {
                                props: {
                                    color: 'blue'
                                }
                            }, '功能');
                        }},
                    {key:'url', title:'链接'},
                    {key:'code', title:'权限代码'},
                    {
                        key:'disabled',
                        title:'状态',
                        width: 70,
                        align: 'center',
                        render: (h, params)=>{
                            if(params.row.disabled) {
                                return h('Icon', {
                                    props: {
                                        type: 'ios-circle-filled'
                                    },
                                    style: {
                                        'color': '#ed3f14',
                                        'font-size': '18px'
                                    }
                                });
                            }
                            return h('Icon', {
                                props: {
                                    type: 'ios-circle-filled'
                                },
                                style: {
                                    'color': '#19be6b',
                                    'font-size': '18px'
                                }
                            });
                        }}
                ]
            },
            form: {
                rule: {
                    name: [
                        { required: true, message: '请填写名称', trigger: 'blur' }
                    ],
                    'parent.id': [
                        { required: true, message: '请选择上级模块', trigger: 'change' }
                    ]
                },
                select: {
                    data: []
                },
                data: {
                    id: null,
                    parent: {},
                    name: null,
                    icon: null,
                    code: null,
                    url: null,
                    type: 'MENU',
                    naviNamePath: null,
                    naviIdPath: null,
                    disabled: false
                }
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
                // 如果树刷新需要重新选中之前选中的节点
                response.data.content.forEach((n)=>n.selected = n.id === this.tree.selectedId);
                let nodeLevel1 = util.transformTreeData(response.data.content, 'name', false);
                this.tree.data = [
                    {
                        id: 'isNull',
                        selected: this.tree.selectedId === 'isNull',
                        title: '所有模块',
                        expand: true,
                        children: [...nodeLevel1]
                    }
                ];
                this.form.select.data = [
                    {
                        id: ' ',
                        name: '所有模块'
                    },
                    ...response.data.content
                ];
            });
        },
        onSelectTree(nodes) {
            if(nodes && nodes.length > 0) {
                this.tree.selectedId = nodes[0].id;
            }
            this.loadGrid();
        },
        formTransformResponse(response) {
            response.data.parent = response.data.parent || {id: ' '};
            return response;
        },
        loadGrid() {
            const table = this.$refs.table.$refs.table;
            table.table.queryParams['parent.id'] = this.tree.selectedId;
            table.loadGrid({
                silent: true
            });
        },
        onLoadGrid() {
            this.loadTreeData();
        },
        onNewModalOpen() {
            this.$refs.table.form.data.parent = {
                id: this.tree.selectedId === 'isNull'? ' ': this.tree.selectedId
            };
        }
    },
    mounted() {
        this.loadTreeData();
        this.loadGrid();
    }
};
</script>
