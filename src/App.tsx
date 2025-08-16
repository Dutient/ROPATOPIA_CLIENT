import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './Router/AppRouter';
import { AuthProvider } from './Contexts/AuthContext';
import { Navbar } from './Components';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <Navbar />
          <AppRouter />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
