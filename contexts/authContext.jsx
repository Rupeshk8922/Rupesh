import React from 'react';

const authContext = () => {
  return <div>authContext Placeholder</div>;
};

export default authContext;
export const useAuth = () => {
  return { user: null, login: () => {}, logout: () => {} };
};
