<style lang="less">
    @import '../../../styles/common.less';
    @import '../../../styles/animation.less';
    @import './dispatch.less';
</style>

<template>
    <Card class="dispatch">
        <paged-table ref="table"
                     :columns="table.columns"
                     :query-params="queryParams"
                     :actions="table.actions"
                     :table-transform-query-params="tableTransformQueryParams"
                     domain-url="entrustForm">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="委托单号">
                    <Input v-model="props.params.orderNumber" placeholder="委托单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="status" label="状态">
                    <RadioGroup v-model="props.params.status">
                        <Radio label="">全部</Radio>
                        <Radio label="NEW">新建</Radio>
                        <Radio label="DISPATCHING">派工</Radio>
                        <Radio label="FINISHED">竣工</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem class="padding-right-medium" prop="vehicle.plateNumber" label="车牌号">
                    <Input v-model="props.params.vehicle.plateNumber" placeholder="车牌号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="vehicle.engineNumber" label="引擎号">
                    <Input v-model="props.params.vehicle.engineNumber" placeholder="引擎号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="vehicle.frameNumber" label="车架号">
                    <Input v-model="props.params.vehicle.frameNumber" placeholder="车架号"/>
                </FormItem>
            </template>
        </paged-table>
        <Modal v-model="form.modal"
               :loading="form.loading"
               :title="form.title"
               @on-ok="dispatch"
               :width="800">
            <Form :label-width="80">
                <Row>
                    <Col :span="8">
                        <FormItem label="车牌号">
                            {{form.data.vehicle.plateNumber}}
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="引擎号">
                            {{form.data.vehicle.engineNumber}}
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="车架号">
                            {{form.data.vehicle.frameNumber}}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col :span="8">
                        <FormItem label="车型">
                            {{form.data.vehicle.vehicleCategory.name}}
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="计划完工">
                            {{form.data.planFinishDate}}
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="进场里数">
                            {{form.data.kilometres}}
                        </FormItem>
                    </Col>
                </Row>
                <FormItem label="维修项目">
                    <Table :columns="maintenanceItem.columns" :data="maintenanceItem.data"></Table>
                </FormItem>
                <FormItem label="维修配件">
                    <Table :columns="parts.columns" :data="parts.data"></Table>
                </FormItem>
            </Form>
            <Form class="dispatch-form-detail"
                  ref="form"
                  :model="form.auditData"
                  :rules="form.rules"
                  :label-width="80"
                  v-if="form.title == '派工'">
                <FormItem label="派工方式">
                    <RadioGroup v-model="form.workType">
                        <Radio label="个人"></Radio>
                        <Radio label="班组"></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="班组" prop="workingTeam" required v-if="form.workType === '班组'">
                    <Select v-model="form.auditData.workingTeamId"  placeholder="请选择班组" style="width: 200px;">
                        <Option :value="workingTeam.id" v-for="workingTeam in form.workingTeams" :key="workingTeam.id">
                            {{workingTeam.name}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="维修人员" prop="workerId" required v-if="form.workType === '个人'">
                    <Select v-model="form.auditData.workerId"  placeholder="请选择维修人员" style="width: 200px;">
                        <Option :value="admin.id" v-for="admin in form.admins" :key="admin.id">
                            {{admin.name}}
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';
    import entrustFormColumns from './entrust-form-columns.js';
    import maintenanceItemColumn from './maintenance-item-column';
    import partsColumn from './parts-column';

    export default {
        components: {
            PagedTable
        },
        data() {
            return {
                table: {
                    columns: entrustFormColumns,
                    actions: [
                        (h, params)=> {
                            if(params.row.status === 'NEW') {
                                return h('Tooltip', {
                                    props: {
                                        content: '生成派工单',
                                        placement: 'top'
                                    }
                                },[
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        on: {
                                            click: () => {
                                                this.openDespatchModal(params.row);
                                            }
                                        }
                                    }, '派工')
                                ])
                            } else {
                                return h('Button', {
                                    props: {
                                        type: 'ghost',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.openViewModal(params.row);
                                        }
                                    }
                                }, '查看')
                            }
                        }
                    ]
                },
                queryParams: {
                    vehicle: {}
                },
                form: {
                    modal: false,
                    loading: true,
                    title: '',
                    workingTeams:[],
                    admins: [],
                    data: {
                        id: null,
                        vehicle: {
                            vehicleCategory: {}
                        },
                        planFinishDate: null
                    },
                    workType: '个人',
                    auditData: {
                        workingTeamId: null,
                        workerId: null
                    },
                    rules: {
                        workingTeamId: [
                            { required: true, message: '请选择班组', trigger: 'change'}
                        ],
                        workerId: [
                            { required: true, message: '请选择维修人员', trigger: 'change'}
                        ]
                    }
                },
                maintenanceItem: {
                    columns: maintenanceItemColumn,
                    data: []
                },
                parts: {
                    columns: [...partsColumn, {key: 'count', title: '数量', width: 100}],
                    data: []
                }
            }
        },
        computed: {
            loginUser() {
                return this.$store.state.user.loginUser;
            }
        },
        methods: {
            tableTransformQueryParams(queryParams) {
                queryParams['vehicle.engineNumber'] = queryParams.vehicle.engineNumber;
                queryParams['vehicle.plateNumber'] = queryParams.vehicle.plateNumber;
                queryParams['vehicle.frameNumber'] = queryParams.vehicle.frameNumber;
                return queryParams;
            },
            openDespatchModal(row) {
                this.getForm(row);
                this.form.title = '派工';
                this.form.modal = true;
            },
            openViewModal(row) {
                this.getForm(row);
                this.form.title = '查看详情';
                this.form.modal = true;
            },
            getForm(row) {
                util.ajax.get(`/api/entrustForm/${row.id}`).then((response)=>{
                    response.data.vehicle.vehicleCategory = {};
                    this.form.data = response.data;
                    this.maintenanceItem.data = response.data.items.map((i)=>{
                        return {
                            ...i.maintenanceItem
                        }
                    });
                    this.parts.data = response.data.partses.map((i)=>{
                        return {
                            ...i.parts,
                            count: i.count
                        }
                    })
                    return util.ajax.get(`/api/vehicleCategory/${response.data.vehicle.vehicleCategoryId}`)
                }).then((response)=>{
                    this.form.data.vehicle.vehicleCategory = response.data;
                });
            },
            loadWorkingTeams() {
                util.ajax.get('/api/workingTeam', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.workingTeams = response.data;
                })
            },
            loadAdmins() {
                util.ajax.get('/api/admin', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.admins = response.data;
                })
            },
            clearFormLoading() {
                this.form.loading = false;
                this.$nextTick(() => {
                    this.form.loading = true;
                });
            },
            dispatch() {
                if(!this.$refs.form) {
                    this.form.modal = false;
                    return;
                }
                this.$refs.form.validate((valid) => {
                    if(valid) {
                        util.ajax.post(`/api/entrustForm/dispatch/${this.form.data.id}`, this.form.auditData).then(()=>{
                            this.form.modal = false;
                            this.$Message.success('生成派工单成功');
                            this.$refs.table.loadGrid();
                        }).catch((error)=>{
                            this.clearFormLoading();
                            return Promise.reject(error);
                        });
                    } else {
                        this.clearFormLoading();
                    }
                })
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
            this.loadWorkingTeams();
            this.loadAdmins();
        }
    };
</script>