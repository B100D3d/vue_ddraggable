<script>
import {
    EFFECTS,
    parseJSON,
    prevent,
    stringify,
} from "@/components/DDraggable/utils"
import { cloneDeep, isEqual } from "lodash"
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
                    dragstart: (e) => this.start(e, item),
                    dragend: (e) => this.end(e, item),
                    dragenter: (e) => this.enter(e, item),
                    dragleave: (e) => this.leave(e, item),
                    dragover: (e) => this.dragover(e, item),
                    drop: (e) => this.drop(e, index),
                }
                node.data.attrs = { ...nodeAttrs, draggable: "true" }
                node.data.class = {
                    ...nodeClass,
                    [this.ghostClass]: item === this.draggingItem,
                    [this.overClass]: item === this.overItem,
                }
                return node
            }

            const patchSlots = ({ item, index }) =>
                itemSlot({ item, index }).map((node) =>
                    patchNode(node, { item, index })
                )

            const children = this.localList.flatMap((item, index) =>
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
            localList: cloneDeep(this.list),

            dragging: false,
            dropped: false,

            overItem: null,
            draggingItem: null,
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
        start(e, item) {
            this.dragging = true
            this.draggingItem = item

            e.dataTransfer.effectAllowed = this.effect
            e.dataTransfer.setData("item", stringify(item))
            e.dataTransfer.setData("group", this.group)

            if (this.dragImage) {
                e.dataTransfer.setDragImage(this.dragImage, 0, 0)
            }
        },
        end(e, droppedItem) {
            this.dragging = false
            this.draggingItem = null

            // was dropped inside this list
            if (this.dropped) {
                this.$emit("change", this.localList)
            } else {
                const originalItem = this.list.find(
                    (item, index) =>
                        item[this.getKey(item, index)] ===
                        droppedItem[this.getKey(item, index)]
                )
                const effect = e.dataTransfer.dropEffect
                if (effect === EFFECTS.MOVE) {
                    this.$emit(
                        "change",
                        this.list.filter((item) => item !== originalItem)
                    )
                }
            }

            this.overItem = null
            this.dropped = false
        },
        enter(e, item) {
            this.overItem = item

            if (this.dragging) {
                const draggingItemIdx = this.localList.indexOf(
                    this.draggingItem
                )
                const overIdx = this.localList.indexOf(this.overItem)
                // swap two items
                ;[this.localList[draggingItemIdx], this.localList[overIdx]] = [
                    this.localList[overIdx],
                    this.localList[draggingItemIdx],
                ]
            }
        },
        leave(e) {
            this.overItem = null
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
                this.localList.splice(index + 1, 0, item)
                this.$emit("change", this.localList)

                this.dropped = false
            } else {
                this.$emit("drop", item)
            }

            this.overItem = null
            return prevent(e)
        },
    },
    watch: {
        list() {
            if (!isEqual(this.list, this.localList)) {
                this.localList = cloneDeep(this.list)
            }
        },
    },
}
</script>
