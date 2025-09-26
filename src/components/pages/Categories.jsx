import React, { useEffect } from 'react';
import { useCategoryQuery } from '../../features/categorySlice';
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const {
    data: categories,
    isLoading,
    isError,
    isSuccess,
  } = useCategoryQuery();

  const navigate = useNavigate();

  // Navigate on error
  useEffect(() => {
    if (isError) {
      navigate("*");
    }
  }, [isError, navigate]); // Run effect when error changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Failed to load categories.</div>;
  }

  return (
    
    <div className='p-4'>
      <h1 className="text-2xl font-bold mb-2">Categories</h1>
      <div className="flex flex-wrap justify-center items-center md:justify-start md:flex-row md:flex-wrap pb-32 
      overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200" style={{ maxHeight: 'calc(100vh - 200px)'}}>
        {categories?.data && categories.data.length > 0 ? (
          categories.data.map((category) => (
          <div
            key={category.id || category._id}
            className="flex flex-col items-center justify-center w-1/2 md:w-[15%] p-4"
          >
            <div className="flex items-center justify-center bg-gray-200 rounded-full p-4">
              <i className={category.icon} style={{ fontSize: 50 }} /> {/* Display icon */}
            </div>
            <div className="text-center mt-2">{category.name}</div>
            <div><span className='text-sm'>100,000 ads</span></div>
          </div>
        ))
      ): (
          <div>No categories found</div>
        )}
      </div>
    </div>
  );
}

export default Categories;


