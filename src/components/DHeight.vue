<script>
export default {
    name: "DHeight",
    data() {
        return {
            height: 0,
            observer: null,
        }
    },
    mounted() {
        this.observe()
        this.addListener()
    },
    beforeDestroy() {
        this.unobserve()
        this.removeListener()
    },
    methods: {
        observe() {
            const config = { childList: true, subtree: true }
            const observer = new MutationObserver(this.calculateHeight)
            observer.observe(this.$el, config)
            this.observer = observer
        },
        unobserve() {
            this.observer?.disconnect()
        },
        addListener() {
            window.addEventListener("resize", this.calculateHeight)
        },
        removeListener() {
            window.removeEventListener("resize", this.calculateHeight)
        },
        calculateHeight() {
            this.height = this.$el?.clientHeight || 0
        },
    },
}
</script>

<template>
    <div class="d-height">
        <slot :height="height" />
    </div>
</template>

<style scoped></style>
