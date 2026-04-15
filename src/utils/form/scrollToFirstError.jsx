export default function scrollToFirstError(errors) {
  const firstKey = Object.keys(errors || {})[0];
  if (!firstKey) return;

  const el = document.querySelector(`[data-field="${firstKey}"]`);
  if (!el) return;

  el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
  });

  if (typeof el.focus === 'function') {
      setTimeout(() => el.focus(), 250);
  }
}