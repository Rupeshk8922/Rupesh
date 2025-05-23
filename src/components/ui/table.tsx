import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table: React.FC<TableProps> = ({ className, ...props }) => {
  return (
 <table className={className} {...props}>
 {props.children}
 </table>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader: React.FC<TableHeaderProps> = ({ className, ...props }) => {
 return (
 <thead className={className} {...props}>
 {props.children}
 </thead>
 );
};

interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => {
 return (
 <th className={className} {...props}>
 {props.children}
 </th>
 );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody: React.FC<TableBodyProps> = ({ className, ...props }) => {
 return (
 <tbody className={className} {...props}>
 {props.children}
 </tbody>
 );
};

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => {
 return <td className={className} {...props}>{props.children}</td>;
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => {
 return (
 <tr className={className} {...props}>
 {props.children}
 </tr>
 );
};

export { Table, TableHeader, TableHead, TableBody, TableCell, TableRow };