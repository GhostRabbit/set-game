let deck = []
let board = {
  cards: [],
  bounds: [],
  selected: [],
  sets: []
}
let discard = []
let roundTime
let lastPick
const cardDimentions = {}
const cardBackgrounds = {}
const weightOfStroke = 5
const animationSpeed = 5000

function setup() {
  createCanvas(500, 500)
  rectMode(CENTER)
  imageMode(CENTER)
  textAlign(CENTER, CENTER)
  init()
  clearBoard()
}

function init() {
  console.log("init")
  deck = []

  // Create cards
  const x = [color('rgb(204, 102, 0)'), color('rgb(0, 204, 102)'), color('rgb(102, 0, 204)')].forEach(c => {
    Object.keys(Fill).forEach(f => {
      const y = ['X', 'Y', 'Z'].forEach(l => {
        for (let n = 1; n <= 3; n++) {
          deck.push(new Card(l, n, f, c))
        }
      })
    })
  })
  deck = shuffle(deck)

  cardDimentions.w = width * 2 / 7
  cardDimentions.h = height / 6
  cardDimentions.lineWidth = height / 50
  cardDimentions.corner = height / 60

  // Init graphics
  cardBackgrounds[Fill.Striped] = createCardGraphics()
  cardBackgrounds[Fill.Checker] = createCardGraphics()
  cardBackgrounds[Fill.Wave] = createCardGraphics()
}

function mouseClicked(event) {
  const mx = event.clientX
  const my = event.clientY

  // Find card to select
  let result = -1
  for (let i = 0; i < board.bounds.length; i++) {
    const b = board.bounds[i]
    if (!b) continue
    if (b.x - b.w2 < mx && mx < b.x + b.w2
      && b.y - b.h2 < my && my < b.y + b.h2
    ) {
      result = i
      break
    }
  }
  if (result != -1) {
    selectCard(result)
  }
}

function selectCard(i) {
  if (board.selected.includes(i)) {
    board.selected.splice(board.selected.indexOf(i), 1)
    return
  }
  board.selected.push(i)
  if (board.selected.length == 3) {
    pickSet(board.selected)
    board.selected = []
  }
}

function pickSet(selected) {
  let set = [pickCardFromBoard(selected[0]), pickCardFromBoard(selected[1]), pickCardFromBoard(selected[2])]
  set.correct = mark(set)
  board.sets.push(set)
}

function mark([c1, c2, c3]) {
  const letter = countUniqes(c1.letter, c2.letter, c3.letter) != 2
  const count = countUniqes(c1.count, c2.count, c3.count) != 2
  const fill = countUniqes(c1.fill, c2.fill, c3.fill) != 2
  const color = countUniqes(c1.fill, c2.fill, c3.fill) != 2
  return letter && count && fill && color
}

function countUniqes(a, b, c) {
  if (a == b && b == c) return 1
  if (a != b && a != c && b != c) return 3
  return 2
}

function pickCardFromBoard(i) {
  const c = board.cards[i]
  board.cards[i] = undefined
  return c
}

function clearBoard() {
  board.cards.forEach(c => discard.push(c))
  board.cards = []
  board.bounds = []
  board.selected = []

  if (deck.length < 12) {
    discard = shuffle(discard)
    discard.forEach(c => deck.push(c))
    discard = []
  }

  lastPick = second()
  roundTime = 60
}

function draw() {
  clear()
  background(255)

  if (second() != lastPick) {
    let firstEmpty = board.cards.indexOf(undefined)
    if (firstEmpty != -1) {
      board.cards[firstEmpty] = deck.shift()
    }
    else if (board.cards.length < 12) {
      board.cards.push(deck.shift())
    }
    lastPick = second()
    if (roundTime-- == 0) {
      clearBoard()
    }
  }

  cardBackgrounds[Fill.Striped] = updateStripedBackground(cardBackgrounds[Fill.Striped])
  cardBackgrounds[Fill.Checker] = updateCheckerBackground(cardBackgrounds[Fill.Checker])
  cardBackgrounds[Fill.Wave] = updateWaveBackground(cardBackgrounds[Fill.Wave])
  drawBoard()
  drawScore()
  drawCountdown()
}

function createCardGraphics() {
  const cnv = createGraphics(cardDimentions.w, cardDimentions.h)
  return [cnv, cnv.canvas.getContext('2d')]
}

