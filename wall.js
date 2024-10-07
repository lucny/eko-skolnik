// Wall.js
// Třída pro vytváření statických zdí
class Wall {
    constructor(color, x, y, w, h, restitution) {
      // Vytvoření fyzikálního těla pro zeď
      this.body = Bodies.rectangle(x + w / 2, y + h / 2, w, h, {
        isStatic: true,
        restitution: restitution
      });
      this.width = w;
      this.height = h;
      this.color = color; // Barva zdi (může být nahrazena texturou)
      World.add(world, this.body); // Přidání zdi do světa
    }
  
    // Zobrazení zdi na plátně
    display() {
      const pos = this.body.position;
      const angle = this.body.angle;
      push();
      translate(pos.x, pos.y);
      rotate(angle);
      rectMode(CENTER);
      fill(this.color);
      rect(0, 0, this.width, this.height);
      pop();
    }
}
  