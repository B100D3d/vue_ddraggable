<script>
import { parseJSON } from "@/utils"
import { prevent } from "@/components/DDraggable/utils"

export default {
    name: "DropZone",
    render(h) {
        this.$slots.default.forEach((node) => {
            if (!node.data) node.data = {}
            const nodeListeners = node.data.on || {}
            node.data.on = {
                ...nodeListeners,
                dragover: this.dragover,
                drop: this.drop,
            }
        })

        return this.$slots.default
    },
    methods: {
        drop(e) {
            const item = parseJSON(e.dataTransfer.getData("item"), null)
            this.$emit("drop", item)
        },
        dragover(e) {
            return prevent(e)
        },
    },
}
</script>
