<style lang="less">
    @import './type.less';
</style>

<template>
    <div class="vehicle-type-main">
        <div class="vehicle-type-tree">
            <Card>
                <Tree :data="tree.data" @on-select-change="onSelectTree"></Tree>
            </Card>
        </div>
        <div class="vehicle-type-list">
            <Card>
                <single-table ref="table"
                              :columns="table.columns"
                              form-title="车型维护"
                              domain-url="vehicleCategory"
                              :form-rule="form.rule"
                              :form-data="form.data"
                              :form-transform-response="formTransformResponse"
                              @on-load="onLoadGrid"
                              @on-new-modal-open="onNewModalOpen">
                    <template slot="query-form" slot-scope="props">
                        <FormItem class="padding-right-medium" prop="name" label="名称">
                            <Input v-model="props.params.name" placeholder="名称"/>
                        </FormItem>
                    </template>

                    <template slot="edit-form" slot-scope="props">
                        <FormItem class="padding-right-medium" prop="parent.id" label="上级车型">
                            <Select v-model="props.data.parent.id" placeholder="请选择上级车型">
                                <Option v-for="row in form.select.data" :value="row.id" :key="row.id">{{row.name}}</Option>
                            </Select>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="name" label="名称">
                            <Input v-model="props.data.name" placeholder="请输入名称"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="logo" label="车型logo">
                            <image-uploader :default-file-list="form.uploader.defaultFileList"
                                            :pre-view="false"
                                            :on-success="onUploadSuccess"
                                            :on-remove="onRemoveLogo"></image-uploader>
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
    import imageUploader from '@/views/my-components/upload/image-uploader.vue';

    export default {
        components: {
            singleTable,
            imageUploader
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
                        {key:'name', title:'名称'}
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
                        logo:null
                    },
                    uploader: {
                        defaultFileList: []
                    }
                }
            }
        },
        methods: {
            loadTreeData() {
                util.ajax.get('/api/vehicleCategory', {
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
                            title: '所有车型',
                            expand: true,
                            children: [...nodeLevel1]
                        }
                    ];
                    this.form.select.data = [
                        {
                            id: ' ',
                            name: '所有车型'
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
                this.form.uploader.defaultFileList.splice(0);
                if(response.data.logo) {
                    this.form.uploader.defaultFileList.push({
                        name: response.data.logo.name,
                        id: response.data.logo.id
                    });
                }
                return response;
            },
            loadGrid() {
                const table = this.$refs.table;
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
            },
            onUploadSuccess(res, file) {
                this.$refs.table.form.data.logo = res[0];
            },
            onRemoveLogo(file) {
                this.$refs.table.form.data.logo = null;
            }
        },
        mounted() {
            this.loadTreeData();
            this.loadGrid();
        }
    };
</script>
