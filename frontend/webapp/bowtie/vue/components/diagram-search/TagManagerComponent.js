let TagManagerComponent = {

    template: '#tag_manager-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        isPublic: Boolean,
        nameInput: String,
        all_diagrams: Array,
    },
    data: function () {
        return {
            selected_tags: [],
        }
    },
    methods: {
        onTagCheck: function (tag_name) {
            idx = this.selected_tags.indexOf(tag_name)
            if (idx > -1) {
                // tag was already present, must hence be removed
                this.selected_tags.splice(idx, 1)
            } else {
                this.selected_tags.push(tag_name)
            }
            if (this.selected_tags.length === 0) {
                this.$emit('tags-empty')
            } else {
                this.$emit('tag-change', this.selected_tags)
                console.log(this.selected_tags)
            }
        }
    },
    computed: {
        all_tags: function () {
            // Even though it's definitely how we use it, we cannot create bellow 'tags' as a Map
            // Because it is not well implemented in JS and more importantly not supported by Vue
            tags = [
                {
                    name: "FirstTag",
                    occurences: 1,
                },
                {
                    name: "ScdTag",
                    occurences: 2
                },
            ]
            for (const diag of this.all_diagrams) {
                for (const tag of diag.tags) {
                    if (tag !== "") {
                        for (const stored_tag of tags) {
                            if (stored_tag.name === tag) {
                                // tag was already present, value must simply be incremented
                                stored_tag.occurences += 1
                            } else {
                                tags.push({
                                    name: tag,
                                    occurences: 1
                                })
                            }
                        }
                    }
                }
            }
            return tags
        },
    },
}