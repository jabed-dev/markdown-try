(async function () {
    let input = document.getElementById('input');

    async function getSnippets(url) {
        return (await fetch(url)).json();
    };

    let snippets = await getSnippets(`/snippets/html_snippets.json`);
    Object.assign(snippets, await getSnippets(`/snippets/lorem.json`), await getSnippets('/snippets/markdown_snippets.json'));

    input.addEventListener('input', createAutocompleteList);
    input.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.keyCode === 32) {
            createAutocompleteList.call(this, event);
        }
    });
    let currentFocus, active = false;

    async function createAutocompleteList(event) {
        try {
            event.preventDefault();
            closeList();

            let caretStart = this.selectionStart - 1;
            while (caretStart >= 0) {
                if (!this.value[caretStart].match(/<|\w|!|#|\(|\[|{|\^|`|~|-|=|\*|\+|\||>/g)) break;
                caretStart--;
            }

            let typeValue = this.value.substring(++caretStart, this.selectionStart);
            let lessThan = '';
            if (typeValue[0] === '<') {
                typeValue = typeValue.replace('<', '');
                lessThan = '<';
            }
            if (!typeValue) return;
            currentFocus = 0;

            let autocompleteList = document.createElement('div');
            autocompleteList.setAttribute('id', 'autocomplete-list');
            autocompleteList.setAttribute('class', 'autocomplete-items');
            let matchList = false, loremNum = '';
            if (typeValue.match(/lorem\d*/g)) {
                loremNum = typeValue.match(/(?<=lorem)\d+/g);
                snippets.lorem.prefix = `lorem${loremNum ? loremNum : ''}`;
                loremNum = loremNum ? +loremNum > 1000 ? 1000 : +loremNum : 31;
            }

            typeValueRx = typeValue.replace(/(\()|(\[)|(\^)|(\+)|(\*)|(\|)/g, (str) => '\\' + str);

            for (let snippe in snippets) {
                let regex = new RegExp(`^${typeValueRx}`, 'gi')
                    , matchValue = snippets[snippe].prefix.match(regex);
                if (matchValue) {
                    let listItem = document.createElement('div');
                    listItem.innerHTML = `<strong class="match-value">${matchValue.join('')
                        .replace(/(\<)|(\>)/g, (str, g1, g2) => g1 ? '&lt;' : g2 ? '&gt;' : '')}</strong>`;
                    listItem.innerHTML += snippets[snippe].prefix.substr(typeValue.length)
                        .replace(/(\<)|(\>)/g, (str, g1, g2) => g1 ? '&lt;' : g2 ? '&gt;' : '');

                    listItem.addEventListener('click', () => {
                        let tag = snippets[snippe].body.split(`${typeValue.match(/^lorem\d*/g) ? ' ' : '$'}`);

                        let lorem = '';
                        if (loremNum) {
                            for (let i = 0; i < loremNum; i++) {
                                lorem += (tag[i] + ' ');
                            }
                            lorem = lorem.trim();
                            if (lorem) {
                                tag[0] = lorem;
                                tag[1] = '';
                            }
                        }

                        typeInTextarea(this, lessThan + typeValue, tag[0], tag[1] ? tag[1] : '');
                        closeList(false);
                    });
                    autocompleteList?.appendChild(listItem);
                    matchList = true;
                }
            }
            if (matchList) {
                autocompleteList.children[0]?.classList.add('autocomplete-active');
                this.parentNode.appendChild(autocompleteList);
                autocompleteListPosition(autocompleteList);
                active = true;
            }
        } catch (err) {
            return 0;
        }
    }

    function typeInTextarea(el, writeText, startTag, endTag) {
        let start = el.selectionStart - writeText.length
            , end = el.selectionEnd - writeText.length
            , text = el.value
            , before = text.substring(0, start)
            , after = text.substring(end + writeText.length, text.length);
        el.value = (before + startTag + endTag + after);
        el.selectionStart = el.selectionEnd = start + startTag.length;
        el.focus();
    }

    input.addEventListener('keydown', function (event) {
        let list = document.getElementById('autocomplete-list');
        if (list) {
            list = list.getElementsByTagName('div');
        } else {
            return;
        }

        if (event.keyCode === 40) {
            event.preventDefault();
            currentFocus++;
            addActive(list, 1);
        } else if (event.keyCode === 38) {
            event.preventDefault();
            currentFocus--;
            addActive(list, -1);
        } else if (event.keyCode === 13) {
            event.preventDefault();
            if (currentFocus > -1) {
                list[currentFocus].click();
            }
        }
    });

    function addActive(list, n) {
        if (active) list[currentFocus - n].classList.remove('autocomplete-active');
        if (currentFocus < 0) currentFocus = list.length - 1;
        if (currentFocus >= list.length) currentFocus = 0;
        list[currentFocus].classList.add('autocomplete-active');
        active = true;
    }

    function closeList() {
        let listItems = document.getElementById('autocomplete-list');
        if (listItems) {
            listItems.parentNode.removeChild(listItems);
            active = false;
        }
    }

    document.addEventListener('click', (event) => {
        closeList(event.target);
    });



    (function () {
        let properties = [
            'direction',
            'boxSizing',
            'width',
            'height',
            'overflowX',
            'overflowY',
            'borderTopWidth',
            'borderRightWidth',
            'borderBottomWidth',
            'borderLeftWidth',
            'borderStyle',
            'paddingTop',
            'paddingRight',
            'paddingBottom',
            'paddingLeft',
            'fontStyle',
            'fontVariant',
            'fontWeight',
            'fontStretch',
            'fontSize',
            'fontSizeAdjust',
            'lineHeight',
            'fontFamily',
            'textAlign',
            'textTransform',
            'textIndent',
            'textDecoration',
            'letterSpacing',
            'wordSpacing',
            'tabSize',
            'MozTabSize'
        ];

        let isBrowser = (typeof window !== 'undefined');
        let isFirefox = (isBrowser && window.mozInnerScreenX != null);

        function getCaretCoordinates(element, position, options) {
            if (!isBrowser) {
                throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
            }

            let debug = options && options.debug || false;
            if (debug) {
                let el = document.querySelector('#input-textarea-caret-position-mirror-div');
                if (el) el.parentNode.removeChild(el);
            }

            let div = document.createElement('div');
            div.id = 'input-textarea-caret-position-mirror-div';
            document.body.appendChild(div);

            let style = div.style;
            let computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9
            let isInput = element.nodeName === 'INPUT';

            style.whiteSpace = 'pre-wrap';
            if (!isInput)
                style.wordWrap = 'break-word';

            style.position = 'absolute';
            if (!debug)
                style.visibility = 'hidden';

            properties.forEach(function (prop) {
                if (isInput && prop === 'lineHeight') {
                    if (computed.boxSizing === "border-box") {
                        let height = parseInt(computed.height);
                        let outerHeight =
                            parseInt(computed.paddingTop) +
                            parseInt(computed.paddingBottom) +
                            parseInt(computed.borderTopWidth) +
                            parseInt(computed.borderBottomWidth);
                        let targetHeight = outerHeight + parseInt(computed.lineHeight);
                        if (height > targetHeight) {
                            style.lineHeight = height - outerHeight + "px";
                        } else if (height === targetHeight) {
                            style.lineHeight = computed.lineHeight;
                        } else {
                            style.lineHeight = 0;
                        }
                    } else {
                        style.lineHeight = computed.height;
                    }
                } else {
                    style[prop] = computed[prop];
                }
            });
            if (isFirefox) {
                if (element.scrollHeight > parseInt(computed.height))
                    style.overflowY = 'scroll';
            } else {
                style.overflow = 'hidden';
            }

            div.textContent = element.value.substring(0, position);
            if (isInput)
                div.textContent = div.textContent.replace(/\s/g, '\u00a0');
            let span = document.createElement('span');
            span.textContent = element.value.substring(position) || '.';
            div.appendChild(span);

            let coordinates = {
                top: span.offsetTop + parseInt(computed['borderTopWidth']),
                left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
                height: parseInt(computed['lineHeight'] === 'normal' ? '16px' : computed['lineHeight'])
            };

            if (debug) {
                span.style.backgroundColor = '#aaa';
            } else {
                document.body.removeChild(div);
            }

            return coordinates;
        }

        if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
            module.exports = getCaretCoordinates;
        } else if (isBrowser) {
            window.getCaretCoordinates = getCaretCoordinates;
        }

    })();



    function autocompleteListPosition(list) {
        let element = input;

        let rect = document.createElement('div');
        document.body.appendChild(rect);
        rect.style.position = 'absolute';
        rect.style.backgroundColor = 'transparent';
        rect.style.height = '20px';
        rect.style.width = '1px';
        ['keyup', 'click', 'scroll'].forEach(function (event) {
            element.addEventListener(event, update);
        });

        function update() {
            var coordinates = getCaretCoordinates(element, element.selectionEnd, { debug: false });
            rect.style.top = element.offsetTop
                - element.scrollTop
                + coordinates.top
                + 'px';
            rect.style.left = element.offsetLeft
                - element.scrollLeft
                + coordinates.left
                + 'px';

            list.style.top = element.offsetTop
                - element.scrollTop
                + coordinates.top
                + coordinates.height
                + 'px';

            let listLeft = element.offsetLeft - element.scrollLeft + coordinates.left;
            let elementRight = element.offsetWidth + element.offsetLeft - 5;
            if (elementRight < listLeft + list.offsetWidth) {
                listLeft = listLeft - ((listLeft + list.offsetWidth) - elementRight);
            }
            list.style.left = listLeft + 'px';
            list.style.opacity = 1;
        }
    }

})();

