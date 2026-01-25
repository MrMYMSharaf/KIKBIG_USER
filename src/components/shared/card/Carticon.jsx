import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetMyCartQuery } from '../../features/AddTocartSlice';

const CartIcon = () => {
  const navigate = useNavigate();
  const { data: cartData } = useGetMyCartQuery();
  
  const cartItemCount = cartData?.data?.length || 0;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Shopping Cart"
    >
      <ShoppingCart size={24} className="text-gray-700" />
      
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;