<script>
import UIkit from "uikit"
import Icons from "uikit/dist/js/uikit-icons"
import DDraggable from "@/components/DDraggable/DDraggable"
import DropZone from "@/components/DropZone"
UIkit.use(Icons)
export default {
    name: "App",
    components: { DropZone, DDraggable },
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
        addItem() {
            this.items.push({
                text: `New item ${this.items.length}`,
                id: Math.random(),
            })
        },
        addVItem() {
            this.vItems.push({
                text: `New vItem ${this.vItems.length}`,
                id: Math.random(),
            })
        },
        handleSelectDrop(item) {
            const text = typeof item === "string" ? item : item.text || ""
            this.selection.push(text)
        },
    },
}
</script>

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
        <div class="uk-flex uk-flex-column uk-flex-middle">
            <d-draggable
                v-model="items"
                item-key="id"
                tag="transition-group"
                ghost-class="ghost"
                over-class="over"
                effect="move"
                drop-from
                handle=".handle"
                :component-options="{
                    props: {
                        tag: 'div',
                        name: 'fade-move',
                    },
                }"
            >
                <template #item="{ item }">
                    <div
                        class="
                            item
                            uk-margin-top
                            uk-text-center
                            uk-padding-small
                            uk-flex
                            uk-flex-middle
                        "
                    >
                        {{ item.text }}
                        <a class="handle uk-margin-left" uk-icon="table" />
                    </div>
                </template>
            </d-draggable>
            <a
                uk-icon="icon: plus; ratio: 0.8"
                class="uk-margin-top"
                @click="addItem"
            />
        </div>
        <div class="uk-flex uk-flex-column uk-flex-middle">
            <d-draggable
                v-model="vItems"
                item-key="id"
                tag="v-virtual-scroll"
                ghost-class="ghost"
                over-class="over"
                :component-options="{
                    props: {
                        height: 400,
                        width: 200,
                        itemHeight: 76,
                    },
                }"
                drop-from
            >
                <template #item="{ item }">
                    <div
                        class="
                            item
                            uk-margin-top uk-text-center uk-padding-small
                        "
                    >
                        {{ item.text }}
                    </div>
                </template>
            </d-draggable>
            <a
                uk-icon="icon: plus; ratio: 0.8"
                class="uk-margin-top"
                @click="addVItem"
            />
        </div>
        <div>
            <drop-zone @drop="handleSelectDrop">
                <select class="uk-select uk-margin-left" v-model="selected">
                    <option v-for="item of selection" :key="item" :value="item">
                        {{ item }}
                    </option>
                </select>
            </drop-zone>
        </div>
    </div>
</template>

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

.v-virtual-scroll {
    flex: initial;
}

.item {
    border: 1px solid #f5f5f5;
    background-color: white;

    &.ghost {
        opacity: 0.4;
        background-color: rgba(169, 188, 234, 0.82);
    }
}
</style>
