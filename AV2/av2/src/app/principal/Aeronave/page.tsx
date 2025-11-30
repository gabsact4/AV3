'use client';
import Style from "./Aeronave.module.css";
import Sidebar from "../component/Navbar";
import { useState } from "react";
import axios from "axios";

export default function CadastroAeronave() {
  const [aeronave, setAeronave] = useState({
    nome: "",
    tipo: "comercial",
    capacidade: 0,
    alcance: 0,
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function cadastrarAeronave() {
    setMensagem("");
    setErro("");

    if (!aeronave.nome.trim()) {
      setErro("O nome da aeronave é obrigatório.");
      return;
    }

    try {
      const resposta = await axios.post("http://localhost:3001/api/aeronaves", {
        codigo: aeronave.nome,   // Seu backend usa "code"
        modelo: aeronave.nome,   // opcional, se quiser mudar
        tipo: aeronave.tipo,
        capacidade: aeronave.capacidade,
        alcance: aeronave.alcance
      });

      setMensagem("Aeronave cadastrada com sucesso!");

      // limpa campos
      setAeronave({
        nome: "",
        tipo: "comercial",
        capacidade: 0,
        alcance: 0,
      });

      console.log("Aeronave cadastrada:", resposta.data);
    } catch (error) {
      console.error("Erro ao cadastrar aeronave:", error);
      setErro("Erro ao cadastrar aeronave.");
    }
  }

  return (
    <div className={Style.container}>
      <Sidebar />

      <div className={Style.content}>
        <h1 className={Style.title}>Cadastro de Aeronave</h1>

        {mensagem && <p className={Style.sucesso}>{mensagem}</p>}
        {erro && <p className={Style.erro}>{erro}</p>}

        <form className={Style.form}>
          <div className={Style.formGroup}>
            <label htmlFor="nome">Nome da Aeronave *</label>
            <input
              type="text"
              id="nome"
              placeholder="Nome do Projeto"
              value={aeronave.nome}
              required
              onChange={(e) =>
                setAeronave({ ...aeronave, nome: e.target.value })
              }
            />
          </div>

          <div className={Style.formGroup}>
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              value={aeronave.tipo}
              onChange={(e) =>
                setAeronave({ ...aeronave, tipo: e.target.value })
              }
            >
              <option value="comercial">Comercial</option>
              <option value="militar">Militar</option>
            </select>
          </div>

          <div className={Style.formRow}>
            <div className={Style.formGroup}>
              <label htmlFor="capacidade">Capacidade</label>
              <input
                type="number"
                id="capacidade"
                min="0"
                placeholder="0"
                value={aeronave.capacidade}
                onChange={(e) =>
                  setAeronave({
                    ...aeronave,
                    capacidade: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className={Style.formGroup}>
              <label htmlFor="alcance">Alcance (km)</label>
              <input
                type="number"
                id="alcance"
                min="0"
                placeholder="0"
                value={aeronave.alcance}
                onChange={(e) =>
                  setAeronave({
                    ...aeronave,
                    alcance: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <button
            type="button"
            className={Style.submitButton}
            onClick={cadastrarAeronave}
          >
            Cadastrar Aeronave
          </button>
        </form>
      </div>
    </div>
  );
}
