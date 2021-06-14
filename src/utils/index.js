export const parseJSON = (str, defaultValue) => {
    try {
        return JSON.parse(str)
    } catch (e) {
        console.error(e)
        return defaultValue
    }
}
