class Projectile {
  constructor(x, y, size, shape, options, color) {
    this.size = size;
    this.shape = shape;
    this.color = color;
    this.dragging = false;
    this.launchForce = { x: 0, y: 0 };
    this.energyConsumed = 0; // Spotřeba energie školníka
    this.springLength = 0; // Délka natažení pružiny
    this.angleInDegrees = 0; // Úhel pružiny ve stupních

    if (shape === 'circle') {
      this.body = Bodies.circle(x, y, size, options);
    } else if (shape === 'polygon') {
      this.body = Bodies.polygon(x, y, shape.sides, size, options);
    }

    World.add(world, this.body);
  }

  // Aplikace síly na základě úhlu a síly
  shootCommand(angle, force) {
    if (angle < 0 || angle > 360 || force < 1 || force > 100) {
      document.getElementById('errorMessage').innerText = "Neplatný příkaz! Úhel musí být v rozsahu 0-360 a síla v rozsahu 1-100.";
      return;
    }

    const rad = radians(angle);
    const calculatedForce = {
      x: cos(rad) * force * 0.05,
      y: sin(rad) * force * 0.05
    };

    this.launchForce = calculatedForce;
    this.applyForce();
    this.calculateEnergyConsumption(force); // Výpočet spotřeby energie
    this.springLength = 0; // Reset pružiny po vystřelení
    closeModal();
  }

  // Výpočet spotřeby energie na základě natažení pružiny
  calculateEnergyConsumption(force) {
    const maxEnergy = 400; // Maximální energie pro 10 metrů rychlé chůze
    this.energyConsumed += (force / 100) * maxEnergy; // Proporcionální energie na základě natažení
  }

  // Získání aktuální spotřeby energie
  getEnergyConsumption() {
    return this.energyConsumed;
  }

  applyForce() {
    Body.applyForce(this.body, this.body.position, this.launchForce);
  }

  // Funkce pro myší akce
  mousePressed() {
    const d = dist(mouseX, mouseY, this.body.position.x, this.body.position.y);
    if (d < this.size) {
      if (!keyIsDown(CONTROL)) {
        this.dragging = true; // Umožní tažení projektilu
      }
    }
  }

  mouseReleased() {
    if (this.dragging) {
      this.calculateLaunchForce();
      this.applyForce();
      this.dragging = false;
    }
  }

  calculateLaunchForce() {
    const springLength = dist(this.body.position.x, this.body.position.y, mouseX, mouseY);
    const angle = atan2(mouseY - this.body.position.y, mouseX - this.body.position.x);

    let limitedLength = springLength;
    if (springLength > 100) {
      limitedLength = 100;
    }
    this.calculateEnergyConsumption(limitedLength); // Výpočet spotřeby energie
    this.launchForce.x = -cos(angle) * limitedLength * 0.1;
    this.launchForce.y = -sin(angle) * limitedLength * 0.1;
    this.springLength = limitedLength; // Uložíme hodnotu natažení pružiny
    this.angleInDegrees = degrees(angle); // Uložíme úhel pružiny ve stupních
  }

  // Zobrazení pružiny při tažení projektilu
  displaySpring() {
    if (this.dragging) {
      stroke(0);
      const springLength = dist(this.body.position.x, this.body.position.y, mouseX, mouseY);
      const angle = atan2(mouseY - this.body.position.y, mouseX - this.body.position.x);

      let limitedLength = springLength;
      if (springLength > 100) {
        limitedLength = 100;
      }

      const endX = this.body.position.x + cos(angle) * limitedLength;
      const endY = this.body.position.y + sin(angle) * limitedLength;
      line(this.body.position.x, this.body.position.y, endX, endY);

      // Zobrazení hodnoty natažení pružiny
      noStroke();
      fill(0);
      textSize(10);
      text(`${Math.round(limitedLength)} | ${Math.round(degrees(angle) >= 0 ? degrees(angle) : 360 + degrees(angle))}°`, endX, endY);
    }
  }

  // Zobrazení projektilu
  display() {
    const pos = this.body.position;
    fill(this.color);
    noStroke();

    if (this.shape === 'circle') {
      ellipse(pos.x, pos.y, this.size * 2);
    } else if (this.shape === 'polygon') {
      beginShape();
      const vertices = this.body.vertices;
      vertices.forEach(v => vertex(v.x, v.y));
      endShape(CLOSE);
    }

    // Zobrazení pružiny, pokud je projektil tažen
    this.displaySpring();
  }
}
