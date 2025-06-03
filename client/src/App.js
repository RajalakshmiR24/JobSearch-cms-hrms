import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes';
import { Provider } from "react-redux"; 
import { store } from "./redux/store"; 
import "./index.css";

const App = () => (
  <div>
   <React.StrictMode>
    <Provider store={store}> 
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
  </div>
);

export default App;
