<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Card>
        <fold class="margin-bottom-large">
            <Form label-position="left" :label-width="80" inline>
                <FormItem class="padding-right-medium" label="field.title" style="width: 30%">
                    <Input></Input>
                </FormItem>
                <FormItem style="width: 30%">
                    <Button type="primary">查询</Button>
                    <Button type="ghost">重置</Button>
                </FormItem>
            </Form>
        </fold>
        <Row>
            <Button type="primary"> <Icon type="plus"></Icon> 新建</Button>
        </Row>
        <Row class="margin-top-medium">
            <Table border :columns="columns" :data="data"></Table>
        </Row>
    </Card>
</template>

<script>
import data from './data/data';

export default {
    name: 'page',
    components: {
        tableSearchForm
    },
    data() {
        return {
            columns: [
                {
                    title: 'Name',
                    key: 'name',
                    render: (h, params) => {
                        return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'person'
                                }
                            }),
                            h('strong', params.row.name)
                        ]);
                    }
                },
                {
                    title: 'Age',
                    key: 'age'
                },
                {
                    title: 'Address',
                    key: 'address'
                },
                {
                    title: 'Action',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
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
                                        this.show(params.index)
                                    }
                                }
                            }, 'View'),
                            h('Poptip',
                                {
                                    props: {
                                        confirm: true,
                                        transfer: true,
                                        title: '您确认删除这条内容吗？'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.remove(params.index)
                                        }
                                    }
                                },
                                [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        }
                                    }, 'Delete')
                                ]
                            )
                        ]);
                    }
                }
            ],
            data: data
        }
    },
    methods: {
        show (index) {
            this.$Modal.info({
                title: 'User Info',
                content: `Name：${this.data[index].name}<br>Age：${this.data[index].age}<br>Address：${this.data[index].address}`
            })
        },
        remove (index) {
            this.data.splice(index, 1);
        }
    }
};
</script>