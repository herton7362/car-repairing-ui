<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <paged-table ref="table"
                      :columns="table.columns"
                     :actions="table.actions"
                      domain-url="dispatchForm">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="派工单号">
                    <Input v-model="props.params.orderNumber" placeholder="派工单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="status" label="状态">
                    <RadioGroup v-model="props.params.status">
                        <Radio label="">全部</Radio>
                        <Radio label="NEW">新建</Radio>
                        <Radio label="DRAWING">领料</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem class="padding-right-medium" prop="entrustFormOrderNumber" label="委托单号">
                    <Input v-model="props.params.entrustFormOrderNumber" placeholder="委托单号"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
            </template>
        </paged-table>
        <Modal v-model="entrustForm.modal" title="委托书" :width="800">
            <Form :label-width="80">
                <Row>
                    <Col :span="8">
                    <FormItem label="车牌号">
                        {{entrustForm.data.vehicle.plateNumber}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="引擎号">
                        {{entrustForm.data.vehicle.engineNumber}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="车架号">
                        {{entrustForm.data.vehicle.frameNumber}}
                    </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col :span="8">
                    <FormItem label="车型">
                        {{entrustForm.data.vehicle.vehicleCategory.name}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="计划完工">
                        {{entrustForm.data.planFinishDate}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="进场里数">
                        {{entrustForm.data.kilometres}}
                    </FormItem>
                    </Col>
                </Row>
                <FormItem label="维修项目">
                    <Table :columns="entrustForm.maintenanceItem.columns" :data="entrustForm.maintenanceItem.data"></Table>
                </FormItem>
                <FormItem label="维修配件">
                    <Table :columns="entrustForm.parts.columns" :data="entrustForm.parts.data"></Table>
                </FormItem>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';
    import maintenanceItemColumn from '../entrust-form/maintenance-item-column';
    import partsColumn from '../entrust-form/parts-column';

    export default {
        components: {
            PagedTable
        },
        data() {
            return {
                table: {
                    columns: [
                        {key:'orderNumber', title:'派工单号'},
                        {
                            key:'entrustFormOrderNumber',
                            title:'委托单号',
                            render: (h, params) => {
                                return h('a', {
                                    props: {
                                        href: 'javascript:void(0)'
                                    },
                                    on: {
                                        click: () => {
                                            this.getForm(params.row.entrustFormId);
                                            this.entrustForm.modal = true;
                                        }
                                    }
                                }, params.row.entrustFormOrderNumber)
                            }
                        },
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
                                    return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '新建');
                                } else if(param.row.status === 'DRAWING') {
                                    return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '领料');
                                }
                            }
                        }
                    ],
                    actions: [
                        (h, params)=> {
                            if(params.row.status === 'NEW') {
                                return  h('Tooltip', {
                                    props: {
                                        content: '生成领料单',
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
                                                this.draw(params.row);
                                            }
                                        }
                                    }, '领料')
                                ])
                            }
                        }
                    ]
                },
                entrustForm: {
                    modal: false,
                    data: {
                        id: null,
                        vehicle: {
                            vehicleCategory: {}
                        },
                        planFinishDate: null
                    },
                    maintenanceItem: {
                        columns: maintenanceItemColumn,
                        data: []
                    },
                    parts: {
                        columns: [
                            ...partsColumn,
                            {
                                title: '数量 单位',
                                width: 120,
                                align: 'center',
                                render: (h, params)=>{
                                    return h('span', `${params.row.count} ${params.row.unit.name}`)
                                }
                            }
                        ],
                        data: []
                    }
                }
            }
        },
        methods: {
            getForm(id) {
                util.ajax.get(`/api/entrustForm/${id}`).then((response)=>{
                    response.data.vehicle.vehicleCategory = {};
                    this.entrustForm.data = response.data;
                    this.entrustForm.maintenanceItem.data = response.data.items.map((i)=>{
                        return {
                            ...i.maintenanceItem
                        }
                    });
                    this.entrustForm.parts.data = response.data.partses.map((i)=>{
                        return {
                            ...i.parts,
                            count: i.count
                        }
                    })
                    return util.ajax.get(`/api/vehicleCategory/${response.data.vehicle.vehicleCategoryId}`)
                }).then((response)=>{
                    this.entrustForm.data.vehicle.vehicleCategory = response.data;
                });
            },
            draw(row) {
                util.ajax.post(`/api/dispatchForm/draw/${row.id}`).then(()=>{
                    this.$Message.success('生成领料单成功');
                    this.$refs.table.loadGrid();
                });
            },
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
        }
    };
</script>