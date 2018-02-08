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
                      :form-transform-response="formTransformResponse"
                      :mask-closable="false"
                      @on-load="onTableLoad">
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
                                <Option :value="member.id" v-for="member in form.members" :key="member.id">{{member.name}}</Option>
                            </Select>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col :span="8">
                        <FormItem label="车型" prop="vehicle.vehicleCategories">
                            <Cascader ref="vehicleCategories" :data="form.vehicleCategories" v-model="props.data.vehicle.vehicleCategories" placeholder="请选车型"/>
                        </FormItem>
                        </Col>
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
                <Row>
                    <FormItem label="维修项目" required>
                        <maintenance-item-picker ref="itemPicker" @on-selection-change="onSelectItem"></maintenance-item-picker>
                    </FormItem>
                </Row>
                <Row>
                    <FormItem label="维修配件" required>
                        <parts-picker ref="partsPicker" @on-selection-change="onSelectParts"></parts-picker>
                    </FormItem>
                </Row>
            </template>
        </single-table>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import SingleTable from '@/views/my-components/single-table/single-table.vue';
    import MaintenanceItemPicker from './maintenance-item-picker.vue';
    import PartsPicker from './parts-picker.vue';

    export default {
        components: {
            SingleTable,
            MaintenanceItemPicker,
            PartsPicker
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
                        },
                        {
                            key: 'operatorId',
                            title: '接车员',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/admin/${param.row.operatorId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        },
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
                        }
                    ]
                },
                queryParams: {
                    vehicle: {}
                },
                defaultQueryParams: {},
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
                        'vehicle.vehicleCategories': [
                            { required: true, message: '请选择车型', trigger: 'change', type: 'array' }
                        ],
                        operatorId: [
                            { required: true, message: '请选择接车员', trigger: 'change' }
                        ],
                        clerkId: [
                            { required: true, message: '请选择业务员', trigger: 'change' }
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
                    data: {
                        id: null,
                        vehicle: {
                            engineNumber: null,
                            frameNumber: null,
                            plateNumber: null,
                            memberId: null,
                            vehicleCategoryId: null,
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
                parts: {
                    columns: [
                        {key: 'name',title: '配件项目'},
                        {key: 'modelNumber',title: '型号'},
                        {key: 'standard',title: '规格'},
                        {key: 'count',title: '数量 单位'},
                        {key: 'price',title: '单价', align: 'right'},
                        {key: 'subtotal',title: '金额', align: 'right'}
                    ],
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
            formTransformResponse(response) {
                if(response.data.vehicle) {
                    response.data.vehiclePlateNumber = response.data.vehicle.plateNumber;
                }
                if(response.data.vehicle.vehicleCategoryId) {
                    let category = this.form.vehicleCategoriesRaw.find((d)=>d.id === response.data.vehicle.vehicleCategoryId);
                    response.data.vehicle.vehicleCategories = [category.parent.id, response.data.vehicle.vehicleCategoryId];
                }
                this.$refs.itemPicker.clearSelect();
                if(response.data.items && response.data.items.length) {
                    this.$refs.itemPicker.select(response.data.items.map((s)=> s.maintenanceItem));
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
                this.$refs.table.form.data.items = selection.map((s)=> {
                    return {maintenanceItem:s}
                });
                // 同时把项目中配置好的零件加入
                
            },
            onSelectParts(selection) {
                this.$refs.table.form.data.partses = selection.map((s)=> {
                    return {parts:s, count: s.count}
                })
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.vehicle.plateNumber', (val) => {
                this.form.vehicleVisible = !!val;
                let vehicle = this.form.vehicles.find((d)=>d.plateNumber === val);
                let vehicleCategories = [];
                if(vehicle) {
                    let category = this.form.vehicleCategoriesRaw.find((d)=>d.id === vehicle.vehicleCategoryId);
                    vehicleCategories = [category.parent.id, vehicle.vehicleCategoryId];
                }
                this.$refs.table.form.data.vehicle = Object.assign({vehicleCategories}, vehicle || {
                    plateNumber:val,
                    isDefault: false
                });
            });
            this.$refs.table.$watch('form.data.vehicle.vehicleCategories', function(val) {
                this.form.data.vehicle.vehicleCategoryId = val[1];
            })
            this.defaultQueryParams['admin.id'] = this.loginUser.id;
            this.$refs.table.loadGrid();
            this.loadVehicles();
            this.loadInsuranceCompanies();
            this.loadAdmins();
            this.loadMembers();
            this.loadVehicleCategory();
        }
    };
</script>