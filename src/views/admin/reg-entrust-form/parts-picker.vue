<style lang="less">
</style>

<template>
    <div>
        <Table :columns="table.columns" :data="table.data"></Table>
        <a href="javascript:void(0)" @click="openModal">添加配件</a>
        <Modal v-model="form.modal"
               title="选择配件项目"
               :transfer="false"
               :loading="form.loading"
               :width="600"
               @on-ok="chose">
            <Table ref="selection"
                   :columns="parts.columns"
                   :data="parts.data"
                   :height="400"
                   @on-row-click="onRowClick"
                   @on-selection-change="onSelectItem"></Table>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    export default {
        name: 'parts-picker',
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
                        {key: 'name',title: '配件项目'},
                        {key: 'modelNumber',title: '型号',width: 100,align: 'center'},
                        {key: 'standard',title: '规格',width: 100, align: 'center'},
                        {
                            title: '数量 单位',
                            width: 120,
                            align: 'center',
                            render: (h, params)=>{
                                return h('span', [
                                    h('InputNumber', {
                                        props: {
                                            size: 'small',
                                            v: {
                                                model: params.row.count
                                            }
                                        },
                                        style: {
                                            width: '50px',
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('span', params.row.unit.name)
                                ])
                            }
                        },
                        {key: 'price',title: '单价',width: 100, align: 'right'},
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
                parts: {
                    columns: [
                        {type: 'selection',width: 60,align: 'center'},
                        {key: 'name',title: '配件项目'},
                        {key: 'modelNumber',title: '型号',width: 100,align: 'center'},
                        {key: 'standard',title: '规格',width: 100, align: 'center'},
                        {
                            title: '单位',
                            width: 80,
                            align: 'center',
                            render: (h, params)=>{
                                return h('span', params.row.unit.name);
                            }
                        },
                        {key: 'price',title: '单价',width: 100}
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
            loadParts() {
                util.ajax.get('/api/parts', {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.parts.data = response.data;
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
                selection.forEach((s)=>s.count = s.count || 1);
                this.table.data.push(...selection);
                this.$emit('on-selection-change', [...this.table.data]);
                return exist;
            },
            clearSelect() {
                this.table.data.splice(0);
                this.$emit('on-selection-change', []);
            },
            hilightRow(id) {
                let index = 0;
                this.parts.data.some((d, i)=>{
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
            this.loadParts();
        }
    }
</script>
