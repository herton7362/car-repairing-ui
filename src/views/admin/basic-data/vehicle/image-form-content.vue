<style lang="less">
    @import './image-form-content.less';
</style>

<template>
    <div class="parts-images">
        <span>只能上传jpg/png文件，且不超过500kb，建议分辨率为240*240</span>
        <Row class="margin-top-medium">
            <Col :span="8">
            <Upload ref="cover"
                    :show-upload-list="false"
                    :format="['jpg','jpeg','png']"
                    :max-size="1024"
                    name="attachments"
                    :on-success="handleCoverSuccess"
                    :action="'/attachment/upload' | baseUrl">
                <div class="upload-button cover" v-if="!cover.file.attachmentId">
                    <Icon class="add-image-btn" type="plus-round"></Icon>
                    <div slot="tip" class="el-upload__tip">封面</div>
                </div>
                <div class="cover-img" v-if="cover.file.attachmentId">
                    <template v-if="cover.file.status === 'finished'">
                        <img width="100%" :src="'/attachment/download/' + cover.file.attachmentId | baseUrl">
                        <div class="upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native.stop="removeCover"></Icon>
                        </div>
                    </template>
                    <template v-else>
                        <Progress v-if="cover.file.showProgress" :percent="cover.file.percentage" hide-info></Progress>
                    </template>
                </div>
            </Upload>
            </Col>
            <Col :span="16" style="padding-left: 55px;">
            <Row>
                <Upload class="upload-wrap"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="1024"
                        name="attachments"
                        :on-success="handleAttached1Success"
                        :action="'/attachment/upload' | baseUrl">
                    <div class="upload-button" v-if="!attached1.file.attachmentId">
                        <Icon class="add-image-btn" type="plus-round"></Icon>
                        <div slot="tip" class="el-upload__tip">附图1</div>
                    </div>
                    <div class="img" v-if="attached1.file.attachmentId">
                        <template v-if="attached1.file.status === 'finished'">
                            <img width="100%" :src="'/attachment/download/' + attached1.file.attachmentId | baseUrl">
                            <div class="upload-list-cover">
                                <Icon type="ios-trash-outline" @click.native.stop="removeAttached1"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="attached1.file.showProgress" :percent="attached1.file.percentage" hide-info></Progress>
                        </template>
                    </div>
                </Upload>
                <Upload class="upload-wrap"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="1024"
                        name="attachments"
                        :on-success="handleAttached2Success"
                        :action="'/attachment/upload' | baseUrl">
                    <div class="upload-button" v-if="!attached2.file.attachmentId">
                        <Icon class="add-image-btn" type="plus-round"></Icon>
                        <div slot="tip" class="el-upload__tip">附图2</div>
                    </div>
                    <div class="img" v-if="attached2.file.attachmentId">
                        <template v-if="attached2.file.status === 'finished'">
                            <img width="100%" :src="'/attachment/download/' + attached2.file.attachmentId | baseUrl">
                            <div class="upload-list-cover">
                                <Icon type="ios-trash-outline" @click.native.stop="removeAttached2"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="attached2.file.showProgress" :percent="attached2.file.percentage" hide-info></Progress>
                        </template>
                    </div>
                </Upload>
            </Row>
            <Row class="margin-top-large">
                <Upload class="upload-wrap"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="1024"
                        name="attachments"
                        :on-success="handleAttached3Success"
                        :action="'/attachment/upload' | baseUrl">
                    <div class="upload-button" v-if="!attached3.file.attachmentId">
                        <Icon class="add-image-btn" type="plus-round"></Icon>
                        <div slot="tip" class="el-upload__tip">附图3</div>
                    </div>
                    <div class="img" v-if="attached3.file.attachmentId">
                        <template v-if="attached3.file.status === 'finished'">
                            <img width="100%" :src="'/attachment/download/' + attached3.file.attachmentId | baseUrl">
                            <div class="upload-list-cover">
                                <Icon type="ios-trash-outline" @click.native.stop="removeAttached3"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="attached3.file.showProgress" :percent="attached3.file.percentage" hide-info></Progress>
                        </template>
                    </div>
                </Upload>
                <Upload class="upload-wrap"
                        :show-upload-list="false"
                        :format="['jpg','jpeg','png']"
                        :max-size="1024"
                        name="attachments"
                        :on-success="handleAttached4Success"
                        :action="'/attachment/upload' | baseUrl">
                    <div class="upload-button" v-if="!attached4.file.attachmentId">
                        <Icon class="add-image-btn" type="plus-round"></Icon>
                        <div slot="tip" class="el-upload__tip">附图4</div>
                    </div>
                    <div class="img" v-if="attached4.file.attachmentId">
                        <template v-if="attached4.file.status === 'finished'">
                            <img width="100%" :src="'/attachment/download/' + attached4.file.attachmentId | baseUrl">
                            <div class="upload-list-cover">
                                <Icon type="ios-trash-outline" @click.native.stop="removeAttached4"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="attached4.file.showProgress" :percent="attached4.file.percentage" hide-info></Progress>
                        </template>
                    </div>
                </Upload>
            </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import util from '@/libs/util';
    export default {
        props: {
            formData: Object
        },
        data() {
            return {
                cover: {
                    file: {}
                },
                attached1: {
                    file: {}
                },
                attached2: {
                    file: {}
                },
                attached3: {
                    file: {}
                },
                attached4: {
                    file: {}
                }
            }
        },
        methods: {
            handleCoverSuccess(res, file) {
                res.forEach((r)=>{
                    file.attachmentId = r.id;
                    file.name = r.name;
                    file.isCover = true;
                });
                this.formData.partsCoverImage = this.formData.partsCoverImage || {};
                Object.assign(this.formData.partsCoverImage, file);
            },
            handleAttached1Success(res, file) {
                res.forEach((r)=>{
                    file.attachmentId = r.id;
                    file.name = r.name;
                    file.isCover = false;
                });
                this.formData.partsAttached1Image = this.formData.partsAttached1Image || {};
                Object.assign(this.formData.partsAttached1Image, file);
            },
            handleAttached2Success(res, file) {
                res.forEach((r)=>{
                    file.attachmentId = r.id;
                    file.name = r.name;
                    file.isCover = false;
                });
                this.formData.partsAttached2Image = this.formData.partsAttached2Image || {};
                Object.assign(this.formData.partsAttached2Image, file);
            },
            handleAttached3Success(res, file) {
                res.forEach((r)=>{
                    file.attachmentId = r.id;
                    file.name = r.name;
                    file.isCover = false;
                });
                this.formData.partsAttached3Image = this.formData.partsAttached3Image || {};
                Object.assign(this.formData.partsAttached3Image, file);
            },
            handleAttached4Success(res, file) {
                res.forEach((r)=>{
                    file.attachmentId = r.id;
                    file.name = r.name;
                    file.isCover = false;
                });
                this.formData.partsAttached4Image = this.formData.partsAttached4Image || {};
                Object.assign(this.formData.partsAttached4Image, file);
            },
            removeCover() {
                this.cover.file = {}
                this.formData.partsCoverImage.attachmentId = null;
            },
            removeAttached1() {
                this.attached1.file = {}
                this.formData.partsAttached1Image.attachmentId = null;
            },
            removeAttached2() {
                this.attached2.file = {}
                this.formData.partsAttached2Image.attachmentId = null;
            },
            removeAttached3() {
                this.attached3.file = {}
                this.formData.partsAttached3Image.attachmentId = null;
            },
            removeAttached4() {
                this.attached4.file = {}
                this.formData.partsAttached4Image.attachmentId = null;
            }
        },
        mounted() {

        },
        filters: {
            baseUrl(val) {
                return util.baseURL + val;
            }
        },
        watch: {
            'formData.partsCoverImage': {
                handler(val, oldVal) {
                    this.cover.file = Object.assign({status: 'finished'}, val);
                },
                deep: true
            },
            'formData.partsAttached1Image': {
                handler(val, oldVal) {
                    this.attached1.file = Object.assign({status: 'finished'}, val);
                },
                deep: true
            },
            'formData.partsAttached2Image': {
                handler(val, oldVal) {
                    this.attached2.file = Object.assign({status: 'finished'}, val);
                },
                deep: true
            },
            'formData.partsAttached3Image': {
                handler(val, oldVal) {
                    this.attached3.file = Object.assign({status: 'finished'}, val);
                },
                deep: true
            },
            'formData.partsAttached4Image': {
                handler(val, oldVal) {
                    this.attached4.file = Object.assign({status: 'finished'}, val);
                },
                deep: true
            }
        }
    }
</script>
