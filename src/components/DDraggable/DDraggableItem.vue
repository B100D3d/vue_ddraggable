<script>
import { except, prevent } from "@/components/DDraggable/utils"

export default {
    name: "DDraggableItem",
    props: {
        tag: {
            type: [String, Object],
            required: true,
        },
        props: {
            type: Object,
            required: true,
        },
        ghostClass: {
            type: String,
            required: false,
            default: "",
        },
        overClass: {
            type: String,
            required: false,
            default: "",
        },
    },

    computed: {
        propsClass() {
            return this.props.class || ""
        },
        propsWithoutClass() {
            return except(this.props, ["class"])
        },
    },

    data() {
        return {
            ghost: false,
            over: false,
        }
    },

    methods: {
        dragstart(e) {
            this.$emit("dragstart", e)
            this.ghost = true
        },
        dragend(e) {
            this.$emit("dragend", e)
            this.ghost = false
            this.over = false
        },
        dragenter(e) {
            this.$emit("dragenter", e)
            this.over = true
        },
        dragleave(e) {
            this.$emit("dragleave", e)
            this.over = false
        },
        dragover(e) {
            return prevent(e)
        },
        drop(e) {
            this.$emit("drop", e)
            this.over = false
        },
    },
}
</script>

<template>
    <component
        :is="tag"
        class="ddraggable-item"
        :class="[propsClass, { [ghostClass]: ghost, [overClass]: over }]"
        v-bind="propsWithoutClass"
        draggable="true"
        @dragstart="dragstart"
        @dragend="dragend"
        @dragenter.stop.prevent="dragenter"
        @dragleave.stop.prevent="dragleave"
        @dragover.stop.prevent="dragover"
        @drop.stop.prevent="drop"
    >
        <slot />
    </component>
</template>

<style lang="scss" scoped>
.ddraggable-item {
}
</style>
