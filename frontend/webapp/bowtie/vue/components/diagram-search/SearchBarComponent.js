
class Trie{
    constructor() {
        this.trie = null;
        this.suggestions = [];
    }
    newNode() {
        return {
            isLeaf: false,
            children: {}
        }
    }

    add(word) {
        if (!this.trie) this.trie = this.newNode();

        let root = this.trie;
        for (const letter of word) {
            if (!(letter in root.children)) {
                root.children[letter] = this.newNode();
            }
            root = root.children[letter];
        }
        root.isLeaf = true;
    }

    find(word) {
        let root = this.trie;
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
        console.log(this.trie);
    }
}
let SearchBarComponent = {

    template: '#search-bar-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        nameInput:String,
        all_diagrams:Array,
        tags_selected:Array,
    },
    data: function () {
        return {
            is_public: false,
            trie: new Trie(),
        }
    },
    methods: {
        //My functions
        publicChange: function (value) {
            this.is_public = value
            this.$emit('update_diagrams',["",this.is_public])
        }

    },
    computed: {// Sort of augmented variables. Seen by VueJs as variable but are actually func

    },
    // beforeMount is launched at the creation of the component
    mounted() {
        for(const diag of this.all_diagrams){
            this.trie.add(diag.name.toLowerCase())
            console.log('added'+diag.name)
        }
        for(const tag of this.tags_selected){
            this.trie.add(tag.toLowerCase())
        }

    },

}