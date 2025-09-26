import React from "react";

const LanguageSelect = ({ languages, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Language</label>
      <select
        name="language"
        value={value}
        onChange={onChange}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Language</option>
        {languages.map((lang) => (
          <option key={lang._id} value={lang._id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelect;
