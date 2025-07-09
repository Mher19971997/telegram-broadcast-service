export namespace mixin {
  export const Extend = <C extends { new (): any }[]>(...constructors: C) => {
    return <T extends { new (): any }>(constructor: T): T & C => {
      constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
          Object.defineProperty(
            constructor.prototype,
            name,
            Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
          );
        });
      });
      return <T & C>constructor;
    };
  };
}
