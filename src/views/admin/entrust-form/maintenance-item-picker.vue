<style lang="less">
</style>

<template>
    <div>
        <Table :columns="table.columns" :data="table.data"></Table>
        <a href="javascript:void(0)" @click="openModal">添加项目</a>
        <Modal v-model="form.modal"
               title="选择维修项目"
               :transfer="false"
               :loading="form.loading"
               :width="600"
               @on-ok="chose">
            <Table ref="selection"
                   :columns="maintenanceItem.columns"
                   :data="maintenanceItem.data"
                   :height="400"
                   @on-row-click="onRowClick"
                   @on-selection-change="onSelectItem"></Table>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import maintenanceItemColumn from './maintenance-item-column';
    export default {
        name: 'maintenance-item-picker',
        props: {
            defaultSelection: {
                type: Array,
                default() {
                    return []
                }
            }
        },
        data() {
            return {
                table: {
                    columns: [
                        ...maintenanceItemColumn,
                        {
                            title: '操作',
                            key: 'action',
                            width: 80,
                            align: 'center',
                            render: (h, params) => {
                                return h('div', [
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
                                                    this.remove(params.index)
                                                }
                                            }
                                        },
                                        [
                                            h('a', {
                                                props: {
                                                    href: 'javascript:void(0)'
                                                }
                                            }, '删除')
                                        ]
                                    )
                                ]);
                            }
                        }
                    ],
                    data: this.defaultSelection
                },
                maintenanceItem: {
                    columns: [
                        {type: 'selection',width: 60,align: 'center'},
                        ...maintenanceItemColumn
                    ],
                    data: [],
                    selection: []
                },
                form: {
                    modal: false,
                    loading: true
                }
            }
        },
        methods: {
            loadMaintenanceItems() {
                util.ajax.get('/api/maintenanceItem', {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.maintenanceItem.data = response.data;
                })
            },
            openModal() {
                this.form.modal = true;
                this.$refs.selection.selectAll(false);
            },
            chose() {
                let exist = this.select(this.selection);
                if(exist) {
                    this.$refs.selection.selectAll(false);
                    this.form.loading = false;
                    this.$nextTick(() => {
                        this.form.loading = true;
                    });
                    return exist;
                }
                this.form.modal = false;
                this.$emit('on-select', this.selection);
            },
            select(selection) {
                let exist = false;
                selection.forEach((s)=>{
                    if(this.table.data.some((d, i)=>{
                        if(d.id === s.id) {
                            this.hilightRow(d.id);
                            return true;
                        }
                    })) {
                        this.$Notice.warning({
                            title: '您已经选择过此项目',
                            desc: '项目 ' + s.name + ' 已经添加到维修项目中。'
                        });
                        exist = true;
                    }
                });
                if(exist) {
                    return exist;
                }
                this.table.data.push(...selection);
                return exist;
            },
            clearSelect() {
                this.table.data.splice(0);
            },
            hilightRow(id) {
                let index = 0;
                this.maintenanceItem.data.some((d, i)=>{
                    if(d.id === id) {
                        index = i;
                        return true;
                    }
                })
                const hilightInterval = setInterval(()=> {
                    this.$refs.selection.objData[index]._isHighlight = !this.$refs.selection.objData[index]._isHighlight;
                }, 120);
                setTimeout(()=>{
                    clearInterval(hilightInterval);
                    this.$refs.selection.objData[index]._isHighlight = false;
                }, 1500)
            },
            onRowClick(row, index) {
                this.$refs.selection.toggleSelect(index);
            },
            onSelectItem(selection) {
                this.selection = selection;
            },
            remove(index) {
                this.table.data.splice(index, 1)
            }
        },
        mounted() {
            this.loadMaintenanceItems();
        },
        watch: {
            'table.data'(val) {
                this.$emit('on-selection-change', [...val]);
            },
            deep: true
        }
    }
</script>
