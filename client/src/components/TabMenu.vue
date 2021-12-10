<template>
<div class="ui tabular menu">
    <a v-for="(tab, index) in tabs" :key="index" :class="tabClass(index)" @click.prevent="selectTabIndex(index)">
        {{tab}}
    </a>
</div>
</template>

<script>
export default {
    data() {
        return {
            selectedTabIndex: 0
        }
    },
    props: {
        tabs: Array
    },
    mounted() {
        this.selectTabIndex(this.selectedTabIndex)
    },
    methods: {
        tabClass(index) {
            return index === this.selectedTabIndex ? 'item active' : 'item'
        },
        selectTabIndex(index) {
            this.selectedTabIndex = index
            this.$emit('selected-tab-changed', this.tabs[index])
        }
    }
}
</script>
