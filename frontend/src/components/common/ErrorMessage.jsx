import React from "react";

const ErrorMessage = ({ error, className = "" }) => {
  if (!error) return null;

  return (
    <div
      className={`
        mt-3
        rounded-[7px]
        border border-[#713244]
        bg-[#351a24]
        p-[9px]
        text-[11px]
        text-[#ff9eb4]
        ${className}
      `}
    >
      {error}
    </div>
  );
};

export default ErrorMessage;