function updateStripedBackground([cnv, ctx]) {
  const w = cardDimentions.w
  const h = cardDimentions.h
  const lineWidth = cardDimentions.lineWidth

  cnv.reset()
  cnv.rect(0, 0, w, h, cardBackgrounds.corner)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2 + lerp(0, 2 * lineWidth, (millis() % animationSpeed) / animationSpeed)
  for (let i = 0; i < 20; i++) {
    cnv.line(-w, y, 2 * w, y)
    y += 2 * lineWidth
  }
  return [cnv, ctx]
}

function updateWaveBackground([cnv, ctx]) {
  const w = cardDimentions.w
  const h = cardDimentions.h
  const lineWidth = cardDimentions.lineWidth

  cnv.reset()
  cnv.background(255) // Why is this needed for this background?
  cnv.rect(0, 0, w, h, cardBackgrounds.corner)
  ctx.clip()

  let da = lerp(0, 2 * PI, (millis() % (2 * animationSpeed)) / (2 * animationSpeed))
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  cnv.noFill()
  let y = -h * 2 + 18 * lineWidth
  for (let i = 0; i < 4; i++) {
    cnv.beginShape()
    for (let x = -w / 2; x < 1.5 * w; x += 5) {
      let a = lerp(0, 12 * PI, (x + w)) / (3 * w) - da
      cnv.vertex(x, y + lineWidth * sin(a))
    }
    cnv.endShape()
    y += 2 * lineWidth
  }
  return [cnv, ctx]
}

function updateCheckerBackground([cnv, ctx]) {
  const w = cardDimentions.w
  const h = cardDimentions.h
  const lineWidth = cardDimentions.lineWidth

  cnv.reset()
  cnv.rect(0, 0, w, h, height / 60)
  ctx.clip()

  ctx.rotate(PI / 4)
  cnv.strokeWeight(lineWidth)
  cnv.stroke(color('#AAA'))
  let y = -h * 2
  let dr = lineWidth / 2 * sin(lerp(0, 2 * PI, (millis() % animationSpeed) / animationSpeed))
  for (let i = 0; i < 20; i++) {
    for (let x = 0; x < w; x += 2 * lineWidth) {
      cnv.circle(x, y, dr + lineWidth / 3)
      dr *= -1
    }
    y += 2 * lineWidth
  }
  // ctx.pop()
  return [cnv, ctx]
}

function drawBoard() {
  let x = -width / 6
  let y
  const w = cardDimentions.w
  const h = cardDimentions.h
  board.bounds = []
  board.cards.forEach((c, i) => {
    if (i % 4 == 0) {
      y = height / 10
      x += width / 3
    }
    if (c) {
      c.draw(x, y, w, h)
      if (board.selected.includes(i)) {
        const c = color('rgba(204,204,0,0.3)')
        fill(c)
        stroke(c)
        rect(x, y, w, h, cardBackgrounds.corner)
      }
      board.bounds[i] = ({ x: x, y: y, w2: w / 2, h2: h / 2 })
    }
    y += height / 5
  })

  push()
  translate(width / 24, height - height / 6)
  scale(0.3)
  x = -width
  board.sets.forEach((set, i) => {
    if (i % 3 == 0) {
      y = h / 2
      x += 9 * width / 8
    }
    set[0].draw(x, y)
    set[1].draw(x + w, y)
    set[2].draw(x + 2 * w, y)
    if (!set.correct) {
      fill(color('rgba(255, 0, 0, 0.2)'))
      rect(x + w, y, w * 3, h)
    }
    y += h
  })
  pop()
}

function drawScore() {
  let score = 0
  board.sets.forEach(s => {
    score += s.correct ? 1 : -1
  })
  textStyle(NORMAL)
  const size = height / 25
  textSize(size)
  noFill()
  strokeWeight(1)
  stroke(color('black'))
  text(score + " p", width - size, height - 3 * size)
}

function drawCountdown() {
  textStyle(NORMAL)
  const size = height / 25
  textSize(height / 25)
  noFill()
  strokeWeight(1)
  stroke(color('black'))
  text(roundTime + " s", width - 1.5 * size, height - size)
}

const Fill = {
  Wave: 'Wave',
  Striped: 'Striped',
  Checker: 'Checker'
}

class Card {
  constructor(letter, count, fill, color) {
    this.letter = letter
    this.count = count
    this.fill = fill
    this.color = color
  }

  draw(x, y) {
    image(cardBackgrounds[this.fill][0], x, y)
    stroke(this.color)
    strokeWeight(weightOfStroke)
    noFill()
    rect(x, y, cardDimentions.w, cardDimentions.h, cardDimentions.corner)

    textSize(height / 9)
    textStyle(BOLD)
    stroke(color('black'))
    fill(this.color)
    strokeWeight(weightOfStroke)
    text(this.letter.repeat(this.count), x, y + 5)
  }
}