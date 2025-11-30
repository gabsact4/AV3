'use client';

import Card from "./Card";
import Navbar from "./component/Navbar";
import Style from "./Menu.module.css";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";

type AircraftType = {
  id: number;
  model: string;
  code: string;
  type: string;
  capacity: number;
  range: number;

  parts?: {
    id: number;
    name: string;
    status: string;  
  }[];

  stages?: {
    id: number;
    name: string;
    status: string; 
  }[];

  tests?: any[];
};

export default function Principal() {
  const [busca, setBusca] = useState("");
  const [aeroNaves, setAeroNaves] = useState<AircraftType[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [aeronave, setAeronave] = useState({
    nome: "",
    tipo: "comercial",
    capacidade: 0,
    alcance: 0,
  });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarAeronaves();
  }, []);

  async function carregarAeronaves() {
    try {
      const resposta = await axios.get("http://localhost:3001/api/aeronaves");
      setAeroNaves(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar aeronaves:", error);
    }
  }

  async function cadastrarAeronave() {
    setMensagem("");
    setErro("");

    if (!aeronave.nome.trim()) {
      setErro("O nome da aeronave é obrigatório.");
      return;
    }

    try {
      const resposta = await axios.post("http://localhost:3001/api/aeronaves", {
        codigo: aeronave.nome,
        modelo: aeronave.nome,
        tipo: aeronave.tipo,
        capacidade: aeronave.capacidade,
        alcance: aeronave.alcance
      });

      setMensagem("Aeronave cadastrada com sucesso!");
      
      await carregarAeronaves();

      setTimeout(() => {
        setAeronave({
          nome: "",
          tipo: "comercial",
          capacidade: 0,
          alcance: 0,
        });
        setModalAberto(false);
        setMensagem("");
      }, 1500);

      console.log("Aeronave cadastrada:", resposta.data);
    } catch (error) {
      console.error("Erro ao cadastrar aeronave:", error);
      setErro("Erro ao cadastrar aeronave.");
    }
  }

  const aeroNavesFiltradas = aeroNaves.filter(nave =>
    nave.model?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.buscaContainer}>
        <input
          type="text"
          placeholder="Buscar aeronave..."
          className={Style.input}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className={Style.conteudo}>
        <div className={Style.header}>
          <h1 className={Style.titulo}>Sistema de Gerenciamento de Aeronaves</h1>
          <p className={Style.subtitulo}>Gerencie suas aeronaves e peças</p>
        </div>

        <div className={Style.stats}>
          <div className={Style.statCard}>
            <h3>Total de Aeronaves</h3>
            <p className={Style.statNumber}>{aeroNaves.length}</p>
          </div>
        </div>

        <div className={Style.grid}>
          {aeroNavesFiltradas.length > 0 ? (
            aeroNavesFiltradas.map((nave) => {
              const status =
                nave.stages && nave.stages.length > 0
                  ? nave.stages[0].status
                  : "pending";

              const pecasFaltantes =
                nave.parts?.filter(p => p.status === "missing").length || 0;

              return (
                <Link
                  key={nave.id}
                  href={`/principal/${nave.id}`}
                  className={Style["grid-item"]}
                >
                  <Card
                    titulo={nave.model}
                    status={status}
                    pecasFaltantes={pecasFaltantes}
                  />
                </Link>
              );
            })
          ) : (
            <div className={Style.emptyState}>Nenhuma aeronave encontrada.</div>
          )}
          
          <button 
            className={Style.cardButton}
            onClick={() => setModalAberto(true)}
          >
            <div className={Style.cardButtonContent}>
              <div className={Style.cardButtonIcon}>+</div>
              <h3 className={Style.cardButtonTitle}>Cadastrar Nova Aeronave</h3>
              <p className={Style.cardButtonSubtitle}>Clique para adicionar uma nova aeronave</p>
            </div>
          </button>
        </div>
      </div>

      {modalAberto && (
        <div className={Style.modalOverlay}>
          <div className={Style.modalContent}>
            <div className={Style.modalHeader}>
              <h2 className={Style.modalTitle}>Cadastro de Aeronave</h2>
              <button 
                className={Style.modalClose}
                onClick={() => setModalAberto(false)}
              >
                x
              </button>
            </div>

            <div className={Style.modalBody}>
              {mensagem && <p className={Style.sucesso}>{mensagem}</p>}
              {erro && <p className={Style.erro}>{erro}</p>}

              <form className={Style.form}>
                <div className={Style.formGroup}>
                  <label htmlFor="nome">Nome da Aeronave *</label>
                  <input
                    type="text"
                    id="nome"
                    placeholder="Nome da Aeronave"
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

                <div className={Style.modalActions}>
                  <button
                    type="button"
                    className={Style.cancelButton}
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={Style.submitButton}
                    onClick={cadastrarAeronave}
                  >
                    Cadastrar Aeronave
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}