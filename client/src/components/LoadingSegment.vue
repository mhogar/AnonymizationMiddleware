<template>
<div :class="'ui basic segment' + loadingClass">
    <slot />
</div>
</template>

<script>
export default {
    props: {
        isLoading: Boolean
    },
    computed: {
        loadingClass() {
            return this.isLoading ? ' loading' : ''
        }
    }
}
</script>