<template>
    <div id="mv-all">
        <div id="mv-content">
            <div id="mv-menu">
                <div id="mv-select-container">
                    <select class="mv-select" id="mv-select-id" v-on:change="selectFile_Selected">
                        <option v-for="info in filesInfo.dataName" v-bind:key="info" v-bind:value="info">{{ info }}</option>
                    </select>
                </div>
            </div>

            <div id="mv-center">
                <canvas id="gl-canvas" class="mv-gl-canvas" width=0 height=0></canvas>
            </div>

            <div id="mv-bottom">
                <div id="mv-bottom-inner">
                    <div id="mv-bottom-left">
                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Tess</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderTess" type="range" min="2" max="20" step="2"
                                v-on:input="sliderTess_Changed" v-on:mousedown="sliderTess_DragStarted" v-on:mouseup="sliderTess_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right">{{objCtrlVal.sliderTess}}</div>
                        </div>

                        <b-form-radio-group class="mv-radio-container" v-model="objCtrlVal.radioShape" plain>
                            <b-form-radio class="mv-radio-button" value="Solid" v-on:change="radioFaceType_Checked">Solid</b-form-radio>
                            <b-form-radio class="mv-radio-button" value="Wire" v-on:change="radioWireType_Checked">Wire</b-form-radio>
                        </b-form-radio-group>

                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Rx</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderRotV" type="range" min="0" max="100"
                                v-on:input="sliderRotV_Changed" v-on:mousedown="sliderRotV_DragStarted" v-on:mouseup="sliderRotV_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right"></div>
                        </div>
                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Ry</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderRotH" type="range" min="0" max="100"
                                v-on:input="sliderRotH_Changed" v-on:mousedown="sliderRotH_DragStarted" v-on:mouseup="sliderRotH_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right2">
                                <b-button class="mv-button-init" v-on:click="buttonRotInit_Click">
                                    <div class="mv-button-init-inner">&times;</div>
                                </b-button>
                            </div>
                        </div>
                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Rz</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderRotR" type="range" min="0" max="100"
                                v-on:input="sliderRotR_Changed" v-on:mousedown="sliderRotR_DragStarted" v-on:mouseup="sliderRotR_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right"></div>
                        </div>

                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Mx</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderMovH" type="range" min="0" max="100"
                                v-on:input="sliderMovH_Changed" v-on:mousedown="sliderMovH_DragStarted" v-on:mouseup="sliderMovH_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right2" style="transform: translateY(7.5vw);">
                                <b-button class="mv-button-init" v-on:click="buttonMovInit_Click">
                                    <div class="mv-button-init-inner">&times;</div>
                                </b-button>
                            </div>
                        </div>
                        <div class="mv-slider-container">
                            <div class="mv-slider-left">My</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderMovV" type="range" min="0" max="100"
                                v-on:input="sliderMovV_Changed" v-on:mousedown="sliderMovV_DragStarted" v-on:mouseup="sliderMovV_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right"></div>
                        </div>

                        <div class="mv-slider-container">
                            <div class="mv-slider-left">Scl</div>
                            <b-form-input
                                class="mv-slider-main" v-model="objCtrlVal.sliderScale" type="range" min="0" max="100"
                                v-on:input="sliderScale_Changed" v-on:mousedown="sliderScale_DragStarted" v-on:mouseup="sliderScale_DragCompleted">
                            </b-form-input>
                            <div class="mv-slider-right2">
                                <b-button class="mv-button-init" v-on:click="buttonScaleInit_Click">
                                    <div class="mv-button-init-inner">&times;</div>
                                </b-button>
                            </div>
                        </div>
                    </div>
                    <div id="mv-bottom-right">
                        &uarr;<br>
                        Scroll down this area to see more.
                    </div>
                </div>
            </div>
        </div>
        <div id="mv-message-container">
            <div id="mv-message">
                Not support landscape mode.
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
    export default class BxVuMobileV extends Vue {
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

            const mvContentEl = document.getElementById('mv-content');
            const mvMessageEl = document.getElementById('mv-message-container');
            if (this.objUtil.isVertical()) {
                (<any>mvContentEl).style.visibility = "visible";
                (<any>mvMessageEl).style.visibility = "hidden";
            }
            else {
                (<any>mvContentEl).style.visibility = "hidden";
                (<any>mvMessageEl).style.visibility = "visible";
            }
        }

        // ------------------------------------------------

        selectFile_Selected(): void {
            const selectFile = document.getElementById('mv-select-id');
            const index = (<any>selectFile).selectedIndex;

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
    #mv-all input[type=range] {
        -webkit-appearance: none;
        margin: 0;
    }
    #mv-all input[type=range]:focus {
        outline: none;
    }
    #mv-all input[type=range]::-webkit-slider-runnable-track {
        height: 1vw;
    }
    #mv-all input[type=range]::-webkit-slider-thumb {
        width: 3vw;
        height: 3vw;
        margin-top: -1vw;
    }

    #mv-all .form-check-inline .form-check-input {
        width: 3vw;
        height: 3vw;
    }

    #mv-all {
        width: 100%;
        height: 100%;
        font-size: 4.8vw;
        overflow: hidden;
        position: relative;
    }
    #mv-content {
        width: 100%;
        height: 100%;
        position: absolute;
    }

    #mv-message-container {
        width: 100%;
        height: 100%;
        position: absolute;
        visibility: hidden;
    }
    #mv-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform : translate(-50%, -50%);
    }

    #mv-menu {
        height: 12vw;
        position: relative;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: lightgrey;
    }
    #mv-select-container {
        display: inline-block;
        margin-left: 2vw;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }
    #mv-select-container::before {
        position: absolute;
        top: 4vw;
        right: 2vw;
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: 2vw solid transparent;
        border-right: 2vw solid transparent;
        border-top: 2vw solid #666666;
        pointer-events: none;
    }
    .mv-select {
        font-size: 4.8vw;
        width: 50vw;
        height: 8vw;
        padding-left: 2.5vw;
        margin-top: 1vw;
    }
    select {
        -webkit-appearance: none;
    }

    #mv-center {
        width: calc(100% - 6px);
        height: calc(100% - 12vw - 50vw - 3px);
        margin: 3px;
    }
    .mv-gl-canvas {
        width: 100%;
        height: 100%;
    }

    #mv-bottom {
        width: 100%;
        height: 50vw;
        overflow-x: hidden;
        overflow-y: scroll;
    }
    #mv-bottom-inner {
        margin: 2vw 1vw 1vw 1vw;
        display: flex;
    }

    #mv-bottom-left {
        width: 75%;
        height: 100%;
    }
    #mv-bottom-right {
        width: 25%;
        height: 100%;
        padding-top: 4vw;
        text-align: center;
        font-size: 4vw;
    }

    .mv-slider-container {
        height: 14vw;
        margin-top: 2vw;
    }
    .mv-slider-left {
        float: left;
        width: 13vw;
        height: 7.5vw;
        padding-left: 2vw;
        vertical-align: top;
    }
    .mv-slider-main {
        float: left;
        width: calc(100% - 13vw - 8vw);
        height: 7.5vw;
        vertical-align: middle;
    }
    .mv-slider-right {
        float: left;
        width: 8vw;
        height: 7.5vw;
        padding-right: 2vw;
        text-align: right;
        vertical-align: top;
    }
    #mv-all input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 4.8vw;
        width: 4.8vw;
        border-radius:50%;
        transform: translateY(-1vw);
    }

    .mv-radio-container {
        height: 14vw;
        margin-top: 2vw;
        padding-left: 2vw;
    }
    .mv-radio-button {
        margin-right: 4vw;
    }
    #mv-all input[type="radio"] {
        transform: scale(1.5);
    }
    #mv-all .form-check-inline .form-check-input {
        margin-right: 2vw;
    }

    .mv-slider-right2 {
        float: left;
        width: 8vw;
        padding-left: 2vw;
        transform: translateY(-0.7vw);
    }
    .mv-button-init {
        font-size: 9.6vw;
        width: 6.6vw;
        height: 6.6vw;
        padding: 0;
        color: black;
        background-color: transparent;
        border: 0;
    }
    .mv-button-init-inner {
        transform: translateY(-4.2vw);
    }
</style>
