import React, { useEffect, useState, useCallback } from "react";
import Textfield from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import SectionMessage from "@atlaskit/section-message";
import styled, { createGlobalStyle } from "styled-components";
import { v4 as uuid } from "uuid";
import TodoList from "./components/TodoList";

const TODO_APP_STORAGE_KEY = "TODO_APP";

const GlobalStyle = createGlobalStyle`
  :root {
    --bg:#f7f8fa; --card:#fff; --text:#172b4d; --muted:#6b778c; --primary:#0052cc; --border:#ebecf0;
  }
  html, body, #root { height:100%; }
  body { margin:0; background:var(--bg); color:var(--text); font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
`;

const Page = styled.div`max-width:820px;margin:48px auto;padding:0 16px;`;
const Header = styled.header`display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;`;
const Title = styled.h1`font-size:24px;font-weight:700;letter-spacing:.2px;margin:0;`;
const AddBar = styled.div`
  display:grid;grid-template-columns:1fr auto;gap:8px;background:var(--card);
  padding:12px;border:1px solid var(--border);border-radius:12px;box-shadow:0 1px 2px rgba(9,30,66,.08);
`;

export default function App() {
  const [todoList, setTodoList] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isInit, setIsInit] = useState(false);

  // Load từ localStorage và bổ sung note nếu thiếu
  useEffect(() => {
    try {
      const storaged = localStorage.getItem(TODO_APP_STORAGE_KEY);
      if (storaged) {
        const parsed = JSON.parse(storaged);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(t => ({ ...t, note: t?.note ?? "" }));
          setTodoList(normalized);
        }
      }
    } catch (e) {
      console.warn("Cannot parse TODO_APP:", e);
    } finally {
      setIsInit(true);
    }
  }, []);

  // Save vào localStorage
  useEffect(() => {
    if (!isInit) return;
    try {
      localStorage.setItem(TODO_APP_STORAGE_KEY, JSON.stringify(todoList));
    } catch (e) {
      console.warn("Cannot save TODO_APP:", e);
    }
  }, [todoList, isInit]);

  const addTodo = useCallback(() => {
    const name = textInput.trim();
    if (!name) return;
    setTodoList(prev => [
      { id: uuid(), name, isCompleted: false, note: "", createdAt: Date.now() },
      ...prev,
    ]);
    setTextInput("");
  }, [textInput]);

  const handleCheck = useCallback(
    (id) =>
      setTodoList(prev =>
        prev.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
      ),
    []
  );

  const handleDelete = useCallback(
    (id) => setTodoList(prev => prev.filter(t => t.id !== id)),
    []
  );

  // Nhận thêm tham số note
  const handleRename = useCallback((id, name, note) => {
    setTodoList(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, name, ...(note !== undefined ? { note } : {}) }
          : t
      )
    );
  }, []);

  const handleKeyDown = (e) => { if (e.key === "Enter") addTodo(); };

  return (
    <Page>
      <GlobalStyle />
      <Header>
        <Title>Danh sách việc</Title>
        <span style={{ color:"var(--muted)", fontSize:14 }}>
          {todoList.length} việc 
        </span>
      </Header>

      <AddBar>
        <Textfield
          placeholder="Nhập việc cần làm..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <Button appearance="primary" onClick={addTodo}>Thêm</Button>
      </AddBar>

      {todoList.length === 0 ? (
        <div style={{ marginTop:16 }}>
          <SectionMessage title="Chưa có việc nào" appearance="information">
            Hãy thêm việc ở ô phía trên để bắt đầu.
          </SectionMessage>
        </div>
      ) : (
        <TodoList
          todoList={todoList}
          onCheckBtnClick={handleCheck}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      )}
    </Page>
  );
}
