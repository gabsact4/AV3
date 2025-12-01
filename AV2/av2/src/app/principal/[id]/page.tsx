'use client';

import Navbar from "../component/Navbar";
import Card from "../Card";
import Style from "../Menu.module.css";
import StyleButton from "./AeroNave.module.css";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface Aeronave {
  id: number;
  code: string;
  model: string;
  type: string;
  capacity: number;
  range: number;
  status: string;
  responsavelId?: number;
  responsavelNome?: string;
  etapaAtual?: string;
  progressoEtapa?: number;
  totalEtapas?: number;
}

interface Usuario {
  id: number;
  name: string;
  role: string;
}

interface Etapa {
  id: number;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: number;
  createdAt: string;
}

export default function Detalhes() {
  const router = useRouter();
  const params = useParams();
  const naveId = params?.id as string;
  
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [aeronave, setAeronave] = useState<Aeronave | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    const name = localStorage.getItem('userName') || '';
    setUserRole(role);
    setUserName(name);
    
    if (naveId) {
      carregarDados();
    }
  }, [naveId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [aeronavesResponse, usuariosResponse, etapasResponse] = await Promise.all([
        api.get('/aeronaves'),
        api.get('/funcionarios'),
        api.get(`/aeronaves/${naveId}/etapas`)
      ]);
      
      const aeronaveEncontrada = aeronavesResponse.data.find(
        (a: Aeronave) => a.id === parseInt(naveId)
      );
      
      if (aeronaveEncontrada) {
        setAeronave(aeronaveEncontrada);
        const aeronaveDetalhes = await api.get(`/aeronaves/${naveId}`);
        setAeronave(aeronaveDetalhes.data);
      } else {
        setError('Aeronave não encontrada');
      }
      
      setUsuarios(usuariosResponse.data);
      setEtapas(etapasResponse.data);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setError(error.response?.data?.error || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const isOperario = () => {
    return userRole === 'OPERATOR';
  };

  const isAdminOrEngineer = () => {
    return userRole === 'ADMIN' || userRole === 'ENGINEER';
  };

  const atribuirResponsavel = async () => {
    if (!responsavelSelecionado) {
      setError('Selecione um responsável');
      return;
    }

    try {
      await api.put(`/aeronaves/${naveId}/responsavel`, {
        responsavelId: parseInt(responsavelSelecionado)
      });
      
      setSuccess('Responsável atribuído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
      carregarDados();
    } catch (error: any) {
      console.error("Erro ao atribuir responsável:", error);
      setError(error.response?.data?.error || "Erro ao atribuir responsável");
    }
  };

  const getStatusAeronave = () => {
    if (!aeronave) return 'Carregando...';
    
    const etapasConcluidas = etapas.filter(e => e.status === 'COMPLETED').length;
    const etapasTotais = etapas.length;
    
    if (etapasConcluidas === 0) return 'Não Iniciada';
    if (etapasConcluidas === etapasTotais) return 'Concluída';
    if (etapasConcluidas > 0 && etapasConcluidas < etapasTotais) return 'Em Andamento';
    
    return aeronave.status || 'Em Planejamento';
  };

  const getEtapaAtual = () => {
    const etapaEmAndamento = etapas.find(e => e.status === 'IN_PROGRESS');
    if (etapaEmAndamento) {
      const ordem = etapas.findIndex(e => e.id === etapaEmAndamento.id) + 1;
      return `${ordem} de ${etapas.length}`;
    }
    
    const primeiraPendente = etapas.find(e => e.status === 'PENDING');
    if (primeiraPendente) {
      const ordem = etapas.findIndex(e => e.id === primeiraPendente.id) + 1;
      return `${ordem} de ${etapas.length}`;
    }
    
    return `${etapas.length} de ${etapas.length}`;
  };

  const getNomeEtapaAtual = () => {
    const etapaEmAndamento = etapas.find(e => e.status === 'IN_PROGRESS');
    if (etapaEmAndamento) return etapaEmAndamento.name;
    
    const primeiraPendente = etapas.find(e => e.status === 'PENDING');
    if (primeiraPendente) return primeiraPendente.name;
    
    return 'Concluída';
  };

  const getResponsavelAtual = () => {
    if (aeronave?.responsavelNome) {
      return aeronave.responsavelNome;
    }
    return 'Não atribuído';
  };

  if (loading) {
    return (
      <div className={Style.pagina}>
        <Navbar />
        <div className={Style.conteudo}>
          <div className={StyleButton.loading}>
            <p>Carregando detalhes da aeronave...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.conteudo}>
        <div className={StyleButton.page}>
          
          {error && (
            <div className={StyleButton.alert}>
              <div className={StyleButton.alertError}>
                <span>{error}</span>
                <button onClick={() => setError('')}>x</button>
              </div>
            </div>
          )}

          {success && (
            <div className={StyleButton.alert}>
              <div className={StyleButton.alertSuccess}>
                <span>{success}</span>
                <button onClick={() => setSuccess('')}>x</button>
              </div>
            </div>
          )}

          {isAdminOrEngineer() && (
            <div className={StyleButton.section}>
              <div className={StyleButton.sectionHeader}>
                <h2>Gestão de Responsáveis</h2>
              </div>
              <div className={StyleButton.responsavelContainer}>
                <div className={StyleButton.formGroup}>
                  <label htmlFor="responsavel" className={StyleButton.label}>
                    Selecione o Responsável:
                  </label>
                  <select
                    id="responsavel"
                    value={responsavelSelecionado}
                    onChange={(e) => setResponsavelSelecionado(e.target.value)}
                    className={StyleButton.select}
                  >
                    <option value="">Selecione um responsável</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.name} - {usuario.role}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={atribuirResponsavel}
                  className={StyleButton.buttonPrimary}
                  disabled={!responsavelSelecionado}
                >
                  Atribuir Responsável
                </button>

                <div className={StyleButton.responsavelAtual}>
                  <strong>Responsável atual:</strong> {getResponsavelAtual()}
                </div>
              </div>
            </div>
          )}

          <div className={StyleButton.section}>
            <div className={StyleButton.cardContainer}>
              <Card 
                titulo={`Aeronave ${aeronave?.code || 'XP-01'}`} 
                status={getStatusAeronave()} 
              />
            </div>
          </div>

          <div className={StyleButton.section}>
            <div className={StyleButton.gridBotoes}>

               <button 
                    className={`${StyleButton.button} ${StyleButton.buttonSecondary}`}
                    onClick={() => router.push(`/principal/${naveId}/pecas`)}
                  >
                    Gerenciar Peças
                  </button>
              
              
              {isAdminOrEngineer() && (
                <>
                  <button 
                    className={`${StyleButton.button} ${StyleButton.buttonSecondary}`}
                    onClick={() => router.push(`/principal/${naveId}/teste`)}
                  >
                    Testes
                  </button>
                </>
              )}

              <button 
                  className={`${StyleButton.button} ${StyleButton.buttonInfo}`}
                  onClick={() => router.push(`/principal/${naveId}/Etapas`)}
                >
                  Gerenciar Etapas
                </button>

            </div>
          </div>

          <div className={StyleButton.section}>
            <div className={StyleButton.infoContainer}>
              <div className={StyleButton.sectionHeader}>
                <h2>Informações da Aeronave</h2>
              </div>
              
              <div className={StyleButton.infoGrid}>
                <div className={StyleButton.infoColuna}>
                  <div className={StyleButton.infoItem}>
                    <strong>ID:</strong> {naveId}
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Modelo:</strong> {aeronave?.model || 'Não disponível'}
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Tipo:</strong> {aeronave?.type || 'Não disponível'}
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Capacidade:</strong> {aeronave?.capacity || 'N/A'} passageiros
                  </div>
                </div>
                
                <div className={StyleButton.infoColuna}>
                  <div className={StyleButton.infoItem}>
                    <strong>Status:</strong>
                    <span className={`${StyleButton.status} ${StyleButton.statusTexto}`}>
                      {getStatusAeronave()}
                    </span>
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Etapa Atual:</strong> {getEtapaAtual()} - {getNomeEtapaAtual()}
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Responsável:</strong> {getResponsavelAtual()}
                  </div>
                  <div className={StyleButton.infoItem}>
                    <strong>Usuário Logado:</strong> {userName} ({userRole})
                  </div>
                </div>
              </div>

              {aeronave && (
                <div className={StyleButton.infoAdicional}>
                  <div className={StyleButton.sectionHeader}>
                    <h3>Detalhes Técnicos</h3>
                  </div>
                  <div className={StyleButton.infoGrid}>
                    <div className={StyleButton.infoColuna}>
                      <div className={StyleButton.infoItem}>
                        <strong>Código:</strong> {aeronave.code}
                      </div>
                      <div className={StyleButton.infoItem}>
                        <strong>Alcance:</strong> {aeronave.range} km
                      </div>
                    </div>
                    <div className={StyleButton.infoColuna}>
                      <div className={StyleButton.infoItem}>
                        <strong>Capacidade:</strong> {aeronave.capacity} passageiros
                      </div>
                      <div className={StyleButton.infoItem}>
                        <strong>Tipo:</strong> {aeronave.type}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}