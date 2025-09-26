import React from 'react'

const ForgotPasswort = () => {
  return (
    <div className="bg-[url('assets/Auth/Login.png')] bg-cover bg-center h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full bg-opacity-75">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Pedlar</h1>

        <form className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>         
        </form>

        


        
      </div>
    </div>
  )
}

export default ForgotPasswort