import { useState, useEffect, useRef } from "react";

const CHARS = "0101XYZ_+-*&%#@!?[]/\\<>=0101";

/**
 * TextScramble provides a technical decoding effect.
 * It replaces letters with random characters and slowly decrypts them back.
 */
export const TextScramble = ({
  text = "",
  autostart = true,
  triggerOnHover = false,
  speed = 25,
  delay = 0,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef(null);
  const frameRef = useRef(0);

  const startScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    frameRef.current = 0;
    const length = text.length;

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            // Decrypt the character based on frames elapsed
            if (index < frameRef.current / 2) {
              return text[index];
            }
            // Return random technical symbol
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      frameRef.current += 1;

      if (frameRef.current / 2 >= length) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
      }
    }, speed);
  };

  useEffect(() => {
    let timeoutId;
    if (autostart) {
      timeoutId = setTimeout(startScramble, delay);
    } else {
      setDisplayText(text);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, autostart, delay]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      startScramble();
    }
  };

  return (
    <span onMouseEnter={handleMouseEnter} className={className}>
      {displayText}
    </span>
  );
};

export default TextScramble;
