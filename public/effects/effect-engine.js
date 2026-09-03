export class EffectEngine {
  constructor(context = {}) {
    this.context = context;
    this.effects = new Map();
  }

  register(name, handler) {
    this.effects.set(name, handler);
    return this;
  }

  mount(root = document) {
    root.querySelectorAll('[data-effect]').forEach((element) => {
      const effectName = element.dataset.effect;
      const handler = this.effects.get(effectName);
      if (!handler) return;
      handler(element, this.context);
    });
  }
}
