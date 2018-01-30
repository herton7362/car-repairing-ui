<style lang="less">
    @import '../../../styles/common.less';
    @import './list.less';
</style>

<template>
    <Card class="attachment-list">
        <Row>
            <image-uploader :default-file-list="defaultFileList"
                            :pre-view="false"
                            :on-success="onUploadSuccess"
                            :on-remove="onRemoveLogo"></image-uploader>

            <Row>
                <Card class="margin-top-medium margin-right-medium"
                      v-for="row in attachments"
                      :key="row.id"
                      :padding="0"
                      style="width: 200px; display: inline-block;">
                    <img width="198" height="200" :src="'/attachment/download/' + row.id | baseUrl">
                    <div style="padding: 14px;">
                        <span>{{row.name}}</span>
                        <div class="bottom clearfix">
                            <span class="size">{{row.size | sizeFormatter}}</span>
                            <Poptip confirm transfer title="您确认删除这条附件吗？" @on-ok="remove(row)" style="float:right">
                                <Button type="error" size="small">
                                    <Icon type="trash-a"></Icon>
                                </Button>
                            </Poptip>
                        </div>
                    </div>
                </Card>
            </Row>

            <Row class="margin-top-medium">
                <Page :total="total"
                      @on-change="onPageChange"
                      @on-page-size-change="onPageSizeChange" show-sizer show-elevator></Page>
            </Row>
        </Row>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import imageUploader from '@/views/my-components/upload/image-uploader.vue';

    export default {
        components: {
            imageUploader
        },
        data() {
            return {
                defaultFileList: [],
                attachments: [],
                total: 0,
                currentPage: 1,
                pageSize: 10
            }
        },
        filters: {
            baseUrl(val) {
                return util.baseURL + val;
            },
            sizeFormatter: function (val) {
                return util.bytesToSize(val);
            }
        },
        methods: {
            onUploadSuccess() {

            },
            onRemoveLogo() {

            },
            onPageChange(page) {
                this.currentPage = page;
                this.loadAttachemnts();
            },
            onPageSizeChange(pageSize) {
                this.pageSize = pageSize;
                this.loadAttachemnts();
            },
            remove(row) {
                util.ajax.delete(`/api/attachment/${row.id}`).then(() => {
                    this.$Message.success('删除成功');
                    this.loadAttachemnts();
                });
            },
            loadAttachemnts() {
                util.ajax.get('/api/attachment', {
                    params: {
                        currentPage: this.currentPage,
                        pageSize: this.pageSize
                    }
                }).then((response)=>{
                    this.attachments = response.data.content;
                    this.total = response.data.totalElements;
                })
            }
        },
        mounted() {
            this.loadAttachemnts();
        }
    };
</script>
