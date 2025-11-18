import React, { useMemo } from 'react';

const CategorySelect = ({ 
  categories = [], 
  categoryValue = '', 
  childCategoryValue = '', 
  onChange,
  onQuestionChange,
  specialQuestionsValues = {}
}) => {
  const childCategories = useMemo(() => {
    if (!categoryValue) return [];
    const selectedCategory = categories.find(cat => cat._id === categoryValue);
    return selectedCategory?.children || [];
  }, [categoryValue, categories]);
  
  const selectedSubCategory = useMemo(() => {
    if (!childCategoryValue) return null;
    return childCategories.find(sub => sub._id?.toString() === childCategoryValue?.toString());
  }, [childCategoryValue, childCategories]);

  return (
    <div className="space-y-4">
      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Category
        </label>
        <select
          name="category"
          value={categoryValue}
          onChange={onChange}
          className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-transparent transition-all"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Child/Subcategory Dropdown */}
      {childCategories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Subcategory
          </label>
          <select
            name="childCategory"
            value={childCategoryValue}
            onChange={onChange}
            className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-transparent transition-all"
          >
            <option value="">Select Subcategory</option>
            {childCategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Special specialQuestions Section */}
      {selectedSubCategory?.specialQuestions?.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
            <div className="w-1 h-6 bg-[#00008F] rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-900">
              Additional Information
            </h3>
          </div>
          
          <div className="space-y-4">
            {selectedSubCategory.specialQuestions.map((q, index) => (
              <div 
                key={q.key}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {q.label}
                  {q.required && <span className="text-[#00008F] ml-1">*</span>}
                </label>
                
                {q.type === "select" ? (
                  <div className="relative">
                    <select
                      name={q.key}
                      value={specialQuestionsValues[q.key] || ''}
                      onChange={onQuestionChange}
                      className="appearance-none border border-gray-300 p-3 pr-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select {q.label}</option>
                      {q.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : q.type === "textarea" ? (
                  <textarea
                    name={q.key}
                    value={specialQuestionsValues[q.key] || ''}
                    onChange={onQuestionChange}
                    rows={3}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-transparent transition-all resize-none"
                    placeholder={`Enter ${q.label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type={q.type}
                    name={q.key}
                    value={specialQuestionsValues[q.key] || ''}
                    onChange={onQuestionChange}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-transparent transition-all"
                    placeholder={`Enter ${q.label.toLowerCase()}`}
                  />
                )}
                
                {specialQuestionsValues[q.key] && (
                  <div className="absolute right-3 top-10 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;