window.MarkdownEditor = class {
  HEADING_PREFIX = ['# ', '## ', '### ', '#### ', '##### ', '###### '];

  pullFromCache() {
    return localStorage.getItem('MDE') || '';
  }

  pushToCache(content) {
    localStorage.setItem('MDE', content);
  }

  setContent(content) {
    this.$editor.value = content;
    this.render();
  }

  renderInlineContent(line) {
    line = line.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
    line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    line = line.replace(/\*(.*?)\*/g, '<i>$1</i>');
    line = line.replace(/\~\~(.*?)\~\~/g, '<strike>$1</strike>');
    line = line.replace(/\`(.*?)\`/g, '<code>$1</code>');
    line = line.replace(/\$(.*?)\$/g, '<katex-inline>$1</katex-inline>');

    if (line.startsWith('[ ] ')) {
      line = '<input type="checkbox" disabled> ' + line.slice(4);
    }
    if (line.startsWith('[x] ')) {
      line = '<input type="checkbox" checked disabled> ' + line.slice(4);
    }

    return line;
  }

  renderContent(lines) {
    const result = [];

    for (let i = 0, j = 0; i < lines.length; i = j + 1, j = i) {
      const line = lines[i];

      let flag = false;
      for (let k = 0; k < 6; k++)
        if (line.startsWith(this.HEADING_PREFIX[k])) {
          result.push({
            tag: 'h' + (k + 1),
            text: this.renderInlineContent(line.slice(k + 2)),
          });
          flag = true;
          break;
        }
      if (flag) continue;

      if (line.startsWith('> ')) {
        while (j + 1 < lines.length && lines[j + 1].startsWith('> ')) ++j;
        const copied = JSON.parse(JSON.stringify(lines.slice(i, j + 1)));
        for (let k = 0; k < copied.length; k++) {
          copied[k] = copied[k].slice(2);
        }
        result.push({
          tag: 'blockquote',
          children: this.renderContent(copied),
        });
        continue;
      }

      if (line.startsWith('$$')) {
        while (j + 1 < lines.length && !lines[j + 1].startsWith('$$')) ++j;
        if (j + 1 == lines.length) {
          j = i;
        } else {
          ++j;
          result.push({
            tag: 'katex',
            text: lines.slice(i + 1, j).join('\n'),
          });
        }
        continue;
      }

      if (line.startsWith('```')) {
        while (j + 1 < lines.length && !lines[j + 1].startsWith('```')) ++j;
        if (j + 1 == lines.length) {
          j = i;
        } else {
          ++j;
          result.push({
            tag: 'pre',
            children: [
              {
                tag: 'code',
                text: lines
                  .slice(i + 1, j)
                  .join('\n')
                  .replace(/\"/g, '&quot;')
                  .replace(/\&/g, '&amp;')
                  .replace(/\</g, '&lt;')
                  .replace(/\>/g, '&gt;'),
              },
            ],
          });
        }
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        const isList = (line) => {
          let count = 1;
          while (line.startsWith('  ')) {
            line = line.slice(2);
            count++;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return count;
          } else {
            return -1;
          }
        };
        const cached = [
          {
            level: 1,
            lines: [line],
          },
        ];
        while (j + 1 < lines.length) {
          let level = isList(lines[j + 1]);
          if (level != -1) {
            j++;
            cached.push({
              level,
              lines: [lines[j]],
            });
          } else {
            let followed = true;
            const level = cached[cached.length - 1].level;
            for (let k = 0; k < level; k++) {
              if (lines[j + 1][k * 2] != ' ' || lines[j + 1][k * 2 + 1] != ' ') {
                followed = false;
                break;
              }
            }
            if (followed) {
              j++;
              cached[cached.length - 1].lines.push(lines[j]);
            } else {
              break;
            }
          }
        }
        for (const cacheBlock of cached) {
          const level = isList(cacheBlock.lines[0]);
          for (let k = 0; k < cacheBlock.lines.length; k++) {
            cacheBlock.lines[k] = cacheBlock.lines[k].slice(level * 2);
          }
          cacheBlock.text = this.renderInlineContent(cacheBlock.lines.join('<br>'));
        }
        console.log(cached);
        function solve(l, r, level) {
          const result = {
            tag: 'ul',
            children: [],
          };
          for (let ll = l, rr = l; ll <= r; ll = rr + 1, rr = ll) {
            while (rr + 1 <= r && cached[rr + 1].level > level) ++rr;
            result.children.push({
              tag: 'li',
              text: cached[ll].text,
            });
            if (ll < rr) {
              result.children[result.children.length - 1].children = [solve(ll + 1, rr, level + 1)];
            }
          }
          return result;
        }
        result.push(solve(0, cached.length - 1, 1));
        continue;
      }

      if (line) {
        result.push({
          tag: 'p',
          text: this.renderInlineContent(line),
        });
      } else {
        result.push({
          tag: 'blank-line',
        });
      }
    }

    const finalResult = [];
    for (let l = 0, r = 0; l < result.length; l = r + 1, r = l) {
      if (result[l].tag == 'blank-line') {
        continue;
      }
      if (result[l].tag == 'p') {
        while (r + 1 < result.length && result[r + 1].tag == 'p') {
          ++r;
        }
        for (let i = l + 1; i <= r; i++) {
          result[l].text += '<br>';
          result[l].text += result[i].text;
        }
      }
      finalResult.push(result[l]);
    }

    return finalResult;
  }

  renderDOM($root, vdomtree) {
    let result = '';
    function walk(vnode) {
      if (vnode instanceof Array) {
        for (const single of vnode) {
          walk(single);
        }
      } else {
        result += '<' + vnode.tag + '>';
        if (vnode.text) {
          result += vnode.text;
        }
        if (vnode.children) {
          walk(vnode.children);
        }
        result += '</' + vnode.tag + '>';
      }
    }
    walk(vdomtree);
    console.log('result:', result);
    $root.innerHTML = result;

    if (window.katex) {
      for (const $e of $root.getElementsByTagName('katex-inline')) {
        katex.render($e.innerText, $e, { displayMode: false, throwOnError: false });
      }
      for (const $e of $root.getElementsByTagName('katex')) {
        katex.render($e.innerText, $e, { displayMode: true, throwOnError: false });
      }
    }
  }

  render() {
    console.log('render entrace', this._Rendering, this._NeedRender, this._RenderPromise);
    if (this.$editor === null || this.$preview === null) {
      throw new Error('Markdown Editor is not installed.');
    }
    if (this._Rendering) {
      this._NeedRender = true;
      return this._RenderPromise;
    }

    this._Rendering = true;
    return (this._RenderPromise = new Promise((resolve) => {
      console.log('render loop', this._Rendering, this._NeedRender, this._RenderPromise);
      do {
        this._NeedRender = false;
        const content = this.$editor.value;
        this.pushToCache(content);
        const vdomtree = this.renderContent(content.split('\n'));
        console.log('vdomtree:', vdomtree);
        this.renderDOM(this.$preview, vdomtree);
      } while (this._NeedRender);
      this._Rendering = false;
      console.log('render end loop', this._Rendering, this._NeedRender, this._RenderPromise);
      resolve(this.$preview.innerHTML);
    }));
  }

  install($editor, $preview) {
    this.$editor = $editor;
    this.$preview = $preview;
    this.$editor.addEventListener('input', () => {
      this.render();
    });
    this.$editor.value = this.pullFromCache();
    this.render();
  }

  async getHTML() {
    await this.render();
    let html = '';
    html += '<div class="mdui-typo">';
    html += this.$preview.innerHTML;
    html += '</div>';
    html += '<style>';
    html += 'html, body { margin: 0 !important; padding: 0 !important; }';
    html += '@page { size: A4; margin: 5em; }';
    html += '</style>';
    html += '<link rel="stylesheet" href="https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css"/>';
    html += '<link href="https://cdn.bootcss.com/KaTeX/0.10.1/katex.min.css" rel="stylesheet"/>';
    return html;
  }

  async exportToHTML() {
    const blob = new Blob([await this.getHTML()], { type: 'text/html;charset=utf-8' });

    const fileName = `export.html`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(link.href);
  }

  async exportToPdf() {
    const blob = new Blob([await this.getHTML()], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const $iframe = document.createElement('iframe');
    $iframe.style.display = 'none';
    $iframe.src = blobUrl;
    document.body.appendChild($iframe);

    $iframe.onload = () => {
      setTimeout(() => {
        $iframe.focus();
        $iframe.contentWindow.print();
      }, 1);
    };
  }

  constructor() {
    this.$editor = null;
    this.$preview = null;
  }
};

window.MDE = new window.MarkdownEditor();
