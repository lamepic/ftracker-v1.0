import React from "react";
import "./CustomBadge.css";

function CustomBadge({ count, size, position }) {
  return (
    <div
      className="badge"
      style={{
        height: size,
        width: size,
        top: position?.top,
        right: position?.right,
      }}
    >
      {count}
    </div>
  );
}

export default CustomBadge;
