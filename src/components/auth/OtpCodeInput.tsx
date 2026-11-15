import React, { useRef, useEffect } from "react";

interface OtpCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function OtpCodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
}: OtpCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const setDigitAt = (index: number, char: string) => {
    const chars = value.split("");
    while (chars.length < 6) chars.push("");
    chars[index] = char;
    const newCode = chars.join("").slice(0, 6);
    onChange(newCode);

    if (newCode.length === 6 && onComplete) {
      onComplete(newCode);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputChar = e.target.value.slice(-1); // Take latest typed char

    if (!inputChar) {
      setDigitAt(index, "");
      return;
    }

    if (!/^\d$/.test(inputChar)) {
      return; // Only allow digits 0-9
    }

    setDigitAt(index, inputChar);

    // Focus next box
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current is already empty, go back and clear previous
        setDigitAt(index - 1, "");
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      } else {
        setDigitAt(index, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").trim();
    const cleanedDigits = pasteData.replace(/\D/g, "").slice(0, 6);

    if (cleanedDigits.length > 0) {
      onChange(cleanedDigits);
      const targetIndex = Math.min(cleanedDigits.length, 5);
      inputRefs.current[targetIndex]?.focus();

      if (cleanedDigits.length === 6 && onComplete) {
        onComplete(cleanedDigits);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
        margin: "18px 0",
      }}
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[idx]}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: "48px",
            height: "56px",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: 700,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-input, var(--bg-card))",
            border: hasError
              ? "2px solid #ef4444"
              : digits[idx]
              ? "2px solid var(--primary, #C96B32)"
              : "1.5px solid var(--border-color)",
            borderRadius: "10px",
            outline: "none",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            if (!disabled && !hasError && !digits[idx]) {
              e.currentTarget.style.borderColor = "var(--text-secondary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !hasError && !digits[idx]) {
              e.currentTarget.style.borderColor = "var(--border-color)";
            }
          }}
        />
      ))}
    </div>
  );
}
