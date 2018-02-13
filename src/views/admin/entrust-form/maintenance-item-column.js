export default [
    {key: 'name',title: '维修项目'},
    {
        key: 'workingTeam',
        title: '班组',
        align: 'center',
        width: 120,
        render(h, param) {
            return h('span', param.row.workingTeam.name)
        }
    },
    {
        key: 'workType',
        title: '工种',
        align: 'center',
        width: 120,
        render(h, param) {
            return h('span', param.row.workingTeam.name)
        }
    },
    {key: 'manHourPrice',title: '工时金额', align: 'right'}
]