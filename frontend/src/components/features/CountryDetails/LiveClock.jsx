import { memo, useEffect, useState } from 'react';
import { chakra } from '@chakra-ui/react';
import moment from 'moment-timezone';

const format = (offsetSeconds) =>
  (offsetSeconds != null ? moment().utcOffset(offsetSeconds / 60) : moment()).format('HH:mm:ss');

/**
 * Self-contained ticking clock. Keeping the 1s interval here means only this
 * span re-renders every second, not the whole country page.
 */
function LiveClock({ offsetSeconds, ...props }) {
  const [time, setTime] = useState(() => format(offsetSeconds));

  useEffect(() => {
    setTime(format(offsetSeconds));
    const id = setInterval(() => setTime(format(offsetSeconds)), 1000);
    return () => clearInterval(id);
  }, [offsetSeconds]);

  return <chakra.span {...props}>{time}</chakra.span>;
}

export default memo(LiveClock);
