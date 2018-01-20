<style lang="less">
    @import '../../../styles/common.less';
    @import "fold";
</style>

<template>
    <div class="kratos-fold" :class="{'kratos-expanded': expanded}">
        <slot></slot>
        <a href="javascript:void(0)" class="expand-handler" @click="onExpand(!expanded)">{{expanded? '收起': '展开'}} <Icon type="chevron-down"></Icon></a>

    </div>
</template>

<script>
export default {
    name: 'fold',
    props: {
    },
    data() {
        return {
            expanded: false
        }
    },
    methods: {
        onExpand(expand) {
            this.expanded = expand;
            this.$emit('on-expand', expand);
        }
    }
};
</script>