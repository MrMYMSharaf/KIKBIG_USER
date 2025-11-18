import React, { useMemo, useRef, useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Import quill-emoji
import 'quill-emoji/dist/quill-emoji.css';
import * as Emoji from 'quill-emoji';

// Register emoji module
Quill.register('modules/emoji', Emoji);

// Create a custom Block Blot for tables
const BlockEmbed = Quill.import('blots/block/embed');

class TableBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.innerHTML = value;
    node.contentEditable = 'true';
    node.classList.add('custom-table');
    return node;
  }

  static value(node) {
    return node.innerHTML;
  }
}

TableBlot.blotName = 'table';
TableBlot.tagName = 'table';
TableBlot.className = 'custom-table';

Quill.register(TableBlot);

const DescriptionEditor = ({ value, onChange }) => {
  const quillRef = useRef(null);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isInsideTable, setIsInsideTable] = useState(false);

  // Check if cursor is inside a table
  const checkTableContext = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let element = selection.anchorNode;
      
      while (element && element !== document) {
        if (element.tagName === 'TABLE' || (element.classList && element.classList.contains('custom-table'))) {
          setIsInsideTable(true);
          return;
        }
        element = element.parentElement;
      }
    }
    setIsInsideTable(false);
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.on('selection-change', checkTableContext);
      
      // Also check on text change
      quill.root.addEventListener('click', checkTableContext);
      quill.root.addEventListener('keyup', checkTableContext);

      // Prevent table deletion and maintain cell content
      const handleKeyDown = (e) => {
        if (e.key !== 'Backspace' && e.key !== 'Delete') return;
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        let element = selection.anchorNode;
        let currentNode = element;
        
        // Find if we're inside a table
        while (currentNode && currentNode !== quill.root) {
          if (currentNode.tagName === 'TABLE' || (currentNode.classList && currentNode.classList.contains('custom-table'))) {
            // We're inside a table, prevent deletion of the table itself
            e.stopPropagation();
            
            // Find the cell we're in
            let cellElement = element;
            while (cellElement && cellElement.tagName !== 'TD') {
              cellElement = cellElement.parentElement;
              if (!cellElement || cellElement === quill.root) break;
            }
            
            if (cellElement && cellElement.tagName === 'TD') {
              const range = selection.getRangeAt(0);
              const cellContent = cellElement.textContent || '';
              
              // If cell is empty, prevent default and keep a non-breaking space
              if (!cellContent.trim() || cellContent === '\u00A0') {
                e.preventDefault();
                cellElement.innerHTML = '&nbsp;';
                
                // Set cursor position
                const newRange = document.createRange();
                newRange.selectNodeContents(cellElement);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                return;
              }
              
              // If at the start of cell with backspace, prevent deletion
              if (e.key === 'Backspace' && range.startOffset === 0) {
                e.preventDefault();
                return;
              }
            }
            return;
          }
          currentNode = currentNode.parentElement;
        }
      };

      // Monitor for empty cells and fix them
      const handleInput = (e) => {
        const tables = quill.root.querySelectorAll('table');
        tables.forEach(table => {
          const cells = table.querySelectorAll('td');
          cells.forEach(cell => {
            const content = cell.textContent || cell.innerText;
            if (!content.trim() && !cell.querySelector('br')) {
              cell.innerHTML = '&nbsp;';
            }
          });
        });
      };

      quill.root.addEventListener('keydown', handleKeyDown, true);
      quill.root.addEventListener('input', handleInput);

      return () => {
        if (quill) {
          quill.off('selection-change', checkTableContext);
          quill.root.removeEventListener('click', checkTableContext);
          quill.root.removeEventListener('keyup', checkTableContext);
          quill.root.removeEventListener('keydown', handleKeyDown, true);
          quill.root.removeEventListener('input', handleInput);
        }
      };
    }
  }, []);

  const handleEditorChange = (content) => {
    onChange({
      target: {
        name: 'description',
        value: content
      }
    });
  };

  // Function to insert table
  const insertTable = (rows = 3, cols = 3) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true) || { index: 0 };
      
      let tableHTML = '<tbody>';
      for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
          const isHeader = i === 0;
          const style = isHeader 
            ? 'border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; min-width: 80px;'
            : 'border: 1px solid #ddd; padding: 8px; min-width: 80px;';
          const content = isHeader ? `Header ${j + 1}` : `Cell`;
          tableHTML += `<td style="${style}">${content}</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody>';
      
      try {
        quill.focus();
        quill.insertEmbed(range.index, 'table', tableHTML, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        quill.insertText(range.index + 1, '\n', Quill.sources.USER);
      } catch (error) {
        console.error('Error inserting table:', error);
      }
      
      setShowTableMenu(false);
    }
  };

  // Toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link'],
        ['emoji'],
        ['blockquote', 'code-block'],
        ['clean'],
        ['table-insert']
      ],
      handlers: {
        'table-insert': function() {
          setShowTableMenu(prev => !prev);
        }
      }
    },
    'emoji-toolbar': true,
    'emoji-textarea': false,
    'emoji-shortname': true,
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'color', 'background',
    'align',
    'list', 'bullet', 'check', 'indent',
    'link',
    'blockquote', 'code-block',
    'emoji',
    'table'
  ];

  // Add row to selected table
  const addRow = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = window.getSelection();
      let element = selection.anchorNode;
      
      while (element && element.tagName !== 'TD') {
        element = element.parentElement;
      }
      
      if (element && element.tagName === 'TD') {
        const row = element.closest('tr');
        const table = element.closest('table');
        const colCount = row.cells.length;
        
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const newCell = document.createElement('td');
          newCell.style.cssText = 'border: 1px solid #ddd; padding: 8px; min-width: 80px;';
          newCell.textContent = 'Cell';
          newRow.appendChild(newCell);
        }
        row.parentNode.insertBefore(newRow, row.nextSibling);
        
        handleEditorChange(quill.root.innerHTML);
      }
    }
  };

  // Delete row from selected table
  const deleteRow = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = window.getSelection();
      let element = selection.anchorNode;
      
      while (element && element.tagName !== 'TD') {
        element = element.parentElement;
      }
      
      if (element && element.tagName === 'TD') {
        const row = element.closest('tr');
        const table = element.closest('table');
        
        if (table.rows.length > 1) {
          row.remove();
          handleEditorChange(quill.root.innerHTML);
        } else {
          alert('Cannot delete the last row!');
        }
      }
    }
  };

  // Add column to selected table
  const addColumn = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = window.getSelection();
      let element = selection.anchorNode;
      
      while (element && element.tagName !== 'TD') {
        element = element.parentElement;
      }
      
      if (element && element.tagName === 'TD') {
        const table = element.closest('table');
        const cellIndex = Array.from(element.parentNode.children).indexOf(element);
        
        Array.from(table.rows).forEach((row, rowIndex) => {
          const newCell = document.createElement('td');
          const isHeader = rowIndex === 0;
          newCell.style.cssText = isHeader 
            ? 'border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; min-width: 80px;'
            : 'border: 1px solid #ddd; padding: 8px; min-width: 80px;';
          newCell.textContent = isHeader ? 'Header' : 'Cell';
          row.insertBefore(newCell, row.cells[cellIndex + 1]);
        });
        
        handleEditorChange(quill.root.innerHTML);
      }
    }
  };

  // Delete column from selected table
  const deleteColumn = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = window.getSelection();
      let element = selection.anchorNode;
      
      while (element && element.tagName !== 'TD') {
        element = element.parentElement;
      }
      
      if (element && element.tagName === 'TD') {
        const table = element.closest('table');
        const cellIndex = Array.from(element.parentNode.children).indexOf(element);
        
        if (table.rows[0].cells.length > 1) {
          Array.from(table.rows).forEach(row => {
            if (row.cells[cellIndex]) {
              row.cells[cellIndex].remove();
            }
          });
          
          handleEditorChange(quill.root.innerHTML);
        } else {
          alert('Cannot delete the last column!');
        }
      }
    }
  };

  // Delete entire table
  const deleteTable = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      if (confirm('Are you sure you want to delete this entire table?')) {
        const selection = window.getSelection();
        let element = selection.anchorNode;
        
        while (element && element.tagName !== 'TD') {
          element = element.parentElement;
        }
        
        if (element && element.tagName === 'TD') {
          const table = element.closest('table');
          table.remove();
          handleEditorChange(quill.root.innerHTML);
          setIsInsideTable(false);
        }
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="border rounded-lg overflow-visible shadow-sm relative">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          placeholder="✨ Write your description here... Add emojis and format text!"
          className="bg-white"
        />
        
        {/* Table Insert Menu Dropdown */}
        {showTableMenu && (
          <div className="absolute top-14 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-[10000]">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Insert Table</h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => insertTable(3, 3)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors"
              >
                3 × 3 Table
              </button>
              <button
                type="button"
                onClick={() => insertTable(4, 4)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors"
              >
                4 × 4 Table
              </button>
              <button
                type="button"
                onClick={() => insertTable(5, 5)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors"
              >
                5 × 5 Table
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowTableMenu(false)}
              className="w-full mt-2 px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Table Edit Controls - Only show when inside table */}
        {isInsideTable && (
          <div className="absolute top-14 left-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-2 z-[10000]">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={addRow}
                title="Add Row"
                className="px-2 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors font-medium"
              >
                + Row
              </button>
              <button
                type="button"
                onClick={deleteRow}
                title="Delete Row"
                className="px-2 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors font-medium"
              >
                − Row
              </button>
              <button
                type="button"
                onClick={addColumn}
                title="Add Column"
                className="px-2 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors font-medium"
              >
                + Col
              </button>
              <button
                type="button"
                onClick={deleteColumn}
                title="Delete Column"
                className="px-2 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors font-medium"
              >
                − Col
              </button>
              <button
                type="button"
                onClick={deleteTable}
                title="Delete Entire Table"
                className="px-2 py-1.5 bg-red-700 text-white text-xs rounded hover:bg-red-800 transition-colors font-medium"
              >
                🗑️ Table
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .ql-container {
          min-height: 300px;
          font-size: 15px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .ql-editor {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
        }

        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
          left: 15px;
        }

        /* Toolbar Styling */
        .ql-toolbar {
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
          border-bottom: 2px solid #e5e7eb !important;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 12px 8px !important;
        }

        .ql-toolbar .ql-formats {
          margin-right: 10px;
        }

        .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }

        /* Custom Table Button in Toolbar */
        .ql-toolbar button.ql-table-insert {
          width: 28px !important;
        }

        .ql-toolbar button.ql-table-insert:after {
          content: '⊞';
          font-size: 18px;
        }

        /* Emoji Picker Positioning */
        .ql-emoji-picker {
          width: 320px !important;
          max-height: 320px;
          overflow-y: auto;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          padding: 12px;
          position: absolute;
          z-index: 9999;
          top: 100% !important;
          left: auto !important;
          right: 0 !important;
          margin-top: 8px;
        }

        .ql-toolbar .ql-emoji {
          position: relative;
        }

        .ql-emoji-picker .ql-emoji {
          width: 28px !important;
          height: 28px !important;
          margin: 3px;
          cursor: pointer;
          transition: transform 0.2s;
          border-radius: 4px;
          font-size: 22px !important;
          line-height: 28px !important;
          text-align: center;
        }

        .ql-emoji-picker .ql-emoji:hover {
          transform: scale(1.4);
          background: #f3f4f6;
        }

        /* Emoji in Editor Content */
        .ql-editor .emoji,
        .ql-editor img.emoji,
        .ql-editor span.emoji {
          font-size: 1.2em !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          display: inline !important;
          margin: 0 1px !important;
          position: relative !important;
          top: 0 !important;
        }

        /* Custom Table Styling */
        .ql-editor .custom-table,
        .ql-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 15px 0;
          display: table !important;
        }

        .ql-editor .custom-table td,
        .ql-editor table td {
          border: 1px solid #ddd !important;
          padding: 10px !important;
          min-width: 80px !important;
        }

        .ql-editor .custom-table tr:first-child td,
        .ql-editor table tbody tr:first-child td {
          background-color: #f3f4f6 !important;
          font-weight: bold !important;
        }

        .ql-editor .custom-table tr:not(:first-child):nth-child(even),
        .ql-editor table tbody tr:not(:first-child):nth-child(even) {
          background-color: #f9fafb;
        }

        .ql-editor .custom-table tr:hover,
        .ql-editor table tbody tr:hover {
          background-color: #f3f4f6;
        }

        /* Heading styles */
        .ql-editor h1 { font-size: 2em; font-weight: bold; margin: 16px 0 8px; }
        .ql-editor h2 { font-size: 1.5em; font-weight: bold; margin: 14px 0 7px; }
        .ql-editor h3 { font-size: 1.3em; font-weight: bold; margin: 12px 0 6px; }
        .ql-editor h4 { font-size: 1.1em; font-weight: bold; margin: 10px 0 5px; }

        /* Spacing */
        .ql-editor p {
          margin: 8px 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default DescriptionEditor;