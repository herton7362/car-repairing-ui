<style lang="less">
    @import '../../../styles/common.less';
    @import '../../../styles/animation.less';
</style>

<template>
    <Card class="reg-entrust-form">
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="采购单"
                      domain-url="purchaseForm"
                      :modal-width="800"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :default-query-params="defaultQueryParams"
                      :form-transform-data="formTransformData"
                      :form-transform-response="formTransformResponse"
                      :table-transform-query-params="tableTransformQueryParams"
                      :mask-closable="false"
                      @on-new-modal-open="onNewModalOpen">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="采购单号">
                    <Input v-model="props.params.orderNumber" placeholder="采购单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="purchaseDate" label="采购日期">
                    <DatePicker type="daterange"
                                placeholder="采购日期"
                                v-model="props.params.purchaseDate"></DatePicker>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <Row>
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
                    <FormItem label="采购日期" prop="purchaseDate">
                        <DatePicker type="date"
                                    placeholder="请选择采购日期"
                                    v-model="props.data.purchaseDate"></DatePicker>
                    </FormItem>
                    </Col>
                </Row>
                <FormItem label="维修配件" required>
                    <parts-picker ref="partsPicker" @on-selection-change="onSelectionChangeParts"></parts-picker>
                </FormItem>
            </template>
        </single-table>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import SingleTable from '@/views/my-components/single-table/single-table.vue';
    import PartsPicker from '../entrust-form/parts-picker.vue';

    export default {
        components: {
            SingleTable,
            PartsPicker
        },
        data() {
            return {
                table: {
                    columns: [
                        {key: 'orderNumber',title: '采购单号'},
                        {key: 'purchaseDate',title: '采购日期'},
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
                        },
                        {
                            key: 'status',
                            title: '状态',
                            align: 'center',
                            render(h, param){
                                if(param.row.status === 'NEW') {
                                    return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '待审核');
                                } else if(param.row.status === 'IN_STORE') {
                                    return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '已入库');
                                }
                            }
                        }
                    ]
                },
                defaultQueryParams: {
                    sort: 'sortNumber,updatedDate',
                    order: 'asc,desc'
                },
                form: {
                    rule: {
                        clerkId: [
                            { required: true, message: '请选择业务员', trigger: 'change' }
                        ],
                        purchaseDate: [
                            { required: true, message: '请选择采购日期', trigger: 'change', type: 'date' }
                        ]
                    },
                    data: {
                        id: null,
                        clerkId: null,
                        purchaseDate: null,
                        partses: []
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
            onNewModalOpen() {
                this.$refs.partsPicker.clearSelect();
            },
            formTransformData(data) {
                data.status = 'NEW';
                return data;
            },
            tableTransformQueryParams(data) {
                return Object.assign({}, data, {
                    purchaseDate: data.purchaseDate && data.purchaseDate[0]?[util.dateFormat(data.purchaseDate[0], 'yyyy-MM-dd HH:mm:ss'),
                        util.dateFormat(data.purchaseDate[1], 'yyyy-MM-dd HH:mm:ss')]: null
                });
            },
            onSelectionChangeParts(selection) {
                this.$refs.table.form.data.partses = selection.map((s)=> {
                    return {parts:s, count: s.count}
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
            this.defaultQueryParams['creator.id'] = this.loginUser.id;
            this.$refs.table.loadGrid();
            this.loadAdmins();
        }
    };
</script>