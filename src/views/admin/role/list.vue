<style lang="less">
    @import '../../../styles/common.less';
    @import 'list.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      :actions="table.actions"
                      form-title="角色维护"
                      domain-url="role"
                      :form-rule="form.rule"
                      :form-data="form.data">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="name" label="登录名">
                    <Input v-model="props.params.name" placeholder="登录名"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <FormItem label="名称" prop="name">
                    <Input v-model="props.data.name" placeholder="请输入名称"/>
                </FormItem>
            </template>
        </single-table>
        <Modal v-model="authorization.modal"
               title="角色授权"
               :loading="authorization.loading"
               @on-ok="authorize">
            <Row>
                <Button type="text" size="small" @click="collapseAll"> <Icon type="minus"></Icon><span>收起全部</span></Button>
                <Button type="text" size="small" @click="expandAll"> <Icon type="plus"></Icon><span>展开全部</span></Button>
                <ButtonGroup style="float: right">
                    <Button type="error" size="small" @click="clearChecked"> <Icon type="toggle"></Icon><span>取消全选</span></Button>
                    <Button type="success" size="small" @click="checkAll"> <Icon type="toggle-filled"></Icon><span>选择全部</span></Button>
                </ButtonGroup>
            </Row>
            <div class="margin-top-medium" style="height: 600px; overflow: auto">
                <Tree ref="authorizationTree"
                      class="authorization-tree"
                      :data="authorization.data"
                      show-checkbox></Tree>
            </div>
        </Modal>
    </Card>
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
            table: {
                columns: [
                    {key:'name', title:'名称'}
                ],
                actions: [
                    (h, params)=> {
                        return h('Button', {
                            props: {
                                type: 'warning',
                                size: 'small'
                            },
                            style: {
                                marginRight: '5px'
                            },
                            on: {
                                click: () => {
                                    this.openAuthorizeModal(params.row);
                                }
                            }
                        }, '授权')
                    }
                ]
            },
            form: {
                rule: {
                    name: [
                        { required: true, message: '请填写角色名', trigger: 'blur' }
                    ]
                },
                data: {
                    id: null,
                    name: null
                }
            },
            authorization: {
                id: null,
                modal: false,
                loading: true,
                raw: [],
                data: []
            }
        }
    },
    methods: {
        openAuthorizeModal(row) {
            const isLeafNode = (node) => {
                return !node.children || node.children.length === 0;
            };

            util.ajax.get(`/api/role/authorizations/${row.id}`).then((response)=>{
                const checkedIds = response.data.map((n)=>n.id);
                this.clearChecked();
                // 由于iview 半选的问题所以不主动勾选父节点
                // 只勾选最下级节点
                this.authorization.raw.forEach((n)=>n.checked = util.oneOf(n.id, checkedIds) && isLeafNode(n));
                this.authorization.modal = true;
                this.authorization.id = row.id;
            })
        },
        authorize() {
            // 将半选的权限获取到
            const addHalfCheckedNodes = (checkedNodes) => {
                let [addedIds, halfCheckedNodes] = [[
                    ...checkedNodes.map((node)=> node.id)
                ], []];
                let addNode = (node)=> {
                    if(node.parent && !util.oneOf(node.parent.id, addedIds)) {
                        halfCheckedNodes.push(node.parent);
                        addedIds.push(node.parent.id);
                        addNode(node.parent);
                    }
                };
                checkedNodes.forEach(addNode);
                checkedNodes.push(...halfCheckedNodes);
            };

            let checkedNodes = this.$refs.authorizationTree.getCheckedNodes();
            addHalfCheckedNodes(checkedNodes);
            util.ajax.post('/api/role/authorize', {
                roleId: this.authorization.id,
                moduleIds: checkedNodes.map((node)=> node.id)
            }).then(() => {
                this.authorization.modal = false;
                this.$Message.success('授权成功');
            });
        },
        clearChecked() {
            this.authorization.raw.forEach((n)=>n.checked = false);
        },
        checkAll() {
            // 选中所有父节点即可
            this.authorization.data.forEach((n)=>n.checked = true);
        },
        collapseAll() {
            this.authorization.raw.forEach((n)=>n.expand = false);
        },
        expandAll() {
            this.authorization.raw.forEach((n)=>n.expand = true);
        },
        loadModules() {
            util.ajax.get('/api/module', {
                params: {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }
            }).then((response)=>{
                const prettifyTreeNode = (nodes) => {
                    nodes.forEach((node)=>{
                        if(node.children && node.children.length > 0) {
                            prettifyTreeNode(node.children);
                        } else {
                            node.nodeClass = 'leaf-node';
                        }
                    })
                };
                // 增加checked属性
                this.authorization.raw = response.data.content.map((n)=>{
                    n.checked = false;
                    n.expand = true;
                    return n;
                });
                const nodes = util.transformTreeData(response.data.content, 'name');
                // 让最后一级节点横排显示
                prettifyTreeNode(nodes);
                this.authorization.data = nodes;
            });
        }
    },
    mounted() {
        this.loadModules();
        this.$refs.table.loadGrid();
    }
};
</script>
