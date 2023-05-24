const indicies = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const combos = []

for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
            combos.push([indicies[i], indicies[j], indicies[k]])
        }
    }
}

function countUniques(a, b, c) {
    if (a == b && b == c) return 1
    if (a != b && a != c && b != c) return 3
    return 2
}

function isSetCorrect([c1, c2, c3]) {
    if (c1 == undefined || c2 == undefined || c3 == undefined) return false
    if (countUniques(c1.letter, c2.letter, c3.letter) == 2) return false
    if (countUniques(c1.count, c2.count, c3.count) == 2) return false
    if (countUniques(c1.fill, c2.fill, c3.fill) == 2) return false
    if (countUniques(c1.color, c2.color, c3.color) == 2) return false
    return true
}

function findCorrectSetIn(cards) {
    combos.sort(() => Math.random() - 0.5)
    for (let c of combos) {
        let set = [cards[c[0]], cards[c[1]], cards[c[2]]]
        if (isSetCorrect(set)) {
            return set
        }
    }
    return []
}
