const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

class Bgg {
    async getBggCollection(user) {
        let url = `https://www.boardgamegeek.com/xmlapi/collection/${user}?own=1`;
        let collection = [];

        const response = await axios.get(url);

        if (response.status == 200) {
            var options = {
                attributeNamePrefix: "@_",
                ignoreAttributes: false,
            };

            const parser = new XMLParser(options);
            let jObj = parser.parse(response.data);
            collection = jObj.items.item;
        }
        return collection
    }

    shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

}

module.exports.Bgg = Bgg