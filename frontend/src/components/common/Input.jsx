import React, { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      containerClassName = "",
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-[#cbd6ea]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border
            bg-[#0a1220]
            px-3.5 py-3
            text-sm text-[#eef3ff]
            placeholder:text-[#52617a]
            outline-none transition

            border-[#293a57]

            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20

            autofill:bg-[#0a1220]
            autofill:text-[#eef3ff]
            

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }

            ${className}
          `}
          {...props}
        />

        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

        {!error && helperText && (
          <p className="mt-1.5 text-xs text-[#65738c]">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
