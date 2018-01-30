<style lang="less">
    @import '../../../../styles/common.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="班组维护"
                      domain-url="workingTeam"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
                <FormItem class="padding-right-medium" prop="name" label="名称">
                    <Input v-model="props.params.name" placeholder="名称"/>
                </FormItem>
            </template>

            <template slot="edit-form" slot-scope="props">
                <FormItem prop="name" label="班组名称">
                    <Input v-model="props.data.name" placeholder="请输入班组名称"/>
                </FormItem>
                <FormItem label="班组人员" prop="adminIds" type="array">
                    <Select v-model="props.data.adminIds"  placeholder="请选择班组人员" multiple filterable>
                        <Option :value="admin.id" v-for="admin in admins" :key="admin.id">
                            {{admin.name}}
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
                        {key:'name', title:'班组名称', width: 200},
                        {
                            key:'admins',
                            title:'班组人员',
                            render: (h, params) => {
                                return h('span', params.row.admins.map((admin)=>admin.name).join('，'));
                            }
                        }
                    ]
                },
                form: {
                    rule: {
                        name: [
                            { required: true, message: '请填写班组名称', trigger: 'blur' }
                        ],
                        adminIds: [
                            { type:'array', required: true, message: '请选择班组人员', trigger: 'change' }
                        ]
                    },
                    data: {
                        id: null,
                        name: null,
                        adminIds: [],
                        admins: []
                    }
                },
                admins: []
            }
        },
        methods: {
            formTransformResponse(response) {
                if(response.data.admins) {
                    response.data.adminIds = response.data.admins.map((admin)=>admin.id);
                } else {
                    response.data.adminIds = [];
                }
                return response;
            },
            loadAdmins() {
                util.ajax.get('/api/admin', {
                    sort:'sortNumber,updatedDate',
                    order: 'asc,desc'
                }).then((response)=>{
                    this.admins = response.data;
                })
            }
        },
        mounted() {
            this.$refs.table.$watch('form.data.adminIds', (val)=>{
                this.$refs.table.form.data.admins = this.admins.filter((admin)=>util.oneOf(admin.id, val));
            });
            this.$refs.table.loadGrid();
            this.loadAdmins();
        }
    };
</script>
