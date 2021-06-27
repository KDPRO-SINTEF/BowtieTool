class prefixTree {
    constructor() {
        this.prefixTree = null;
        this.suggestions = [];
    }

    newNode() {
        return {
            isLeaf: false,
            children: {}
        }
    }

    add(word) {
        if (!this.prefixTree) this.prefixTree = this.newNode();

        let root = this.prefixTree;
        for (const letter of word) {
            if (!(letter in root.children)) {
                root.children[letter] = this.newNode();
            }
            root = root.children[letter];
        }
        root.isLeaf = true;
    }

    find(word) {
        let root = this.prefixTree;
        for (const letter of word) {
            if (letter in root.children) {
                root = root.children[letter];
            } else {
                return null;
            }
        }

        return root;
    }

    traverse(root, word) {
        if (root.isLeaf) {
            this.suggestions.push(word);
            return;
        }

        for (const letter in root.children) {
            this.traverse(root.children[letter], word + letter);
        }
    }

    complete(word, CHILDREN = null) {
        const root = this.find(word);

        if (!root) return this.suggestions; // cannot suggest anything

        const children = root.children;

        let spread = 0;

        for (const letter in children) {
            this.traverse(children[letter], word + letter);
            spread++;

            if (CHILDREN && spread === CHILDREN) break;
        }

        return this.suggestions;
    }

    clear() {
        this.suggestions = [];
    }

    print() {
        console.log(this.prefixTree);
    }
}

let SearchBarComponent = {

    template: '#search-bar-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        nameInput: String,
        all_diagrams: Array,
        tags_selected: Array,
    },
    data: function () {
        return {
            is_public: 0,
        }
    },
    methods: {
        //My functions
        publicChange: function (value) {
            this.is_public = value
            this.$emit('update_diagrams', ["", this.is_public])
        },
        onInput: function (event) {
            this.query = event.target.value
            this.$emit('change-name', this.query)
            var parts = this.query.split(' ')
            const wordToComplete = parts.pop()
            // const restOfWords = parts.join(' ')
            if (wordToComplete) {
                this.suggestion = this.prefixTree.complete(wordToComplete)[0]
                if (this.suggestion) {
                    // if (this.suggestion.includes(this.nameInput)) {
                    const fakeDiv = document.getElementById("fake-div")
                    fakeDiv.innerText = this.query
                    this.span.style.left = this.r.left + fakeDiv.clientWidth + 'px';
                    const ghostText = this.suggestion.slice(wordToComplete.length)
                    this.prefixTree.clear()
                    this.span.textContent = ghostText

                    // }
                } else {
                    this.span.textContent = ""
                }

            }
        },
        onKey: function (e) {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (this.suggestion) {
                    this.span.textContent = '';
                    this.input.value = this.suggestion;
                    this.$emit('change-name', this.suggestion)
                }
            }
            if (e.key === "Backspace") {
                const length = this.span.textContent.length
                this.span.textContent = this.span.textContent.slice(length, length + 1)
            }
        },
    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func
        prefixTree() {
            const trie = new prefixTree();
            for (const diag of this.all_diagrams) {
                trie.add(diag.name.toLowerCase())
            }
            for (const tag of this.tags_selected) {
                trie.add(tag.toLowerCase())
            }
            return trie
        }
    },
    mounted() {
        this.input = document.getElementById("validationCustom01")
        this.r = this.input.getBoundingClientRect()
        this.span = document.getElementById('ghost')

        const css = getComputedStyle(this.input)

        this.span.style.cssText = `
        width: ${this.r.width}px;
        height: ${this.r.height}px;
        left: ${this.r.left}px;
        top: ${this.r.top}px;
        z-index: -10;
        opacity: 0.4;
        position: absolute;
        white-space: pre-wrap;
        font-size: ${parseInt(css.fontSize)}px;
        padding-left: ${parseInt(css.paddingLeft)}px;
        padding-top: ${parseInt(css.paddingTop) + 1}px;
        `;
    }
}