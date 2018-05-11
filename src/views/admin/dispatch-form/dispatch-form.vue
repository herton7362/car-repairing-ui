<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <paged-table ref="table"
                      :columns="table.columns"
                     :actions="table.actions"
                      domain-url="dispatchForm">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="orderNumber" label="派工单号">
                    <Input v-model="props.params.orderNumber" placeholder="派工单号"/>
                </FormItem>
                <FormItem class="padding-right-medium" prop="status" label="状态">
                    <RadioGroup v-model="props.params.status">
                        <Radio label="">全部</Radio>
                        <Radio label="NEW">新建</Radio>
                        <Radio label="DRAWING">领料</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem class="padding-right-medium" prop="entrustFormOrderNumber" label="委托单号">
                    <Input v-model="props.params.entrustFormOrderNumber" placeholder="委托单号"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
            </template>
        </paged-table>
        <entrust-form-modal ref="entrustFormModal"></entrust-form-modal>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import PagedTable from '@/views/my-components/single-table/paged-table.vue';
    import EntrustFormModal from '../entrust-form/entrust-form-modal.vue';

    export default {
        components: {
            PagedTable,
            EntrustFormModal
        },
        data() {
            return {
                table: {
                    columns: [
                        {key:'orderNumber', title:'派工单号'},
                        {key:'entrustFormOrderNumber',title:'委托单号'},
                        {
                            key:'workingTeamId',
                            title:'班组',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                if(param.row.workingTeamId) {
                                    util.ajax.get(`/api/workingTeam/${param.row.workingTeamId}`).then((response)=>{
                                        span.elm.innerHTML = response.data.name;
                                    })
                                } else {
                                    span.text = 'N/A';
                                }
                                return span;
                            }
                        },
                        {
                            key:'workerId',
                            title:'维修工人',
                            render(h, param){
                                let span = h('span',[h('Spin')]);
                                if(param.row.workerId) {
                                    util.ajax.get(`/api/admin/${param.row.workerId}`).then((response)=>{
                                        span.elm.innerHTML = response.data.name;
                                    })
                                }else {
                                    span.text = 'N/A';
                                }
                                return span;
                            }
                        },
                        {
                            key: 'status',
                            title: '状态',
                            render(h, param){
                                if(param.row.status === 'NEW') {
                                    return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '新建');
                                } else if(param.row.status === 'DRAWING') {
                                    return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '领料');
                                }
                            }
                        }
                    ],
                    actions: [
                        (h, params)=> {
                            if(params.row.status === 'NEW' || params.row.status === 'CONFIRM') {
                                return  h('Tooltip', {
                                    props: {
                                        content: '生成领料单',
                                        placement: 'top'
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        },
                                        on: {
                                            click: () => {
                                                this.draw(params.row);
                                            }
                                        }
                                    }, '领料')
                                ])
                            }
                        },
                        (h, params)=> {
                            return h('Button', {
                                props: {
                                    type: 'ghost',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.$refs.entrustFormModal.getForm(params.row.entrustFormId);
                                    }
                                }
                            }, '查看')
                        }
                    ]
                }
            }
        },
        methods: {
            draw(row) {
                util.ajax.post(`/api/dispatchForm/draw/${row.id}`).then(()=>{
                    this.$Message.success('生成领料单成功');
                    this.$refs.table.loadGrid();
                });
            },
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
        }
    };
</script>
