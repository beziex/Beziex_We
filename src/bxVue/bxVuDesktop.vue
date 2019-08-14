<template>
    <div id="pc-all">
        <div id="pc-menu">
            <div id="pc-select-container">
                <select class="pc-select" id="pc-select-id" v-on:change="selectFile_Selected">
                    <option v-for="info in filesInfo.dataName" v-bind:key="info" v-bind:value="info">{{ info }}</option>
                </select>
            </div>
        </div>

        <div id="pc-main">
            <div id="pc-left">
                <canvas id="gl-canvas" class="pc-gl-canvas" width=0 height=0></canvas>
            </div>

            <div id="pc-right">
                <div id="pc-right-inner">
                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Tess</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderTess" type="range" min="2" max="20" step="2"
                            v-on:input="sliderTess_Changed" v-on:mousedown="sliderTess_DragStarted" v-on:mouseup="sliderTess_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right">{{objCtrlVal.sliderTess}}</div>
                    </div>

                    <b-form-radio-group class="pc-radio-container" v-model="objCtrlVal.radioShape" plain>
                        <b-form-radio class="pc-radio-button" value="Solid" v-on:change="radioFaceType_Checked">Solid</b-form-radio>
                        <b-form-radio class="pc-radio-button" value="Wire" v-on:change="radioWireType_Checked">Wire</b-form-radio>
                    </b-form-radio-group>

                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Rx</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderRotV" type="range" min="0" max="100"
                            v-on:input="sliderRotV_Changed" v-on:mousedown="sliderRotV_DragStarted" v-on:mouseup="sliderRotV_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right"></div>
                    </div>
                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Ry</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderRotH" type="range" min="0" max="100"
                            v-on:input="sliderRotH_Changed" v-on:mousedown="sliderRotH_DragStarted" v-on:mouseup="sliderRotH_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right2">
                            <b-button class="pc-button-init" v-on:click="buttonRotInit_Click">
                                <div class="pc-button-init-inner">&times;</div>
                            </b-button>
                        </div>
                    </div>
                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Rz</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderRotR" type="range" min="0" max="100"
                            v-on:input="sliderRotR_Changed" v-on:mousedown="sliderRotR_DragStarted" v-on:mouseup="sliderRotR_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right"></div>
                    </div>

                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Mx</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderMovH" type="range" min="0" max="100"
                            v-on:input="sliderMovH_Changed" v-on:mousedown="sliderMovH_DragStarted" v-on:mouseup="sliderMovH_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right2" style="transform: translateY(17px);">
                            <b-button class="pc-button-init" v-on:click="buttonMovInit_Click">
                                <div class="pc-button-init-inner">&times;</div>
                            </b-button>
                        </div>
                    </div>
                    <div class="pc-slider-container">
                        <div class="pc-slider-left">My</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderMovV" type="range" min="0" max="100"
                            v-on:input="sliderMovV_Changed" v-on:mousedown="sliderMovV_DragStarted" v-on:mouseup="sliderMovV_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right"></div>
                    </div>

                    <div class="pc-slider-container">
                        <div class="pc-slider-left">Scl</div>
                        <b-form-input
                            class="pc-slider-main" v-model="objCtrlVal.sliderScale" type="range" min="0" max="100"
                            v-on:input="sliderScale_Changed" v-on:mousedown="sliderScale_DragStarted" v-on:mouseup="sliderScale_DragCompleted">
                        </b-form-input>
                        <div class="pc-slider-right2">
                            <b-button class="pc-button-init" v-on:click="buttonScaleInit_Click">
                                <div class="pc-button-init-inner">&times;</div>
                            </b-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from "vue-property-decorator";
    
    import BootstrapVue from 'bootstrap-vue';
    import 'bootstrap/dist/css/bootstrap.css';
    import 'bootstrap-vue/dist/bootstrap-vue.css';
    Vue.use(BootstrapVue);

    import { BxRoot } from '../bxRoot';
    import { BxVuUtil, BxControlValue } from './bxVuUtil';
    import { BxRdRoot } from '../bxRead/bxRdRoot';

    @Component
    export default class BxVuDesktop extends Vue {
        @Prop()
        public objRoot!: BxRoot;
        @Prop()
        public objUtil!: BxVuUtil;
        @Prop()
        public objCtrlVal!: BxControlValue;

        filesInfo: BxRdRoot = new BxRdRoot();

        mounted(): void {
            this.objRoot.init();

            window.addEventListener('resize', this.resizeCanvas);
            setTimeout(() => { this.resizeCanvas(); }, 1);
        }
        beforeDestroy(): void {
            window.removeEventListener('resize', this.resizeCanvas);
        }

        // ------------------------------------------------

        private resizeCanvas(): void {
           this.objUtil.resizeCanvas(this.objRoot);
        }

        // ------------------------------------------------

        selectFile_Selected(): void {
            const selectFile = document.getElementById('pc-select-id');
            const index: number = (<any>selectFile).selectedIndex;

            this.objUtil.selectFile_Selected(index, this.objCtrlVal, this.objRoot);
        }

        sliderTess_Changed(e: Event): void {
            this.objUtil.sliderTess_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderTess_DragStarted(e: Event): void {
            this.objUtil.sliderTess_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderTess_DragCompleted(e: Event): void {
            this.objUtil.sliderTess_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        radioFaceType_Checked(e: Event): void {
            this.objUtil.radioFaceType_Checked(e, this.objCtrlVal, this.objRoot);
        }

        radioWireType_Checked(e: Event): void {
            this.objUtil.radioWireType_Checked(e, this.objCtrlVal, this.objRoot);
        }

        // ------------------------------------------------

        sliderRotH_Changed(e: Event): void {
            this.objUtil.sliderRotH_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotV_Changed(e: Event): void {
            this.objUtil.sliderRotV_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotR_Changed(e: Event): void {
            this.objUtil.sliderRotR_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotH_DragStarted(e: Event): void {
            this.objUtil.sliderRotH_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotV_DragStarted(e: Event): void {
            this.objUtil.sliderRotV_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotR_DragStarted(e: Event): void {
            this.objUtil.sliderRotR_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotH_DragCompleted(e: Event): void {
            this.objUtil.sliderRotH_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotV_DragCompleted(e: Event): void {
            this.objUtil.sliderRotV_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        sliderRotR_DragCompleted(e: Event): void {
            this.objUtil.sliderRotR_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        // ------------------------------------------------

        sliderMovH_Changed(e: Event): void {
            this.objUtil.sliderMovH_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderMovV_Changed(e: Event): void {
            this.objUtil.sliderMovV_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderMovH_DragStarted(e: Event): void {
            this.objUtil.sliderMovH_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderMovV_DragStarted(e: Event): void {
            this.objUtil.sliderMovV_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderMovH_DragCompleted(e: Event): void {
            this.objUtil.sliderMovH_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        sliderMovV_DragCompleted(e: Event): void {
            this.objUtil.sliderMovV_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        // ------------------------------------------------

        sliderScale_Changed(e: Event): void {
            this.objUtil.sliderScale_Changed(e, this.objCtrlVal, this.objRoot);
        }

        sliderScale_DragStarted(e: Event): void {
            this.objUtil.sliderScale_DragStarted(e, this.objCtrlVal, this.objRoot);
        }

        sliderScale_DragCompleted(e: Event): void {
            this.objUtil.sliderScale_DragCompleted(e, this.objCtrlVal, this.objRoot);
        }

        // ------------------------------------------------

        buttonRotInit_Click(e: Event): void {
            this.objUtil.buttonRotInit_Click(e, this.objCtrlVal, this.objRoot);
        }

        buttonMovInit_Click(e: Event): void {
            this.objUtil.buttonMovInit_Click(e, this.objCtrlVal, this.objRoot);
        }

        buttonScaleInit_Click(e: Event): void {
            this.objUtil.buttonScaleInit_Click(e, this.objCtrlVal, this.objRoot);
        }
    }
</script>

<style>
    #pc-all {
        height: 100%;
        font-size: 12px;
        overflow: hidden;
    }

    #pc-menu {
        height: 36px;
        position: relative;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: lightgrey;
    }
    #pc-select-container {
        display: inline-block;
        margin-left: 5px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }
    #pc-select-container::before {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #666666;
        pointer-events: none;
    }
    .pc-select {
        width: 175px;
        padding-left: 5px;
        font-size: 16px;
    }

    #pc-main {
        display: flex;
        height: calc(100% - 42px);
    }

    #pc-left {
        width: calc(100% - 306px);
        height: 100%;
        margin: 3px 3px 0 3px;
    }
    .pc-gl-canvas {
        width: 100%;
        height: 100%;
    }

    #pc-right {
        width: 300px;
    }
    #pc-right-inner {
        margin: 10px 5px 5px 5px;
    }

    .pc-slider-container {
        height: 30px;
        margin-top: 5px;
    }
    .pc-slider-left {
        float: left;
        width: 40px;
        padding-left: 10px;
    }
    .pc-slider-main {
        float: left;
        width: calc(100% - 40px - 35px);
    }
    .pc-slider-right {
        float: left;
        width: 35px;
        padding-right: 15px;
        text-align: right;
    }

    .pc-radio-container {
        height: 30px;
        margin-top: 5px;
        padding-left: 10px;
    }
    .pc-radio-button {
        margin-right: 20px;
    }

    .pc-slider-right2 {
        float: left;
        width: 35px;
        padding-left: 5px;
    }
    .pc-button-init {
        font-size: 22px;
        width: 22px;
        height: 22px;
        padding: 0;
        color: black;
        background-color: transparent;
        border: 0;
    }
    .pc-button-init-inner {
        transform: translateY(-9px);
    }
</style>
