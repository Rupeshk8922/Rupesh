import React from "react";
import { useRoutes } from "react-router-dom";
import { getRoutes } from "./routes/routes";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user } = useAuth();
  const routes = getRoutes(user);
  const element = useRoutes(routes);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {element}
    </React.Suspense>
  );
}

export default App;
