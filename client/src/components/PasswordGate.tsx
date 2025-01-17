import { useState, ReactNode } from "react";
import styled from "styled-components";

const PasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
`;

const PasswordForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #00012e;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const Title = styled.h2`
  color: #00012e;
  text-align: center;
  margin: 0;
`;

interface PasswordGateProps {
  children: ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_SITE_PASSWORD) {
      sessionStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <PasswordContainer>
        <PasswordForm onSubmit={handleSubmit}>
          <Title>SilkStream</Title>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          {error && (
            <div style={{ color: "red", textAlign: "center" }}>{error}</div>
          )}
          <Button type="submit">Enter</Button>
        </PasswordForm>
      </PasswordContainer>
    );
  }

  return <>{children}</>;
};
