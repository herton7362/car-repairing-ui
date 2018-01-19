<style lang="less">
    @import '../../../../styles/common.less';
</style>

<template>
    <Form label-position="left" :label-width="labelWidth" inline>
        <FormItem class="padding-right-medium" :label="field.title" style="width: 30%" v-for="(field, index) in fields" :key="field.key">
            <table-search-form-expand :column="field" :index="index"></table-search-form-expand>
        </FormItem>
        <FormItem style="width: 30%">
            <Button type="primary">查询</Button>
            <Button type="ghost">重置</Button>
            <Button type="text">展开 <Icon type="chevron-down"></Icon></Button>
        </FormItem>
    </Form>
</template>

<script>
import tableSearchFormExpand from './expand.js';
export default {
    name: 'table-search-form',
    components: {
        tableSearchFormExpand
    },
    props: {
        fields: Array,
        labelWidth: {
            type: Number,
            default: 80
        }
    },
    data() {
        return {
            form: this.fields.reduce((result = {}, field) => {
                result[field.key] = null;
                return result
            })
        }
    }
};
</script>