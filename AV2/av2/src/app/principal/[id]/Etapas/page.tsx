'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../component/Navbar";
import Style from "./Etapas.module.css";
import axios from "axios";

interface Etapa {
  id: number;
  name: string;
  deadline: number;
  status: string;
  aircraftId: number;
  createdAt: string;
  assignments: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      role: string;
    };
  }>;
}

interface Usuario {
  id: number;
  name: string;
  role: string;
}

interface NovaEtapa {
  name: string;
  deadline: number;
  status: string;
  aircraftId: number;
  userIds: number[];
}

export default function EtapasAeronavePage() {
  const router = useRouter();
  const params = useParams();
  const idNave = params?.id as string;
  
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [novaEtapa, setNovaEtapa] = useState<NovaEtapa>({
    name: '',
    deadline: 7,
    status: 'PENDING',
    aircraftId: parseInt(idNave) || 0,
    userIds: []
  });

  const api = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
    if (idNave) {
      carregarDados();
    }
  }, [idNave]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [etapasResponse, usuariosResponse] = await Promise.all([
        api.get(`/aeronaves/${idNave}/stages`),
        api.get('/funcionarios')
      ]);
      
      setEtapas(etapasResponse.data);
      setUsuarios(usuariosResponse.data);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setError(error.response?.data?.error || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const criarEtapa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaEtapa.name.trim()) {
      setError("Nome da etapa é obrigatório");
      return;
    }

    try {
      setError('');
      await api.post('/stages', novaEtapa);
      
      await carregarDados();
      setNovaEtapa({
        name: '',
        deadline: 7,
        status: 'PENDING',
        aircraftId: parseInt(idNave) || 0,
        userIds: []
      });
      setMostrarForm(false);
      
    } catch (error: any) {
      console.error("Erro ao criar etapa:", error);
      setError(error.response?.data?.error || "Erro ao criar etapa");
    }
  };

  const atualizarStatus = async (etapaId: number, novoStatus: string) => {
    try {
      setError('');
      await api.put(`/stages/${etapaId}`, {
        status: novoStatus
      });
      
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao atualizar etapa:", error);
      setError(error.response?.data?.error || "Erro ao atualizar etapa");
    }
  };

  const deletarEtapa = async (etapaId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta etapa?")) {
      return;
    }

    try {
      setError('');
      await api.delete(`/stages/${etapaId}`);
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao deletar etapa:", error);
      setError(error.response?.data?.error || "Erro ao deletar etapa");
    }
  };

  const toggleUsuario = (userId: number) => {
    setNovaEtapa(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return Style.statusPendente;
      case 'IN_PROGRESS': return Style.statusAndamento;
      case 'COMPLETED': return Style.statusConcluido;
      default: return Style.statusPendente;
    }
  };

  const traduzirStatus = (status: string) => {
    const traducoes: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluído'
    };
    return traducoes[status] || status;
  };

  if (loading) {
    return (
      <div className={Style.pagina}>
        <Navbar />
        <div className={Style.conteudo}>
          <div className={Style.loading}>
            <p>Carregando etapas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.conteudo}>
        <div className={Style.header}>
          <button 
            className={Style.botaoVoltar} 
            onClick={() => router.push(`/principal/${idNave}`)}
          >
            ← Voltar
          </button>
          <h1 className={Style.titulo}>Etapas: Aeronave XP-{idNave}</h1>
          <p className={Style.subtitulo}>Gerenciamento de etapas de produção</p>
        </div>

        {error && (
          <div className={Style.erro}>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className={Style.controles}>
          {(userRole === 'ADMIN' || userRole === 'ENGINEER') && (
            <button
              className={Style.botaoNovaEtapa}
              onClick={() => setMostrarForm(!mostrarForm)}
            >
              {mostrarForm ? 'Cancelar' : '+ Nova Etapa'}
            </button>
          )}
        </div>

        {mostrarForm && (
          <div className={Style.formContainer}>
            <h2>Criar Nova Etapa</h2>
            <form onSubmit={criarEtapa} className={Style.form}>
              <div className={Style.formGroup}>
                <label>Nome da Etapa *</label>
                <input
                  type="text"
                  placeholder="Ex: Montagem da Fuselagem"
                  className={Style.input}
                  value={novaEtapa.name}
                  onChange={(e) => setNovaEtapa({...novaEtapa, name: e.target.value})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Prazo (dias) *</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className={Style.input}
                  value={novaEtapa.deadline}
                  onChange={(e) => setNovaEtapa({...novaEtapa, deadline: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Status</label>
                <select
                  className={Style.input}
                  value={novaEtapa.status}
                  onChange={(e) => setNovaEtapa({...novaEtapa, status: e.target.value})}
                >
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Atribuir Funcionários</label>
                <div className={Style.listaUsuarios}>
                  {usuarios.map(usuario => (
                    <label key={usuario.id} className={Style.usuarioItem}>
                      <input
                        type="checkbox"
                        checked={novaEtapa.userIds.includes(usuario.id)}
                        onChange={() => toggleUsuario(usuario.id)}
                      />
                      <span>
                        {usuario.name} ({usuario.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={Style.acoesForm}>
                <button type="submit" className={Style.botaoCriar}>
                  Criar Etapa
                </button>
                <button 
                  type="button" 
                  className={Style.botaoCancelar}
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={Style.listaEtapas}>
          <h2>Etapas da Aeronave ({etapas.length})</h2>
          
          {etapas.length === 0 ? (
            <div className={Style.semEtapas}>
              <p>Nenhuma etapa cadastrada para esta aeronave.</p>
              {(userRole === 'ADMIN' || userRole === 'ENGINEER') && (
                <button
                  className={Style.botaoNovaEtapa}
                  onClick={() => setMostrarForm(true)}
                >
                  Criar Primeira Etapa
                </button>
              )}
            </div>
          ) : (
            <div className={Style.gridEtapas}>
              {etapas.map(etapa => (
                <div key={etapa.id} className={Style.cardEtapa}>
                  <div className={Style.cardHeader}>
                    <h3>{etapa.name}</h3>
                    <span className={`${Style.status} ${getCorStatus(etapa.status)}`}>
                      {traduzirStatus(etapa.status)}
                    </span>
                  </div>
                  
                  <div className={Style.cardInfo}>
                    <p><strong>Prazo:</strong> {etapa.deadline} dias</p>
                    <p><strong>Criada em:</strong> {new Date(etapa.createdAt).toLocaleDateString('pt-BR')}</p>
                    
                    {etapa.assignments.length > 0 && (
                      <div className={Style.atribuicoes}>
                        <strong>Responsáveis:</strong>
                        <div className={Style.listaResponsaveis}>
                          {etapa.assignments.map(assignment => (
                            <span key={assignment.id} className={Style.responsavel}>
                              {assignment.user.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {(userRole === 'ADMIN' || userRole === 'ENGINEER') && (
                    <div className={Style.acoes}>
                      <select
                        value={etapa.status}
                        onChange={(e) => atualizarStatus(etapa.id, e.target.value)}
                        className={Style.selectStatus}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="IN_PROGRESS">Em Andamento</option>
                        <option value="COMPLETED">Concluído</option>
                      </select>
                      
                      <button
                        className={Style.botaoDeletar}
                        onClick={() => deletarEtapa(etapa.id)}
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}