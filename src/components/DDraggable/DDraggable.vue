<script>
import {
    EFFECTS,
    parseJSON,
    prevent,
    stringify,
} from "@/components/DDraggable/utils"
import { cloneDeep, isEqual } from "lodash"
import { VVirtualScroll } from "vuetify/lib"

const DRAGGABLE_ITEM_CLASS = "d-draggable-item"
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
        handle: {
            type: String,
            required: false,
            default: "",
        },
    },

    render(h) {
        try {
            const { item: itemSlot } = this.$scopedSlots

            const patchNode = (node, { item, index }) => {
                if (!node.data) node.data = {}
                const nodeListeners = node.data.on || {}
                const nodeAttrs = node.data.attrs || {}
                const nodeClass = node.data.class || {}
                const key = this.getKey(item, index)
                node.key = key
                node.data.on = {
                    ...nodeListeners,
                    dragenter: (e) => this.enter(e, key),
                    dragleave: (e) => this.leave(e, key),
                    dragover: (e) => this.dragover(e, key),
                    drop: (e) => this.drop(e, index),
                }
                if (!this.handle) {
                    node.data.on = {
                        ...node.data.on,
                        dragstart: (e) => this.start(e, key),
                        dragend: (e) => this.end(e, key),
                    }
                    node.data.attrs = { ...nodeAttrs, draggable: "true" }
                }
                node.data.staticClass += ` ${DRAGGABLE_ITEM_CLASS}`
                node.data.class = {
                    ...nodeClass,
                    [this.ghostClass]: key === this.draggingItemKey,
                    [this.overClass]: key === this.overItemKey,
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
                const props = {
                    ...(this.componentOptions.props || {}),
                    items: this.localList,
                }
                return h(tag, {
                    ...this.componentOptions,
                    props,
                    items: this.localList,
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

    mounted() {
        if (this.handle) {
            this.handleChildren()
        }
    },
    updated() {
        if (this.handle) {
            this.handleChildren()
        }
    },
    data() {
        return {
            localList: cloneDeep(this.list),

            dragging: false,
            dropped: false,

            overItemKey: null,
            draggingItemKey: null,
        }
    },

    methods: {
        handleChildren() {
            this.localList.forEach((item, index) => {
                const key = this.getKey(item, index)
                const elems = this.$el.children[index].querySelectorAll(
                    this.handle
                )
                elems.forEach((element) => {
                    element.draggable = true
                    element.ondragstart = (e) => this.start(e, key)
                    element.ondragend = (e) => this.end(e, key)
                })
            })
        },

        getKey(item, index) {
            if (typeof this.itemKey === "function") {
                return this.itemKey(item, index)
            }
            return this.itemKey ? item[this.itemKey] : index
        },
        getItem(key, list) {
            return list.find((item, index) => {
                return this.getKey(item, index) === key
            })
        },

        getDragItem(e) {
            const dragItem = e.dataTransfer.getData("item")
            const group = e.dataTransfer.getData("group")
            return { item: parseJSON(dragItem, null), group }
        },
        start(e, key) {
            this.dragging = true
            this.draggingItemKey = key

            const item = this.getItem(key, this.localList)

            e.dataTransfer.effectAllowed = this.effect
            e.dataTransfer.setData("item", stringify(item))
            e.dataTransfer.setData("group", this.group)

            /* set d-draggable-item as drag image when using handle item */
            if (this.handle) {
                const eventPath =
                    e.path || (e.composedPath && e.composedPath()) || []
                const element = eventPath.find((element) =>
                    element.classList.contains(DRAGGABLE_ITEM_CLASS)
                )
                if (element) {
                    e.dataTransfer.setDragImage(element, 0, 0)
                }
            }

            if (this.dragImage) {
                e.dataTransfer.setDragImage(this.dragImage, 0, 0)
            }
        },
        end(e, droppedItemKey) {
            this.dragging = false
            this.draggingItemKey = null

            // was dropped inside this list
            if (this.dropped) {
                this.$emit("change", this.localList)
            } else {
                const originalItem = this.getItem(droppedItemKey, this.list)
                const effect = e.dataTransfer.dropEffect
                if (effect === EFFECTS.MOVE) {
                    this.$emit(
                        "change",
                        this.list.filter((item) => item !== originalItem)
                    )
                }
            }

            this.overItemKey = null
            this.dropped = false
        },
        enter(e, key) {
            this.overItemKey = key
            if (this.dragging) {
                const overItem = this.getItem(key, this.localList)
                const draggingItem = this.getItem(
                    this.draggingItemKey,
                    this.localList
                )

                const overIdx = this.localList.indexOf(overItem)
                const draggingItemIdx = this.localList.indexOf(draggingItem)

                // swap two items
                ;[this.localList[draggingItemIdx], this.localList[overIdx]] = [
                    this.localList[overIdx],
                    this.localList[draggingItemIdx],
                ]
            }
        },
        leave(e) {
            this.overItemKey = null
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

            this.overItemKey = null
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
