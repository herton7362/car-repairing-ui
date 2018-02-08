<style lang="less">
    @import '../../../../styles/common.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="车辆维护"
                      domain-url="vehicle"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="engineNumber" label="引擎号">
                    <Input v-model="props.params.engineNumber" placeholder="引擎号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="plateNumber" label="车牌号">
                    <Input v-model="props.params.plateNumber" placeholder="车牌号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="frameNumber" label="车架号">
                    <Input v-model="props.params.frameNumber" placeholder="车架号"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <FormItem label="会员" prop="memberId">
                    <Select v-model="props.data.memberId" placeholder="请选择会员" filterable>
                        <Option :value="member.id" v-for="member in form.members" :key="member.id">{{member.name}}</Option>
                    </Select>
                </FormItem>
                <FormItem prop="vehicleCategories" label="车型">
                    <Cascader :data="form.vehicleCategories" v-model="props.data.vehicleCategories" placeholder="请选车型"></Cascader>
                </FormItem>
                <FormItem prop="engineNumber" label="引擎号">
                    <Input v-model="props.data.engineNumber" placeholder="引擎号"/>
                </FormItem>
                <FormItem prop="plateNumber" label="车牌号">
                    <Input v-model="props.data.plateNumber" placeholder="车牌号"/>
                </FormItem>
                <FormItem prop="frameNumber" label="车架号">
                    <Input v-model="props.data.frameNumber" placeholder="车架号"/>
                </FormItem>
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
                        {
                            key: 'vehicleCategoryId',
                            title: '车型',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/vehicleCategory/${param.row.vehicleCategoryId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        },
                        {key: 'engineNumber', title: '引擎号'},
                        {key: 'plateNumber', title: '车牌号'},
                        {key: 'frameNumber', title: '车架号'},
                        {
                            key: 'memberId',
                            title: '会员',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                util.ajax.get(`/api/member/${param.row.memberId}`).then((response)=>{
                                    span.elm.innerHTML = response.data.name;
                                })
                                return span;
                            }
                        }
                    ]
                },
                form: {
                    rule: {
                        engineNumber: [
                            { required: true, message: '请填写引擎号', trigger: 'blur' }
                        ],
                        plateNumber: [
                            { required: true, message: '请填写车牌号', trigger: 'blur' }
                        ],
                        frameNumber: [
                            { required: true, message: '请填写车架号', trigger: 'blur' }
                        ],
                        memberId: [
                            { required: true, message: '请选择会员', trigger: 'change' }
                        ]
                    },
                    members: [],
                    vehicleCategories: [],
                    vehicleCategoriesRaw: [],
                    data: {
                        id: null,
                        memberId: '',
                        member: null,
                        engineNumber: null,
                        plateNumber: null,
                        frameNumber: null,
                        vehicleCategories: [],
                        vehicleCategoryId: null
                    }
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                if(response.data.vehicleCategoryId) {
                    let category = this.form.vehicleCategoriesRaw.find((d)=>d.id === response.data.vehicleCategoryId);
                    response.data.vehicleCategories = [category.parent.id, response.data.vehicleCategoryId]
                }
                return response;
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
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.vehicleCategories', function(val) {
                this.form.data.vehicleCategoryId = val[1];
            })
            this.$refs.table.loadGrid();
            this.loadMembers();
            this.loadVehicleCategory();
        }
    };
</script>