export default {
    name: 'table-search-form-expand',
    functional: true,
    props: {
        index: Number,
        column: {
            type: Object,
            default: null
        }
    },
    render: (h, ctx) => {
        return h('Input', {
            props: {
                placeholder: ctx.props.column.title
            }
        });
    }
};