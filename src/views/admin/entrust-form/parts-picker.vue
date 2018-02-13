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
    import partsColumn from './parts-column';
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
                        ...partsColumn,
                        {
                            title: '数量 单位',
                            width: 120,
                            align: 'center',
                            render: (h, params)=>{
                                return h('span', [
                                    h('InputNumber', {
                                        props: {
                                            value: params.row.count,
                                            size: 'small'
                                        },
                                        on: {
                                            'input': (val) => {
                                                this.table.data[params.index].count = val;
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
                        ...partsColumn,
                        {
                            title: '单位',
                            width: 80,
                            align: 'center',
                            render: (h, params)=>{
                                return h('span', params.row.unit.name);
                            }
                        }
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
                    this.parts.data = response.data.map((d)=> ({count: 1, ...d}));
                })
            },
            openModal() {
                this.form.modal = true;
                this.$refs.selection.selectAll(false);
            },
            chose() {
                this.select(this.selection);
                this.form.modal = false;
                this.$emit('on-select', this.selection);
            },
            select(selection) {
                let exist = false;
                selection.forEach((s)=>{
                    this.table.data.forEach((d)=>{
                        if(d.id === s.id) {
                            d.count += s.count || 1;
                            exist = true;
                        }
                    })
                });
                if(!exist) {
                    this.table.data.push(...selection);
                }
            },
            clearSelect() {
                this.table.data.splice(0);
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
        },
        watch: {
            'table.data': {
                handler(val) {
                    this.$emit('on-selection-change', [...val]);
                },
                deep: true
            }
        }
    }
</script>
