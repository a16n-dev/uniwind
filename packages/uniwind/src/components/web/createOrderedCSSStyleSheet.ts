// @ts-expect-error - Importing internal react-native-web module
import originalCreateOrderedCSSStyleSheet from 'react-native-web/dist/exports/StyleSheet/dom/createOrderedCSSStyleSheet'

type CSSStyleSheet = {
    cssRules: CSSRuleList
    insertRule: (rule: string, index: number) => number
}

type OrderedCSSStyleSheet = {
    getTextContent: () => string
    insert: (cssText: string, groupValue: number) => void
}

/**
 * Wraps a CSS rule in @layer rnw if it starts with .css-
 * This ensures react-native-web default styles have lower specificity than Tailwind styles
 */
const wrapInLayer = (cssText: string): string => {
    const trimmed = cssText.trim()

    // Only wrap rules that start with .css- (react-native-web generated classes)
    if (/^(\.css|[a-z])/.test(trimmed)) {
        return `@layer rnw.${hashString(trimmed)} {${trimmed}}`
    }

    return cssText
}

/**
 * Custom createOrderedCSSStyleSheet that wraps .css- rules in @layer rnw
 * This ensures proper CSS cascade ordering with Tailwind styles
 */
const createOrderedCSSStyleSheet = (sheet: CSSStyleSheet | null): OrderedCSSStyleSheet => {
    const original = originalCreateOrderedCSSStyleSheet(sheet) as OrderedCSSStyleSheet

    return {
        getTextContent: () => {
            return original.getTextContent()
        },
        insert: (cssText: string, groupValue: number) => {
            // Wrap .css- rules in @layer rnw before insertion
            const wrappedCssText = wrapInLayer(cssText)

            original.insert(wrappedCssText, groupValue)
        },
    }
}

const hashString = (text: string) => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i)
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + char
        // eslint-disable-next-line no-bitwise
        hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash)
}

export default createOrderedCSSStyleSheet

export { createOrderedCSSStyleSheet }
