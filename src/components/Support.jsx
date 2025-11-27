import React from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

const Support = () => {
  return (
    <div className="flex items-center gap-4">
      
      <p className="text-gray-700 text-lg font-medium">
        View PZEM test results
      </p>

      <Link
        to="/pzem/test-dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md 
                   hover:bg-green-700 transition-colors"
      >
        Test Dashboard
        <ArrowRight size={16} />
      </Link>

    </div>
  )
}

export default Support;
