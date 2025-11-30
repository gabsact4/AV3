'use client';

import React, { useState } from "react";
import styles from "./Login.module.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fazerLogin = async () => {
    if (!usuario || !senha) {
      alert("Preencha usuário e senha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          usuario: usuario,
          senha: senha
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Usuário ou senha inválidos!");
        return;
      }

      if (data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id.toString());
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("username", data.user.username);

        console.log("Login bem-sucedido:", {
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
          username: data.user.username
        });

        router.push("/principal");
      } else {
        alert("Dados de usuário não encontrados na resposta.");
      }

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fazerLogin();
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>

      <div className={styles.formGroup}>
        <label htmlFor="usuario" className={styles.label}>Usuário</label>
        <input
          id="usuario"
          className={styles.input}
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite seu usuário"
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="senha" className={styles.label}>Senha</label>
        <input
          id="senha"
          className={styles.input}
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua senha"
          disabled={loading}
        />
      </div>

      <button 
        className={styles.button} 
        onClick={fazerLogin}
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className={styles.credentials}>
        <p><strong>Credenciais de teste:</strong></p>
        <p>Admin: admin / admin123</p>
        <p>Engenheiro: engenheiro1 / eng123</p>
        <p>Operador: operador1 / op123</p>
      </div>
    </div>
  );
}