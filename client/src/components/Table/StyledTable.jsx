import React from 'react';

const StyledTable = ({ columns, data }) => {

  return (
    <table className="w-full border-collapse bg-gray-800 text-white rounded overflow-hidden p-3">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="px-4 py-3 text-left bg-gray-700 font-semibold text-xs border-b border-gray-600">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-3 border-b border-gray-700 text-center">
              No data available.
            </td>
          </tr>
        ) : (
          data.map((row, index) => (
            <tr
              key={index}
              className={`${
                row.deleteFlag ? 'cursor-pointer bg-gray-700 opacity-50' : 'hover:bg-gray-700'
              }`}
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-4 py-3 border-b border-gray-700 text-xs">
                  {col.render ? col.render(row, index) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default StyledTable;
