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
                        {key: 'engineNumber', title: '引擎号'},
                        {key: 'plateNumber', title: '车牌号'},
                        {key: 'frameNumber', title: '车架号'},
                        {
                            key: 'member',
                            title: '会员',
                            render(h, param){
                                return h('span', param.row.member.name)
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
                    data: {
                        id: null,
                        memberId: '',
                        member: null,
                        engineNumber: null,
                        plateNumber: null,
                        frameNumber: null
                    }
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                if(response.data.member) {
                    response.data.memberId = response.data.member.id;
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
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.adminId', (val) => {
                this.$refs.table.form.data.admin = this.form.admins.find((d)=>d.id === val);
            });
            this.$refs.table.loadGrid();
            this.loadMembers();
        }
    };
</script>