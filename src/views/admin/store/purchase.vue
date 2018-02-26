<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <paged-table ref="table"
                     :columns="table.columns"
                     url="/api/purchaseForm"
                     :table-transform-query-params="tableTransformQueryParams"
                     :actions="table.actions">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="采购单号">
                    <Input v-model="props.params.orderNumber" placeholder="采购单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="purchaseDate" label="采购日期">
                    <DatePicker type="daterange"
                                placeholder="采购日期"
                                v-model="props.params.purchaseDate"></DatePicker>
                </FormItem>
            </template>
        </paged-table>
        <Modal v-model="form.modal"
               title="订单详情"
               :width="800">
            <Form ref="form" :model="form.data" :label-width="80">
                <Row>
                    <Col :span="8">
                    <FormItem label="业务员" prop="clerkId">
                        {{form.data.clerkName}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="采购日期" prop="purchaseDate">
                        {{form.data.purchaseDate}}
                    </FormItem>
                    </Col>
                </Row>
                <FormItem label="维修配件">
                    <parts-picker ref="partsPicker" :editable="false"></parts-picker>
                </FormItem>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import singleTable from '@/views/my-components/single-table/single-table.vue';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';
    import PartsPicker from '../entrust-form/parts-picker.vue';

    export default {
        components: {
            singleTable,
            PagedTable,
            PartsPicker
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
                        {key: 'orderNumber',title: '采购单号'},
                        {key: 'purchaseDate',title: '采购日期'},
                        {
                            key: 'clerkId',
                            title: '业务员',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/admin/${param.row.clerkId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        },
                        {
                            key: 'status',
                            title: '状态',
                            align: 'center',
                            render(h, param){
                                if(param.row.status === 'NEW') {
                                    return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '待审核');
                                } else if(param.row.status === 'IN_STORE') {
                                    return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '已入库');
                                }
                            }
                        }
                    ],
                    actions: [
                        (h, params)=> {
                            if(params.row.status === 'NEW') {
                                return  h('Poptip', {
                                    props: {
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
                                    }, '入库'),
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
                                                    this.inStore(params.row);
                                                }
                                            }
                                        }, '生成入库单')
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
                    modal: false,
                    storeId: null,
                    stores: [],
                    data: {
                        id: null,
                        clerkId: null,
                        purchaseDate: null,
                        clerkName: null,
                        partses: []
                    }
                }
            }
        },
        methods: {
            tableTransformQueryParams(data) {
                return Object.assign({}, data, {
                    purchaseDate: data.purchaseDate && data.purchaseDate[0]?[util.dateFormat(data.purchaseDate[0], 'yyyy-MM-dd HH:mm:ss'),
                        util.dateFormat(data.purchaseDate[1], 'yyyy-MM-dd HH:mm:ss')]: null
                });
            },
            loadStores() {
                util.ajax.get('/api/store').then((response)=>{
                    this.form.stores = response.data;
                })
            },
            inStore(row) {
                if(!this.form.storeId) {
                    this.$Message.warning('请选择仓库');
                    return;
                }
                util.ajax.post(`/api/purchaseForm/inStore/${row.id}`, {
                    storeId: this.form.storeId
                }).then(()=>{
                    this.$Message.success('生成入库单成功');
                    this.$refs.table.loadGrid();
                });
            },
            detail(row) {
                util.ajax.get(`/api/purchaseForm/${row.id}`).then((response)=>{
                    this.$refs.partsPicker.clearSelect();
                    if(response.data.partses && response.data.partses.length) {
                        this.$refs.partsPicker.select(response.data.partses.map((s)=> {
                            return {
                                ...s.parts,
                                count: s.count
                            };
                        }));
                    }
                    if(response.data.clerkId) {
                        response.data.clerkName = null;
                        util.ajax.get(`/api/admin/${response.data.clerkId}`).then((r)=>{
                            response.data.clerkName = r.data.name;
                        })
                    }
                    this.form.data = response.data;
                    this.form.modal = true;
                })
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
            this.loadStores();
        }
    };
</script>