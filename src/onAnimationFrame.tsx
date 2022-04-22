import { onCleanup } from "solid-js";

export const onAnimationFrame = (fn: Function) => {
  let running = true;

  const animate = () => {
    fn();
    if (running) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  onCleanup(() => (running = false));
};
