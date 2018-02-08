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
                      :modal-width="800"
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
                <Row>
                    <Col :span="9">
                        <FormItem label="工种" prop="workTypeId">
                            <Select v-model="props.data.workTypeId"  placeholder="请选择工种">
                                <Option :value="workType.id" v-for="workType in form.workTypes" :key="workType.id">
                                    {{workType.name}}
                                </Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col :span="9">
                        <FormItem label="班组" prop="workingTeamId">
                            <Select v-model="props.data.workingTeamId"  placeholder="请选择班组">
                                <Option :value="workingTeam.id" v-for="workingTeam in form.workingTeams" :key="workingTeam.id">
                                    {{workingTeam.name}}
                                </Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col :span="6">
                        <FormItem prop="manHourPrice" label="工时金额">
                            <InputNumber :step="1.0" v-model="props.data.manHourPrice" placeholder="请输入工时金额"/>
                        </FormItem>
                    </Col>
                </Row>
                <FormItem label="配件项目">
                    <parts-picker ref="partsPicker" @on-selection-change="onSelectParts"></parts-picker>
                </FormItem>
            </template>
        </single-table>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import singleTable from '@/views/my-components/single-table/single-table.vue';
    import PartsPicker from '../../reg-entrust-form/parts-picker.vue';

    export default {
        components: {
            singleTable,
            PartsPicker
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
                    data: {
                        id: null,
                        name: null,
                        workTypeId: '',
                        workType: null,
                        manHourPrice: null,
                        workingTeamId: '',
                        workingTeam: null,
                        partses: []
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
            onSelectParts(selection) {
                this.$refs.table.form.data.partses = selection.map((s)=> {
                    return {parts:s, count: s.count}
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
            this.$refs.table.loadGrid();
            this.loadWorkTypes();
            this.loadWorkingTeams();
        }
    };
</script>
