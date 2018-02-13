import util from '@/libs/util';
export default [
    {key: 'orderNumber',title: '委托单号'},
    {
        key: 'vehicle',
        title: '车牌号',
        render(h, param){
            return h('span', param.row.vehicle.plateNumber)
        }
    },
    {
        key: 'operatorId',
        title: '接车员',
        render(h, param){
            let span = h('span',[h('Spin')]);
            util.ajax.get(`/api/admin/${param.row.operatorId}`).then((response)=>{
                span.elm.innerHTML = response.data.name;
            })
            return span;
        }
    },
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
        render(h, param){
            if(param.row.status === 'NEW') {
                return h('Tag', {props: {type: 'dot',color: 'blue',size: 'small'}}, '新建');
            } else if(param.row.status === 'DISPATCHING') {
                return h('Tag', {props: {type: 'dot',color: 'yellow',size: 'small'}}, '派工');
            } else if(param.row.status === 'FINISHED') {
                return h('Tag', {props: {type: 'dot',color: 'green',size: 'small'}}, '竣工');
            } else {
                return h('Tag', {props: {type: 'dot',color: '#999',size: 'small'}}, '未知');
            }
        }
    }
]