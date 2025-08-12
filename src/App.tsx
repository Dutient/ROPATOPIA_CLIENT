import AppRouter from './Router/AppRouter';
import { AuthProvider } from './Contexts/AuthContext';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  );
}

export default App;
