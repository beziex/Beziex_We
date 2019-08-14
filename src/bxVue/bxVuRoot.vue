<template>
    <div id="template-root">
        <bx-vu-desktop v-if="!isMobile()"
            :objRoot="objRoot"
            :objUtil="objUtil"
            :objCtrlVal="objCtrlVal">
        </bx-vu-desktop>

        <bx-vu-mobile v-if="isMobile()"
            :objRoot="objRoot"
            :objUtil="objUtil"
            :objCtrlVal="objCtrlVal">
        </bx-vu-mobile>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';

    import BxVuDesktop from './bxVuDesktop.vue';
    import BxVuMobile from './bxVuMobile.vue';

    import { BxRoot } from '../bxRoot';
    import { BxVuUtil, BxControlValue } from './bxVuUtil';

    @Component({
        components: {
            BxVuDesktop,
            BxVuMobile
        }
    })
    export default class BxVuRoot extends Vue {
        private objRoot: BxRoot;
        private objUtil: BxVuUtil;
        private objCtrlVal: BxControlValue;

        constructor() {
            super();

            this.objRoot = new BxRoot();
            this.objUtil = new BxVuUtil();
            this.objCtrlVal = new BxControlValue();
        }

        mounted(): void {
            window.addEventListener('resize', this.resize);
            this.resize();
        }
        beforeDestroy(): void {
            window.removeEventListener('resize', this.resize);
        }

        // ------------------------------------------------

        private isMobile_: boolean|null = null;

        isMobile(): boolean {
            if (this.isMobile_ == null)
                return false;
            else
                return <boolean>this.isMobile_;
        }

        private resize(): void {
            if (this.isMobile_ == null)
                this.isMobile_ = (<BxVuUtil>this.objUtil).isMobile();
        }
    }
</script>

<style>
    html {
        width: 100%;
        height: 100%;
    }
    body {
        width: 100%;
        height: 100%;
    }
    .app {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
        background-color: white;        
    }
    #template-root {
        width: 100%;
        height: 100%;
    }
</style>
