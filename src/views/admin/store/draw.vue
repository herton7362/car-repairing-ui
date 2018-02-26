<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <paged-table ref="table" :columns="table.columns" url="/api/drawingForm" :actions="table.actions">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="派工单号">
                    <Input v-model="props.params.orderNumber" placeholder="派工单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="status" label="状态">
                    <RadioGroup v-model="props.params.status">
                        <Radio label="">全部</Radio>
                        <Radio label="NEW">待审核</Radio>
                        <Radio label="OUT_STORE">出库</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem class="padding-right-medium" prop="entrustFormOrderNumber" label="委托单号">
                    <Input v-model="props.params.entrustFormOrderNumber" placeholder="委托单号"/>
                </FormItem>
            </template>
        </paged-table>
        <entrust-form-modal ref="entrustFormModal"></entrust-form-modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import EntrustFormModal from '../entrust-form/entrust-form-modal.vue';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';

    export default {
        components: {
            EntrustFormModal,
            PagedTable
        },
        data() {
            const constructStoreOptions = (h)=> {
                let options = [];
                this.form.stores.forEach((store)=>{
                    options.push(h('Option', {
                        props: {
                            value: store.id,
                            key: store.id
                        }
                    }, store.name))
                })
                return options;
            }
            return {
                table: {
                    columns: [
                        {key:'orderNumber', title:'领料单号'},
                        {key:'entrustFormOrderNumber', title:'委托单号'},
                        {
                            key:'workingTeamId',
                            title:'班组',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                if(param.row.workingTeamId) {
                                    util.ajax.get(`/api/workingTeam/${param.row.workingTeamId}`).then((response)=>{
                                        span.elm.innerHTML = response.data.name;
                                    })
                                } else {
                                    span.text = 'N/A';
                                }
                                return span;
                            }
                        },
                        {
                            key:'workerId',
                            title:'维修工人',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                if(param.row.workerId) {
                                    util.ajax.get(`/api/admin/${param.row.workerId}`).then((response)=>{
                                        span.elm.innerHTML = response.data.name;
                                    })
                                }else {
                                    span.text = 'N/A';
                                }
                                return span;
                            }
                        },
                        {
                            key: 'status',
                            title: '状态',
                            render(h, param){
                                if(param.row.status === 'NEW') {
                                    return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '待审核');
                                } else if(param.row.status === 'OUT_STORE') {
                                    return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '已出库');
                                }
                            }
                        }
                    ],
                    actions: [
                        (h, params)=> {
                            if(params.row.status === 'NEW') {
                                return  h('Poptip', {
                                    props: {
                                        content: '生成出库单',
                                        placement: 'top'
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.form.storeId = null;
                                            }
                                        },
                                        style: {
                                            marginRight: '5px'
                                        }
                                    }, '出库'),
                                    h('div', {
                                        slot: 'content'
                                    }, [
                                        h('Select', {
                                            props: {
                                                placeholder: '请选择仓库',
                                                value: this.form.storeId
                                            },
                                            on: {
                                                input: (val) => {
                                                    this.form.storeId = val
                                                }
                                            },
                                            style: {
                                                width: '150px'
                                            },
                                            slot: 'content'
                                        }, constructStoreOptions(h)),
                                        h('br'),
                                        h('Button', {
                                            props: {
                                                type: 'success',
                                                size: 'small',
                                                long: true
                                            },
                                            class: 'margin-top-small',
                                            on: {
                                                click: ()=>{
                                                    this.outStore(params.row);
                                                }
                                            }
                                        }, '生成出库单')
                                    ])
                                ])
                            }
                        },
                        (h, params)=> {
                            return h('Button', {
                                props: {
                                    type: 'ghost',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.detail(params.row);
                                    }
                                }
                            }, '详情')
                        }
                    ]
                },
                form: {
                    rule: {
                    },
                    stores: [],
                    storeId: null,
                    data: {
                        id: null
                    }
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            },
            loadStores() {
                util.ajax.get('/api/store').then((response)=>{
                    this.form.stores = response.data;
                })
            },
            outStore(row) {
                if(!this.form.storeId) {
                    this.$Message.warning('请选择仓库');
                    return;
                }
                util.ajax.post(`/api/drawingForm/outStore/${row.id}`, {
                    storeId: this.form.storeId
                }).then(()=>{
                    this.$Message.success('生成出库单成功');
                    this.$refs.table.loadGrid();
                });
            },
            detail(row) {
                this.$refs.entrustFormModal.getForm(row.entrustFormId);
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
            this.loadStores();
        }
    };
</script>