

var categories = [
    {
        category: "World Locations",
        topics: [
          "America",
          "Australia",
          "Antarctica",
          "Britain",
          "Brazil",
          "Belgium",
          "China",
          "Cuba",
          "Costa Rica",
          "Canada",
          "Egypt",
          "France",
          "Greece",
          "Germany",
          "Italy",
          "Iran",
          "Israel",
          "India",
          "Japan",
          "Taiwan",
          "Mexico",
          "North Korea",
          "Netherlands",
          "Philippines",
          "Poland",
          "South Korea",
          "Russia",
          "Rome",
          "Vietnam",
          "Uganda"
          ]
    },
    {
      category: "Food Locations",
      topics: [
        "Starbucks",
        "Quickly",
        "McDonald's",
        "Burger King",
        "Wendy's",
        "Applebees",
        "In and Out",
        "Shake Shack",
        "Chick-Fil-A",
        "Taco Bell",
        "Sketchy Pho Restaurant ",
        "Subway",
        "Ranch 99",
        "Target",
        "Safeway",
        "KFC",
        "Chipotle",
        "Panda Express",
        "Sushi",
        "Steakhouse",
        "Wing Stop",
        "Olive Garden",
        "Costco",
        "Ramen noodles",
        "Hot Pot",
        "Ice Cream",
        "Taco Truck",
        "Seven Eleven",
        "Red Lobster",
        "Milk Tea",
        ]
    },
    {
      category: "Tourists Attractions",
      topics: [
        "Leaning Tower of Pisa",
        "Eiffel Tower",
        "Statue of Liberty",
        "Golden Gate bridge",
        "Pyramids",
        "Parthenon",
        "Mount Rushmore",
        "Niagara Falls",
        "Half Dome",
        "Hollywood",
        "Grand Canyon",
        "Old Faithful",
        "Hawaii",
        "St. Basil’s Cathedral",
        "Gettysburg",
        "Lincoln Memorial",
        "Roman Colosseum",
        "Tokyo Tower",
        "Mount Fuji",
        "Hong Kong",
        "Amazon Rainforest ",
        "Apple Headquarters",
        "Mount Everest",
        "New York City ",
        "Forbidden City",
        "Alcatraz",
        "Aztec Ruins",
        "Palace of Versailles",
        "Buckingham Palace",
        "Taj Mahal",
        ]
    },
    {
      category: "Movies/Films/Shows",
      topics:[
        "The Wizard of Oz",
        "Bee Movie",
        "Star Wars",
        "Transformers",
        "Mission Impossible",
        "Avengers",
        "Matrix",
        "Spirited Away",
        "My Neighbor Totoro",
        "Tomb Raider",
        "Titanic",
        "Avatar",
        "Jurassic Park",
        "Indiana Jones",
        "Rocky",
        "Fight Club",
        "Get Out",
        "Saving Private Ryan",
        "A Space Odyssey",
        "Star Trek",
        "The Office",
        "La La Land",
        "Toy Story",
        "Finding Nemo",
        "King Kong",
        "Frozen",
        "Godzilla",
        "Mulan",
        "Alice in Wonderland",
        ]
    },
    {
        category: "States",
        topics: [
            "California",
            "Nevada",
            "Oregon",
            "Washington",
            "Idaho",
            "Montana",
            "Arizona",
            "New Mexico",
            "Kansas",
            "Arkansas",
            "Alabama",
            "Texas",
            "Tennessee",
            "Louisiana",
            "Mississippi",
            "North Carolina",
            "South Carolina",
            "New Jersey",
            "New York",
            "Massachusetts",
            "Connecticut",
            "Georgia",
            "Florida",
            "Hawaii",
            "Pennsylvania",
            "Virginia ",
            "Michigan",
            "Minnesota",
            "Ohio",
            "Indiana",
            "Colorado",
            "Illinois",
            "Alaska",
            "Maryland",
            "Missouri",
            "Wisconsin",
            "Utah ",
            "Maine ",
            "Kentucky",
            "Iowa",
            "Oklahoma",
            "Rhode Island",
            "Nebraska",
            "Delaware",
            "Vermont",
            "North Dakota",
            "South Dakota",
            "New Hampshire",
            "West Virginia",
            "Wyoming",
            "Florida",
            "Maryland",
        ]
    }
];

module.exports = {
    getRandomCategory: function(prev) {
        var randN = parseInt(categories.length*Math.random());

        var a = [];
        for (var i = 0; i < categories[randN].topics.length; i++) {
            if(!prev.includes(categories[randN].topics[i])) a.push(i);
            else if (0.7 <= Math.random()) a.push(i);
        }
        if (a.length == 0) {
            a = categories[randN].topics.splice();
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
