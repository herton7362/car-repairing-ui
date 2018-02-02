<style lang="less">
    @import '../../../styles/common.less';
    @import '../../../styles/animation.less';
    @import './reg-entrust-form.less';
</style>

<template>
    <Card class="reg-entrust-form">
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="登记委托单"
                      domain-url="entrustForm"
                      :modal-width="800"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :query-params="queryParams"
                      :default-query-params="defaultQueryParams"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="vehicle.engineNumber" label="引擎号">
                    <Input v-model="props.params['vehicle.engineNumber']" placeholder="引擎号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="vehicle.plateNumber" label="车牌号">
                    <Input v-model="props.params['vehicle.plateNumber']" placeholder="车牌号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="vehicle.frameNumber" label="车架号">
                    <Input v-model="props.params['vehicle.frameNumber']" placeholder="车架号"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <Row>
                    <Col :span="10">
                        <FormItem label="车牌号" prop="vehicleId" style="position: relative">
                            <AutoComplete ref="vehicleSelector"
                                    v-model="props.data.vehicleId"
                                    placeholder="请填写车牌号"
                                    :style="'width:' + (form.editVehicle? '176px': '100%')">
                                <Option :value="vehicle.plateNumber"
                                        v-for="vehicle in form.vehicles"
                                        :key="vehicle.id">{{vehicle.plateNumber}}</Option>
                            </AutoComplete>
                            <transition name="scale-up">
                                <Button type="primary"
                                        v-show="form.editVehicle"
                                        style="position: absolute; right: 0; ">新建</Button>
                            </transition>
                        </FormItem>
                    </Col>
                </Row>
                <transition name="fade">
                    <div v-show="form.editVehicle">
                        <Row>
                            <Col :span="8">
                                <FormItem label="引擎号" prop="engineNumber">
                                    <Input v-model="form.vehicle.engineNumber" placeholder="请输入引擎号"/>
                                </FormItem>
                            </Col>
                            <Col :span="8">
                                <FormItem label="车架号" prop="frameNumber">
                                    <Input v-model="form.vehicle.frameNumber" placeholder="请输入车架号"/>
                                </FormItem>
                            </Col>
                            <Col :span="8">
                                <FormItem label="车主" prop="memberName">
                                    <Input v-model="form.vehicle.memberName" placeholder="请输入车主姓名"/>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col :span="8">
                                <FormItem label="电话" prop="loginName">
                                    <Input v-model="form.vehicle.loginName" placeholder="请输入车主电话"/>
                                </FormItem>
                            </Col>
                        </Row>
                    </div>
                </transition>
                <Row>
                    <Col :span="8">
                        <FormItem label="进场时间" prop="approachDate">
                            <DatePicker type="date" placeholder="请选择进场时间" v-model="props.data.approachDate"></DatePicker>
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="保险公司" prop="insuranceCompanyId">
                            <Select v-model="props.data.insuranceCompanyId" placeholder="请选择保险公司" filterable>
                                <Option :value="insuranceCompany.id"
                                        v-for="insuranceCompany in form.insuranceCompanies"
                                        :key="insuranceCompany.id">{{insuranceCompany.name}}</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="计划完工" prop="planFinishDate">
                            <DatePicker type="date" placeholder="请选择计划完工时间" v-model="props.data.planFinishDate"></DatePicker>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col :span="8">
                        <FormItem label="接车员" prop="operatorId">
                            <Select v-model="props.data.operatorId" placeholder="请选择接车员" filterable>
                                <Option :value="admin.id"
                                        v-for="admin in form.admins"
                                        :key="admin.id">{{admin.name}}</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="业务员" prop="clerkId">
                            <Select v-model="props.data.clerkId" placeholder="请选择接车员" filterable>
                                <Option :value="admin.id"
                                        v-for="admin in form.admins"
                                        :key="admin.id">{{admin.name}}</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col :span="8">
                        <FormItem label="进场里数" prop="kilometres">
                            <InputNumber v-model="props.data.kilometres" placeholder="请填写进场里数"/>
                        </FormItem>
                    </Col>
                </Row>
            </template>
        </single-table>
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
                        {key: 'orderNumber',title: '委托单号'},
                        {
                            key: 'vehicle',
                            title: '引擎号',
                            render(h, param){
                                return h('span', param.row.vehicle.engineNumber)
                            }
                        },
                        {
                            key: 'vehicle',
                            title: '车牌号',
                            render(h, param){
                                return h('span', param.row.vehicle.plateNumber)
                            }
                        },
                        {
                            key: 'vehicle',
                            title: '车架号',
                            render(h, param){
                                return h('span', param.row.vehicle.frameNumber)
                            }
                        }
                    ]
                },
                queryParams: {
                    vehicle: {}
                },
                defaultQueryParams: {},
                form: {
                    rule: {
                        vehicleId: [
                            { required: true, message: '请选择车辆', trigger: 'change' }
                        ],
                        approachDate: [
                            { required: true, message: '请选择进场时间', trigger: 'change' }
                        ]
                    },
                    vehicle: {},
                    vehicles: [],
                    editVehicle: false,
                    insuranceCompanies: [],
                    admins: [],
                    data: {
                        id: null,
                        vehicleId: '',
                        vehicle: null,
                        approachDate: null,
                        insuranceCompanyId: '',
                        insuranceCompany: null,
                        planFinishDate: null,
                        operatorId: '',
                        operator: null,
                        kilometres: null,
                        clerkId: '',
                        clerk: null
                    }
                }
            }
        },
        computed: {
            loginUser() {
                return this.$store.state.user.loginUser;
            }
        },
        methods: {
            formTransformResponse(response) {
                if(response.data.vehicle) {
                    response.data.vehicleId = response.data.vehicle.id;
                }
                return response;
            },
            loadVehicles() {
                util.ajax.get('/api/vehicle', {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.vehicles = response.data;
                })
            },
            loadInsuranceCompanies() {
                util.ajax.get('/api/dictionary/code/insurance_company').then((response)=>{
                    this.form.insuranceCompanies = response.data;
                })
            },
            loadAdmins() {
                util.ajax.get('/api/admin', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.admins = response.data;
                })
            }
        },
        mounted() {
            this.$refs.vehicleSelector.$watch('notFound', (val)=>{
                this.form.editVehicle = val;
                this.$refs.vehicleSelector.$refs.dropdown.width = this.$refs.vehicleSelector.width;
            })
            this.$refs.table.$watch('form.data.vehicleId', (val) => {
                let vehicle = this.form.vehicles.find((d)=>d.id === val);
                this.$refs.table.form.data.vehicle = vehicle;
                if(vehicle) {
                    this.form.editVehicle = true;
                    this.form.vehicle = {
                        engineNumber: vehicle.engineNumber,
                        frameNumber: vehicle.frameNumber,
                        memberName: vehicle.member.name,
                        loginName: vehicle.member.loginName
                    }
                } else {
                    this.form.editVehicle = false;
                    this.form.vehicle = {};
                }
            });
            this.defaultQueryParams['admin.id'] = this.loginUser.id;
            this.$refs.table.loadGrid();
            this.loadVehicles();
            this.loadInsuranceCompanies();
            this.loadAdmins();
        }
    };
</script>