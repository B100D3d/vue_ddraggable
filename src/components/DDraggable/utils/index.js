import { pickBy } from "lodash"

export const parseJSON = (str, defaultValue) => {
    try {
        return JSON.parse(str)
    } catch (e) {
        console.error(e)
        return defaultValue
    }
}

export const prevent = (e) => {
    e.stopPropagation()
    e.preventDefault()
    return false
}

export const EFFECTS = {
    MOVE: "move",
    COPY: "copy",
}

/**
 * returns object without fields with names from keys array
 */
export const except = (object, keys) =>
    pickBy(object, (_, key) => !keys.includes(key))
