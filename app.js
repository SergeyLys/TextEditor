function getMockText () {
    return new Promise(function (resolve, reject){
        resolve("A year ago I was in the audience at a gathering of designers in San Francisco. There were four designers on stage, and two of them worked for me. I was there to support them. The topic of design responsibility came up, possibly brought up by one of my designers, I honestly don’t remember the details. What I do remember is that at some point in the discussion I raised my hand and suggested, to this group of designers, that modern design problems were very complex. And we ought to need a license to solve them.");
    })
}

class Editor {
    constructor(editorContainer) {
        this.holder = editorContainer;

        this.selected = null;

        if (this.holder) {
            this.makeEditable(this.holder);
            this.addEventListeners();
        }

        this.debouncedWrapTyped = _.debounce(this.wrapTyped, 100);
    }

    addEventListeners() {
        this.holder.addEventListener('keyup', ({target}) => {
            if (target.innerText) this.debouncedWrapTyped(target, true);
        });
        this.holder.addEventListener('dblclick', ({target}) => {
            const isWrapper = target.parentElement === this.holder;

            if (this.selected) {
                this.selected.classList.remove('selected');
            }

            this.selected = !isWrapper ? target.parentElement : target;
            this.selected.classList.add('selected');
        });
    }

    attachControl(controlsContainer) {
        controlsContainer.addEventListener('click', ({target}) => {
                if (this.selected && target.hasAttribute('data-formatType')) {
                    const formatType = target.getAttribute('data-formatType');
                    const text = this.selected.innerHTML;
                    const children = Array.from(this.selected.children);
                    const isChildrenExists = children.length > 0;

                    switch (formatType) {
                        case 'bold': {
                            this.selected.innerHTML = isChildrenExists ? this.selected.innerHTML : `<span class="bold">${text}</span>`;
                            if (isChildrenExists) {
                                this.selected.children[0].classList.contains('bold')
                                ? this.selected.children[0].classList.remove('bold')
                                : this.selected.children[0].classList.add('bold');
                            }
                        }
                            break;
                        case 'italic': {
                            this.selected.innerHTML = isChildrenExists ? this.selected.innerHTML : `<span class="italic">${text}</span>`;
                            if (isChildrenExists) {
                                this.selected.children[0].classList.contains('italic')
                                ? this.selected.children[0].classList.remove('italic')
                                : this.selected.children[0].classList.add('italic');
                            }
                        }
                            break;
                        case 'underline': {
                            this.selected.innerHTML = isChildrenExists ? this.selected.innerHTML : `<span class="underline">${text}</span>`;
                            if (isChildrenExists) {
                                this.selected.children[0].classList.contains('underline')
                                ? this.selected.children[0].classList.remove('underline')
                                : this.selected.children[0].classList.add('underline');
                            }
                        }
                            break;
                    }
                }
            });
    }

    makeEditable(element) {
        element.setAttribute('contenteditable', true);
        element.style.outline = 'none';
    }

    wrapToSpan(word) {
        return word.split(' ').map((w) => `<span>${w}</span>`).join(' ');
    }

    splitStringByElements(text) {
        if (_.isString(text)) {
            return this.wrapToSpan(text);
        }

        if (_.isArray(text)) {
            const reg = />(.*)</;

            return text.map((word) => {
                const betweenTags = word.match(reg);

                if (betweenTags) {
                    const splitted = betweenTags[1].split(' ');
                    const edited = splitted.splice(0, 1).join();
                    const rest = splitted.map((w) => `<span>${w}</span>`).join(' ');

                    return [ `<span>${word.replace(reg, `>${edited}<` )}</span>`, rest ].join(' ');
                }

                return this.wrapToSpan(word);
            }).join(' ');
        }
    }

    wrapTyped(target, moveCursorToEnd) {
        const string = Array.from(target.children).map((word) => `${word.innerHTML}`);
        console.log(this.splitStringByElements(string));
        target.innerHTML = this.splitStringByElements(string);

        if (moveCursorToEnd) {
            const children = Array.from(target.children);
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(children[children.length - 1], 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    async applyText(text) {
        if (_.isString(text)) {
            this.holder.innerHTML = this.splitStringByElements(text);
        }

        if (text instanceof Promise) {
            try {
                const data = await text;
                this.holder.innerHTML = await this.splitStringByElements(data);
            } catch ({message}) {
                throw message
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const holder = document.getElementById('file');
    const controls = document.getElementById('format-actions');
    const editor = new Editor(holder);
    editor.applyText(getMockText());
    editor.attachControl(controls);
});