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
    if (trimmed.startsWith('.css-')) {
        return `@layer rnw{${trimmed}}`
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
            const textContent = original.getTextContent()

            // Process the text content to wrap .css- rules in @layer rnw
            return textContent
                .split('\n')
                .map(line => {
                    const trimmed = line.trim()

                    if (trimmed.startsWith('.css-')) {
                        return `@layer rnw{${trimmed}}`
                    }

                    return line
                })
                .join('\n')
        },

        insert: (cssText: string, groupValue: number) => {
            // Wrap .css- rules in @layer rnw before insertion
            const wrappedCssText = wrapInLayer(cssText)

            original.insert(wrappedCssText, groupValue)
        },
    }
}

export default createOrderedCSSStyleSheet

export { createOrderedCSSStyleSheet }
