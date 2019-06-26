

var categories = [
    {
        category: "World Locations",
        topics: [
            "China",
            "America"
        ]
    }
];

module.exports = {
    getRandomCategory: function() {
        var randN = parseInt(categories.length*Math.random());

        var a = [];
        for (var i = 0; i < categories[randN].topics.length; i++) {
            a.push(i);
        }
        for (var i = 0; i < a.length; i++) {
            var j = a[i];
            var n = parseInt(Math.random()*a.length);
            a[i] = a[n];
            a[n] = j;
        }

        return {
            category: categories[randN].category,
            topic: categories[randN].topics[a.pop()],
            fakeTopic: categories[randN].topics[a.pop()]
        };
    },
    getCategory: function(cat) {

        var nN = 0;
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].category == cat) {
                nN = i;
                break;
            }
        }
        var a = [];
        for (var i = 0; i < categories[nN].topics.length; i++) {
            a.push(i);
        }
        for (var i = 0; i < a.length; i++) {
            var j = a[i];
            var n = parseInt(Math.random()*a.length);
            a[i] = a[n];
            a[n] = j;
        }

        return {
            category: categories[nN].category,
            topic: categories[nN].topics[a.pop()],
            fakeTopic: categories[nN].topics[a.pop()]
        };
    }
};