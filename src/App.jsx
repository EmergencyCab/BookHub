// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import CreateBook from "./pages/CreateBook";
import ReadingLists from "./pages/ReadingLists";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <Router>
      <div className="App">
        <Header onSearch={handleSearch} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create-book" element={<CreateBook />} />
            <Route path="/reading-lists" element={<ReadingLists />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
