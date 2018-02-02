<style lang="less">
    @import '../../../../styles/common.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="维修项目维护"
                      domain-url="maintenanceItem"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="name" label="名称">
                    <Input v-model="props.params.name" placeholder="名称"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <FormItem prop="name" label="项目名称">
                    <Input v-model="props.data.name" placeholder="请输入项目名称" style="width: 250px"/>
                </FormItem>
                <FormItem label="工种" prop="workTypeId">
                    <Select v-model="props.data.workTypeId"  placeholder="请选择工种" style="width: 200px">
                        <Option :value="workType.id" v-for="workType in form.workTypes" :key="workType.id">
                            {{workType.name}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem prop="manHourPrice" label="工时金额">
                    <InputNumber :step="1.0" v-model="props.data.manHourPrice" placeholder="请输入工时金额"/>
                </FormItem>
                <FormItem label="班组" prop="workingTeamId">
                    <Select v-model="props.data.workingTeamId"  placeholder="请选择班组" style="width: 200px">
                        <Option :value="workingTeam.id" v-for="workingTeam in form.workingTeams" :key="workingTeam.id">
                            {{workingTeam.name}}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="零件" prop="partIds" type="array">
                    <Select v-model="props.data.partIds"  placeholder="请选择所需零件" multiple filterable>
                        <Option :value="part.id" v-for="part in form.parts" :key="part.id">
                            {{part.name}}
                        </Option>
                    </Select>
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
                        {key:'name', title:'名称', width: 200},
                        {
                            key:'workType',
                            title:'工种',
                            width: 100,
                            render: (h, params) => {
                                return h('span', params.row.workType.name);
                            }
                        },
                        {key:'manHourPrice', title:'工时金额', width: 100, align: 'right'},
                        {
                            key:'workingTeam',
                            title:'班组',
                            width: 100,
                            render: (h, params) => {
                                return h('span', params.row.workingTeam.name);
                            }
                        },
                        {
                            key:'parts',
                            title:'零件',
                            render: (h, params) => {
                                return h('span', params.row.parts.map((part)=>part.name).join('，'));
                            }
                        }
                    ]
                },
                form: {
                    rule: {
                        name: [
                            { required: true, message: '请填写项目名称', trigger: 'blur' }
                        ],
                        manHourPrice: [
                            { required: true, message: '请填写工时金额', trigger: 'blur', type: 'number' }
                        ]
                    },
                    workTypes: [],
                    workingTeams: [],
                    parts: [],
                    data: {
                        id: null,
                        name: null,
                        workTypeId: '',
                        workType: null,
                        manHourPrice: null,
                        workingTeamId: '',
                        workingTeam: null,
                        partIds: [],
                        parts: []
                    }
                }
            }
        },
        methods: {
            formTransformResponse(response) {
                if(response.data.workType) {
                    response.data.workTypeId = response.data.workType.id;
                }
                if(response.data.workingTeam) {
                    response.data.workingTeamId = response.data.workingTeam.id;
                }
                if(response.data.parts) {
                    response.data.partIds = response.data.parts.map((part)=>part.id);
                } else {
                    response.data.partIds = [];
                }
                return response;
            },
            loadWorkTypes() {
                util.ajax.get('/api/dictionary/code/work_type').then((response)=>{
                    this.form.workTypes = response.data;
                })
            },
            loadWorkingTeams() {
                util.ajax.get('/api/workingTeam', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.workingTeams = response.data;
                })
            },
            loadParts() {
                util.ajax.get('/api/parts', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.form.parts = response.data;
                })
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.workTypeId', (val)=>{
                this.$refs.table.form.data.workType = this.form.workTypes.find((d)=>d.id === val);
            });
            this.$refs.table.$watch('form.data.workingTeamId', (val)=>{
                this.$refs.table.form.data.workingTeam = this.form.workingTeams.find((d)=>d.id === val);
            });
            this.$refs.table.$watch('form.data.partIds', (val)=>{
                this.$refs.table.form.data.parts = this.form.parts.filter((part)=>util.oneOf(part.id, val));
            });
            this.$refs.table.loadGrid();
            this.loadWorkTypes();
            this.loadWorkingTeams();
            this.loadParts();
        }
    };
</script>
