class Card {
    constructor(letter, count, fill, color) {
        this.letter = letter
        this.count = count
        this.fill = fill
        this.color = color
    }

    paint(x, y, scaleFactor) {
        this.x = x
        this.y = y
        push()
        translate(x, y)
        if (scaleFactor > 0) scale(scaleFactor)
        rectMode(CENTER)
        image(cardBackgrounds[this.fill][0], 0, 0)
        stroke(this.color)
        strokeWeight(dimensions.stroke)
        noFill()
        rect(0, 0, dimensions.w, dimensions.h, dimensions.corner)

        textAlign(CENTER, CENTER)
        textSize(dimensions.text)
        textStyle(BOLD)
        stroke(color("black"))
        fill(this.color)
        strokeWeight(dimensions.stroke)
        text(this.letter.repeat(this.count), 0, 5)
        pop()
    }

    covers(x, y) {
        return this.x - dimensions.w / 2 < x && x < this.x + dimensions.w / 2
            && this.y - dimensions.h / 2 < y && y < this.y + dimensions.h / 2
    }

    fade(color) {
        rectMode(CENTER)
        noStroke()
        fill(color)
        rect(this.x, this.y, dimensions.w + dimensions.ws, dimensions.h + dimensions.hs)
    }
}