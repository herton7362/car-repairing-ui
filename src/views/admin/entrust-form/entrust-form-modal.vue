<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Modal v-model="entrustForm.modal" title="委托书" :width="800">
        <Form :label-width="80">
            <Row>
                <Col :span="8">
                <FormItem label="车牌号">
                    {{entrustForm.data.vehicle.plateNumber}}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="引擎号">
                    {{entrustForm.data.vehicle.engineNumber}}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="车架号">
                    {{entrustForm.data.vehicle.frameNumber}}
                </FormItem>
                </Col>
            </Row>
            <Row>
                <Col :span="8">
                <FormItem label="车型">
                    {{entrustForm.data.vehicle.vehicleCategory.name}}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="计划完工">
                    {{entrustForm.data.planFinishDate}}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="进场里数">
                    {{entrustForm.data.kilometres}}
                </FormItem>
                </Col>
            </Row>
            <FormItem label="维修项目">
                <Table :columns="entrustForm.maintenanceItem.columns" :data="entrustForm.maintenanceItem.data"></Table>
            </FormItem>
            <FormItem label="维修配件">
                <Table :columns="entrustForm.parts.columns" :data="entrustForm.parts.data"></Table>
            </FormItem>
        </Form>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import maintenanceItemColumn from '../entrust-form/maintenance-item-column';
    import partsColumn from '../entrust-form/parts-column';
    export default {
        data() {
            return {
                entrustForm: {
                    modal: false,
                    data: {
                        id: null,
                        vehicle: {
                            vehicleCategory: {}
                        },
                        planFinishDate: null
                    },
                    maintenanceItem: {
                        columns: maintenanceItemColumn,
                        data: []
                    },
                    parts: {
                        columns: [
                            ...partsColumn,
                            {
                                title: '数量 单位',
                                width: 120,
                                align: 'center',
                                render: (h, params)=>{
                                    return h('span', `${params.row.count} ${params.row.unit.name}`)
                                }
                            }
                        ],
                        data: []
                    }
                }
            }
        },
        methods: {
            getForm(id) {
                util.ajax.get(`/api/entrustForm/${id}`).then((response)=>{
                    response.data.vehicle.vehicleCategory = {};
                    this.entrustForm.data = response.data;
                    this.entrustForm.maintenanceItem.data = response.data.items.map((i)=>{
                        return {
                            ...i.maintenanceItem
                        }
                    });
                    this.entrustForm.parts.data = response.data.partses.map((i)=>{
                        return {
                            ...i.parts,
                            count: i.count
                        }
                    })
                    return util.ajax.get(`/api/vehicleCategory/${response.data.vehicle.vehicleCategoryId}`)
                }).then((response)=>{
                    this.entrustForm.data.vehicle.vehicleCategory = response.data;
                    this.entrustForm.modal = true;
                });
            }
        }
    }
</script>