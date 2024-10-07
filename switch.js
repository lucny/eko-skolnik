// Switch.js
// Třída pro vypínač, který ovládá sadu světel
class Switch {
  constructor(x, y, width, height, status, lights, world) {
    // Přidáme parametr `world`
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.status = status; // "on" nebo "off"
    this.lights = lights; // Pole světel, která vypínač ovládá
    this.color = this.status === "on" ? color(255, 0, 0) : color(0, 255, 0); // Barva vypínače podle stavu

    // Vytvoření fyzikálního tělesa pro přepínač
    this.body = Bodies.rectangle(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      this.height,
      {
        isStatic: true, // Přepínače jsou statické
        isSensor: true, // Detekce pouze kolize bez interakce s fyzikou
      }
    );

    World.add(world, this.body); // Přidáme přepínač do světa, který předáme jako parametr
    // Nastaví stav světel podle počátečního stavu vypínače
    if (this.status === "on") {
      this.lights.forEach((light) => light.turnOn());
    }
  }

  // Zobrazení přepínače
  display() {
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);
  }

  // Přepínání stavu přepínače
  toggle() {
    if (this.status === "on") {
      this.status = "off";
      this.color = color(0, 255, 0);
      this.lights.forEach((light) => light.turnOff());
    } else {
      this.status = "on";
      this.color = color(255, 0, 0);
      this.lights.forEach((light) => light.turnOn());
    }
  }
}
