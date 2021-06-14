<script>
import { cloneDeep } from "lodash"
import { EFFECTS, parseJSON, prevent } from "@/components/DDraggable/utils"
import DDraggableItem from "@/components/DDraggable/DDraggableItem"

export default {
    name: "DDraggable",
    components: { DDraggableItem },
    model: {
        prop: "list",
        event: "change",
    },
    props: {
        list: {
            type: Array,
            required: true,
        },
        itemKey: {
            type: String,
            required: false,
            default: null,
        },
        tag: {
            type: [String, Object],
            required: true,
        },
        transitionName: {
            type: String,
            required: false,
            default: "fade-move",
        },
        componentProps: {
            type: Object,
            required: false,
            default: () => ({}),
        },
        childTag: {
            type: [String, Object, Function],
            required: true,
        },
        childProps: {
            type: [Object, Function],
            required: false,
            default: () => ({}),
        },
        effect: {
            type: String,
            required: false,
            default: EFFECTS.COPY,
        },
        group: {
            type: String,
            required: false,
            default: "",
        },
        virtualScroll: {
            type: Boolean,
            required: false,
            default: false,
        },
        virtualScrollProps: {
            type: Object,
            required: false,
            default: () => ({}),
        },
        dropFrom: {
            type: Boolean,
            required: false,
            default: false,
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
        dragImage: {
            type: Element,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            dragging: false,
            dropped: false,
            overIdx: null,
        }
    },

    methods: {
        getChildTag(item, index) {
            if (typeof this.childTag === "function") {
                return this.childTag(item, index)
            }
            return this.childTag
        },

        getChildProps(item, index) {
            if (typeof this.childProps === "function") {
                return this.childProps(item, index)
            }
            return this.childProps
        },

        getDragItem(e) {
            const dragItem = e.dataTransfer.getData("item")
            const group = e.dataTransfer.getData("group")
            return { item: parseJSON(dragItem, null), group }
        },
        start(e, index) {
            this.dragging = true

            e.dataTransfer.effectAllowed = this.effect
            e.dataTransfer.setData("item", JSON.stringify(this.list[index]))
            e.dataTransfer.setData("group", this.group)

            if (this.dragImage) {
                e.dataTransfer.setDragImage(this.dragImage, 0, 0)
            }
        },
        end(e, droppedItemIdx) {
            this.dragging = false

            // was dropped inside this list
            if (this.dropped) {
                // swap two items
                const newList = cloneDeep(this.list)
                ;[newList[droppedItemIdx], newList[this.overIdx]] = [
                    this.list[this.overIdx],
                    this.list[droppedItemIdx],
                ]
                this.$emit("change", newList)
            } else {
                const effect = e.dataTransfer.dropEffect
                if (effect === EFFECTS.MOVE) {
                    this.$emit(
                        "change",
                        this.list.filter((_, idx) => idx !== droppedItemIdx)
                    )
                }
            }

            this.overIdx = null
            this.dropped = false
        },
        enter(e, index) {
            this.overIdx = index
        },
        leave(e) {
            this.overIdx = null
        },
        drop(e, index) {
            // from this list
            if (this.dragging) {
                this.dropped = true
                return prevent(e)
            }

            const { item, group } = this.getDragItem(e)

            if (this.group !== group) return prevent(e)

            if (this.dropFrom) {
                const newList = cloneDeep(this.list)
                newList.splice(index + 1, 0, item)
                this.$emit("change", newList)

                this.dropped = false
            } else {
                this.$emit("drop", { item })
            }

            return prevent(e)
        },
    },
}
</script>

<template>
    <transition-group
        :tag="tag"
        :name="transitionName"
        class="uk-position-relative"
        v-bind="componentProps"
    >
        <v-virtual-scroll
            :key="'virtual-scroll'"
            v-if="virtualScroll"
            v-bind="virtualScrollProps"
            :items="list"
        >
            <template #default="{ item, index }">
                <d-draggable-item
                    :key="itemKey ? item[itemKey] : index"
                    :tag="getChildTag(item, index)"
                    :props="getChildProps(item, index)"
                    :ghost-class="ghostClass"
                    :over-class="overClass"
                    @dragstart="start($event, index)"
                    @dragend="end($event, index)"
                    @dragenter.stop.prevent="enter($event, index)"
                    @dragleave.stop.prevent="leave($event, index)"
                    @drop.stop.prevent="drop($event, index)"
                >
                    <slot name="item" :item="item" :index="index" />
                </d-draggable-item>
            </template>
        </v-virtual-scroll>
        <d-draggable-item
            v-else
            v-for="(item, index) of list"
            :key="itemKey ? item[itemKey] : index"
            :tag="getChildTag(item, index)"
            :props="getChildProps(item, index)"
            :ghost-class="ghostClass"
            :over-class="overClass"
            @dragstart="start($event, index)"
            @dragend="end($event, index)"
            @dragenter.stop.prevent="enter($event, index)"
            @dragleave.stop.prevent="leave($event, index)"
            @drop.stop.prevent="drop($event, index)"
        >
            <slot name="item" :item="item" :index="index" />
        </d-draggable-item>
    </transition-group>
</template>

<style lang="scss" scoped>
.ddraggable-item {
    &.over {
        border: 1px dotted #666;
    }
}

.fade-move-enter-from,
.fade-move-leave-to {
    opacity: 0;
}

.fade-move-leave-from,
.fade-move-enter-to {
    opacity: 1;
}

.fade-move-enter-active,
.fade-move-leave-active {
    transition: opacity 0.3s ease !important;
}

.fade-move-leave-active {
    position: absolute !important;
}

.fade-move-move {
    transition: transform 0.3s ease, opacity 0.3s ease !important;
}
</style>
