import Vue from 'vue';
import BxVuRoot from './bxVue/bxVuRoot.vue';

new Vue({
    el: "#app",
    template: `
        <div class="app">
            <vu-root></vu-root>
        </div>
    `,

    components: {
        'vu-root': BxVuRoot
    }
});
