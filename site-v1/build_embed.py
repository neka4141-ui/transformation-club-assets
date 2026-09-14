"""Build standalone remote HTML and a scoped GetPlatinum HTML block."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
REVISION = 'c92e880263131e360b2a54b54df253c59f042d8d'
BASE = f'https://raw.githubusercontent.com/neka4141-ui/transformation-club-assets/{REVISION}/site-v1/assets/'


def scope_css(css):
    result = []
    pos = 0
    while pos < len(css):
        start = css.find('{', pos)
        if start < 0:
            result.append(css[pos:])
            break
        header = css[pos:start].strip()
        end, depth = start + 1, 1
        while depth:
            depth += (css[end] == '{') - (css[end] == '}')
            end += 1
        body = css[start + 1:end - 1]
        if header.startswith(('@media', '@supports')):
            body = scope_css(body)
        elif not header.startswith('@'):
            header = ','.join('#tc-embed' if s.strip() in (':root', 'html', 'body')
                              else '#tc-embed ' + s.strip() for s in header.split(','))
        result.append(header + '{' + body + '}')
        pos = end
    return '\n'.join(result)


css = (ROOT / 'assets/styles.css').read_text(encoding='utf-8')
css = re.sub(r"url\('([^']+)'\)", lambda m: "url('" + BASE + m[1] + "')", css)
css = css.replace('Montserrat', 'TCMontserrat').replace('Caveat', 'TCCaveat')
css = css.replace('hero-art-in', 'tc-hero-art-in').replace('hero-copy-in', 'tc-hero-copy-in')
css = scope_css(css)
css += '''
/* Full-width HTML block within GetPlatinum's centered content container. */
#tc-embed{position:relative;left:50%;width:100vw;max-width:none!important;margin:0 0 0 -50vw!important;padding:0!important;overflow:hidden;line-height:normal;text-align:left;box-sizing:border-box;background:#090807;color:#f7f5ed}
#tc-embed main{display:block;margin:0;padding:0;max-width:none}
#tc-embed h1,#tc-embed h2,#tc-embed p{padding:0;border:0}
#tc-embed a{text-decoration:none}
#tc-embed .section{margin-block:0}
*:has(> #tc-embed),*:has(> * > #tc-embed){padding-block:0!important;margin-block:0!important;background:#090807!important}
'''
source = (ROOT / 'index.html').read_text(encoding='utf-8')
body = source.split('<body>', 1)[1].split('</body>', 1)[0]
body = body.replace('src="assets/', 'src="' + BASE)
js = (ROOT / 'assets/app.js').read_text(encoding='utf-8')
js = js.replace("'use strict';", "'use strict';\n  const root = document.getElementById('tc-embed');\n  if (!root || root.dataset.initialized) return;\n  root.dataset.initialized = 'true';")
js = js.replace('document.querySelector', 'root.querySelector')
js = js.replace('const links = window.CLUB_LINKS || {};', '''// Вставьте реальные HTTPS-ссылки здесь. Пустые адреса показывают сообщение.
  const links = { light: '', master: '', personal: '', video: '' };''')
fragment = '<!-- Замените старый HTML-блок целиком этим кодом. -->\n<style>\n' + css + '\n</style>\n<div id="tc-embed">\n' + body + '\n</div>\n<script>\n' + js + '\n</script>\n'
(ROOT / 'getplatinum-embed.html').write_text(fragment, encoding='utf-8')
document = '''<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090807">
<title>Система 3-х шагов — клуб трансформаций</title>
<style>html,body{margin:0;padding:0;background:#090807}html{scroll-behavior:smooth}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style>
</head><body>
''' + fragment + '\n</body></html>\n'
(ROOT / 'index-online.html').write_text(document, encoding='utf-8')
print('Built getplatinum-embed.html and index-online.html; asset revision:', REVISION)
