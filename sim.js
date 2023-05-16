const deck = []
const values = [1, 2, 3]
const board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const combos = []

values.forEach(a => {
    values.forEach(b => {
        values.forEach(c => {
            values.forEach(d => {
                deck.push([a, b, c, d])
            })
        })
    })
})

for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
            combos.push([board[i], board[j], board[k]])
        }
    }
}

function isSetCorrect(c1, c2, c3) {
    function countUniques(a, b, c) {
        if (a == b && b == c) return 1
        if (a != b && a != c && b != c) return 3
        return 2
    }
    for (let i = 0; i < 4; i++) {
        if (countUniques(c1[i], c2[i], c3[i]) == 2) return false
    }
    return true
}

let withSet = 0, withoutSet = 0

for (let s = 0; s < 10000; s++) {
    deck.sort(() => Math.random() - 0.5)
    let isSet = false
    combos.forEach(c => {
        if (isSetCorrect(deck[c[0]], deck[c[1]], deck[c[2]])) {
            isSet = true
            return
        }
    })
    if (isSet) withSet++
    else withoutSet++
}

console.log(withSet, withoutSet, withSet + withoutSet, withSet / (withSet + withoutSet))

