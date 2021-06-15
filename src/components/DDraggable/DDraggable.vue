<script>
import { EFFECTS, parseJSON, prevent } from "@/components/DDraggable/utils"
import { cloneDeep } from "lodash"
import { VVirtualScroll } from "vuetify/lib"

export default {
    name: "DDraggable",
    components: { VVirtualScroll },
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
            type: [String, Function],
            required: false,
            default: null,
        },
        tag: {
            type: [String, Function],
            required: true,
        },
        componentOptions: {
            type: Object,
            required: false,
            default: () => ({}),
        },
        effect: {
            type: String,
            required: false,
            default: EFFECTS.COPY,
            validator: (effect) => Object.values(EFFECTS).includes(effect),
        },
        group: {
            type: String,
            required: false,
            default: "",
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

    render(h) {
        try {
            const { item: itemSlot } = this.$scopedSlots

            const patchNode = (node, { item, index }) => {
                const nodeListeners = node.data.on || {}
                const nodeAttrs = node.data.attrs || {}
                const nodeClass = node.data.class || {}
                node.key = this.getKey(item, index)
                node.data.on = {
                    ...nodeListeners,
                    dragstart: (e) => this.start(e, index),
                    dragend: (e) => this.end(e, index),
                    dragenter: (e) => this.enter(e, index),
                    dragleave: (e) => this.leave(e, index),
                    dragover: (e) => this.dragover(e, index),
                    drop: (e) => this.drop(e, index),
                }
                node.data.attrs = { ...nodeAttrs, draggable: "true" }
                node.data.class = {
                    ...nodeClass,
                    [this.ghostClass]: index === this.ghostIdx,
                    [this.overClass]: this.overIdx === index,
                }
                return node
            }

            const patchSlots = ({ item, index }) =>
                itemSlot({ item, index }).map((node) =>
                    patchNode(node, { item, index })
                )

            const children = this.list.flatMap((item, index) =>
                patchSlots({ item, index })
            )

            const tag =
                this.tag === "v-virtual-scroll" ? VVirtualScroll : this.tag

            if (this.tag === "v-virtual-scroll") {
                return h(tag, {
                    ...this.componentOptions,
                    scopedSlots: {
                        default: ({ item, index }) =>
                            patchSlots({ item, index }),
                    },
                })
            }

            return h(tag, this.componentOptions, children)
        } catch (e) {
            return h("pre", { style: { color: "red" } }, e.stack)
        }
    },

    data() {
        return {
            dragging: false,
            dropped: false,
            overIdx: null,
            ghostIdx: null,
        }
    },

    methods: {
        getKey(item, index) {
            if (typeof this.itemKey === "function") {
                return this.itemKey(item, index)
            }
            return this.itemKey ? item[this.itemKey] : index
        },

        getDragItem(e) {
            const dragItem = e.dataTransfer.getData("item")
            const group = e.dataTransfer.getData("group")
            return { item: parseJSON(dragItem, null), group }
        },
        start(e, index) {
            this.dragging = true
            this.ghostIdx = index

            e.dataTransfer.effectAllowed = this.effect
            e.dataTransfer.setData("item", JSON.stringify(this.list[index]))
            e.dataTransfer.setData("group", this.group)

            if (this.dragImage) {
                e.dataTransfer.setDragImage(this.dragImage, 0, 0)
            }
        },
        end(e, droppedItemIdx) {
            this.dragging = false
            this.ghostIdx = null

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
        dragover(e) {
            return prevent(e)
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
                this.$emit("drop", item)
            }

            this.overIdx = null

            return prevent(e)
        },
    },
}
</script>
