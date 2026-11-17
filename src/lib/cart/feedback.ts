/** Purely visual feedback; cart state always updates synchronously first. */
export function cartFeedback(from: HTMLElement | null) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")]
    .reverse()
    .find((el) => el.getBoundingClientRect().width > 0);
  if (!target) return;
  target.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 400 });
  if (!from) return;

  const start = from.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  // A small dot flies to the cart; white with a blue ring, so it shows on the blue header too.
  const block = document.createElement("span");
  Object.assign(block.style, {
    position: "fixed",
    zIndex: "150",
    top: `${start.top + start.height / 2}px`,
    left: `${start.left + start.width / 2}px`,
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 0 0 3px var(--color-accent)",
    pointerEvents: "none",
  });
  document.body.appendChild(block);
  const dx = end.left + end.width / 2 - start.left - start.width / 2;
  const dy = end.top + end.height / 2 - start.top - start.height / 2;
  const animation = block.animate(
    [
      { transform: "translate(-50%, -50%) rotate(0deg) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(180deg) scale(.3)`, opacity: 0.4 },
    ],
    { duration: 550, easing: "cubic-bezier(.2,.7,.2,1)" },
  );
  void animation.finished.then(() => block.remove(), () => block.remove());
}
