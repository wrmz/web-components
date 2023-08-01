import fs from 'fs';
import CleanCSS from 'clean-css';
import minifyHTML from 'html-minifier';

export default function injectInnerHTML() {
    return {
        name: 'injectInnerHTML',
        transform(code, id) {
            if (code.indexOf('@injectHTML') > -1) {
                let codeBlock = '';
                let html = '';
                let css = '';

                try {
                    const cssFile = id.replace('.js', '.css');
                    css = fs.readFileSync(cssFile, 'utf8');
                } catch (err) {
                    console.warn(`${id} does not have a CSS file.`);
                }

                try {
                    const htmlFile = id.replace('.js', '.html');
                    html = fs.readFileSync(htmlFile, 'utf8');
                } catch (err) {
                    console.warn(`${id} does not have an HTML template.`);
                }

                if (css) {
                    const minifiedCss = new CleanCSS({ level: { 2: { all: true } } }).minify(css);
                    if (minifiedCss.errors && minifiedCss.errors.length > 0) {
                        console.error(minifiedCss.errors);
                    }
                    if (minifiedCss.warnings && minifiedCss.warnings.length > 0) {
                        console.warn(minifiedCss.warnings);
                    }
                    codeBlock = `${codeBlock}<style>${minifiedCss.styles}</style>`;
                }


                if (html) {
                    const minifiedHTML = minifyHTML.minify(html, {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true
                    });
                    codeBlock = `${codeBlock}${minifiedHTML}`;
                }

                code = code.replace('super();',  `super();const el=document.createElement('template');el.innerHTML=\`${codeBlock}\`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));`);
            }

            return {
                code: code,
                map: null
            };
        }
    };
}
