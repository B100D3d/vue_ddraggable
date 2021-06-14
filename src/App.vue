<template>
    <div
        class="
            uk-width-1-1
            uk-height-1-1
            uk-padding-large
            uk-grid
            uk-position-relative
        "
        uk-grid
    >
        <div class="uk-position-top-right uk-margin-top uk-margin-right">
            <button uk-icon="move" class="uk-icon-button" @click="open" />
        </div>

        <div>
            <d-draggable
                v-model="items"
                item-key="id"
                tag="div"
                child-tag="div"
                :child-props="{ class: 'uk-margin-top' }"
                ghost-class="ghost"
                over-class="over"
                effect="copy"
                group="items"
                drop-from
            >
                <template #item="{ item }">
                    {{ item.text }}
                </template>
            </d-draggable>
        </div>
        <div>
            <d-draggable
                v-model="vItems"
                item-key="id"
                tag="div"
                child-tag="div"
                :child-props="{ class: 'uk-margin-top' }"
                class="uk-margin-left"
                ghost-class="ghost"
                over-class="over"
                effect="copy"
                group="items"
                drop-from
                virtual-scroll
                :virtual-scroll-props="{
                    height: 400,
                    width: 100,
                    itemHeight: 44,
                }"
            >
                <template #item="{ item }">
                    {{ item.text }}
                </template>
            </d-draggable>
        </div>
        <div>
            <select
                class="uk-select uk-margin-left"
                v-model="selected"
                @drop="handleSelectDrop"
                @dragover.stop.prevent="dragover"
            >
                <option v-for="item of selection" :key="item" :value="item">
                    {{ item }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
import UIkit from "uikit"
import Icons from "uikit/dist/js/uikit-icons"
import DDraggable from "@/components/DDraggable/DDraggable"
import { parseJSON } from "@/utils"
UIkit.use(Icons)
export default {
    name: "App",
    components: { DDraggable },
    data() {
        return {
            items: [
                { text: "First", id: Math.random() },
                { text: "Second", id: Math.random() },
                { text: "Third", id: Math.random() },
            ],
            vItems: [
                { text: "First", id: Math.random() },
                { text: "Second", id: Math.random() },
                { text: "Third", id: Math.random() },
            ],
            selected: "1",
            selection: ["1", "2", "3"],
        }
    },

    methods: {
        open() {
            window.open("/", "_blank")
        },
        handleSelectDrop(e) {
            const item = parseJSON(e.dataTransfer.getData("item"), "")
            const text = typeof item === "string" ? item : item.text || ""
            this.selection.push(text)
        },
        dragover(e) {
            return false
        },
    },
}
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap");

@import "./styles/variables";
@import "styles/light-theme";
@import "./styles/functions";
@import "./styles/animations";

@import "../node_modules/uikit/src/scss/variables-theme.scss";
@import "../node_modules/uikit/src/scss/mixins-theme.scss";
@import "../node_modules/uikit/src/scss/uikit-theme.scss";
@import "../node_modules/uikit/src/scss/variables.scss";

@import "./styles/globals";

html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, Roboto, serif;
    font-weight: 400;
    text-rendering: optimizeLegibility;
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5rem;

    @media screen and (max-width: $screen-s) {
        font-size: 14px;
    }
}

#app {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;

    * {
        font-family: -apple-system, BlinkMacSystemFont, Roboto, serif;
    }
}

.ghost {
    border: 1px dashed #666;
    opacity: 0.4;
}

.over {
    border: 1px dashed #666;
}
</style>
