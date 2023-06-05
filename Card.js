class Card {
    constructor(letter, count, fill, color) {
        this.letter = letter
        this.count = count
        this.fill = fill
        this.color = color

        this.a = random(-PI, PI) * 0.025
        this.dx = random(-0.5, 0.5) * 0.4
        this.dy = random(-0.5, 0.5) * 0.4
    }

    paint(x, y, scaleFactor, highlightColor) {
        this.x = x
        this.y = y
        push()
        translate(x, y)
        // rotate(this.a)
        scale(scaleFactor)
        // translate(dimensions.ws * this.dx, dimensions.hs * this.dy)
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
        if (highlightColor) {
            fill(highlightColor)
            noStroke()
            rect(0, 0, dimensions.w + dimensions.stroke, dimensions.h + dimensions.stroke, dimensions.corner)
        }
        pop()
    }

    covers(x, y) {
        return this.x - dimensions.w / 2 < x && x < this.x + dimensions.w / 2
            && this.y - dimensions.h / 2 < y && y < this.y + dimensions.h / 2
    }

    fade(fadeColor) {
        push()
        translate(this.x, this.y)
        // rotate(this.a)
        // translate(dimensions.ws * this.dx, dimensions.hs * this.dy)
        rectMode(CENTER)
        strokeWeight(1.5 * dimensions.stroke)
        stroke(fadeColor)
        fill(fadeColor)
        rect(0, 0, dimensions.w, dimensions.h, dimensions.corner)
        pop()
    }
}