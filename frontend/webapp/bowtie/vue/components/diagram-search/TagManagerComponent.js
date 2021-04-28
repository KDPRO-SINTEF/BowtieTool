let TagManagerComponent = {

    template: '#tag_manager-template',

    components: {},
    props: { //Link with parent, parent can send data with 'v-bind'. To go from child to parent $emit("param")
        isPublic: Number,
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
            tags = []
            var not_found = true;
            for (const diag of this.all_diagrams) {
                var diagram_tags = JSON.parse(diag.tags)
                for (const tag of diagram_tags) {
                    if (tag !== "") {
                        not_found = true
                        for (const stored_tag of tags) {
                            if (stored_tag.name === tag) {
                                not_found = false
                                // tag was already present, value must simply be incremented
                                stored_tag.occurences += 1
                            }
                        }
                        if (not_found) {
                            tags.push({
                                name: tag,
                                occurences: 1
                            })
                        }
                    }
                }
            }

            return tags
        },
    },
}