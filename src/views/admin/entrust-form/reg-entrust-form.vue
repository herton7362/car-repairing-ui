<style lang="less">
    @import '../../../styles/common.less';
    @import '../../../styles/animation.less';
    @import './reg-entrust-form.less';
</style>

<template>
    <Card class="reg-entrust-form">
        <single-table ref="table"
                      :columns="table.columns"
                      :actions="table.actions"
                      form-title="登记委托单"
                      domain-url="entrustForm"
                      :modal-width="800"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :query-params="queryParams"
                      :default-query-params="defaultQueryParams"
                      :form-transform-response="formTransformResponse"
                      :form-transform-data="formTransformData"
                      :mask-closable="false"
                      :table-transform-query-params="tableTransformQueryParams"
                      @on-new-modal-open="onNewModalOpen"
                      @on-load="onTableLoad">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="委托单号">
                    <Input v-model="props.params.orderNumber" placeholder="委托单号"/>
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

            <template slot="edit-form" slot-scope="props">
                <Row>
                    <Col :span="8">
                        <FormItem label="车牌号" prop="vehicle.plateNumber">
                            <AutoComplete v-model="props.data.vehicle.plateNumber"
                                          placeholder="请填写车牌号">
                                <Option :value="vehicle.plateNumber"
                                        v-for="vehicle in form.vehicles"
                                        :key="vehicle.id">{{vehicle.plateNumber}}</Option>
                            </AutoComplete>
                        </FormItem>
                    </Col>
                </Row>
                <div v-show="form.vehicleVisible">
                    <Row>
                        <Col :span="8">
                        <FormItem label="引擎号" prop="vehicle.engineNumber">
                            <Input v-model="props.data.vehicle.engineNumber" placeholder="请输入引擎号"/>
                        </FormItem>
                        </Col>
                        <Col :span="8">
                        <FormItem label="车架号" prop="vehicle.frameNumber">
                            <Input v-model="props.data.vehicle.frameNumber" placeholder="请输入车架号"/>
                        </FormItem>
                        </Col>
                        <Col :span="8">
                        <FormItem label="车主" prop="vehicle.memberId">
                            <Select v-model="props.data.vehicle.memberId" placeholder="请选择车主" filterable>
                                <Option :value="member.id" v-for="member in form.members" :key="member.id">{{member.name || member.mobile}}</Option>
                            </Select>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col :span="16">
                        <FormItem label="车型" prop="vehicle.vehicleCategories">
                            <Cascader ref="vehicleCategories" :data="form.vehicleCategories" v-model="props.data.vehicle.vehicleCategoryId" placeholder="请选车型"/>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col :span="8">
                        <FormItem label="联系电话" prop="contactTel">
                            <Input v-model="props.data.contactTel" placeholder="请输入联系电话"/>
                        </FormItem>
                        </Col>
                    </Row>
                </div>
                <Row>
                    <Col :span="8">
                        <FormItem label="进场时间" prop="approachDate">
                            <DatePicker type="date"
                                        placeholder="请选择进场时间"
                                        v-model="props.data.approachDate"></DatePicker>
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
                            <DatePicker type="date"
                                        placeholder="请选择计划完工时间"
                                        v-model="props.data.planFinishDate"></DatePicker>
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
                <FormItem label="维修项目" required>
                    <maintenance-item-picker ref="itemPicker"
                                             @on-selection-change="onSelectionChangeItem"
                                             @on-select="onSelectItem"></maintenance-item-picker>
                </FormItem>
                <FormItem label="维修配件" required>
                    <parts-picker ref="partsPicker" @on-selection-change="onSelectionChangeParts"></parts-picker>
                </FormItem>
                <Row>
                    <Col :span="8">
                    <FormItem label="应付">
                        {{form.needPay}}
                    </FormItem>
                    </Col>
                </Row>
            </template>
        </single-table>
        <Modal v-model="payForm.modal" title="收款" :loading="payForm.loading" @on-ok="pay">
            <Form ref="payForm" :model="payForm.data" :rules="payForm.rule" :label-width="80">
                <Row>
                    <Col :span="8">
                    <FormItem label="应付">
                        {{payForm.needPay}}
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="会员余额">
                        {{payForm.memberBalance}}
                    </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col :span="8">
                    <FormItem label="实收" prop="finalPay">
                        <InputNumber v-model="payForm.data.finalPay" placeholder="请填写实收金额"/>
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="现金" prop="cashPay">
                        <InputNumber v-model="payForm.data.cashPay" placeholder="请填写实收金额"/>
                    </FormItem>
                    </Col>
                    <Col :span="8">
                    <FormItem label="余额" prop="balancePay">
                        <InputNumber v-model="payForm.data.balancePay" placeholder="请填写实收金额"/>
                    </FormItem>
                    </Col>
                </Row>
            </Form>
        </Modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import SingleTable from '@/views/my-components/single-table/single-table.vue';
    import MaintenanceItemPicker from './maintenance-item-picker.vue';
    import PartsPicker from './parts-picker.vue';
    import entrustFormColumns from './entrust-form-columns.js';

    export default {
        components: {
            SingleTable,
            MaintenanceItemPicker,
            PartsPicker
        },
        data() {
            return {
                table: {
                    columns: entrustFormColumns,
                    actions: [
                        (h, params)=> {
                            if(params.row.payStatus === 'UNPAY') {
                                return  h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.$refs.payForm.resetFields();
                                            util.ajax.get(`/api/entrustForm/${params.row.id}`).then((response) => {
                                                this.payForm.data = response.data;
                                                this.payForm.needPay = 0;
                                                this.payForm.needPay = this.calculateNeedPay(this.payForm.data);
                                                util.ajax.get(`/api/member/${this.payForm.data.vehicle.memberId}`).then((r)=>{
                                                    this.payForm.memberBalance = r.data.balance || 0;
                                                })
                                                this.payForm.modal = true;
                                            });
                                        }
                                    },
                                    style: {
                                        marginRight: '5px'
                                    }
                                }, '收款')
                            }
                        },
                        (h, params)=> {
                            if(params.row.status === 'NEW' && params.row.origin === 'ONLINE_SHOP') {
                                return  h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            util.ajax.post(`/api/entrustForm/confirm/${params.row.id}`).then((response)=>{
                                                this.$Message.success('操作成功');
                                                this.$refs.table.loadGrid();
                                            });
                                        }
                                    },
                                    style: {
                                        marginRight: '5px'
                                    }
                                }, '确认')
                            }
                        }
                    ]
                },
                queryParams: {
                    vehicle: {}
                },
                defaultQueryParams: {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                },
                form: {
                    rule: {
                        'vehicle.plateNumber': [
                            { required: true, message: '请填写车牌号', trigger: 'change' },
                            { type: 'string', pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/ ,
                                message:'车牌号格式不正确', trigger: 'blur'}
                        ],
                        contactTel: [
                            { required: true, message: '请填写手机号', trigger: 'blur'},
                            { type: 'string', pattern: /(^1[0-9]{10}$)/ ,
                                message:'手机号格式不正确', trigger: 'blur'}
                        ],
                        approachDate: [
                            { required: true, message: '请选择进场时间', trigger: 'change', type: 'date' }
                        ],
                        'vehicle.vehicleCategoryId': [
                            { required: true, message: '请选择车型', trigger: 'change', type: 'array' }
                        ],
                        operatorId: [
                            { required: true, message: '请选择接车员', trigger: 'change' }
                        ],
                        clerkId: [
                            { required: true, message: '请选择业务员', trigger: 'change' }
                        ],
                        finalPay: [
                            { required: true, message: '请填写实收金额', trigger: 'blur' , type: 'number' }
                        ]
                    },
                    vehicle: {},
                    vehicles: [],
                    insuranceCompanies: [],
                    admins: [],
                    members: [],
                    vehicleCategoriesRaw: [],
                    vehicleCategories: [],
                    vehicleVisible: false,
                    needPay: 0,
                    data: {
                        id: null,
                        vehicle: {
                            engineNumber: null,
                            frameNumber: null,
                            plateNumber: null,
                            memberId: null,
                            vehicleCategoryId: [],
                            vehicleCategories: []
                        },
                        approachDate: null,
                        insuranceCompanyId: null,
                        planFinishDate: null,
                        operatorId: null,
                        kilometres: null,
                        clerkId: null,
                        contactTel: null,
                        items: [],
                        partses: []
                    }
                },
                payForm: {
                    modal: false,
                    loading: true,
                    needPay: 0,
                    memberBalance: 0,
                    data: {
                        id: null,
                        finalPay: null,
                        cashPay: null,
                        balancePay: null,
                        payType: 'OFFLINE',
                        vehicle: {}
                    },
                    rule: {
                        finalPay: [
                            { required: true, message: '请填写实收金额', trigger: 'blur', type: 'number'}
                        ],
                        cashPay: [
                            { required: true, message: '请填写现金金额', trigger: 'blur', type: 'number'}
                        ],
                        balancePay: [
                            { required: true, message: '请填写余额金额', trigger: 'blur', type: 'number'}
                        ]
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
                    response.data.vehiclePlateNumber = response.data.vehicle.plateNumber;
                }
                this.$refs.itemPicker.clearSelect();
                if(response.data.items && response.data.items.length) {
                    this.$refs.itemPicker.select(response.data.items.map((s)=> {
                        return s.maintenanceItem;
                    }));
                }
                this.$refs.partsPicker.clearSelect();
                if(response.data.partses && response.data.partses.length) {
                    this.$refs.partsPicker.select(response.data.partses.map((s)=> {
                        return {
                            ...s.parts,
                            count: s.count
                        };
                    }));
                }
                return response;
            },
            tableTransformQueryParams(queryParams) {
                queryParams['vehicle.engineNumber'] = queryParams.vehicle.engineNumber;
                queryParams['vehicle.plateNumber'] = queryParams.vehicle.plateNumber;
                queryParams['vehicle.frameNumber'] = queryParams.vehicle.frameNumber;
                return queryParams;
            },
            formTransformData(data) {
                data.status = 'NEW';
                data.payStatus = 'UNPAY';
                data.payType = 'OFFLINE';
                data.origin = 'LOCAL';
                return data;
            },
            onNewModalOpen() {
                this.$refs.itemPicker.clearSelect();
                this.$refs.partsPicker.clearSelect();
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
            },
            loadMembers() {
                util.ajax.get('/api/member', {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((resonse)=>{
                    this.form.members = resonse.data;
                })
            },
            loadVehicleCategory() {
                util.ajax.get('/api/vehicleCategory', {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((resonse)=>{
                    this.form.vehicleCategoriesRaw = resonse.data;
                    this.form.vehicleCategories = util.transformTreeData(resonse.data.map((d)=>{
                        return {
                            value: d.id,
                            name: d.name,
                            id: d.id,
                            parent: d.parent
                        }
                    }), 'name');
                })
            },
            onTableLoad() {
                this.loadVehicles();
            },
            onSelectItem(selection) {
                selection.forEach((s)=> {
                    // 同时把项目中配置好的零件加入
                    this.$refs.partsPicker.select(s.partses.map((s)=> {
                        return {
                            ...s.parts,
                            count: s.count
                        };
                    }));
                });
            },
            onSelectionChangeItem(selection) {
                this.$refs.table.form.data.items = selection.map((s)=> {
                    return {maintenanceItem:s}
                });
                this.form.needPay = 0;
                this.form.needPay = this.calculateNeedPay(this.$refs.table.form.data);
            },
            onSelectionChangeParts(selection) {
                this.$refs.table.form.data.partses = selection.map((s)=> {
                    return {parts:s, count: s.count}
                });
                this.form.needPay = 0;
                this.form.needPay = this.calculateNeedPay(this.$refs.table.form.data);
            },
            calculateNeedPay(data) {
                let needPay = 0;
                data.items.forEach((s)=>{
                    needPay += s.maintenanceItem.manHourPrice;
                });
                data.partses.forEach((s)=>{
                    needPay += s.count * s.parts.price;
                });
                return needPay;
            },
            pay() {
                this.$refs.payForm.validate((valid) => {
                    if (valid) {
                        this.payForm.data.payType = 'OFFLINE';
                        util.ajax.post(`/api/entrustForm/pay/${this.payForm.data.id}`, this.payForm.data).then(() => {
                            this.payForm.modal = false;
                            this.$Message.success('收款成功');
                            this.$refs.table.loadGrid();
                        }).catch((error)=>{
                            this.payForm.loading = false;
                            this.$nextTick(() => {
                                this.payForm.loading = true;
                            });
                            return Promise.reject(error);
                        });
                    } else {
                        this.payForm.loading = false;
                        this.$nextTick(() => {
                            this.payForm.loading = true;
                        });
                    }
                })
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.vehicle.plateNumber', (val) => {
                this.form.vehicleVisible = !!val;
                let vehicle = this.form.vehicles.find((d)=>d.plateNumber === val);
                this.$refs.table.form.data.vehicle = Object.assign({}, vehicle || {
                    plateNumber:val,
                    isDefault: false
                });
            });
            this.$refs.table.loadGrid();
            this.loadVehicles();
            this.loadInsuranceCompanies();
            this.loadAdmins();
            this.loadMembers();
            this.loadVehicleCategory();
        }
    };
</script>
