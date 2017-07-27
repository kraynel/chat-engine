exports.defineTags = function(dictionary) {
    dictionary.defineTag("ceplugin", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.ceplugin = tag.value;
        }
    });
};
