import React, { forwardRef } from "react";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",

  secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300",

  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200",

  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",

  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg font-medium
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <span
            className="
              h-4 w-4 animate-spin rounded-full
              border-2 border-current border-t-transparent
            "
          />
        )}

        {loading ? "Loading..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";
