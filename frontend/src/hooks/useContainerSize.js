import { useRef, useState, useEffect } from 'react';

export function useContainerSize(defaultWidth = 700) {
  const ref = useRef(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      if (w > 0 && w !== width) setWidth(w);
    };

    measure();
    const t1 = setTimeout(measure, 0);
    const t2 = setTimeout(measure, 100);

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, width];
}
