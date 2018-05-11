<style lang="less">
    @import '../../../../styles/common.less';
    @import './item.less';
</style>

<template>
    <div class="item-main">
        <div class="item-tree">
            <Card>
                <Tree :data="tree.data" @on-select-change="onSelectTree"></Tree>
            </Card>
        </div>
        <div class="item-list">
            <Card>
                <single-table ref="table"
                              :columns="table.columns"
                              :query-params="{category:'轮胎',sort:'sortNumber,updatedDate',order: 'asc,desc'}"
                              form-title="维修项目维护"
                              domain-url="maintenanceItem"
                              :form-rule="form.rule"
                              :form-data="form.data"
                              :modal-width="800"
                              :mask-closable="false"
                              :form-transform-response="formTransformResponse"
                              :form-transform-data="formTransformData">
                    <template slot="query-form" slot-scope="props">
                        <FormItem class="padding-right-medium" prop="name" label="名称">
                            <Input v-model="props.params.name" placeholder="名称"/>
                        </FormItem>
                        <FormItem class="padding-right-medium" prop="category" label="类别">
                            <RadioGroup @on-change="onCategoryChange" v-model="props.params.category">
                                <Radio label="轮胎"></Radio>
                                <Radio label="保养"></Radio>
                                <Radio label="钣金喷漆"></Radio>
                            </RadioGroup>
                        </FormItem>
                    </template>

                    <template slot="edit-form" slot-scope="props">
                        <Row>
                            <Col :span="12">
                            <FormItem prop="name" label="项目名称">
                                <Input v-model="props.data.name" placeholder="请输入项目名称" style="width: 250px"/>
                            </FormItem>
                            </Col>
                            <Col :span="12">
                            <RadioGroup v-model="props.data.category">
                                <Radio label="轮胎"></Radio>
                                <Radio label="保养"></Radio>
                                <Radio label="钣金喷漆"></Radio>
                            </RadioGroup>
                            </Col>
                        </Row>

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
                        <Row>
                            <Col :span="18">
                            <FormItem label="车型" prop="vehicleCategoryId">
                                <Cascader :data="form.vehicleCategories"
                                          v-model="props.data.vehicleCategoryId"
                                          change-on-select
                                          placeholder="请选择车型"></Cascader>
                            </FormItem>
                            </Col>
                        </Row>
                        <FormItem label="配件项目">
                            <parts-picker ref="partsPicker" @on-selection-change="onSelectParts"></parts-picker>
                        </FormItem>
                    </template>
                </single-table>
            </Card>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import singleTable from '@/views/my-components/single-table/single-table.vue';
    import PartsPicker from '../../entrust-form/parts-picker.vue';

    export default {
        components: {
            singleTable,
            PartsPicker
        },
        data() {
            return {
                tree: {
                    raw: [],
                    data: [],
                    selectedId: ''
                },
                table: {
                    columns: [
                        {key:'name', title:'名称', width: 200},
                        {
                            key:'workType',
                            title:'工种',
                            width: 100,
                            render: (h, params) => {
                                return h('span', params.row.workType && params.row.workType.name);
                            }
                        },
                        {key:'manHourPrice', title:'工时金额', width: 100, align: 'right'},
                        {
                            title:'车型',
                            width:200,
                            render: (h, params) => {
                                const span = h('span', '无');
                                this.ajaxVehicleCategory.then((response)=>{
                                    const array = params.row.vehicleCategoryId || [];
                                    const result = [];
                                    array.forEach((a)=>{
                                        const v = response.data.content.find((d)=>d.id === a);
                                        result.push(v.name);
                                    });
                                    span.elm.innerHTML = result.join('  ');
                                });

                                return span;
                            }
                        },
                        {
                            key:'workingTeam',
                            title:'班组',
                            width: 100,
                            render: (h, params) => {
                                return h('span', params.row.workingTeam && params.row.workingTeam.name);
                            }
                        },
                        {
                            key:'parts',
                            title:'零件',
                            render: (h, params) => {
                                return h('span', params.row.partses.map((part)=>{
                                    return part.parts? `${part.parts.name} x${part.count} ${part.parts.unit.name}`: ''
                                }).join('，'));
                            }
                        }
                    ]
                },
                form: {
                    rule: {
                        name: [
                            { required: true, message: '请填写项目名称', trigger: 'blur' }
                        ],
                        vehicleCategoryId: [
                            { required: true, message: '请选择车型', trigger: 'change', type: 'array' }
                        ],
                        manHourPrice: [
                            { required: true, message: '请填写工时金额', trigger: 'blur', type: 'number' }
                        ]
                    },
                    workTypes: [],
                    workingTeams: [],
                    vehicleCategories: [],
                    data: {
                        id: null,
                        name: null,
                        workTypeId: '',
                        workType: null,
                        manHourPrice: null,
                        workingTeamId: '',
                        workingTeam: null,
                        vehicleCategoryId: [],
                        ajaxVehicleCategory: null,
                        partses: [],
                        category: '轮胎'
                    }
                }
            }
        },
        methods: {
            loadTreeData() {
                this.ajaxVehicleCategory.then((response)=>{
                    // 如果树刷新需要重新选中之前选中的节点

                    let nodeLevel1 = util.transformTreeData(response.data.content, 'name', false);
                    this.tree.data = [
                        {
                            id: '',
                            selected: this.tree.selectedId === '',
                            title: '所有车型',
                            expand: true,
                            children: [...nodeLevel1]
                        }
                    ];
                });
            },
            onSelectTree(nodes) {
                if(nodes && nodes.length > 0) {
                    this.tree.selectedId = nodes[0].id;
                }
                this.loadGrid();
            },
            formTransformResponse(response) {
                if(response.data.workType) {
                    response.data.workTypeId = response.data.workType.id;
                }
                if(response.data.workingTeam) {
                    response.data.workingTeamId = response.data.workingTeam.id;
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
            formTransformData(data) {
                return data;
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
            },
            loadGrid() {
                const table = this.$refs.table.$refs.table;
                table.table.queryParams.vehicleCategoryId = this.tree.selectedId;
                table.loadGrid({
                    silent: true
                });
            },
            loadVehicleCategories() {
                this.ajaxVehicleCategory = util.ajax.get('/api/vehicleCategory', {
                    params: {
                        sort:'sortNumber,updatedDate',
                        order: 'asc,desc'
                    }
                });
                this.ajaxVehicleCategory.then((response)=>{
                    response.data.content.forEach((n)=>n.selected = n.id === this.tree.selectedId);
                    // 如果树刷新需要重新选中之前选中的节点
                    this.form.vehicleCategories = util.transformTreeData(response.data.content, 'name');
                });
            },
            onCategoryChange(val) {
                this.$refs.table.form.data.category = val;
                this.loadGrid();
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.workTypeId', (val)=>{
                this.$refs.table.form.data.workType = this.form.workTypes.find((d)=>d.id === val);
            });
            this.$refs.table.$watch('form.data.workingTeamId', (val)=>{
                this.$refs.table.form.data.workingTeam = this.form.workingTeams.find((d)=>d.id === val);
            });
            this.loadVehicleCategories();
            this.loadTreeData();
            this.loadGrid();
            this.loadWorkTypes();
            this.loadWorkingTeams();
        }
    };
</script>
