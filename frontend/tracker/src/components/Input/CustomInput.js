import React, { useState } from "react";

function CustomInput({ value, onChange }) {
  const [val, setVal] = useState(value || "");

  return (
    <div>
      <input type="text" value={value} onChange={onChange} />
    </div>
  );
}

export default CustomInput;
