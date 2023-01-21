import fs from 'fs';
import CleanCSS from 'clean-css';
import minifyHTML from 'html-minifier';

export default function injectInnerHTML() {
    return {
        name: 'injectInnerHTML',
        transform(code, id) {
            if (code.indexOf('@injectHTML') > -1) {
                const htmlFile = id.replace('.js', '.html');
                const cssFile = id.replace('.js', '.css');
                const html = fs.readFileSync(htmlFile, 'utf8');
                const minifiedHTML = minifyHTML.minify(html, {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true
                });
                const css = fs.readFileSync(cssFile, 'utf8');
                const minifiedCss = new CleanCSS({ level: { 2: { all: true } } }).minify(css);
                if (minifiedCss.errors && minifiedCss.errors.length > 0) {
                    console.error(minifiedCss.errors);
                }
                if (minifiedCss.warnings && minifiedCss.warnings.length > 0) {
                    console.warn(minifiedCss.warnings);
                }

                const styles = `<style>${minifiedCss.styles}</style>`;

                code = code.replace('super();', `super();const el = document.createElement('template');el.innerHTML = \`<style>${minifiedCss.styles}</style>${minifiedHTML}\`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));`);
            }

            return {
                code: code,
                map: null
            };
        }
    };
}
